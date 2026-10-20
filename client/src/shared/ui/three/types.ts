/**
 * Types for the generic three.js renderer.
 *
 * Nothing here knows about landing pages, orders or Saucia: it is a plain
 * scene description that any page can own. Page-level composition (camera,
 * scroll, which models are active) stays in `pages/home`.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ModelMaterialConfig {
  roughness?: number;
  metalness?: number;
}

export interface ExplicitModelCopy {
  label: string;
  label_ar?: string;
  brief?: string;
  brief_ar?: string;
  link?: string;
}

/** One GLTF entry in a scene description. */
export interface ModelConfig {
  path?: string;
  priority?: boolean;
  scale?: number;
  position?: Vec3;
  rotation?: Vec3;
  flipX?: boolean;
  flipY?: boolean;
  flipZ?: boolean;
  tilt?: Vec3;
  castShadow?: boolean;
  receiveShadow?: boolean;
  material?: ModelMaterialConfig;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  playAnimation?: boolean;
  navPath?: string;
  navSection?: string;
  visible?: boolean;
  userData?: Record<string, unknown>;
  /** Present when clicking the model should open an info card. */
  explicit?: ExplicitModelCopy;
}

export interface ModelsConfig {
  models: Record<string, ModelConfig>;
  default?: Omit<ModelConfig, 'path'>;
  global?: {
    cameraPosition?: Vec3;
    cameraFov?: number;
    controlsEnabled?: boolean;
    shadows?: boolean;
  };
}

export interface ThreeDisplayProps {
  /** Scene description. Must be stable; the scene is initialised once. */
  models: ModelsConfig;
  /** Model keys visible in the current page segment. */
  activeModelKeys: string[];
  targetCamera: Vec3;
  targetBgColor: string;
  focusedModelKey: string | null;
  /** Fires once the priority models are visible and high quality is on. */
  onLCPReady?: () => void;
}

/** Imperative API exposed to the owning page. */
export interface ThreeDisplayHandle {
  triggerEffect(key: string): void;
  raycastAt(clientX: number, clientY: number): string | null;
}
