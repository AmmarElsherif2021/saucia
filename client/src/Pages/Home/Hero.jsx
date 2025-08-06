import { useEffect, useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import { 
  Box, 
  Flex, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  Button, 
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useI18nContext } from '../../Contexts/I18nContext'
// Directly import JSON animations
import hero1 from '../../assets/hero/hero-1.json'
import hero2 from '../../assets/hero/hero-2.json'
import hero3 from '../../assets/hero/hero-3.json'
import hero4 from '../../assets/hero/hero-4.json'




const LocalLottieAnimation = ({ currentSlide, className = "" }) => {
  const lottieRef = useRef(null)
  
  const animationConfigs = useMemo(() => [
    {
      animationData: hero1,
      colors: ['#059669', '#10b981', '#34d399'],
      name: 'salad-bowl'
    },
    {
      animationData: hero2,
      colors: ['#059669', '#10b981', '#34d399'],
      name: 'create-custom'
    },
    {
      animationData: hero3,
      colors: ['#059669', '#10b981', '#34d399'],
      name: 'signature-dish'
    },
    {
      animationData: hero4,
      colors: ['#059669', '#10b981', '#34d399'],
      name: 'nutrition-expert'
    },
    {
      animationData: hero1, // Reusing hero1 for slide 4
      colors: ['#059669', '#10b981', '#34d399'],
      name: 'premium-offers'
    }
  ], [])

  const config = animationConfigs[currentSlide] || animationConfigs[0]
  
  // Force restart animation when slide changes
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(0, true)
      lottieRef.current.play()
    }
  }, [currentSlide])
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={`lottie-${currentSlide}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={config.animationData}
          loop={true}
          autoplay={true}
          className="w-full h-full"
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid meet',
            hideOnTransparent: true
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

const TextContent = ({ slide, isActive }) => {
  const { currentLanguage } = useI18nContext()
  const isRTL = currentLanguage === 'ar'
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const indicatorColor = useColorModeValue('gray.300', 'gray.600')
  const isMobile = useBreakpointValue({ base: true, lg: false })

  if (!slide) return null

  // Determine alignment and textAlign based on language and screen size
  let alignItems, textAlign
  if (isMobile) {
    alignItems = 'center'
    textAlign = 'center'
  } else {
    alignItems = isRTL ? 'flex-end' : 'flex-start'
    textAlign = isRTL ? 'right' : 'left'
  }

  // Helper function to handle section navigation state
  const handleSectionNavigation = (section) => {
    if (section) {
      return { scrollTo: section }
    }
    return undefined
  }

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={`text-${slide.id}`}
          initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Flex
            direction="column"
            gap={6}
            alignItems={alignItems}
            textAlign={textAlign}
            maxW="2xl"
          >
            <Heading
              as="h1"
              size={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="extrabold"
              lineHeight="tall"
              bgGradient="linear(to-r, brand.700, secondary.600)"
              bgClip="text"
            >
              {slide.name}
            </Heading>

            <Text
              fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
              color={textColor}
              fontWeight="normal"
              lineHeight="relaxed"
              maxW="90%"
            >
              {slide.description}
            </Text>

            {slide.path && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Link 
                  to={slide.path}
                  state={slide.section ? handleSectionNavigation(slide.section) : undefined}
                >
                  <Button
                    size={{ base: 'md', md: 'lg' }}
                    px={{ base: 6, md: 8 }}
                    py={{ base: 3, md: 4 }}
                    colorScheme="brand"
                    bgGradient="linear(to-r, brand.500, brand.800)"
                    _hover={{
                      transform: 'translateY(-1px) scale(1.05)',
                      boxShadow: '2xl',
                      bgGradient: 'linear(to-r, brand.600, brand.700)'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    transition="all 0.2s"
                    borderRadius="full"
                    boxShadow="xl"
                  >
                    <Flex alignItems="center" gap={2}>
                      <span>{currentLanguage === 'en' ? 'Explore Now' : 'اكتشف الآن'}</span>
                      <motion.span
                        animate={{
                          x: isRTL ? [-4, 0] : [0, 4]
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          repeatType: 'reverse'
                        }}
                      >
                        {isRTL ? '←' : '→'}
                      </motion.span>
                    </Flex>
                  </Button>
                </Link>
              </motion.div>
            )}

            <Flex gap={2} mt={4}>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ width: '8px' }}
                  animate={{
                    width: i === slide.id ? '32px' : '8px',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    h="1"
                    borderRadius="full"
                    transition="background-color 0.3s"
                    bg={i === slide.id ? 'brand.500' : indicatorColor}
                  />
                </motion.div>
              ))}
            </Flex>
          </Flex>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const Hero = () => {
  const { currentLanguage } = useI18nContext()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const intervalRef = useRef(null)
  const isMobile = useBreakpointValue({ base: true, lg: false })
  const bgFrom = useColorModeValue('white', 'gray.900')
  const bgVia = useColorModeValue('secondary.50', 'gray.800')
  const bgTo = useColorModeValue('secondary.100', 'gray.900')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const heroSlides = useMemo(
    () => [
      {
        id: 0,
        name: currentLanguage === 'en' ? 'Welcome to SauciaSalad!' : 'مرحبًا بكم في سوسيا سالاد!',
        description:
          currentLanguage === 'en'
            ? 'Delicious taste and healthy choices supervised by nutrition experts. Experience the perfect blend of flavor and wellness!'
            : 'طعم لذيذ واختيارات صحية بإشراف خبراء التغذية، جرب معنا واستمتع بالطعم الصح.',
        path: '/menu',
        section: '' // No specific section, just navigate to menu
      },
      {
        id: 1,
        name:
          currentLanguage === 'en'
            ? 'Create Your Own Salad & Fruit Bowl'
            : 'اصنع سلطتك وطبق الفواكه الخاص بك',
        description:
          currentLanguage === 'en'
            ? 'Pick your favorite ingredients and craft your perfect salad—fresh, tasty, and personalized just for you!'
            : 'اختر مكوناتك المفضلة واصنع سلطتك المثالية - طازجة ولذيذة ومخصصة لك!',
        path: '/menu',
        section: 'Make Your Own Salad' // Navigate to specific section
      },
      {
        id: 2,
        name:
          currentLanguage === 'en'
            ? 'Signature Salads, Crafted to Perfection'
            : 'سلطات مميزة، مصنوعة بإتقان',
        description:
          currentLanguage === 'en'
            ? 'Our expertly designed salads, packed with fresh ingredients and unique flavors—ready for you to enjoy.'
            : 'سلطاتنا المصممة بعناية، مليئة بالمكونات الطازجة والنكهات الفريدة - جاهزة لتستمتع بها.',
        path: '/menu',
        section: 'Our signature salad' // Navigate to signature salads section
      },
      {
        id: 3,
        name:
          currentLanguage === 'en' ? 'Meet Our Nutrition Expert' : 'خدمك بكل ود واهتمام',
        description:
          currentLanguage === 'en'
            ? 'Balance, taste, and nutrition—our experts ensure every meal is both healthy and absolutely delicious!'
            : 'التوازن والطعم والتغذية - خبرؤنا يضمنون أن كل وجبة صحية ولذيذة!',
        path: '/',
        section: 'about us' // Navigate to about section on home page
      },
      {
        id: 4,
        name:
          currentLanguage === 'en'
            ? 'Exclusive Offers & Premium Meal Plans'
            : 'عروض حصرية وخطط وجبات مميزة',
        description:
          currentLanguage === 'en'
            ? 'Enjoy personalized meal plans, loyalty rewards, and unbeatable offers—crafted perfectly for your lifestyle.'
            : 'استمتع بخطط وجبات مخصصة، ومكافآت ولاء، وعروض لا تقاوم - مصممة لأسلوب حياتك.',
        path: '/premium',
        section: '' // Navigate to premium page
      },
    ],
    [currentLanguage],
  )

  // Auto-advance slides with proper cleanup
  useEffect(() => {
    if (!isMounted) return
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [heroSlides.length, isMounted])

  if (!isMounted) {
    return (
      <Flex h="100vh" w="full" align="center" justify="center" bg={bgFrom}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '6rem',
            height: '6rem',
            border: '3px solid',
            borderColor: 'secondary.200',
            opacity: 0.4,
            borderRadius: 'full'
          }}
        />
      </Flex>
    )
  }

  return (
    <Box
      as="section"
      minH="100vh"
      w="full"
      bgGradient={`linear(to-br, ${bgFrom}, ${bgVia}, ${bgTo})`}
      position="relative"
      overflow="hidden"
      role="banner"
      aria-label="Hero section"
    >
      {/* Background gradient animation */}
      <Box position="absolute" inset={0} opacity={0.05}>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3)),
                             radial-gradient(circle at 80% 20%, rgba(35, 122, 79, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 40% 80%, rgba(22, 249, 162, 0.3) 0%, transparent 50%)`,
            backgroundSize: '100% 100%'
          }}
        />
      </Box>
      
      {/* Main content container */}
      <Box maxW="7xl" mx="auto" h="full" position="relative" zIndex={10} px={4}>
        {isMobile ? (
          <Flex 
            direction="column" 
            minH="100vh" 
            justify="center" 
            align="center" 
            textAlign="center" 
            gap={8} 
            py={12}
          >
            {/* Animation section */}
            <Box w="64" h="64" flexShrink={0}>
              <LocalLottieAnimation currentSlide={currentSlideIndex} />
            </Box>
            
            {/* Text content section */}
            <Box flex={1} w="full" display="flex" alignItems="center" justifyContent="center">
              <TextContent slide={heroSlides[currentSlideIndex]} isActive={true} />
            </Box>
          </Flex>
        ) : (
          <Grid templateColumns="repeat(2, 1fr)" h="100vh" alignItems="center" gap={12}>
            {/* Text content section - Left */}
            <GridItem>
              <Flex h="full" align="center" justify="flex-start">
                <TextContent slide={heroSlides[currentSlideIndex]} isActive={true} />
              </Flex>
            </GridItem>
            
            {/* Animation section - Right */}
            <GridItem>
              <Flex h="full" align="center" justify="center">
                <Box w="full" maxW="lg" h="96">
                  <LocalLottieAnimation currentSlide={currentSlideIndex} />
                </Box>
              </Flex>
            </GridItem>
          </Grid>
        )}
      </Box>

      {/* Floating background elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          position: 'absolute',
          top: '5rem',
          left: '2.5rem',
          width: '4rem',
          height: '4rem',
          backgroundColor: 'var(--chakra-colors-secondary-600)',
          borderRadius: 'full',
          opacity: 0.2
        }}
      />
      
      <motion.div
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -3, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          bottom: '8rem',
          left: '4rem',
          width: '3rem',
          height: '3rem',
          backgroundColor: 'var(--chakra-colors-brand-400)',
          borderRadius: 'full',
          opacity: 0.2
        }}
      />

      <motion.div
        animate={{ 
          y: [0, -10, 0],
          x: [0, 5, 0]
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
        style={{
          position: 'absolute',
          top: '33%',
          right: '5rem',
          width: '2rem',
          height: '2rem',
          backgroundColor: 'var(--chakra-colors-orange-100)',
          borderRadius: 'full',
          opacity: 0.2
        }}
      />
    </Box>
  )
}
//rotate