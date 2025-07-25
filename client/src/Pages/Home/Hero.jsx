import {
  Box,
  Heading,
  Text,
  useColorMode,
  useBreakpointValue,
  Flex,
  Container,
  Button,
  VStack,
} from '@chakra-ui/react'
import { ItemsCarousel } from '../../Components/ItemsCarousel'
import heroA from '../../assets/hero/heroA.JPG'
import heroB from '../../assets/hero/heroB.JPG'
import heroC from '../../assets/hero/heroC.PNG'
import heroD from '../../assets/hero/heroD.JPG'
import heroE from '../../assets/hero/heroE.JPG'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useTranslation } from 'react-i18next'
import { Link, Link as RouterLink } from 'react-router-dom'

export const AnimatedText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('')
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  // Safely handle undefined text
  const safeText = text || ''

  useEffect(() => {
    const onChangeHandler = (latest) => {
      setDisplayText(safeText.slice(0, latest))
    }
    rounded.on('change', onChangeHandler)
    return () => rounded.clearListeners('change')
  }, [rounded, safeText])

  useEffect(() => {
    const controls = animate(count, safeText.length, {
      type: 'tween',
      delay: delay,
      duration: safeText.length * 0.06,
      ease: 'easeInOut',
    })
    return () => controls.stop()
  }, [safeText, delay, count])

  return (
    <motion.span
      style={
        {
          /* ... */
        }
      }
    >
      {displayText}
    </motion.span>
  )
}

// Motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

const HeroCard = ({ item }) => {
  const { id, name, description, image, path } = item || {}
  const { colorMode } = useColorMode()
  const { currentLanguage } = useI18nContext()
  const { t } = useTranslation()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const isArabic = currentLanguage === 'ar'

  // Responsive layout: column on mobile, row on md+
  const contentLayout = useBreakpointValue({
    base: 'column',
    md: 'row',
  })

  // Responsive width for content/image
  const contentWidth = useBreakpointValue({
    base: '86%',
    md: '50%',
  })

  const optimizedImage = useMemo(() => image, [image])

  // Preload image and handle loading states
  useEffect(() => {
    if (optimizedImage) {
      const img = new Image()
      img.onload = () => {
        setIsLoaded(true)
        setHasError(false)
      }
      img.onerror = () => {
        setHasError(true)
        setIsLoaded(false)
      }
      img.src = optimizedImage
    }
  }, [optimizedImage])

  const MotionFlex = motion(Flex)
  const MotionBox = motion(Box)

  return (
    <Box
      key={id}
      bgImage={`url(${optimizedImage})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      minHeight={{ base: '80vh', md: '100vh' }}
      width="100vw"
      left="50%" // Center the element
      marginLeft="-50vw" // Offset for centering
      position="relative"
      px={{ base: 12, md: 16, lg: 24 }}
      py={{ base: 6, md: 0 }}
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Loading overlay - only show when not loaded and no error */}
      {!isLoaded && !hasError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={0}
        >
          <Box
            as={motion.div}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
            w="60px"
            h="60px"
            border="4px solid"
            borderColor="brand.200"
            borderTopColor="brand.500"
            borderRadius="full"
          />
        </Box>
      )}

      {/* Error fallback */}
      {hasError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={0}
        >
          <Text color="gray.500" fontSize="lg">
            Image failed to load
          </Text>
        </Box>
      )}

      {/* Dark overlay for better text readability */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="blackAlpha.400"
        zIndex={0}
      />

      <Container
        maxW="container.xl"
        height="100%"
        centerContent={false}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={0}
        position="relative"
        zIndex={1}
      >
        <MotionFlex
          alignItems="stretch"
          justifyContent="space-between"
          flexDirection={contentLayout}
          w="80%"
          gap={{ base: 8, md: 12, lg: 24 }}
          //bg={colorMode === 'light' ? 'whiteAlpha.800' : 'blackAlpha.800'}
          padding={0}
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded || hasError ? 'visible' : 'hidden'}
        >
          <MotionBox
            as={VStack}
            width={contentWidth}
            maxW={{ base: '100%', md: '520px' }}
            variants={itemVariants}
            textAlign={isArabic ? 'right' : 'left'}
            alignItems={
              contentLayout === 'column' ? 'center' : isArabic ? 'flex-end' : 'flex-start'
            }
            mb={contentLayout === 'column' ? 4 : 0}
            spacing={2}
          >
            <Box
              as={motion.div}
              color="#ffffff"
              mb={1}
              borderRadius="md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              width="96%"
              bgColor="brand.600"
              p={0}
            >
              <Heading
                as="h1"
                fontSize={['2xl', '3xl', '4xl']}
                margin={0}
                lineHeight={1.2}
                color={'white'}
              >
                <AnimatedText text={name} color="white" />
              </Heading>
            </Box>

            {description && (
              <Box
                display="inline-flex"
                as={motion.div}
                color="brand.500"
                mb={1}
                borderRadius="md"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                width="96%"
                bg="rgba(0, 0, 0, 0.7)"
                // mr={{ base: '15vw', md: '10vw', lg:'4vw'}}
                // ml={{ base: '15vw', md: '10vw', lg:'4vw'}}
                px={0}
              >
                <Text
                  fontSize={['md', 'lg', 'xl']}
                  margin={0}
                  lineHeight={1.5}
                  color={'brand.200'}
                  fontWeight="medium"
                >
                  <AnimatedText
                    text={description}
                    delay={name?.length * 0.1 || 0}
                    color="#ffffff"
                  />
                </Text>
              </Box>
            )}

            {path && (
              <Box
                as={motion.div}
                mt={4}
                // mx={{ base: 8, md: 12 }}
                display="inline-block"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 10,
                  delay: (name?.length + (description?.length || 0)) * 0.05,
                }}
                //bg={colorMode === 'light' ? 'brand.100' : 'brand.600'}
              >
                <Link
                  as={Button}
                  to={path}
                  variant={'solid'}
                  colorScheme="brand"
                  size="lg"
                  fontWeight="bold"
                  px={8}
                  py={6}
                  fontSize={{ base: 'md', md: 'lg' }}
                  _hover={{ bg: 'brand.700' }}
                >
                  {t('hero.explore')}
                </Link>
              </Box>
            )}
          </MotionBox>
        </MotionFlex>
      </Container>
    </Box>
  )
}

// Hero
export const Hero = () => {
  const { currentLanguage } = useI18nContext()
  const heroSlides = useMemo(
    () => [
      {
        id: 1,
        name: currentLanguage === 'en' ? 'Welcome to SauciaSalad!' : 'مرحبًا بكم في سوسيا سالاد!',
        description:
          currentLanguage === 'en'
            ? 'Delicious taste and healthy choices supervised by nutrition experts. Try us and enjoy the perfect flavor!'
            : '!طعم لذيذ واختيارات صحية بإشراف خبراء التغذية، جرب معنا واستمتع بالطعم الصح.',
        image: heroA,
      },
      {
        id: 2,
        name:
          currentLanguage === 'en'
            ? 'Create Your Own Salad & Fruit Bowl'
            : 'اصنع سلطتك وطبق الفواكه الخاص بك',
        description:
          currentLanguage === 'en'
            ? 'Pick your favorite ingredients and craft your perfect salad—fresh, tasty, and personalized!'
            : 'اختر مكوناتك المفضلة واصنع سلطتك المثالية - طازجة ولذيذة ومخصصة لك!',
        image: heroB,
        path: '/menu',
      },
      {
        id: 3,
        name:
          currentLanguage === 'en'
            ? 'Signature Salads, Crafted to Perfection'
            : 'سلطات مميزة، مصنوعة بإتقان',
        description:
          currentLanguage === 'en'
            ? 'Our expertly designed salads, packed with fresh ingredients and unique flavors—ready for you to enjoy.'
            : 'سلطاتنا المصممة بعناية، مليئة بالمكونات الطازجة والنكهات الفريدة - جاهزة لتستمتع بها.',
        image: heroC,
        path: '/menu',
      },
      {
        id: 4,
        name:
          currentLanguage === 'en' ? 'Meet Our Nutrition Expert' : 'تعرف على خبير التغذية لدينا',
        description:
          currentLanguage === 'en'
            ? 'Balance, taste, and nutrition—our expert ensures every meal is both healthy and delicious!'
            : 'التوازن والطعم والتغذية - خبيرنا يضمن أن كل وجبة صحية ولذيذة!',
        image: heroD,
        path: '/',
      },
      {
        id: 5,
        name:
          currentLanguage === 'en'
            ? 'Exclusive Offers & Premium Meal Plans'
            : 'عروض حصرية وخطط وجبات مميزة',
        description:
          currentLanguage === 'en'
            ? 'Enjoy personalized meal plans, loyalty rewards, and unbeatable offers—crafted for your lifestyle.'
            : 'استمتع بخطط وجبات مخصصة، ومكافآت ولاء، وعروض لا تقاوم - مصممة لأسلوب حياتك.',
        image: heroE,
        path: '/premium',
      },
    ],
    [currentLanguage],
  )

  return (
    <Box
      height="100vh"
      width="100%" // Ensure full width
      display="flex"
      alignItems="center"
      justifyContent="start"
      bg="transparent"
      color="white"
      position="relative"
      marginY={1}
      paddingY={0}
    >
      <ItemsCarousel
        items={heroSlides}
        CardComponent={HeroCard}
        visibleCount={1}
        auto={true}
        visibleButtons={true}
        transitionDuration={16000}
      />

      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="20%"
        bgGradient="linear(to-t, whiteAlpha.600, transparent)"
        pointerEvents="none"
      />
    </Box>
  )
}
