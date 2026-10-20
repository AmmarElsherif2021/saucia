/**
 * ThreeDisplay — generic three.js scene renderer.
 *
 * It knows nothing about Saucia: the caller supplies a scene description
 * (`ModelsConfig`) plus the active keys, camera target and focus. It is a
 * `shared/` primitive, so it must never import pages, widgets or entities.
 *
 * Behaviour carried over from the v1 `ThreeScene`:
 * 1. Priority models load immediately; secondary models load in idle time.
 * 2. Low quality first (pixelRatio 1, no shadows), ramped to high quality
 *    after the priority models are visible → fires `onLCPReady`.
 * 3. Render-on-demand: frames are skipped while the scene is settled.
 * 4. `explicit` models get a silhouette outline (mask pass + edge shader).
 * 5. `lowpoly_`-prefixed models become an ever-drifting InstancedMesh field.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type {
  ModelConfig,
  ThreeDisplayHandle,
  ThreeDisplayProps,
  Vec3,
} from './types';

// ---- Tunables ----
const CAM_LERP = 0.035;
const BG_LERP = 0.04;
const OPA_LERP = 0.055;
const LOOK_LERP = 0.04;
const FOCUS_LERP = 0.06;
const FOCUS_SCALE = 1.5;
const SETTLE_SQ = 1e-4;

const GLOW_COLOR = new THREE.Color(0x97e861);
const EFFECT_IN = 0.055;
const EFFECT_OUT = 0.032;
const SCALE_BOOST = 0.18;
const GLOW_PEAK = 0.9;
const PULSE_SPEED = 0.0008;
const PULSE_PEAK = 0.22;

const BLACK_BG = new THREE.Color(0x000000);
const SIL_RES_SCALE = 0.5;
const SIL_THICKNESS = 1;
const SIL_MIN_ALPHA = 0.35;
const SIL_MAX_ALPHA = 1;
const SIL_OPACITY_GATE = 0.3;

const AMBIENT_PREFIX = 'lowpoly_';
const AMBIENT_COUNT_PER_MODEL = 6;
const AMBIENT_SPREAD = { x: 260, y: 160, z: 260 };
const AMBIENT_Y_BASE = 60;
const AMBIENT_SCALE_JITTER = 0.35;
const AMBIENT_BOB_AMPLITUDE = 14;
const AMBIENT_BOB_SPEED_MIN = 0.00035;
const AMBIENT_BOB_SPEED_MAX = 0.0009;
const AMBIENT_SPIN_SPEED_MIN = 0.05;
const AMBIENT_SPIN_SPEED_MAX = 0.16;
const AMBIENT_DRIFT_RADIUS_MIN = 6;
const AMBIENT_DRIFT_RADIUS_MAX = 16;
const AMBIENT_FADE_LERP = 0.02;

const PIXEL_RATIO_MAX = 2;

interface OutlineUniforms {
  [uniform: string]: THREE.IUniform;
  tMask: THREE.IUniform<THREE.Texture>;
  texel: THREE.IUniform<THREE.Vector2>;
  glowColor: THREE.IUniform<THREE.Color>;
  thickness: THREE.IUniform<number>;
  intensity: THREE.IUniform<number>;
}

interface AmbientInstance {
  base: THREE.Vector3;
  scale: number;
  bobSpeed: number;
  bobPhase: number;
  spinSpeed: number;
  spinAxis: THREE.Vector3;
  driftRadius: number;
  driftSpeed: number;
  driftPhase: number;
  rotation: THREE.Quaternion;
}

interface AmbientGroup {
  mesh: THREE.InstancedMesh;
  material: THREE.Material;
  instances: AmbientInstance[];
}

interface ClickEffect {
  t: number;
  phase: 'in' | 'out';
}

const vec = (v: Vec3 | undefined, fallback = 0): THREE.Vector3 =>
  new THREE.Vector3(v?.x ?? fallback, v?.y ?? fallback, v?.z ?? fallback);

/** Traverse only meshes (three's own `child.isMesh` is not a TS narrowing). */
function eachMesh(root: THREE.Object3D, fn: (mesh: THREE.Mesh) => void): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) fn(mesh);
  });
}

function eachMaterial(
  mesh: THREE.Mesh,
  fn: (material: THREE.Material) => void,
): void {
  const material = mesh.material;
  const list = Array.isArray(material) ? material : [material];
  list.forEach(fn);
}

export const ThreeDisplay = forwardRef<ThreeDisplayHandle, ThreeDisplayProps>(
  function ThreeDisplay(
    {
      models,
      activeModelKeys,
      targetCamera,
      targetBgColor,
      focusedModelKey,
      onLCPReady,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const frameIdRef = useRef<number | null>(null);
    const initedRef = useRef(false);
    const mountedRef = useRef(true);

    const modelsRef = useRef<Record<string, THREE.Group>>({});
    const opacitiesRef = useRef<Record<string, number>>({});
    const focusScalesRef = useRef<Record<string, number>>({});
    const clickEffectsRef = useRef<Record<string, ClickEffect>>({});
    const targetCamRef = useRef<THREE.Vector3>(vec(targetCamera));
    const targetBgRef = useRef<THREE.Color>(
      new THREE.Color(targetBgColor || '#eef7ec'),
    );
    const activeKeysRef = useRef<string[]>(activeModelKeys);
    const focusedKeyRef = useRef<string | null>(focusedModelKey);

    const currentLookAtRef = useRef(new THREE.Vector3());
    const targetLookAtRef = useRef(new THREE.Vector3());

    const lcpFiredRef = useRef(false);
    const priorityLoadedRef = useRef(0);
    const qualityRampedRef = useRef(false);
    const dirtyRef = useRef(true);

    const prefetchedBuffers = useRef<Record<string, ArrayBuffer>>({});
    const raycaster = useRef(new THREE.Raycaster());

    const silhouetteTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);
    const silhouetteMaskMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
    const silhouetteOccluderMatRef = useRef<THREE.MeshBasicMaterial | null>(
      null,
    );
    const silhouetteSceneRef = useRef<THREE.Scene | null>(null);
    const silhouetteCameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const silhouetteUniformsRef = useRef<OutlineUniforms | null>(null);
    const silhouetteTouchedRef = useRef<
      Array<{ mesh: THREE.Mesh; material: THREE.Material | THREE.Material[] }>
    >([]);

    const ambientGroupsRef = useRef<Record<string, AmbientGroup>>({});
    const ambientDummyRef = useRef(new THREE.Object3D());

    const onReadyRef = useRef(onLCPReady);
    useEffect(() => {
      onReadyRef.current = onLCPReady;
    }, [onLCPReady]);

    // ---- Prop sync (mount-time props are read inside the init effect) ----
    useEffect(() => {
      activeKeysRef.current = activeModelKeys;
      targetCamRef.current.set(
        targetCamera.x,
        targetCamera.y,
        targetCamera.z,
      );
      targetBgRef.current.set(targetBgColor);
      dirtyRef.current = true;
    }, [activeModelKeys, targetCamera, targetBgColor]);

    useEffect(() => {
      focusedKeyRef.current = focusedModelKey;
      dirtyRef.current = true;
    }, [focusedModelKey]);

    // ---- Imperative API ----
    useImperativeHandle(
      ref,
      () => ({
        triggerEffect: (key: string) => {
          clickEffectsRef.current[key] = { t: 0, phase: 'in' };
          dirtyRef.current = true;
        },
        raycastAt: (clientX: number, clientY: number) => {
          const camera = cameraRef.current;
          const renderer = rendererRef.current;
          if (!camera || !renderer) return null;

          const mouse = new THREE.Vector2(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1,
          );
          raycaster.current.setFromCamera(mouse, camera);

          const meshes: THREE.Mesh[] = [];
          const meshToKey = new Map<string, string>();

          Object.entries(modelsRef.current).forEach(([key, model]) => {
            if (!model.visible) return;
            if (!models.models[key]?.explicit) return;
            if ((opacitiesRef.current[key] ?? 0) < SIL_OPACITY_GATE) return;
            eachMesh(model, (mesh) => {
              meshes.push(mesh);
              meshToKey.set(mesh.uuid, key);
            });
          });

          const intersects = raycaster.current.intersectObjects(meshes, false);
          const first = intersects[0];
          if (!first) return null;
          return meshToKey.get(first.object.uuid) ?? null;
        },
      }),
      [models.models],
    );

    // ---- One-time scene setup ----
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      mountedRef.current = true;
      const modelDefaults = models.default ?? {};
      const globalCam = models.global?.cameraPosition;
      if (globalCam) targetCamRef.current.set(globalCam.x, globalCam.y, globalCam.z);

      const priorityKeys = Object.keys(models.models).filter(
        (key) => models.models[key]?.priority === true,
      );

      // Prefetch priority GLTFs during idle time so parsing starts sooner.
      const priorityPaths = priorityKeys
        .map((key) => {
          const path = models.models[key]?.path;
          return path ? { key, path } : null;
        })
        .filter((entry): entry is { key: string; path: string } =>
          entry !== null,
        );

      const fetchBuffer = ({ key, path }: { key: string; path: string }) => {
        fetch(path)
          .then((res) => res.arrayBuffer())
          .then((buffer) => {
            if (mountedRef.current) {
              prefetchedBuffers.current[key] = buffer;
              dirtyRef.current = true;
            }
          })
          .catch((err) => {
            console.warn(`[ThreeDisplay] Prefetch failed for ${key}:`, err);
          });
      };

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => priorityPaths.forEach(fetchBuffer), {
          timeout: 2000,
        });
      } else {
        setTimeout(() => priorityPaths.forEach(fetchBuffer), 100);
      }

      const quality = {
        high: {
          pixelRatio: Math.min(window.devicePixelRatio ?? 1, PIXEL_RATIO_MAX),
        },
      };

      const computeSilSize = (w: number, h: number) => ({
        w: Math.max(
          2,
          Math.round(w * (rendererRef.current?.getPixelRatio() ?? 1) * SIL_RES_SCALE),
        ),
        h: Math.max(
          2,
          Math.round(h * (rendererRef.current?.getPixelRatio() ?? 1) * SIL_RES_SCALE),
        ),
      });

      const initScene = (width: number, height: number) => {
        if (initedRef.current || !mountedRef.current) return;
        initedRef.current = true;

        const scene = new THREE.Scene();
        scene.background = targetBgRef.current.clone();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
          width >= height ? 50 : 80,
          width / height,
          0.1,
          2000,
        );
        camera.position.copy(targetCamRef.current);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(1);
        renderer.shadowMap.enabled = false;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        ambient.name = 'ambient';
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
        sun.position.set(3, 6, 4);
        sun.castShadow = false;
        sun.name = 'sun';
        scene.add(sun);

        // ---- Silhouette outline pipeline ----
        const initialSilSize = computeSilSize(width, height);
        const silhouetteTarget = new THREE.WebGLRenderTarget(
          initialSilSize.w,
          initialSilSize.h,
          {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            depthBuffer: true,
            stencilBuffer: false,
          },
        );
        silhouetteTargetRef.current = silhouetteTarget;

        silhouetteMaskMatRef.current = new THREE.MeshBasicMaterial({
          color: 0xffffff,
        });
        silhouetteOccluderMatRef.current = new THREE.MeshBasicMaterial({
          colorWrite: false,
        });

        const silUniforms: OutlineUniforms = {
          tMask: { value: silhouetteTarget.texture },
          texel: {
            value: new THREE.Vector2(1 / initialSilSize.w, 1 / initialSilSize.h),
          },
          glowColor: { value: GLOW_COLOR.clone() },
          thickness: { value: SIL_THICKNESS },
          intensity: { value: 0 },
        };
        silhouetteUniformsRef.current = silUniforms;

        const silQuadMaterial = new THREE.ShaderMaterial({
          uniforms: silUniforms,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          toneMapped: false,
          vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = vec4(position.xy, 0.0, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            uniform sampler2D tMask;
            uniform vec2 texel;
            uniform vec3 glowColor;
            uniform float thickness;
            uniform float intensity;
            varying vec2 vUv;

            float m(vec2 uv) { return texture2D(tMask, uv).r; }

            void main() {
              if (intensity <= 0.001) discard;

              vec2 o = texel * thickness;
              float c  = m(vUv);
              float n  = m(vUv + vec2(0.0, o.y));
              float s  = m(vUv + vec2(0.0, -o.y));
              float e  = m(vUv + vec2(o.x, 0.0));
              float w  = m(vUv + vec2(-o.x, 0.0));
              float ne = m(vUv + vec2(o.x, o.y));
              float nw = m(vUv + vec2(-o.x, o.y));
              float se = m(vUv + vec2(o.x, -o.y));
              float sw = m(vUv + vec2(-o.x, -o.y));

              float edge = abs(c - n) + abs(c - s) + abs(c - e) + abs(c - w)
                         + abs(c - ne) + abs(c - nw) + abs(c - se) + abs(c - sw);
              edge = clamp(edge, 0.0, 1.0);

              if (edge < 0.04) discard;

              gl_FragColor = vec4(glowColor, edge * intensity);
            }
          `,
        });

        const silGeometry = new THREE.BufferGeometry();
        silGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(
            new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
            3,
          ),
        );
        silGeometry.setAttribute(
          'uv',
          new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2),
        );
        const silQuad = new THREE.Mesh(silGeometry, silQuadMaterial);
        silQuad.frustumCulled = false;

        const silScene = new THREE.Scene();
        silScene.add(silQuad);
        silhouetteSceneRef.current = silScene;
        silhouetteCameraRef.current = new THREE.OrthographicCamera(
          -1,
          1,
          1,
          -1,
          0,
          1,
        );

        // ---- Quality ramp ----
        const rampToHighQuality = () => {
          if (qualityRampedRef.current || !mountedRef.current) return;
          qualityRampedRef.current = true;

          renderer.setPixelRatio(quality.high.pixelRatio);
          renderer.shadowMap.enabled = true;
          const sunLight = scene.getObjectByName('sun') as
            | THREE.DirectionalLight
            | undefined;
          if (sunLight) sunLight.castShadow = true;

          if (silhouetteTargetRef.current) {
            const size = computeSilSize(
              container.clientWidth,
              container.clientHeight,
            );
            silhouetteTargetRef.current.setSize(size.w, size.h);
            silhouetteUniformsRef.current?.texel.value.set(
              1 / size.w,
              1 / size.h,
            );
          }

          const fill = new THREE.PointLight(0xd0e8ff, 0.5);
          fill.position.set(-3, 2, -2);
          scene.add(fill);
          const rim = new THREE.PointLight(0x88ffcc, 0.3);
          rim.position.set(0, -1, 3);
          scene.add(rim);

          dirtyRef.current = true;
        };

        // ---- Model loading ----
        const loader = new GLTFLoader();
        const initialActive = new Set(activeKeysRef.current);

        const applyTransform = (model: THREE.Object3D, cfg: ModelConfig) => {
          const p = cfg.position;
          model.position.set(p?.x ?? 0, p?.y ?? 0, p?.z ?? 0);
          const r = cfg.rotation;
          model.rotation.set(r?.x ?? 0, r?.y ?? 0, r?.z ?? 0);
          const scale = cfg.scale ?? 1;
          if (typeof scale === 'number') model.scale.setScalar(scale);
          if (cfg.flipX) model.scale.x *= -1;
          if (cfg.flipY) model.scale.y *= -1;
          if (cfg.flipZ) model.scale.z *= -1;
          if (cfg.tilt) {
            model.rotation.set(cfg.tilt.x ?? 0, cfg.tilt.y ?? 0, cfg.tilt.z ?? 0);
          }
        };

        const loadModel = (key: string, cfg: ModelConfig) => {
          if (!cfg.path) return;

          opacitiesRef.current[key] = 0;
          focusScalesRef.current[key] = 1;

          const onLoaded = (gltf: { scene: THREE.Group }) => {
            if (!mountedRef.current) return;
            const model = gltf.scene;

            applyTransform(model, cfg);

            const startOpacity = initialActive.has(key) ? 1 : 0;
            opacitiesRef.current[key] = startOpacity;

            eachMesh(model, (mesh) => {
              mesh.castShadow = cfg.castShadow ?? true;
              mesh.receiveShadow = cfg.receiveShadow ?? false;
              const prepare = (source: THREE.Material) => {
                const material = source.clone();
                material.transparent = true;
                material.opacity = startOpacity;
                if (cfg.material) Object.assign(material, cfg.material);
                return material;
              };
              mesh.material = Array.isArray(mesh.material)
                ? mesh.material.map(prepare)
                : prepare(mesh.material);
            });

            model.visible = startOpacity > 0;
            modelsRef.current[key] = model;
            scene.add(model);
            dirtyRef.current = true;

            if (priorityKeys.includes(key)) {
              priorityLoadedRef.current += 1;
              if (
                priorityLoadedRef.current >= priorityKeys.length &&
                !lcpFiredRef.current
              ) {
                lcpFiredRef.current = true;
                requestAnimationFrame(() => {
                  rampToHighQuality();
                  onReadyRef.current?.();
                });
              }
            }
          };

          const onError = (err: unknown) => {
            console.error(`[ThreeDisplay] Failed to load ${key}`, err);
          };

          const resourcePath = cfg.path.replace(/[^/]*$/, '');
          const cached = prefetchedBuffers.current[key];
          if (cached) {
            loader.parse(cached, resourcePath, onLoaded, onError);
            delete prefetchedBuffers.current[key];
          } else {
            loader.load(cfg.path, onLoaded, undefined, onError);
          }
        };

        const entries = Object.entries(models.models);
        entries
          .filter(([key]) => priorityKeys.includes(key))
          .forEach(([key, cfg]) => loadModel(key, { ...modelDefaults, ...cfg }));

        const secondary = entries.filter(
          ([key]) =>
            !priorityKeys.includes(key) && !key.startsWith(AMBIENT_PREFIX),
        );
        const loadSecondary = () => {
          if (!mountedRef.current) return;
          secondary.forEach(([key, cfg]) =>
            loadModel(key, { ...modelDefaults, ...cfg }),
          );
        };
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(loadSecondary, { timeout: 2000 });
        } else {
          setTimeout(loadSecondary, 600);
        }

        // ---- Ambient lowpoly field (one InstancedMesh per model) ----
        const loadAmbient = (key: string, cfg: ModelConfig) => {
          if (!cfg.path) return;

          const onAmbientLoaded = (gltf: { scene: THREE.Group }) => {
            if (!mountedRef.current) return;

            let proto: THREE.Mesh | null = null;
            eachMesh(gltf.scene, (mesh) => {
              if (!proto) proto = mesh;
            });
            if (!proto) return;

            const source = proto as THREE.Mesh;
            const baseMaterial = Array.isArray(source.material)
              ? source.material[0]
              : source.material;
            if (!baseMaterial) return;

            const material = baseMaterial.clone();
            material.transparent = true;
            material.opacity = 0;
            if (cfg.material) Object.assign(material, cfg.material);

            const mesh = new THREE.InstancedMesh(
              source.geometry,
              material,
              AMBIENT_COUNT_PER_MODEL,
            );
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            mesh.frustumCulled = false;

            const baseScale = cfg.scale ?? 1;
            const dummy = ambientDummyRef.current;
            const instances: AmbientInstance[] = [];

            for (let i = 0; i < AMBIENT_COUNT_PER_MODEL; i += 1) {
              const data: AmbientInstance = {
                base: new THREE.Vector3(
                  (Math.random() * 2 - 1) * AMBIENT_SPREAD.x,
                  AMBIENT_Y_BASE + (Math.random() * 2 - 1) * AMBIENT_SPREAD.y,
                  (Math.random() * 2 - 1) * AMBIENT_SPREAD.z,
                ),
                scale:
                  baseScale *
                  (1 + (Math.random() * 2 - 1) * AMBIENT_SCALE_JITTER),
                bobSpeed:
                  AMBIENT_BOB_SPEED_MIN +
                  Math.random() * (AMBIENT_BOB_SPEED_MAX - AMBIENT_BOB_SPEED_MIN),
                bobPhase: Math.random() * Math.PI * 2,
                spinSpeed:
                  (AMBIENT_SPIN_SPEED_MIN +
                    Math.random() *
                      (AMBIENT_SPIN_SPEED_MAX - AMBIENT_SPIN_SPEED_MIN)) *
                  (Math.random() < 0.5 ? -1 : 1),
                spinAxis: new THREE.Vector3(
                  Math.random() - 0.5,
                  1,
                  Math.random() - 0.5,
                ).normalize(),
                driftRadius:
                  AMBIENT_DRIFT_RADIUS_MIN +
                  Math.random() *
                    (AMBIENT_DRIFT_RADIUS_MAX - AMBIENT_DRIFT_RADIUS_MIN),
                driftSpeed:
                  AMBIENT_BOB_SPEED_MIN +
                  Math.random() * (AMBIENT_BOB_SPEED_MAX - AMBIENT_BOB_SPEED_MIN),
                driftPhase: Math.random() * Math.PI * 2,
                rotation: new THREE.Quaternion(),
              };
              instances.push(data);

              dummy.position.copy(data.base);
              dummy.quaternion.identity();
              dummy.scale.setScalar(data.scale);
              dummy.updateMatrix();
              mesh.setMatrixAt(i, dummy.matrix);
            }

            ambientGroupsRef.current[key] = { mesh, material, instances };
            scene.add(mesh);
            dirtyRef.current = true;
          };

          loader.load(cfg.path, onAmbientLoaded, undefined, (err) => {
            console.error(
              `[ThreeDisplay] Failed to load ambient particle ${key}`,
              err,
            );
          });
        };

        const ambientEntries = entries.filter(([key]) =>
          key.startsWith(AMBIENT_PREFIX),
        );
        const loadAmbientAll = () => {
          if (!mountedRef.current) return;
          ambientEntries.forEach(([key, cfg]) =>
            loadAmbient(key, { ...modelDefaults, ...cfg }),
          );
        };
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(loadAmbientAll, { timeout: 3000 });
        } else {
          setTimeout(loadAmbientAll, 900);
        }

        // ---- Render loop ----
        const animate = () => {
          if (!mountedRef.current) return;
          frameIdRef.current = requestAnimationFrame(animate);

          const focusedKey = focusedKeyRef.current;
          let isDirty = dirtyRef.current;

          if (
            !isDirty &&
            camera.position.distanceToSquared(targetCamRef.current) > SETTLE_SQ
          ) {
            isDirty = true;
          }
          if (
            !isDirty &&
            currentLookAtRef.current.distanceToSquared(targetLookAtRef.current) >
              SETTLE_SQ
          ) {
            isDirty = true;
          }
          if (!isDirty) {
            for (const key of Object.keys(modelsRef.current)) {
              const cfg = models.models[key] ?? {};
              const isActive = activeKeysRef.current.includes(key);
              const targetOpa = isActive ? 1 : 0;
              const currOpa = opacitiesRef.current[key] ?? 0;
              if (Math.abs(currOpa - targetOpa) > SETTLE_SQ) {
                isDirty = true;
                break;
              }
              if (isActive && cfg.autoRotate) {
                isDirty = true;
                break;
              }
              if (clickEffectsRef.current[key]) {
                isDirty = true;
                break;
              }
              const targetFocus = focusedKey === key ? FOCUS_SCALE : 1;
              const currFocus = focusScalesRef.current[key] ?? 1;
              if (Math.abs(currFocus - targetFocus) > 0.001) {
                isDirty = true;
                break;
              }
              if (cfg.explicit && isActive && focusedKey !== key) {
                isDirty = true;
                break;
              }
            }
          }

          if (!isDirty) return;
          dirtyRef.current = false;

          if (focusedKey) {
            const fp = models.models[focusedKey]?.position;
            targetLookAtRef.current.set(
              fp?.x ?? camera.position.x,
              fp?.y ?? camera.position.y,
              fp?.z ?? camera.position.z,
            );
          } else {
            targetLookAtRef.current.set(0, 0, 0);
          }

          const lookMoving =
            currentLookAtRef.current.distanceToSquared(targetLookAtRef.current) >
            SETTLE_SQ;
          if (lookMoving) {
            currentLookAtRef.current.lerp(
              targetLookAtRef.current,
              LOOK_LERP,
            );
            dirtyRef.current = true;
          }

          const camMoving =
            camera.position.distanceToSquared(targetCamRef.current) > SETTLE_SQ;
          if (camMoving || lookMoving) {
            if (camMoving) camera.position.lerp(targetCamRef.current, CAM_LERP);
            camera.lookAt(currentLookAtRef.current);
            dirtyRef.current = true;
          }

          const background = scene.background;
          if (background instanceof THREE.Color) {
            background.lerp(targetBgRef.current, BG_LERP);
          }

          // ---- Ambient particles ----
          const ambientKeys = Object.keys(ambientGroupsRef.current);
          if (ambientKeys.length > 0) {
            const now = Date.now();
            const dummy = ambientDummyRef.current;
            ambientKeys.forEach((key) => {
              const group = ambientGroupsRef.current[key];
              if (!group) return;

              if (group.material.opacity < 1) {
                group.material.opacity = Math.min(
                  1,
                  group.material.opacity + AMBIENT_FADE_LERP,
                );
              }

              group.instances.forEach((data, index) => {
                const bobT = now * data.bobSpeed + data.bobPhase;
                const driftT = now * data.driftSpeed + data.driftPhase;
                dummy.position.set(
                  data.base.x + Math.cos(driftT) * data.driftRadius,
                  data.base.y + Math.sin(bobT) * AMBIENT_BOB_AMPLITUDE,
                  data.base.z + Math.sin(driftT) * data.driftRadius,
                );
                data.rotation.setFromAxisAngle(
                  data.spinAxis,
                  now * 0.001 * data.spinSpeed,
                );
                dummy.quaternion.copy(data.rotation);
                dummy.scale.setScalar(data.scale);
                dummy.updateMatrix();
                group.mesh.setMatrixAt(index, dummy.matrix);
              });
              group.mesh.instanceMatrix.needsUpdate = true;
            });
            dirtyRef.current = true;
          }

          const activeKeys = activeKeysRef.current;
          const silhouetteKeys: string[] = [];

          Object.keys(modelsRef.current).forEach((key) => {
            const model = modelsRef.current[key];
            if (!model) return;

            const cfg = models.models[key] ?? {};
            const isActive = activeKeys.includes(key);
            const isFocused = focusedKey === key;
            const targetOpa = isActive ? 1 : 0;
            const prevOpa = opacitiesRef.current[key] ?? 0;
            const opaSettled = Math.abs(prevOpa - targetOpa) < SETTLE_SQ;

            if (!opaSettled) {
              const nextOpa = prevOpa + (targetOpa - prevOpa) * OPA_LERP;
              opacitiesRef.current[key] = nextOpa;
              model.visible = nextOpa > 0.0005;
              eachMesh(model, (mesh) => {
                eachMaterial(mesh, (material) => {
                  material.opacity = nextOpa;
                });
              });
              dirtyRef.current = true;
            }

            if (isActive && !isFocused && cfg.autoRotate) {
              model.rotation.y += (cfg.autoRotateSpeed ?? 0.3) * 0.05;
              dirtyRef.current = true;
            }

            const effect = clickEffectsRef.current[key];
            if (effect) {
              if (effect.phase === 'in') {
                effect.t = Math.min(1, effect.t + EFFECT_IN);
                if (effect.t >= 1) effect.phase = 'out';
              } else {
                effect.t = Math.max(0, effect.t - EFFECT_OUT);
              }

              const pulse = Math.sin(effect.t * Math.PI);
              const scaleFactor = 1 + pulse * SCALE_BOOST;
              const base = cfg.scale ?? 1;
              const focusMult = focusScalesRef.current[key] ?? 1;
              model.scale.setScalar(base * focusMult * scaleFactor);
              if (cfg.flipX) model.scale.x *= -1;
              if (cfg.flipY) model.scale.y *= -1;
              if (cfg.flipZ) model.scale.z *= -1;

              eachMesh(model, (mesh) => {
                eachMaterial(mesh, (material) => {
                  const standard = material as THREE.MeshStandardMaterial;
                  if (!standard.emissive) return;
                  standard.emissive.lerp(GLOW_COLOR, pulse * 0.4);
                  standard.emissiveIntensity = pulse * GLOW_PEAK;
                });
              });

              if (effect.phase === 'out' && effect.t <= 0) {
                delete clickEffectsRef.current[key];
              }
              dirtyRef.current = true;
            } else {
              const targetFocus = isFocused ? FOCUS_SCALE : 1;
              const prevFocus = focusScalesRef.current[key] ?? 1;
              if (Math.abs(prevFocus - targetFocus) >= 0.001) {
                const nextFocus =
                  prevFocus + (targetFocus - prevFocus) * FOCUS_LERP;
                focusScalesRef.current[key] = nextFocus;
                const base = cfg.scale ?? 1;
                model.scale.setScalar(base * nextFocus);
                if (cfg.flipX) model.scale.x *= -1;
                if (cfg.flipY) model.scale.y *= -1;
                if (cfg.flipZ) model.scale.z *= -1;
                dirtyRef.current = true;
              }

              // Decay any emissive glow left over from a click effect.
              eachMesh(model, (mesh) => {
                eachMaterial(mesh, (material) => {
                  const standard = material as THREE.MeshStandardMaterial;
                  if (!standard.emissive || standard.emissiveIntensity === 0)
                    return;
                  standard.emissiveIntensity = Math.max(
                    0,
                    standard.emissiveIntensity - 0.04,
                  );
                  if (standard.emissiveIntensity === 0) {
                    standard.emissive.set(0, 0, 0);
                  }
                  dirtyRef.current = true;
                });
              });

              if (
                cfg.explicit &&
                isActive &&
                !isFocused &&
                (opacitiesRef.current[key] ?? 0) > SIL_OPACITY_GATE
              ) {
                silhouetteKeys.push(key);
                dirtyRef.current = true;
              }
            }
          });

          // ---- Silhouette mask pass (depth-aware) ----
          const whiteMat = silhouetteMaskMatRef.current;
          const occluderMat = silhouetteOccluderMatRef.current;
          if (silhouetteKeys.length > 0 && whiteMat && occluderMat) {
            const touched = silhouetteTouchedRef.current;
            touched.length = 0;

            Object.keys(modelsRef.current).forEach((key) => {
              const model = modelsRef.current[key];
              if (!model?.visible) return;
              const isTarget = silhouetteKeys.includes(key);
              eachMesh(model, (mesh) => {
                touched.push({ mesh, material: mesh.material });
                mesh.material = isTarget ? whiteMat : occluderMat;
              });
            });

            Object.values(ambientGroupsRef.current).forEach((group) => {
              touched.push({
                mesh: group.mesh,
                material: group.mesh.material,
              });
              group.mesh.material = occluderMat;
            });

            const prevBackground = scene.background;
            const prevShadows = renderer.shadowMap.enabled;

            scene.background = BLACK_BG;
            renderer.shadowMap.enabled = false;

            const target = silhouetteTargetRef.current;
            if (target) {
              renderer.setRenderTarget(target);
              renderer.clear();
              renderer.render(scene, camera);
            }
            renderer.setRenderTarget(null);

            scene.background = prevBackground;
            renderer.shadowMap.enabled = prevShadows;

            for (const entry of touched) {
              entry.mesh.material = entry.material;
            }
            touched.length = 0;
          }

          renderer.render(scene, camera);

          // ---- Silhouette composite pass ----
          const uniforms = silhouetteUniformsRef.current;
          const silScene = silhouetteSceneRef.current;
          const silCamera = silhouetteCameraRef.current;
          if (silhouetteKeys.length > 0 && uniforms && silScene && silCamera) {
            const t = Date.now() * PULSE_SPEED;
            const pulse = Math.sin(t) * 0.5 + PULSE_PEAK;
            uniforms.intensity.value =
              SIL_MIN_ALPHA + pulse * (SIL_MAX_ALPHA - SIL_MIN_ALPHA);

            renderer.autoClear = false;
            renderer.render(silScene, silCamera);
            renderer.autoClear = true;
          } else if (uniforms && uniforms.intensity.value !== 0) {
            uniforms.intensity.value = 0;
          }
        };

        animate();
      };

      const resizeObserver = new ResizeObserver((entries) => {
        if (!mountedRef.current) return;
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width === 0 || height === 0) continue;

          if (!initedRef.current) {
            initScene(width, height);
            continue;
          }

          const camera = cameraRef.current;
          const renderer = rendererRef.current;
          if (!camera || !renderer) continue;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);

          const target = silhouetteTargetRef.current;
          if (target) {
            const size = computeSilSize(width, height);
            target.setSize(size.w, size.h);
            silhouetteUniformsRef.current?.texel.value.set(
              1 / size.w,
              1 / size.h,
            );
          }
          dirtyRef.current = true;
        }
      });
      resizeObserver.observe(container);

      return () => {
        mountedRef.current = false;
        resizeObserver.disconnect();
        if (frameIdRef.current !== null) {
          cancelAnimationFrame(frameIdRef.current);
        }

        Object.values(modelsRef.current).forEach((model) => {
          eachMesh(model, (mesh) => {
            mesh.geometry?.dispose();
            eachMaterial(mesh, (material) => {
              const map = (material as THREE.MeshStandardMaterial).map;
              map?.dispose();
              material.dispose();
            });
          });
        });

        modelsRef.current = {};
        opacitiesRef.current = {};
        focusScalesRef.current = {};
        prefetchedBuffers.current = {};

        Object.values(ambientGroupsRef.current).forEach((group) => {
          group.mesh.geometry?.dispose();
          group.material.dispose();
        });
        ambientGroupsRef.current = {};

        silhouetteTargetRef.current?.dispose();
        silhouetteMaskMatRef.current?.dispose();
        silhouetteOccluderMatRef.current?.dispose();
        silhouetteSceneRef.current?.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const material = mesh.material;
          (Array.isArray(material) ? material : [material]).forEach((m) =>
            m.dispose(),
          );
        });
        silhouetteTargetRef.current = null;
        silhouetteMaskMatRef.current = null;
        silhouetteOccluderMatRef.current = null;
        silhouetteSceneRef.current = null;
        silhouetteCameraRef.current = null;
        silhouetteUniformsRef.current = null;
        silhouetteTouchedRef.current.length = 0;

        const renderer = rendererRef.current;
        const dom = renderer?.domElement;
        if (dom && container.contains(dom)) container.removeChild(dom);
        renderer?.dispose();

        sceneRef.current = null;
        cameraRef.current = null;
        rendererRef.current = null;
        initedRef.current = false;
      };
      // The scene is initialised once: `models` is a static config object.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    );
  },
);
