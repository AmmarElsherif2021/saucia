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

// Memoize FloatingShapesLayout to prevent re-renders orange
const MemoizedFloatingShapesLayout = memo(FloatingShapesLayout);

const StaticTextContent = ({ currentLanguage }) => {
  const isRTL = currentLanguage === 'ar'
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({md:true, lg:false})
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
      style={{
        marginBottom:0,
        //backgroundColor:"#a11aa6" orange
      }}
    >
      <VStack
        spacing={{ base: 2, md: 3 }}
        align={isMobile || isTablet? 'center' : (isRTL ? 'flex-end' : 'flex-start')}
        textAlign={isMobile || isTablet ? 'center' : (isRTL ? 'right' : 'left')}
        maxW={{ base: 'full', lg: '2xl' }}
        justify={'start'}
        
      >
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Heading
            as="h1"
            size={{ base: 'lg', sm: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="extrabold"
            lineHeight={{ base: 'shorter', md: 'short' }}
            bgGradient="linear(to-r, brand.600, secondary.600, brand.800)"
            bgClip="text"
            letterSpacing="tight"
            fontFamily={currentLanguage === 'ar'?'"Lalezar",sans_serif':'"Delicious Handrawn", cursive'}
            textAlign={isMobile || isTablet ? 'center' : (isRTL ? 'right' : 'left')}
            
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
            fontWeight="thin"
            lineHeight={{ base: 'tall', md: 'relaxed' }}
            maxW={{ base: 'full'}}
            opacity={0.9}
            textAlign={isMobile || isTablet ? 'center' : (isRTL ? 'right' : 'left')}
            fontFamily={currentLanguage === 'ar'?'"Lalezar",sans_serif':'"Delicious Handrawn", cursive'}
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
              size={{ base: 'sm', md: 'md' }}
              px={{ base: 2, md: 4 }}
              py={{ base: 4, md: 6 }}
              h={{ base: '10', md: '12' }}
              colorScheme="brand"
              bgGradient="linear(to-r, brand.500, brand.700)"
              //color="whiteAlpha.900"
              fontWeight="bold"
              fontSize={{ base: 'md', md: 'lg' }}
              _hover={{
                transform: 'translateY(-2px)',
                //boxShadow: '2xl',
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
              //boxShadow="xl"
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
                <Text fontFamily={currentLanguage === 'ar'?'"Lalezar",sans_serif':'"Chewy", system-ui'}>
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
                  style={{ fontSize: '1.2em', fontWeight: 'bold' }}
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
      //bg={'orange.200'} blue
      //p={3}
      position="relative"
      overflow="hidden"
      role="banner"
      aria-label="Hero section"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
    

      {/* Main Content Container */}
      <Container maxW="7xl" h="100%" p={0}>
        {isMobile ? (
          /* Mobile Layout - Stacked vertically */
          <VStack 
            minH="120vh" 
            justify="start" 
            align="start" 
            spacing={0}
            px={6}
            py={2}
          >
            {/* Text Content */}
            <Box width="100%" zIndex={10}>
              <StaticTextContent currentLanguage={currentLanguage} />
            </Box>
            
            {/* Floating Shapes - Compact for mobile */}
            <Box 
              width="100%" 
              height="fit-content"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              top={0}
              zIndex={5}
              //bg={'blue.300'}
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
            spacing={4}
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
              p={2}
              m={0}
              //bg={'orange.300'}
              flexWrap={'wrap'}
              
            >
              <MemoizedFloatingShapesLayout />
            </Box>
          </VStack>
        ) : (
          /* Desktop Layout - Side by side */
          <HStack 
            h="90vh" 
            alignItems="center"
            justifyContent={'center'} 
            spacing={8}
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
            <Box flex={1} w={"fit-content"} height="auto" zIndex={5} justifyContent={'center'} alignItems={'center'} display={'flex'}>
              <MemoizedFloatingShapesLayout />
            </Box>
          </HStack>
        )}
      </Container>
    </Box>
  )
}