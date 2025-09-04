import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Image, useBreakpointValue, Spinner, Text, Link } from '@chakra-ui/react';

// Import SVG shape components
import circle from './circle.svg';
import small_circle from './small_circle.svg';
import orange_semi_circle from './orange_semi_circle.svg';
import extruded_circle from './extruded_circle.svg';
import right_bottom_quarter from './right_bottom_quarter.svg';
import octa_star from './octa_star.svg';
import teal_semi_circle from './teal_semi_circle.svg';
import circle2 from './circle2.svg';
import small_triangle from './small_triangle.svg';
import { useNavigate } from 'react-router';

// Responsive scaling ratios
const SCALE_RATIOS = {
  tablet: 0.60,
  mobile: 0.25
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

// Updated shape configuration with composed SVGs
const SHAPE_CONFIG = {
  orange_semi_circle: { 
    component: orange_semi_circle, 
    finalStyle: { left: '10px', top: '10px', width: '128px', height: '128px' },
    initialStyle: { left: '-128px', top: '-50px', width: '128px', height: '128px' },
    path: '/menu',
    section: 'Soups',
    label: 'Soups'
  },
  circle: { 
    component: circle, 
    finalStyle: { left: '150px', top: '60px', width: '90px', height: '90px' },
    initialStyle: { left: '195px', top: '-144px', width: '144px', height: '144px' },
    path: '/menu',
    section: 'make your own salad',
    label: 'Make Your Own Salad'
  },
  small_circle: { 
    component: small_circle, 
    finalStyle: { left: '140px', top: '12px', width: '43px', height: '43px' },
    initialStyle: { left: '135px', top: '-48px', width: '48px', height: '48px' },
  },
  extruded_circle: { 
    component: extruded_circle, 
    finalStyle: { left: '247px', top: '-50px', width: '70px', height: '320px' },
    initialStyle: { left: '247px', top: '-200px', width: '70px', height: '60px' },
    path: '/menu',
    section: 'Our signature salad',
    label: 'Our Signature Salad'
  },
  right_bottom_quarter: { 
    component: right_bottom_quarter, 
    finalStyle: { left: '-15px', top: '220px', width: '192px', height: '128px' },
    initialStyle: { left: '-192px', top: '160px', width: '192px', height: '128px' },
    path: '/menu',
    section: 'Make Your Own Fruit Salad',
    label: 'Make Your Own Fruit Salad'
  },
  octa_star: { 
    component: octa_star, 
    finalStyle: { left: '155px', top: '170px', width: '64px', height: '64px' },
    initialStyle: { left: '800px', top: '200px', width: '64px', height: '64px' },

  },
  teal_semi_circle: { 
    component: teal_semi_circle, 
    finalStyle: { left: '230px', top: '225px', width: '100px', height: '150px' },
    initialStyle: { left: '700px', top: '400px', width: '128px', height: '64px' },
    path: '/menu',
    section: 'Juices',
    label: 'Juices'
  },
  circle2: { 
    component: circle2, 
    finalStyle: { left: '150px', top: '280px', width: '76px', height: '76px' },
    initialStyle: { left: '300px', top: '100px', width: '80px', height: '80px' },
    path: '/menu',
    section: 'Desserts',
    label: 'Desserts'
  },
  small_triangle: { 
    component: small_triangle, 
    finalStyle: { left: '25px', top: '150px', width: '48px', height: '48px' },
    initialStyle: { left: '150px', top: '300px', width: '48px', height: '48px' },
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

// Enhanced asset preloader hook with better error handling and deduplication
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
const AssetLoader = ({ progress, error }) => (
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
        {error ? "Loading with errors..." : "..."}
      </Text>
      
      <Box
        width="250px"
        height="6px"
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
              : 'linear-gradient(90deg, #3182ce, #63b3ed)',
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
          maxW="300px"
        >
          Some assets failed to load but continuing...
        </Text>
      )}
    </Box>
  </AnimatePresence>
);

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
  const scrollContainerRef = useRef(null)
  const containerSize = useBreakpointValue({ 
    base: '90vw', 
    sm: '47vw', 
    md: '35vw', 
    lg: '30vw' 
  }) || '80vw';

  // Handle navigation to menu section
  const handleShapeClick = useCallback((path, section) => {
    // Navigate to the menu page with section as state
    navigate(path, { 
      state: { scrollTo: section },
      replace: false
    });
  }, [navigate]);

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
      y: [0, -8 - (index % 3) * 4, 0],
      x: [0, (index % 2 === 0 ? 4 : -4), 0],
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
    }, [])
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

  // Memoized shape component to prevent unnecessary re-renders
  const ShapeWrapper = useCallback(({ shapeName, index }) => {
    const shape = SHAPE_CONFIG[shapeName];
    const variants = getShapeVariants(shape, index);
    
    return (
      <Box
        as={motion.div}
        position="absolute"
        cursor="pointer"
        zIndex={10}
        _hover={{ zIndex: 20 }}
        variants={variants}
        initial="initial"
        animate={animationPhase}
        whileHover={{ 
          scale: animationPhase === 'floating' ? 1.15 : 1,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        role="button"
        aria-label={`Navigate to ${shape.label} section`}
        onClick={() => handleShapeClick(shape.path, shape.section)}
        title={shape.label && `Go to ${shape.label}`}
      >
        {/* Optimized image with proper loading states */}
        <Box
          as={motion.img}
          src={shape.component}
          alt={shapeName}
          width="100%"
          height="100%"
          objectFit="contain"
          loading="eager"
          draggable={false}
          animate={animationPhase === 'floating' ? {
            filter: [
              'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
              'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            ]
          } : {}}
          transition={{ duration: 3, repeat: Infinity }}
          onError={(e) => {
            console.warn(`Shape image failed to load: ${shapeName}`, e);
          }}
        />
        
        {/* Label tooltip - only show when floating */}
        <AnimatePresence>
          {animationPhase === 'floating' && (
            <Box
              as={motion.div}
              position="absolute"
              bottom="-30px"
              left="50%"
              transform="translateX(-50%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              opacity={0}
              pointerEvents="none"
              initial={{ scale: 0, y: -10, opacity: 0 }}
              whileHover={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                bg="white"
                color="brand.700"
                px={3}
                py={1}
                borderRadius="md"
                boxShadow="md"
                fontSize="xs"
                fontWeight="bold"
                whiteSpace="nowrap"
              >
                {shape.label}
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
    );
  }, [animationPhase, jsonData, getShapeVariants]);

  // Memoized particles to prevent re-creation
  const SettlingParticles = useMemo(() => {
    if (animationPhase !== 'settling') return null;
    
    return [...Array(15)].map((_, i) => (
      <Box
        as={motion.div}
        key={`settling-${i}`}
        position="absolute"
        width="4px"
        height="4px"
        bg="blue.400"
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
        width="4px"
        height="4px"
        bg="indigo.300"
        borderRadius="full"
        opacity={0.4}
        animate={{
          x: [0, 150 + i * 20, 0],
          y: [0, -100 + i * 15, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 12 + i * 2,
          repeat: Infinity,
          delay: i * 0.8,
          ease: "easeInOut"
        }}
        left={`${50 + i * 90}px`}
        top={`${200 + i * 60}px`}
      />
    ));
  }, [animationPhase]);

  // Render loader until all assets are loaded
  if (!isLoaded) {
    return <AssetLoader progress={loadingProgress} error={loadingError} />;
  }

  return (
    <AnimatePresence>
      <Box 
        as={motion.div}
        width={containerSize}
        minW={'350px'}
        height="100vh"
        position="relative"
        overflow="hidden"
        mt={'50px'}
        pt={'50px'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
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