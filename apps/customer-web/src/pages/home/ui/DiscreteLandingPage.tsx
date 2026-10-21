import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, Button, Text, useColorModeValue } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocale } from '../../../shared/i18n';
import { useClickSpark } from '../../../shared/lib/useClickSpark';
import { ThreeDisplay } from '../../../shared/ui/three';
import type {
  ExplicitModelCopy,
  ModelsConfig,
  ThreeDisplayHandle,
  Vec3,
} from '../../../shared/ui/three';
import landingConfigJson from '../config/landingConfig.json';
import modelsConfigJson from '../config/modelsConfig.json';
import type { LandingConfig, LandingSegment } from '../model/types';
import { useDiscreteScroll } from '../model/useDiscreteScroll';
import { Section } from './Section';

/**
 * DiscreteLandingPage — owns the landing experience.
 *
 * Page-level composition: which segment is active, where the camera looks,
 * scroll/navigation. The generic three.js renderer lives in
 * `shared/ui/three` and receives the scene description from here.
 */

const landingConfig = landingConfigJson as unknown as LandingConfig;
const modelsConfig = modelsConfigJson as unknown as ModelsConfig;

const SEGMENTS: LandingSegment[] = landingConfig.segments;

const EXPLICIT_MODELS = Object.entries(modelsConfig.models).reduce<
  Record<string, (typeof modelsConfig.models)[string]>
>((acc, [key, cfg]) => {
  if (cfg.explicit) acc[key] = cfg;
  return acc;
}, {});

const SECTION_TO_INDEX = SEGMENTS.reduce<Record<string, number>>(
  (acc, segment, index) => {
    const navSection = segment.navSection?.toLowerCase();
    if (navSection && !(navSection in acc)) acc[navSection] = index;
    const id = segment.id.toLowerCase();
    if (!(id in acc)) acc[id] = index;
    return acc;
  },
  {},
);

function focusCameraFor(key: string): Vec3 | null {
  const cfg = modelsConfig.models[key];
  if (!cfg) return null;
  const position = cfg.position ?? { x: 0, y: 0, z: 0 };
  const y = position.y + 200;
  const scale = cfg.scale ?? 1;
  const distance = Math.max(80, Math.min(scale * 1.2, 220));
  return { x: position.x, y: y + distance * 0.25, z: position.z + distance };
}

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0, 1] }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      style={{ fontWeight: 700, marginLeft: 2 }}
    >
      |
    </motion.span>
  );
}

interface FocusCardProps {
  cfg: ExplicitModelCopy;
  navPath?: string;
  navSection?: string;
}

function FocusCard({ cfg, navPath, navSection }: FocusCardProps) {
  const navigate = useNavigate();
  const locale = useLocale();
  const arabic = locale === 'ar';
  const [typedIndex, setTypedIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  const fullText = (arabic ? cfg.brief_ar : cfg.brief) ?? '';

  useEffect(() => {
    if (!fullText) {
      setTypedIndex(0);
      setTypingDone(true);
      return;
    }

    setTypedIndex(0);
    setTypingDone(false);
    const interval = window.setInterval(() => {
      setTypedIndex((previous) => {
        if (previous < fullText.length) return previous + 1;
        window.clearInterval(interval);
        setTypingDone(true);
        return previous;
      });
    }, 25);

    return () => window.clearInterval(interval);
  }, [fullText]);

  const displayedText = fullText.slice(0, typedIndex);

  const handleNavigation = useCallback(() => {
    if (navPath && navSection) {
      navigate(navPath, { state: { scrollTo: navSection } });
    } else if (cfg.link) {
      if (cfg.link.startsWith('http')) {
        window.location.href = cfg.link;
      } else {
        navigate(cfg.link);
      }
    }
  }, [cfg.link, navPath, navSection, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: '15%',
        left: '5%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        width: 'min(400px, 90vw)',
        pointerEvents: 'auto',
      }}
    >
      <Box p={{ base: 0, md: 1 }} gap={1}>
        <Text
          fontSize="xs"
          fontWeight="700"
          letterSpacing="0.18em"
          textTransform="uppercase"
          color="brand.600"
          mb={2}
          bg="secondary.500"
          width="fit-content"
        >
          {arabic ? cfg.label_ar ?? cfg.label : cfg.label}
        </Text>

        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          color="gray.700"
          lineHeight={1.4}
          mb={2}
          bg="tertiary.500"
          width="fit-content"
          p={2}
          borderRadius={12}
        >
          {displayedText}
          {typingDone ? null : <Cursor />}
        </Text>

        {typingDone && (navPath || cfg.link) ? (
          <Button
            colorScheme="secondary"
            borderRadius="24px"
            fontWeight="700"
            size="sm"
            p={2}
            justifySelf="end"
            onClick={handleNavigation}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="all 0.22s cubic-bezier(0.22,1,0.36,1)"
          >
            {arabic ? 'اكتشف المزيد' : 'Learn More'}
          </Button>
        ) : null}
      </Box>
    </motion.div>
  );
}

export function DiscreteLandingPage() {
  const sectionsRef = useRef<Array<HTMLDivElement | null>>([]);
  const threeSceneRef = useRef<ThreeDisplayHandle | null>(null);
  const { createSpark } = useClickSpark();
  const location = useLocation();

  const [sceneReady, setSceneReady] = useState(false);
  const [deferScene, setDeferScene] = useState(true);
  const [focusedModelKey, setFocusedModelKey] = useState<string | null>(null);

  const focusedModelKeyRef = useRef<string | null>(focusedModelKey);
  useEffect(() => {
    focusedModelKeyRef.current = focusedModelKey;
  }, [focusedModelKey]);

  const focusCameraPosition = useMemo(
    () => (focusedModelKey ? focusCameraFor(focusedModelKey) : null),
    [focusedModelKey],
  );

  // Defer scene creation until the browser is idle (LCP friendly).
  useEffect(() => {
    const id =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(() => setDeferScene(false), { timeout: 2000 })
        : window.setTimeout(() => setDeferScene(false), 100);

    return () => {
      if (typeof requestIdleCallback !== 'undefined') {
        cancelIdleCallback(id);
      } else {
        window.clearTimeout(id);
      }
    };
  }, []);

  const scrollToSection = useCallback((index: number) => {
    sectionsRef.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const { activeIndex, setActiveIndex } = useDiscreteScroll(
    SEGMENTS.length,
    scrollToSection,
  );

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Navigation arriving from another page: { state: { scrollTo } }.
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;

    const targetIndex = SECTION_TO_INDEX[scrollTo.toLowerCase().trim()] ?? -1;
    if (targetIndex < 0) return;

    const id = window.setTimeout(() => {
      scrollToSection(targetIndex);
      setActiveIndex(targetIndex);
    }, 120);
    return () => window.clearTimeout(id);
  }, [location.state, scrollToSection, setActiveIndex]);

  // IntersectionObserver keeps the active segment in sync with manual scroll.
  useEffect(() => {
    const elementToIndex = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = elementToIndex.get(entry.target);
          if (index !== undefined && index !== activeIndexRef.current) {
            setActiveIndex(index);
            setFocusedModelKey(null);
          }
        }
      },
      { threshold: 0.55 },
    );

    sectionsRef.current.forEach((element, index) => {
      if (!element) return;
      elementToIndex.set(element, index);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [setActiveIndex]);

  const handleContainerClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      createSpark(event, document.body);
      const key = threeSceneRef.current?.raycastAt(
        event.clientX,
        event.clientY,
      );
      if (key && EXPLICIT_MODELS[key]) {
        setFocusedModelKey((previous) => (previous === key ? null : key));
      } else if (!key && focusedModelKeyRef.current) {
        setFocusedModelKey(null);
      }
    },
    [createSpark],
  );

  const handleSceneReady = useCallback(() => setSceneReady(true), []);

  const activeSegment = SEGMENTS[activeIndex] ?? SEGMENTS[0];
  const activeModelKeys = activeSegment?.modelKey ?? [];
  const targetCamera: Vec3 =
    focusCameraPosition ??
    activeSegment?.cameraPosition ?? { x: 0, y: 0, z: 10 };
  const targetBgColor = useColorModeValue(
    activeSegment?.sceneBackground ?? '#eef7ec',
    '#1A202C',
  );

  const focusedCfg = focusedModelKey
    ? modelsConfig.models[focusedModelKey]
    : undefined;

  if (!activeSegment) return null;

  return (
    <Box
      onClick={handleContainerClick}
      cursor="pointer"
      position="relative"
      height="100vh"
      maxWidth="99vw"
      m={0}
      overflow="hidden"
    >
      {sceneReady ? null : (
        <Box
          position="absolute"
          inset={0}
          zIndex={50}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(0,0,0,0.1)"
          pointerEvents="none"
        >
          <Box textAlign="center" color="white" fontSize="sm">
            Loading 3D scene…
          </Box>
        </Box>
      )}

      {deferScene ? null : (
        <ThreeDisplay
          ref={threeSceneRef}
          models={modelsConfig}
          activeModelKeys={activeModelKeys}
          targetCamera={targetCamera}
          targetBgColor={targetBgColor}
          focusedModelKey={focusedModelKey}
          onLCPReady={handleSceneReady}
        />
      )}

      <AnimatePresence>
        {focusedCfg?.explicit ? (
          <FocusCard
            key={focusedModelKey ?? 'focus'}
            cfg={focusedCfg.explicit}
            navPath={focusedCfg.navPath}
            navSection={focusedCfg.navSection}
          />
        ) : null}
      </AnimatePresence>

      <Box
        position="relative"
        zIndex={1}
        height="100%"
        overflowY="auto"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {SEGMENTS.map((segment, index) => (
          <div
            key={segment.id}
            ref={(element) => {
              sectionsRef.current[index] = element;
            }}
            style={{ scrollSnapAlign: 'start', height: '100vh' }}
          >
            <Section data={segment} isActive={activeIndex === index} />
          </div>
        ))}
      </Box>
    </Box>
  );
}
