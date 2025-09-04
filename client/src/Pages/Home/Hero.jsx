import { useEffect, useState, memo } from 'react'
import { motion } from 'framer-motion'
import { 
  Box, 
  Flex, 
  VStack,
  HStack,
  Heading, 
  Text, 
  Button, 
  useBreakpointValue,
  useColorModeValue,
  Container
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useI18nContext } from '../../Contexts/I18nContext'
import FloatingShapesLayout from './Hero/FloatingShapesLayout'

// Memoize FloatingShapesLayout to prevent re-renders
const MemoizedFloatingShapesLayout = memo(FloatingShapesLayout);

const StaticTextContent = ({ currentLanguage }) => {
  const isRTL = currentLanguage === 'ar'
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  // Static content - only the first slide
  const heroContent = {
    name: currentLanguage === 'en' ? 'Welcome to SauciaSalad!' : 'مرحباً بكم في سوسيا سالاد!',
    description: currentLanguage === 'en'
      ? 'Delicious taste and healthy choices. Experience the perfect blend of flavor and wellness!'
      : 'طعم لذيذ واختيارات صحية، جرب معنا واستمتع بالطعم الصح.',
    path: '/menu'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{marginBottom:"10rem"}}
    >
      <VStack
        spacing={{ base: 2, md: 3 }}
        align={isMobile ? 'center' : (isRTL ? 'flex-end' : 'flex-start')}
        textAlign={isMobile ? 'center' : (isRTL ? 'right' : 'left')}
        maxW={{ base: 'full', lg: '2xl' }}
      >
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Heading
            as="h1"
            size={{ base: 'xl', sm: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="extrabold"
            lineHeight={{ base: 'shorter', md: 'short' }}
            bgGradient="linear(to-r, brand.600, secondary.600, brand.800)"
            bgClip="text"
            letterSpacing="tight"
          >
            {heroContent.name}
          </Heading>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Text
            fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
            color={textColor}
            fontWeight="medium"
            lineHeight={{ base: 'tall', md: 'relaxed' }}
            maxW={{ base: 'full', md: '90%' }}
            opacity={0.9}
          >
            {heroContent.description}
          </Text>
        </motion.div>

        {/* Call to Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link to={heroContent.path}>
            <Button
              size={{ base: 'lg', md: 'xl' }}
              px={{ base: 8, md: 12 }}
              py={{ base: 4, md: 6 }}
              h={{ base: '12', md: '14' }}
              colorScheme="brand"
              bgGradient="linear(to-r, brand.500, brand.700)"
              color="white"
              fontWeight="bold"
              fontSize={{ base: 'md', md: 'lg' }}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '2xl',
                bgGradient: 'linear(to-r, brand.600, brand.800)',
                _before: {
                  left: '100%'
                }
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition="all 0.2s"
              borderRadius="full"
              boxShadow="xl"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s'
              }}
            >
              <Flex alignItems="center" gap={3}>
                <Text>
                  {currentLanguage === 'en' ? 'Explore Now' : 'اكتشف الآن'}
                </Text>
                <motion.span
                  animate={{
                    x: isRTL ? [-2, 2] : [0, 4]
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    repeatType: 'reverse'
                  }}
                  style={{ fontSize: '1.2em' }}
                >
                  {isRTL ? '←' : '→'}
                </motion.span>
              </Flex>
            </Button>
          </Link>
        </motion.div>

        {/* Additional Call to Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <HStack spacing={2} flexWrap="wrap" justify={isMobile ? 'center' : 'flex-start'}>
           
            <Link to="/menu">
              <Button
                variant="solid"
                size="xs"
                color="brand.600"
                _hover={{ color: 'brand.800', bg: 'brand.50' }}
                fontWeight="semibold"
              >
                {currentLanguage === 'en' ? 'Menu' : 'قائمة الطعام'}
              </Button>
            </Link>
            <Link to="/premium">
              <Button
                variant="solid"
                size="xs"
                color="secondary.600"
                _hover={{ color: 'secondary.800', bg: 'secondary.50' }}
                fontWeight="semibold"
              >
                {currentLanguage === 'en' ? 'Premium' : 'اشترك الان'}
              </Button>
            </Link>
          </HStack>
        </motion.div>
      </VStack>
    </motion.div>
  )
}

export const Hero = () => {
  const { currentLanguage } = useI18nContext()
  const [isMounted, setIsMounted] = useState(false)
  
  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })
  
  // Theme colors
  const bgFrom = useColorModeValue('white', 'gray.900')
  const bgVia = useColorModeValue('secondary.50', 'gray.800')
  const bgTo = useColorModeValue('secondary.100', 'gray.900')
  const isRTL = currentLanguage === 'ar'

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Flex h="100vh" w="full" align="center" justify="center" bg={bgFrom}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '4rem',
            height: '4rem',
            border: '3px solid',
            borderColor: 'var(--chakra-colors-brand-200)',
            borderTopColor: 'var(--chakra-colors-brand-500)',
            borderRadius: '50%'
          }}
        />
      </Flex>
    )
  }

  return (
    <Box
      as="section"
      minH="100vh"
      h="auto"
      w="full"
      bgGradient={`linear(to-br, ${bgFrom}, ${bgVia}, ${bgTo})`}
      position="relative"
      overflow="hidden"
      role="banner"
      aria-label="Hero section"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Enhanced background gradient animation */}
      <Box position="absolute" inset={0} opacity={0.03}>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.4)),
                             radial-gradient(circle at 80% 20%, rgba(35, 122, 79, 0.4) 0%, transparent 60%),
                             radial-gradient(circle at 40% 80%, rgba(22, 249, 162, 0.4) 0%, transparent 60%)`,
            backgroundSize: '120% 120%'
          }}
        />
      </Box>

      {/* Main Content Container */}
      <Container maxW="7xl" h="100%" p={0}>
        {isMobile ? (
          /* Mobile Layout - Stacked vertically */
          <VStack 
            minH="100vh" 
            justify="center" 
            align="center" 
            spacing={8}
            px={6}
            py={8}
          >
            {/* Text Content */}
            <Box width="100%" zIndex={10}>
              <StaticTextContent currentLanguage={currentLanguage} />
            </Box>
            
            {/* Floating Shapes - Compact for mobile */}
            <Box 
              width="100%" 
              height="350px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              zIndex={5}
            >
              <MemoizedFloatingShapesLayout />
            </Box>
          </VStack>
        ) : isTablet ? (
          /* Tablet Layout - Optimized spacing */
          <VStack 
            minH="100vh" 
            justify="center" 
            align="center" 
            spacing={12}
            px={8}
            py={12}
          >
            {/* Text Content */}
            <Box width="100%" zIndex={10} maxW="4xl">
              <StaticTextContent currentLanguage={currentLanguage} />
            </Box>
            
            {/* Floating Shapes */}
            <Box 
              width="100%" 
              height="450px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              zIndex={5}
            >
              <MemoizedFloatingShapesLayout />
            </Box>
          </VStack>
        ) : (
          /* Desktop Layout - Side by side */
          <HStack 
            h="100vh" 
            alignItems="center" 
            spacing={16}
            px={8}
            direction={isRTL ? 'row-reverse' : 'row'}
          >
            {/* Text content section */}
            <Box flex={1} zIndex={10}>
              <Flex 
                h="full" 
                align="center" 
                justify={isRTL ? 'flex-end' : 'flex-start'}
              >
                <StaticTextContent currentLanguage={currentLanguage} />
              </Flex>
            </Box>
            
            {/* Floating shapes section */}
            <Box flex={1} height="100%" position="relative" zIndex={5}>
              <MemoizedFloatingShapesLayout />
            </Box>
          </HStack>
        )}
      </Container>

      {/* Enhanced floating background elements */}
      <motion.div
        animate={{ 
          y: [0, -25, 0],
          rotate: [0, 8, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          position: 'absolute',
          top: '8%',
          [isRTL ? 'right' : 'left']: '5%',
          width: '3rem',
          height: '3rem',
          backgroundColor: 'var(--chakra-colors-secondary-400)',
          borderRadius: '50%',
          opacity: 0.15,
          filter: 'blur(1px)'
        }}
      />
      
      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
        style={{
          position: 'absolute',
          bottom: '12%',
          [isRTL ? 'right' : 'left']: '8%',
          width: '2.5rem',
          height: '2.5rem',
          backgroundColor: 'var(--chakra-colors-brand-300)',
          borderRadius: '50%',
          opacity: 0.15,
          filter: 'blur(1px)'
        }}
      />

      <motion.div
        animate={{ 
          y: [0, -15, 0],
          x: [0, 8, 0],
          rotate: [0, 3, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 4
        }}
        style={{
          position: 'absolute',
          top: '35%',
          [isRTL ? 'left' : 'right']: '6%',
          width: '2rem',
          height: '2rem',
          backgroundColor: 'var(--chakra-colors-orange-200)',
          borderRadius: '50%',
          opacity: 0.15,
          filter: 'blur(1px)'
        }}
      />

      {/* Additional decorative elements for desktop */}
      {!isMobile && (
        <>
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{
              position: 'absolute',
              top: '15%',
              [isRTL ? 'left' : 'right']: '15%',
              width: '1.5rem',
              height: '1.5rem',
              backgroundColor: 'var(--chakra-colors-teal-200)',
              borderRadius: '50%',
              opacity: 0.1
            }}
          />
          
          <motion.div
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 3
            }}
            style={{
              position: 'absolute',
              bottom: '25%',
              [isRTL ? 'left' : 'right']: '25%',
              width: '1rem',
              height: '1rem',
              backgroundColor: 'var(--chakra-colors-purple-200)',
              borderRadius: '50%'
            }}
          />
        </>
      )}
    </Box>
  )
}