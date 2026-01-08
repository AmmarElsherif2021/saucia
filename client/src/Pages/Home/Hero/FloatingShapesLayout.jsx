import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, delay } from 'framer-motion';
import { Box, Image, useBreakpointValue, Spinner, Text, Link } from '@chakra-ui/react';

// Import SVG shape components shadow
import circle from './circle.svg';
import small_circle from './small_circle.svg';
import top_left_semi_circle from './top-left-corner.svg';
import extruded_circle from './extruded_circle.svg';
import right_bottom_quarter from './right_bottom_quarter.svg';
import octa_star from './octa_star.svg';
import teal_semi_circle from './teal_semi_circle.svg';
import circle2 from './circle2.svg';
import small_triangle from './small_triangle.svg';
import { useNavigate } from 'react-router';
import { useI18nContext } from '../../../Contexts/I18nContext';
import useClickSpark from './useClickSpark';

// Arabic translations
const TRANSLATIONS = {
  en: {
    'Make Your Salad': 'Make Your Salad',
    'Soups': 'Soups',
    'Signature\n Salads': 'Signature\n Salads',
    'Make \nYour Fruit Salad': 'Make \nYour Fruit Salad',
    'Juices': 'Juices',
    'Desserts': 'Desserts',
    'Loading with errors...': 'Loading with errors...',
    'Some assets failed to load but continuing...': 'Some assets failed to load but continuing...'
  },
  ar: {
    'Make Your Salad': 'اصنع سلطتك',
    'Soups': 'الشوربات',
    'Signature\n Salads': 'السلطات\n المميزة',
    'Make \nYour Fruit Salad': 'اصنع\n سلطة الفاكهة',
    'Juices': 'العصائر',
    'Desserts': 'الحلويات',
    'Loading with errors...': 'جاري التحميل مع أخطاء...',
    'Some assets failed to load but continuing...': 'فشل تحميل بعض الملفات ولكن المتابعة...'
  }
};

// Responsive scaling ratios - scaled by 1.5
const SCALE_RATIOS = {
  tablet: 0.90,
  mobile: 0.375
};

// Centralized motion configuration - faster and steeper with median stage
const MOTION_CONFIG = {
  MEDIAN: {
    DURATION: 800,
    STAGGER: 20,
    EASE: [0.6, 0, 0.4, 1]
  },
  SETTLING: {
    DURATION: 800,
    STAGGER: 20,
    EASE: [0.4, 0, 0.2, 1]
  },
  FLOATING: {
    Y_DURATION: 3.2,
    X_DURATION: 5.5,
    Y_AMPLITUDE: 12,
    X_AMPLITUDE: 6,
    STAGGER: 0
  }
};

// Helper function to scale dimensions
const scaleValue = (value, ratio) => {
  if (typeof value === 'string' && value.includes('px')) {
    return Math.round(parseInt(value) * ratio) + 'px';
  }
  return value;
};

// Helper function to scale a style object
const scaleStyle = (style, ratio) => {
  const scaled = {};
  Object.keys(style).forEach(key => {
    scaled[key] = scaleValue(style[key], ratio);
  });
  return scaled;
};

// Updated shape configuration with composed SVGs and median positions //delay
const SHAPE_CONFIG = {
  top_left_semi_circle: { 
    component: top_left_semi_circle, 
    finalStyle: { left: '18px', top: '20px', width: '154px', height: '154px' },
    medianStyle: { left: '50px', top: '40px', width: '100px', height: '100px' },
    initialStyle: {  left: '50px', top: '40px', width: '50px', height: '50px' },
    path: '/menu',
    section: 'make your own salad',
    label: 'Make Your Salad'
  },
  circle: { 
    component: circle, 
    finalStyle: { left: '186px', top: '86px', width: '92px', height: '92px' },
    medianStyle: { left: '186px', top: '60px', width: '50px', height: '50px' },
    initialStyle: { left: '186px', top: '60px', width: '20px', height: '20px' },
    path: '/menu',
    section: 'Soups',
    label: 'Soups'
  },
  small_circle: { 
    component: small_circle, 
    finalStyle: { left: '168px', top: '25px', width: '52px', height: '52px' },
    medianStyle: { left: '168px', top: '35px', width: '55px', height: '55px' },
    initialStyle: { left: '168px', top: '40px', width: '20px', height: '20px' },
  },
  extruded_circle: { 
    component: extruded_circle, 
    finalStyle: { left: '286px', top: '15px', width: '91px', height: '252px' },
    medianStyle: { left: '286px', top: '50px', width: '90px', height: '150px' },
    initialStyle: { left: '286px', top: '60px', width: '90px', height: '50px' },
    path: '/menu',
    section: 'Our signature salad',
    label: 'Signature\n Salads'
  },
  right_bottom_quarter: { 
    component: right_bottom_quarter, 
    finalStyle: { left: '14px', top: '252px', width: '156px', height: '156px' },
    medianStyle: { left: '10px', top: '252px', width: '100px', height: '100px' },
    initialStyle: { left: '0px', top: '252px', width: '34px', height: '34px' },
    path: '/menu',
    section: 'Make Your Own Fruit Salad',
    label: 'Make \nYour Fruit Salad'
  },
  octa_star: { 
    component: octa_star, 
    finalStyle: { left: '186px', top: '204px', width: '77px', height: '77px' },
    medianStyle: { left: '186px', top: '204px', width: '37px', height: '37px' },
    initialStyle: { left: '186px', top: '204px', width: '7px', height: '7px' },
  },
  teal_semi_circle: { 
    component: teal_semi_circle, 
    finalStyle: { left: '259px', top: '288px', width: '120px', height: '120px' },
    medianStyle: { left: '259px', top: '288px', width: '30px', height: '30px' },
    initialStyle: { left: '259px', top: '288px', width: '10px', height: '10px' },
    path: '/menu',
    section: 'Juices',
    label: 'Juices'
  },
  circle2: { 
    component: circle2, 
    finalStyle: { left: '171px', top: '310px', width: '98px', height: '138px' },
    medianStyle: { left: '178px', top: '322px', width: '30px', height: '30px' },
    initialStyle: { left: '178px', top: '322px', width: '7px', height: '7px' },
    path: '/menu',
    section: 'Desserts',
    label: 'Desserts'
  },
  small_triangle: { 
    component: small_triangle, 
    finalStyle: { left: '30px', top: '180px', width: '58px', height: '58px' },
    medianStyle: { left: '30px', top: '200px', width: '20px', height: '20px' },
    initialStyle: { left: '30px', top: '250px', width: '10px', height: '10px' },
  }
};

// Helper function to get responsive style based on screen size
export const getResponsiveStyle = (shapeName, isInitial = false) => {
  const shape = SHAPE_CONFIG[shapeName];
  if (!shape) return {};

  const width = window.innerWidth;
  const baseStyle = isInitial ? shape.initialStyle : shape.finalStyle;
  
  if (width <= 767) {
    return scaleStyle(baseStyle, SCALE_RATIOS.mobile);
  } else if (width <= 1024) {
    return scaleStyle(baseStyle, SCALE_RATIOS.tablet);
  } else {
    return baseStyle;
  }
};

// Enhanced asset preloader hook with better error handling and deduplication handleEvent
const useAssetPreloader = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const loadedAssetsRef = useRef(new Set());
  const loadingPromisesRef = useRef(new Map());

  // Collect all unique assets and deduplicate
  const allAssets = useMemo(() => {
    const uniqueAssets = [...new Set(Object.values(SHAPE_CONFIG).map(shape => shape.component))];
    return uniqueAssets;
  }, []);

  const preloadImage = useCallback((src) => {
    // Return existing promise if already loading
    if (loadingPromisesRef.current.has(src)) {
      return loadingPromisesRef.current.get(src);
    }

    // Return resolved promise if already loaded
    if (loadedAssetsRef.current.has(src)) {
      return Promise.resolve(src);
    }

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      
      const handleLoad = () => {
        loadedAssetsRef.current.add(src);
        loadingPromisesRef.current.delete(src);
        resolve(src);
      };

      const handleError = (error) => {
        loadingPromisesRef.current.delete(src);
        console.error(`Failed to load asset: ${src}`, error);
        reject(new Error(`Failed to load ${src}`));
      };

      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });
      
      // Set src after event listeners to avoid race conditions
      img.src = src;
    });

    loadingPromisesRef.current.set(src, promise);
    return promise;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      try {
        setLoadingError(null);
        setLoadingProgress(0);
        
        const totalAssets = allAssets.length;
        let loadedCount = 0;

        const updateProgress = () => {
          if (isMounted) {
            setLoadingProgress((loadedCount / totalAssets) * 100);
          }
        };

        // Load assets with individual error handling
        const loadPromises = allAssets.map(async (asset) => {
          try {
            await preloadImage(asset);
            if (isMounted) {
              loadedCount++;
              updateProgress();
            }
          } catch (error) {
            console.warn(`Asset loading failed: ${asset}`, error);
            if (isMounted) {
              loadedCount++;
              updateProgress();
            }
            // Don't throw - allow partial loading
          }
        });

        await Promise.allSettled(loadPromises);
        
        // Add small delay to ensure smooth transition
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              setIsLoaded(true);
            }
          }, 100);
        }
      } catch (error) {
        if (isMounted) {
          setLoadingError(error.message);
          // Still allow component to load even with errors
          setTimeout(() => {
            if (isMounted) {
              setIsLoaded(true);
            }
          }, 500);
        }
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [allAssets, preloadImage]);

  return { isLoaded, loadingProgress, loadingError };
};

// Enhanced loader component with better UX
const AssetLoader = ({ progress, error, currentLanguage }) => (
  <AnimatePresence>
    <Box
      as={motion.div}
      position="fixed"
      inset="0"
      bg="white"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="brand.200"
          color={error ? "red.500" : "brand.500"}
          size="xl"
          mb={4}
        />
      </motion.div>
      
      <Text
        fontSize="lg"
        fontWeight="medium"
        color={error ? "red.600" : "brand.700"}
        mb={2}
      >
        {error ? TRANSLATIONS[currentLanguage]['Loading with errors...'] : "..."}
      </Text>
      
      <Box
        width="375px"
        height="9px"
        bg="gray.200"
        borderRadius="full"
        overflow="hidden"
        mb={2}
      >
        <motion.div
          style={{
            height: '100%',
            background: error 
              ? 'linear-gradient(90deg, #e53e3e, #fc8181)' 
              : 'linear-gradient(90deg, #23d381ff, #63ed91ff)',
            borderRadius: 'inherit',
            width: `${progress}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </Box>
      
      <Text
        fontSize="sm"
        color="gray.500"
        mb={error ? 2 : 0}
      >
        {Math.round(progress)}%
      </Text>

      {error && (
        <Text
          fontSize="xs"
          color="red.500"
          textAlign="center"
          maxW="450px"
        >
          {TRANSLATIONS[currentLanguage]['Some assets failed to load but continuing...']}
        </Text>
      )}
    </Box>
  </AnimatePresence>
);

// Custom hook for smart touch handling
const useTouchHandler = (onTap) => {
  const touchStartRef = useRef(null);
  const touchMoveThreshold = 15;
  const touchTimeThreshold = 300;

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      moved: false
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    if (deltaX > touchMoveThreshold || deltaY > touchMoveThreshold) {
      touchStartRef.current.moved = true;
    }
  }, [touchMoveThreshold]);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;

    const touchDuration = Date.now() - touchStartRef.current.time;
    const wasMoved = touchStartRef.current.moved;

    if (!wasMoved && touchDuration < touchTimeThreshold) {
      e.preventDefault();
      e.stopPropagation();
      
      // Create a synthetic event with the touch coordinates for the spark
      const syntheticEvent = {
        ...e,
        clientX: e.changedTouches[0].clientX,
        clientY: e.changedTouches[0].clientY,
        touches: e.changedTouches
      };
      
      onTap(syntheticEvent);
    }

    touchStartRef.current = null;
  }, [onTap, touchTimeThreshold]);

  const handleClick = useCallback((e) => {
    if (!('ontouchstart' in window)) {
      onTap(e);
    } else {
      e.preventDefault();
    }
  }, [onTap]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onClick: handleClick,
  };
};


const FloatingShapesLayout = () => {
  const { isLoaded, loadingProgress, loadingError } = useAssetPreloader();
  const [animationPhase, setAnimationPhase] = useState('initial');
  const [jsonData, setJsonData] = useState(() =>
    Object.keys(SHAPE_CONFIG).reduce((acc, key) => {
      acc[key] = { id: key, status: 'moving', progress: 0 };
      return acc;
    }, {})
  );
  const navigate = useNavigate();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';
  const scrollContainerRef = useRef(null)
  const containerSize = useBreakpointValue({ 
    base: '80vw', 
    sm: '62vw',
    md: '48vw',
    lg: '25vw'
  }) || '80vw';
  const containerRef = useRef(null);
  const { createSpark } = useClickSpark();

  // Handle navigation to menu section with spark effect fontFami
  const handleShapeClick = useCallback((path, section, event) => {
    // Create spark effect at click position
    if (containerRef.current && event) {
      createSpark(event, containerRef.current);

    }

    // Navigate to the menu page with section as state
    // Add a short delay before navigation for spark effect
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    delay(350).then(() => {
      navigate(path, {
      state: { scrollTo: section },
      replace: false
      });
    });
  }, [navigate, createSpark]);

  // Memoized animation variants to prevent re-creation
  const getShapeVariants = useCallback((shape, index) => ({
    initial: {
      ...shape.initialStyle,
      opacity: 0,
      scale: 0,
    },
    median: {
      ...shape.medianStyle,
      opacity: 0.7,
      scale: 0.95,
      rotate: 0,
      transition: {
        delay: 0,
        duration: MOTION_CONFIG.MEDIAN.DURATION / 50,
        ease: MOTION_CONFIG.MEDIAN.EASE,
      }
    },
    settling: {
      ...shape.finalStyle,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        delay: 0,
        duration: MOTION_CONFIG.SETTLING.DURATION / 1000,
        ease: MOTION_CONFIG.SETTLING.EASE,
      }
    },
    floating: {
      ...shape.finalStyle,
      opacity: 1,
      scale: 1,
      rotate: 0,
      y: [0, -MOTION_CONFIG.FLOATING.Y_AMPLITUDE - (index % 3) * 4, 0],
      x: [0, (index % 2 === 0 ? MOTION_CONFIG.FLOATING.X_AMPLITUDE : -MOTION_CONFIG.FLOATING.X_AMPLITUDE), 0],
      transition: {
        y: {
          duration: MOTION_CONFIG.FLOATING.Y_DURATION + (index % 3) * 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * MOTION_CONFIG.FLOATING.STAGGER
        },
        x: {
          duration: MOTION_CONFIG.FLOATING.X_DURATION + (index % 2) * 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * MOTION_CONFIG.FLOATING.STAGGER
        }
      }
    }
  }), []);

  // Enable smooth scrolling behavior
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.style.scrollBehavior = 'smooth'
    }
  }, []);

  // Only start animation after assets are fully loaded
  useEffect(() => {
    if (!isLoaded) return;

    let timeouts = [];

    // Phase transitions: initial → median → settling → floating
    const timer1 = setTimeout(() => {
      setAnimationPhase('median');
    }, 50);

    const timer2 = setTimeout(() => {
      setAnimationPhase('settling');
    }, MOTION_CONFIG.MEDIAN.DURATION + 100);

    const timer3 = setTimeout(() => {
      setAnimationPhase('floating');
      setJsonData(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          updated[key] = { ...prev[key], status: 'settled', progress: 100 };
        });
        return updated;
      });
    }, MOTION_CONFIG.MEDIAN.DURATION + MOTION_CONFIG.SETTLING.DURATION + 200);

    timeouts.push(timer1, timer2, timer3);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isLoaded]);

  // Progress animation for median and settling phases
  useEffect(() => {
    if (animationPhase !== 'median' && animationPhase !== 'settling') return;

    const interval = setInterval(() => {
      setJsonData(prev => {
        const updated = {};
        let allComplete = true;
        
        Object.keys(prev).forEach(key => {
          const currentProgress = prev[key].progress;
          const newProgress = Math.min(currentProgress + Math.random() * 5 + 2, 100);
          
          updated[key] = {
            ...prev[key],
            progress: Math.round(newProgress),
            status: newProgress >= 100 ? 'settled' : 'moving'
          };
          
          if (newProgress < 100) allComplete = false;
        });
        
        return updated;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [animationPhase]);

  // Function to get responsive font size based on screen size
  const getResponsiveFontSize = useCallback(() => {
    return "18px";
  }, []);

  // Memoized shape component to prevent unnecessary re-renders
  const ShapeWrapper = useCallback(({ shapeName, index }) => {
    const shape = SHAPE_CONFIG[shapeName];
    const variants = getShapeVariants(shape, index);
    const translatedLabel = shape.label ? TRANSLATIONS[currentLanguage][shape.label] : '';
    
    // Smart touch handling for this specific shape
    const touchHandlers = useTouchHandler((event) => {
      if (shape.path && shape.section) {
        handleShapeClick(shape.path, shape.section, event);
      }
    });
    
    return (
      <Box
        as={motion.div}
        position="absolute"
        cursor={shape.path ? "pointer" : "default"}
        zIndex={10}
        _hover={{ zIndex: 20 }}
        variants={variants}
        initial="initial"
        animate={animationPhase}
        whileHover={{ 
          scale: animationPhase === 'floating' ? 1.05 : 1,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        role={shape.path ? "button" : "img"}
        aria-label={shape.path ? `Navigate to ${translatedLabel} section` : `Decorative shape ${shapeName}`}
        {...(shape.path ? touchHandlers : {})}
        title={shape.path && translatedLabel ? `Go to ${translatedLabel}` : undefined}
        display="flex"
        flexDirection="column"
        alignItems="center"
        h={"fit-content"}
        py={0}
        style={{ 
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {/* Shape image */}
        <Box
          as={motion.img}
          src={shape.component}
          alt={shapeName}
          width="100%"
          height="100%"
          objectFit="contain"
          loading="eager"
          draggable={false}
          m={0}
          transition={{ duration: 3, repeat: Infinity }}
          onError={(e) => {
            console.warn(`Shape image failed to load: ${shapeName}`, e);
          }}
          style={{
            pointerEvents: 'none'
          }}
        />
        
        {/* Permanent label subtitle - only show for shapes with labels */}
        {shape.label && (
          <Box
            as={motion.div}
            position="absolute"
            bottom="14%"
            left={0}
            w={'100%'}
            transform="translateX(-50%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            initial={{ opacity: 0, y: -15 }}
            animate={{ 
              opacity: animationPhase === 'floating' ? 1 : 0,
              y: animationPhase === 'floating' ? 0 : -15
            }}
            transition={{ 
              duration: 0.3, 
              delay: animationPhase === 'floating' ? 0.5 : 0
            }}
            style={{
              pointerEvents: 'none'
            }}
          >
            <Box
              bg="rgba(255, 255, 255, 0.4)"
              color="brand.700"
              px={0}
              py={0}
              borderRadius="md"
              fontSize='0.75em'
              fontWeight="900"
              textAlign="center"
              whiteSpace="nowrap"
              backdropFilter="blur(6px)"
              w={'65%'}
              h={"fit-content"}
              lineHeight="1.5"
              noOfLines={3}
              mx={0}
              fontFamily={isArabic ? "'Lalezar', sans-serif" : "'Permanent Marker', sans-serif"}
              dir={isArabic ? 'rtl' : 'ltr'}
            >
              {translatedLabel.split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  }, [animationPhase, jsonData, getShapeVariants, getResponsiveFontSize, currentLanguage, isArabic, handleShapeClick]);

  // Memoized particles to prevent re-creation #
  const MedianParticles = useMemo(() => {
    if (animationPhase !== 'median') return null;
    
    return [...Array(12)].map((_, i) => (
      <Box
        as={motion.div}
        key={`median-${i}`}
        position="absolute"
        width="5px"
        height="5px"
        bg="teal.400"
        borderRadius="full"
        initial={{
          x: Math.random() * window.innerWidth * 0.5,
          y: Math.random() * window.innerHeight * 0.5,
          opacity: 0
        }}
        animate={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: [0, 0.8, 0],
          scale: [0, 1.2, 0]
        }}
        transition={{
          duration: 4,
          delay: i * 0.06,
          ease: "easeInOut"
        }}
      />
    ));
  }, [animationPhase]);

  const SettlingParticles = useMemo(() => {
    if (animationPhase !== 'settling') return null;
    
    return [...Array(15)].map((_, i) => (
      <Box
        as={motion.div}
        key={`settling-${i}`}
        position="absolute"
        width="6px"
        height="6px"
        bg="brand.400"
        borderRadius="full"
        initial={{
          x: Math.random() * -window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: 0
        }}
        animate={{
          x: Math.random() * 3 * window.innerWidth,
          y: Math.random() * window.innerHeight,
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{
          duration: 6,
          delay: i * 0.08,
          ease: "easeOut"
        }}
      />
    ));
  }, [animationPhase]);

  const FloatingParticles = useMemo(() => {
    if (animationPhase !== 'floating') return null;
    
    return [...Array(8)].map((_, i) => (
      <Box
        as={motion.div}
        key={`floating-${i}`}
        position="absolute"
        width="6px"
        height="6px"
        bg="indigo.300"
        borderRadius="full"
        opacity={0.4}
        animate={{
          x: [0, 225 + i * 30, 0],
          y: [0, -150 + i * 22.5, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 9 + i * 1.5,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeInOut"
        }}
        left={`${75 + i * 135}px`}
        top={`${300 + i * 90}px`}
      />
    ));
  }, [animationPhase]);

  // Render loader until all assets are loaded
  if (!isLoaded) {
    return <AssetLoader progress={loadingProgress} error={loadingError} currentLanguage={currentLanguage} />;
  }

  return (
    <AnimatePresence>
      <Box 
        ref={containerRef}
        as={motion.div}
        width={containerSize}
        minW={'400px'}
        height="460px"
        position="relative"
        overflow="hidden"
        top={{base: 0, md: 4,lg:12}}
        pt={8} 
        mt={1}
        px={0}
        mx={0}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 8 }}
      >
        {/* Animated background */}
        <Box
          as={motion.div}
          position="absolute"
          inset="0"
          opacity={0.05}
          animate={{ 
            backgroundPosition: animationPhase === 'floating' ? ['0% 0%', '100% 100%'] : '0% 0%'
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Render all shapes */}
        <AnimatePresence>
          {Object.keys(SHAPE_CONFIG).map((shapeName, index) => (
            <ShapeWrapper 
              key={shapeName} 
              shapeName={shapeName} 
              index={index} 
            />
          ))}
        </AnimatePresence>

        {/* Particles */}
        <AnimatePresence>
          {MedianParticles}
          {SettlingParticles}
          {FloatingParticles}
        </AnimatePresence>
      </Box>
    </AnimatePresence>
  );
};

export default FloatingShapesLayout;