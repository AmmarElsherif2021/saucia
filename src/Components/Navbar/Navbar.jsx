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
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import logoIcon from '../../assets/logo.png'
import { ProfileDD } from './ProfileDD.jsx'
import { ProfileModal } from './ProfileModal'
import { useI18nContext } from '../../Contexts/I18nContext.jsx'
import { useTranslation } from 'react-i18next'

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

  // Enhanced color values for better contrast and theming
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Define menu sections for navigation - ensure exact string matches with MenuPage sections
  const menuSections = [
    { path: '/menu', section: '', label: 'menu' },
    { path: '/menu', section: 'Our signature salad', label: 'signatureSalad' },
    { path: '/menu', section: 'Soups', label: 'soups' },
    { path: '/menu', section: 'Desserts', label: 'desserts' },
    { path: '/menu', section: 'Make Your Own Salad', label: 'makeYourOwnSalad' },
    { path: '/menu', section: 'Make Your Own Fruit Salad', label: 'makeYourOwnFruitSalad' },
    { path: '/premium', section: '', label: 'premium' },
  ]

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en'
    changeLanguage(newLanguage)
  }

  const handleSectionNavigation = (section) => {
    console.log('Navbar requesting navigation to:', section)
    return { scrollTo: section }
  }

  return (
    <Box
      bg={bgColor}
      position="fixed"
      top={0}
      left={0}
      right={0}
      width="100vw"
      h={'4rem'}
      pt={2}
      pb={4}
      mb={0}
      zIndex={1000}
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      _dark={{
        backdropFilter: 'blur(20px)',
        bg: 'rgba(26, 32, 44, 0.95)',
      }}
    >
      {/* Main Navigation Container */}
      <Container maxW="99vw" pb={4} px={{ base: 4, sm: 6, md: 8, lg: 12 }}>
        <Flex alignItems="center" justifyContent="space-between" w="100%">
          {/* Logo Section */}
          <Box flexShrink={0} mr={{ base: 2, md: 4 }}>
            <Link to="/">
              <Img
                src={logoIcon}
                w={{ base: 12, sm: 14, md: 16, lg: 20 }}
                h={{ base: 10, sm: 12, md: 14, lg: 16 }}
                alt={t('navbar.logoAlt')}
                objectFit="contain"
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.05)' }}
              />
            </Link>
          </Box>

          {/* Desktop Navigation Menu */}
          <Flex
            display={{ base: 'none', md: 'none', lg: 'flex' }}
            alignItems="center"
            gap={{ lg: 1, xl: 2 }}
            flexGrow={1}
            justifyContent="center"
            maxW="800px"
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
                  px={{ lg: 2, xl: 3 }}
                  _hover={{
                    bg: useColorModeValue('brand.50', 'brand.800'),
                    color: useColorModeValue('brand.700', 'brand.200'),
                    transform: 'translateY(-1px)',
                  }}
                  transition="all 0.2s"
                >
                  {t(`navbar.${item.label}`)}
                </Button>
              </Link>
            ))}
          </Flex>

          {/* Desktop Right Controls */}
          <HStack
            spacing={{ md: 1, lg: 3, xl: 4 }}
            display={{ base: 'none', md: 'flex' }}
            flexShrink={0}
          >
            {/* Cart Button */}
            <Link to="/cart">
              <IconButton
                aria-label={t('navbar.cart')}
                icon={<FaShoppingCart />}
                variant="ghost"
                size={{ md: 'sm', lg: 'md' }}
                _hover={{
                  bg: useColorModeValue('brand.50', 'brand.800'),
                  color: useColorModeValue('brand.700', 'brand.200'),
                  transform: 'scale(1.1)',
                }}
                transition="all 0.2s"
              />
            </Link>

            {/* Profile Dropdown - Desktop Only */}
            <Box display={{ base: 'none', md: 'block', lg: 'block' }}>
              <ProfileDD />
            </Box>

            {/* Theme Toggle */}
            <IconButton
              aria-label={t('common.toggleDarkMode')}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size={{ md: 'sm', lg: 'md' }}
              _hover={{
                bg: useColorModeValue('brand.50', 'brand.800'),
                color: useColorModeValue('brand.700', 'brand.200'),
                transform: 'rotate(180deg)',
              }}
              transition="all 0.3s"
            />

            {/* Language Toggle */}
            <Button
              onClick={toggleLanguage}
              variant="ghost"
              size={{ md: 'sm', lg: 'md' }}
              minW="auto"
              px={{ md: 2, lg: 3 }}
              fontWeight="bold"
              _hover={{
                bg: useColorModeValue('brand.50', 'brand.800'),
                color: useColorModeValue('brand.700', 'brand.200'),
              }}
            >
              {currentLanguage.toUpperCase()}
            </Button>

            {/* Desktop Hamburger Menu - Only for medium screens */}
            <Box display={{ base: 'none', md: 'block', lg: 'none' }}>
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
            </Box>
          </HStack>

          {/* Mobile Controls */}
          <HStack spacing={1} display={{ base: 'flex', md: 'none' }}>
            {/* Mobile Cart */}
            <Link to="/cart">
              <IconButton
                aria-label={t('navbar.cart')}
                icon={<FaShoppingCart />}
                variant="ghost"
                size="sm"
              />
            </Link>

            {/* Mobile Theme Toggle */}
            <IconButton
              aria-label={t('common.toggleDarkMode')}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
            />

            {/* Mobile Menu Toggle */}
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
        </Flex>
      </Container>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <Box
          display={{ base: 'block', md: 'block', lg: 'none' }}
          bg={bgColor}
          mt={0}
          w={'100vw'}
          position="fixed"
          top="3.5rem"
          borderColor={borderColor}
          backdropFilter="blur(10px)"
          _dark={{
            bg: 'rgba(26, 32, 44, 0.98)',
          }}
        >
          <Container maxW="1400px" px={{ base: 4, sm: 6 }}>
            <VStack spacing={2} py={4} align="stretch">
              {/* Home Link */}
              <Link to="/" onClick={onClose}>
                <Button
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  _hover={{
                    bg: useColorModeValue('brand.50', 'brand.800'),
                    color: useColorModeValue('brand.700', 'brand.200'),
                  }}
                >
                  {t('navbar.home')}
                </Button>
              </Link>

              {/* Menu Section Links */}
              {menuSections.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  state={item.section ? handleSectionNavigation(item.section) : undefined}
                  onClick={onClose}
                >
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    _hover={{
                      bg: useColorModeValue('brand.50', 'brand.800'),
                      color: useColorModeValue('brand.700', 'brand.200'),
                    }}
                  >
                    {t(`navbar.${item.label}`)}
                  </Button>
                </Link>
              ))}

              {/* Mobile Profile Button */}
              <Button
                w="full"
                onClick={onProfileModalOpen}
                variant="ghost"
                justifyContent="flex-start"
                _hover={{
                  bg: useColorModeValue('brand.50', 'brand.800'),
                  color: useColorModeValue('brand.700', 'brand.200'),
                }}
              >
                {t('navbar.profile')}
              </Button>

              {/* Mobile Language Toggle */}
              <Button
                w="full"
                onClick={toggleLanguage}
                variant="ghost"
                justifyContent="flex-start"
                _hover={{
                  bg: useColorModeValue('brand.50', 'brand.800'),
                  color: useColorModeValue('brand.700', 'brand.200'),
                }}
              >
                {t('common.language')}: {currentLanguage.toUpperCase()}
              </Button>
            </VStack>
          </Container>
        </Box>
      )}

      {/* Mobile Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal isOpen={isProfileModalOpen} onClose={onProfileModalClose} />
      )}
    </Box>
  )
}
