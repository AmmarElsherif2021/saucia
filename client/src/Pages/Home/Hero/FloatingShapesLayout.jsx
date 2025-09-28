import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Image, useBreakpointValue, Spinner, Text, Link } from '@chakra-ui/react';

// Import SVG shape components shadow
import circle from './circle.svg';
import small_circle from './small_circle.svg';
import top_left_semi_circle from './orange_semi_circle.svg';
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
  tablet: 0.90, // 0.60 * 1.5
  mobile: 0.375 // 0.25 * 1.5
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

// Updated shape configuration with composed SVGs - all dimensions scaled by 1.5
const SHAPE_CONFIG = {
  top_left_semi_circle: { 
    component: top_left_semi_circle, 
    finalStyle: { left: '22.5px', top: '15px', width: '192px', height: '192px' }, // 15*1.5, 10*1.5, 128*1.5
    initialStyle: { left: '-192px', top: '-75px', width: '192px', height: '192px' }, // -128*1.5, -50*1.5, 128*1.5
    path: '/menu',
    section: 'make your own salad',
    label: 'Make Your Salad'
  },
  circle: { 
    component: circle, 
    finalStyle: { left: '232.5px', top: '108px', width: '115.5px', height: '115.5px' }, // 155*1.5, 72*1.5, 77*1.5
    initialStyle: { left: '232.5px', top: '90px', width: '7.5px', height: '7.5px' }, // 155*1.5, 60*1.5, 5*1.5
    path: '/menu',
    section: 'Soups',
    label: 'Soups'
  },
  small_circle: { 
    component: small_circle, 
    finalStyle: { left: '210px', top: '22.5px', width: '64.5px', height: '64.5px' }, // 140*1.5, 15*1.5, 43*1.5
    initialStyle: { left: '202.5px', top: '-72px', width: '72px', height: '72px' }, // 135*1.5, -48*1.5, 48*1.5
  },
  extruded_circle: { 
    component: extruded_circle, 
    finalStyle: { left: '357px', top: '3px', width: '114px', height: '315px' }, // 238*1.5, 2*1.5, 76*1.5, 210*1.5
    initialStyle: { left: '370.5px', top: '3px', width: '7.5px', height: '7.5px' }, // 247*1.5, 2*1.5, 5*1.5
    path: '/menu',
    section: 'Our signature salad',
    label: 'Signature\n Salads'
  },
  right_bottom_quarter: { 
    component: right_bottom_quarter, 
    finalStyle: { left: '18px', top: '315px', width: '195px', height: '195px' }, // 12*1.5, 210*1.5, 130*1.5
    initialStyle: { left: '-288px', top: '240px', width: '42px', height: '42px' }, // -192*1.5, 160*1.5, 28*1.5
    path: '/menu',
    section: 'Make Your Own Fruit Salad',
    label: 'Make \nYour Fruit Salad'
  },
  octa_star: { 
    component: octa_star, 
    finalStyle: { left: '232.5px', top: '255px', width: '96px', height: '96px' }, // 155*1.5, 170*1.5, 64*1.5
    initialStyle: { left: '1200px', top: '300px', width: '96px', height: '96px' }, // 800*1.5, 200*1.5, 64*1.5
  },
  teal_semi_circle: { 
    component: teal_semi_circle, 
    finalStyle: { left: '324px', top: '360px', width: '150px', height: '150px' }, // 216*1.5, 240*1.5, 100*1.5
    initialStyle: { left: '1050px', top: '600px', width: '192px', height: '96px' }, // 700*1.5, 400*1.5, 128*1.5, 64*1.5
    path: '/menu',
    section: 'Juices',
    label: 'Juices'
  },
  circle2: { 
    component: circle2, 
    finalStyle: { left: '222px', top: '402px', width: '97.5px', height: '97.5px' }, // 148*1.5, 268*1.5, 65*1.5
    initialStyle: { left: '450px', top: '150px', width: '120px', height: '120px' }, // 300*1.5, 100*1.5, 80*1.5
    path: '/menu',
    section: 'Desserts',
    label: 'Desserts'
  },
  small_triangle: { 
    component: small_triangle, 
    finalStyle: { left: '37.5px', top: '225px', width: '72px', height: '72px' }, // 25*1.5, 150*1.5, 48*1.5
    initialStyle: { left: '225px', top: '450px', width: '72px', height: '72px' }, // 150*1.5, 300*1.5, 48*1.5
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
          }, 200);
        }
      } catch (error) {
        if (isMounted) {
          setLoadingError(error.message);
          // Still allow component to load even with errors
          setTimeout(() => {
            if (isMounted) {
              setIsLoaded(true);
            }
          }, 1000);
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
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
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
        width="375px" // 250 * 1.5
        height="9px" // 6 * 1.5
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
          maxW="450px" // 300 * 1.5
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
  const touchMoveThreshold = 15; // 10 * 1.5
  const touchTimeThreshold = 300; // milliseconds

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
        touches: e.changedTouches // Pass changedTouches as touches for spark positioning
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
    base: '97vw', 
    sm: '75vw', // 50 * 1.5
    md: '52.5vw', // 35 * 1.5
    lg: '45vw' // 30 * 1.5
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
    settling: {
      ...shape.finalStyle,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 7.5 + (index * 0.2),
        ease: [0.25, 0.8, 0.25, 1],
      }
    },
    floating: {
      ...shape.finalStyle,
      opacity: 1,
      scale: 1,
      rotate: 0,
      filter: 'blur(0px)',
      y: [0, -12 - (index % 3) * 6, 0], // -8 * 1.5, (index % 3) * 4 * 1.5
      x: [0, (index % 2 === 0 ? 6 : -6), 0], // 4 * 1.5, -4 * 1.5
      transition: {
        y: {
          duration: 2 + (index % 3),
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.1
        },
        x: {
          duration: 3 + (index % 2),
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.1
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

    // Phase transitions with proper cleanup
    const timer1 = setTimeout(() => {
      setAnimationPhase('settling');
    }, 100);

    const timer2 = setTimeout(() => {
      setAnimationPhase('floating');
      setJsonData(prev => {
        const updated = {};
        Object.keys(prev).forEach(key => {
          updated[key] = { ...prev[key], status: 'settled', progress: 100 };
        });
        return updated;
      });
    }, 500);

    timeouts.push(timer1, timer2);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isLoaded]);

  // Progress animation for settling phase
  useEffect(() => {
    if (animationPhase !== 'settling') return;

    const interval = setInterval(() => {
      setJsonData(prev => {
        const updated = {};
        let allComplete = true;
        
        Object.keys(prev).forEach(key => {
          const currentProgress = prev[key].progress;
          const newProgress = Math.min(currentProgress + Math.random() * 3 + 1, 100);
          
          updated[key] = {
            ...prev[key],
            progress: Math.round(newProgress),
            status: newProgress >= 100 ? 'settled' : 'moving'
          };
          
          if (newProgress < 100) allComplete = false;
        });
        
        return updated;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [animationPhase]);

  // Function to get responsive font size based on screen size
  const getResponsiveFontSize = useCallback(() => {
    return "18px"; // 12 * 1.5
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
          // animate={animationPhase === 'floating' ? {
          //   filter: [
          //     'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          //     'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
          //     'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          //   ]
          // } : {}}
          transition={{ duration: 3, repeat: Infinity }}
          onError={(e) => {
            console.warn(`Shape image failed to load: ${shapeName}`, e);
          }}
          style={{
            pointerEvents: 'none' // Prevent image from interfering with touch events
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
            initial={{ opacity: 0, y: -15 }} // -10 * 1.5
            animate={{ 
              opacity: animationPhase === 'floating' ? 1 : 0,
              y: animationPhase === 'floating' ? 0 : -15 // -10 * 1.5
            }}
            transition={{ 
              duration: 0.5, 
              delay: animationPhase === 'floating' ? 1 : 0
            }}
            style={{
              pointerEvents: 'none' // Prevent label from interfering with touch events
            }}
          >
            <Box
              bg="rgba(255, 255, 255, 0.4)"
              color="brand.700"
              px={0}
              py={0}
              borderRadius="md"
              fontSize='0.75em' // 0.5 * 1.5
              fontWeight="900"
              textAlign="center"
              whiteSpace="nowrap"
              backdropFilter="blur(6px)" // 4 * 1.5
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
  const SettlingParticles = useMemo(() => {
    if (animationPhase !== 'settling') return null;
    
    return [...Array(15)].map((_, i) => (
      <Box
        as={motion.div}
        key={`settling-${i}`}
        position="absolute"
        width="6px" // 4 * 1.5
        height="6px" // 4 * 1.5
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
          duration: 3,
          delay: i * 0.1,
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
        width="6px" // 4 * 1.5
        height="6px" // 4 * 1.5
        bg="indigo.300"
        borderRadius="full"
        opacity={0.4}
        animate={{
          x: [0, 225 + i * 30, 0], // 150 * 1.5, i * 20 * 1.5
          y: [0, -150 + i * 22.5, 0], // -100 * 1.5, i * 15 * 1.5
          opacity: [0.2, 0.6, 0.2],
          scale: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 12 + i * 2,
          repeat: Infinity,
          delay: i * 0.8,
          ease: "easeInOut"
        }}
        left={`${75 + i * 135}px`} // 50 * 1.5, i * 90 * 1.5
        top={`${300 + i * 90}px`} // 200 * 1.5, i * 60 * 1.5
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
        minW={'510px'} // 340 * 1.5
        height="595px" // 390 * 1.5
        position="relative"
        overflow="hidden"
        top={{base: 0, md: 2,lg:12}} // 32 * 1.5
        pt={0} 
        mt={0}
        px={6} // 4 * 1.5
        mx={'auto'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        //bg={'orange.500'}
        //border={'3px solid #114589ff'} // 2 * 1.5
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
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
          {SettlingParticles}
          {FloatingParticles}
        </AnimatePresence>
      </Box>
    </AnimatePresence>
  );
};

export default FloatingShapesLayout;