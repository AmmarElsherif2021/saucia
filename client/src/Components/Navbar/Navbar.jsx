import { motion } from 'framer-motion'
import { FaShoppingCart } from 'react-icons/fa'
import {
  Box,
  Flex,
  Button,
  IconButton,
  useColorMode,
  useDisclosure,
  VStack,
  useColorModeValue,
  Img,
  HStack,
  Container,
  Badge,
  useBreakpointValue
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import logoIcon from '../../assets/logo.png'
import { ProfileDD } from './ProfileDD.jsx'
import { ProfileModal } from './ProfileModal'
import { useI18nContext } from '../../Contexts/I18nContext.jsx'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../Contexts/CartContext.jsx'
import { useEffect, useState } from 'react'

export const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isProfileModalOpen,
    onOpen: onProfileModalOpen,
    onClose: onProfileModalClose,
  } = useDisclosure()
  const { currentLanguage, changeLanguage } = useI18nContext()
  const { t } = useTranslation()

  // Responsive breakpoint values
  const navHeight = useBreakpointValue({ base: '3.5rem', md: '4rem', lg: '4.5rem' })
  const logoSize = useBreakpointValue({ 
    base: { w: 10, h: 8 }, 
    sm: { w: 12, h: 10 }, 
    md: { w: 14, h: 12 }, 
    lg: { w: 16, h: 14 },
    xl: { w: 20, h: 16 }
  })
  const showDesktopMenu = useBreakpointValue({ base: false, lg: true })
  const showTabletControls = useBreakpointValue({ base: false, md: true, lg: false })

  // Enhanced color values for better contrast and theming
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)')

  // Define remaining menu sections for navigation (moved sections removed)
  const menuSections = [
    { path: '/menu', section: '', label: 'menu' },
    { path: '/premium', section: '', label: 'premium' },
    {path: '/', section: 'about us', label: 'aboutUs'}, //handle navigating scrolling to to about us in Home
  ]

  // Cart count management
  const { cart, setCart } = useCart()
  const [cartCount, setCartCount] = useState(0)
  
  useEffect(() => {
    setCartCount(cart.length)
  }, [cart, setCart])

  // Animation variants
  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      y: -20
    },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en'
    changeLanguage(newLanguage)
  }

  const handleSectionNavigation = (section) => {
  if (section) {
    return { scrollTo: section }
  }
  return undefined}

  const CartIcon = ({ isMobile = false }) => (
    <Link to="/cart">
      <Box position="relative" display="inline-block">
        <IconButton
          aria-label={t('navbar.cart')}
          icon={<FaShoppingCart />}
          variant="ghost"
          size={isMobile ? "sm" : { md: "sm", lg: "md" }}
          _hover={{
            bg: useColorModeValue('brand.50', 'brand.800'),
            color: useColorModeValue('brand.700', 'brand.200'),
            transform: 'scale(1.1)',
          }}
          transition="all 0.2s"
        />
        {cartCount > 0 && (
          <Badge
            colorScheme="red"
            borderRadius="full"
            position="absolute"
            top="-1"
            right="-1"
            fontSize="0.7em"
            px={1.5}
            minW={5}
            h={5}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Box>
    </Link>
  )

  return (
    <>
      <Box
        bg={overlayBg}
        position="fixed"
        top={0}
        left={0}
        right={0}
        width="100vw"
        minW="200px !important" 
        h={navHeight}
        zIndex={1000}
        borderBottom="none"
        
        backdropFilter="blur(12px)"
        WebkitBackdropFilter="blur(12px)" 
      >
        {/* Main Navigation Container */}
        <Container           
          h="100%" 
          minW={'100vw'}
          px={{ base: 3, sm: 4, md: 4, lg: 6, xl: 8 }}
        >
          <Flex alignItems="center" justifyContent="space-between" h="100%">
            {/* Logo Section */}
            <Box flexShrink={0} mr={{ base: 2, md: 4 }}>
              <Link to="/" onClick={onClose}>
                <Img
                  src={logoIcon}
                  w={logoSize.w}
                  h={logoSize.h}
                  alt={t('navbar.logoAlt')}
                  objectFit="contain"
                  transition="transform 0.2s"
                  _hover={{ transform: 'scale(1.05)' }}
                  loading="eager"
                />
              </Link>
            </Box>

            {/* Desktop Navigation Menu - Hidden on mobile/tablet */}
            {showDesktopMenu && (
              <Flex
                alignItems="center"
                gap={{ lg: 1, xl: 2 }}
                flexGrow={1}
                justifyContent="center"
                minW="200px"
                mx={4}
              >
                {menuSections.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    state={item.section ? handleSectionNavigation(item.section) : undefined}
                  >
                    <Button
                      variant="ghost"
                      size={{ lg: 'sm', xl: 'md' }}
                      fontSize={{ lg: 'xs', xl: 'sm' }}
                      px={{ lg: 3, xl: 4 }}
                      py={{ lg: 2, xl: 3 }}
                      whiteSpace="nowrap"
                      _hover={{
                        bg: useColorModeValue('brand.50', 'brand.800'),
                        color: useColorModeValue('brand.700', 'brand.200'),
                        transform: 'translateY(-1px)',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      transition="all 0.2s"
                    >
                      {t(`navbar.${item.label}`)}
                    </Button>
                  </Link>
                ))}
              </Flex>
            )}

            {/* Desktop Right Controls - Large screens only */}
            {showDesktopMenu && (
              <HStack spacing={3} flexShrink={0}>
                <CartIcon />
                <ProfileDD />
                
                <IconButton
                  aria-label={t('common.toggleDarkMode')}
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="md"
                  _hover={{
                    bg: useColorModeValue('brand.50', 'brand.800'),
                    color: useColorModeValue('brand.700', 'brand.200'),
                    transform: 'rotate(180deg)',
                  }}
                  transition="all 0.3s"
                />

                <Button
                  onClick={toggleLanguage}
                  variant="ghost"
                  size="md"
                  minW="auto"
                  px={3}
                  fontWeight="bold"
                  _hover={{
                    bg: useColorModeValue('brand.50', 'brand.800'),
                    color: useColorModeValue('brand.700', 'brand.200'),
                  }}
                >
                  {currentLanguage.toUpperCase()}
                </Button>
              </HStack>
            )}

            {/* Tablet Controls - Medium screens */}
            {showTabletControls && (
              <HStack spacing={2} flexShrink={0}>
                <CartIcon />
                <ProfileDD />
                
                <IconButton
                  aria-label={t('common.toggleDarkMode')}
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="sm"
                  _hover={{
                    bg: useColorModeValue('brand.50', 'brand.800'),
                    transform: 'rotate(180deg)',
                  }}
                  transition="all 0.3s"
                />

                <Button
                  onClick={toggleLanguage}
                  variant="ghost"
                  size="sm"
                  minW="auto"
                  px={2}
                  fontSize="sm"
                  fontWeight="bold"
                  _hover={{
                    bg: useColorModeValue('brand.50', 'brand.800'),
                    color: useColorModeValue('brand.700', 'brand.200'),
                  }}
                >
                  {currentLanguage.toUpperCase()}
                </Button>

                <IconButton
                  aria-label={isOpen ? t('common.close') : t('common.open')}
                  icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                  onClick={isOpen ? onClose : onOpen}
                  variant="ghost"
                  size="sm"
                  _hover={{
                    bg: useColorModeValue('brand.50', 'brand.800'),
                    transform: 'scale(1.1)',
                  }}
                />
              </HStack>
            )}

            {/* Mobile Controls - Small screens only */}
            <HStack 
              spacing={1} 
              display={{ base: 'flex', md: 'none' }}
              flexShrink={0}
            >
              <CartIcon isMobile />
              
              <IconButton
                aria-label={t('common.toggleDarkMode')}
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                _hover={{
                  bg: useColorModeValue('brand.50', 'brand.800'),
                  transform: 'rotate(180deg)',
                }}
                transition="all 0.3s"
              />

              <IconButton
                aria-label={isOpen ? t('common.close') : t('common.open')}
                icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                onClick={isOpen ? onClose : onOpen}
                variant="ghost"
                size="sm"
                _hover={{
                  bg: useColorModeValue('brand.50', 'brand.800'),
                  transform: 'scale(1.1)',
                }}
                transition="all 0.2s"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Mobile/Tablet Menu Dropdown */}
      {isOpen && (
        <Box
          as={motion.div}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={mobileMenuVariants}
          display={{ base: 'block', lg: 'none' }}
          bg={overlayBg}
          position="fixed"
          top={navHeight}
          left={0}
          right={0}
          width="100vw"
          minW="200px" 
          zIndex={999}
          borderBottom="1px"
          borderColor={borderColor}
          backdropFilter="blur(12px)"
          WebkitBackdropFilter="blur(12px)"
          maxH="calc(100vh - 4rem)"
          overflowY="auto"
        >
          <Container maxW="100vw" px={{ base: 3, sm: 4, md: 6 }}>
            <VStack 
              spacing={1} 
              py={4} 
              align="stretch"
              as={motion.div}
            >
              {/* Home Link */}
              <motion.div variants={mobileMenuItemVariants}>
                <Link to="/" onClick={onClose}>
                  <Button
                    variant="ghost"
                    w="full"
                    h={10}
                    justifyContent="flex-start"
                    fontSize={{ base: 'sm', md: 'md' }}
                    _hover={{
                      bg: useColorModeValue('brand.50', 'brand.800'),
                      color: useColorModeValue('brand.700', 'brand.200'),
                    }}
                  >
                    {t('navbar.home')}
                  </Button>
                </Link>
              </motion.div>

              {/* Menu Section Links */}
              {menuSections.map((item) => (
                <motion.div key={item.label} variants={mobileMenuItemVariants}>
                  <Link
                    to={item.path}
                    state={item.section ? handleSectionNavigation(item.section) : undefined}
                    onClick={onClose}
                  >
                    <Button
                      variant="ghost"
                      w="full"
                      h={10}
                      justifyContent="flex-start"
                      fontSize={{ base: 'sm', md: 'md' }}
                      _hover={{
                        bg: useColorModeValue('brand.50', 'brand.800'),
                        color: useColorModeValue('brand.700', 'brand.200'),
                      }}
                    >
                      {t(`navbar.${item.label}`)}
                    </Button>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile-only Profile Button */}
              <motion.div variants={mobileMenuItemVariants}>
                <Box display={{ base: 'block', md: 'none' }}>
                  <Button
                    w="full"
                    h={10}
                    onClick={() => {
                      onProfileModalOpen()
                      onClose()
                    }}
                    variant="ghost"
                    justifyContent="flex-start"
                    fontSize="sm"
                    _hover={{
                      bg: useColorModeValue('brand.50', 'brand.800'),
                      color: useColorModeValue('brand.700', 'brand.200'),
                    }}
                  >
                    {t('navbar.profile')}
                  </Button>
                </Box>
              </motion.div>

              {/* Mobile-only Language Toggle */}
              <motion.div variants={mobileMenuItemVariants}>
                <Box display={{ base: 'block', md: 'none' }}>
                  <Button
                    w="full"
                    h={10}
                    onClick={() => {
                      toggleLanguage()
                      onClose()
                    }}
                    variant="ghost"
                    justifyContent="flex-start"
                    fontSize="sm"
                    _hover={{
                      bg: useColorModeValue('brand.50', 'brand.800'),
                      color: useColorModeValue('brand.700', 'brand.200'),
                    }}
                  >
                    {t('common.language')}
                  </Button>
                </Box>
              </motion.div>
            </VStack>
          </Container>
        </Box>
      )}

      {/* Mobile Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal isOpen={isProfileModalOpen} onClose={onProfileModalClose} />
      )}
    </>
  )
}