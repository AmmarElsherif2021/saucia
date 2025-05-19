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
  const bgColor = useColorModeValue('white', 'gray.800')

  // Define menu sections for navigation - ensure exact string matches with MenuPage sections
  const menuSections = [
    { path: '/menu', section: '', label: 'menu' },
    { path: '/menu', section: 'Our signature salad', label: 'signatureSalad' },
    { path: '/menu', section: 'Soups', label: 'soups' },
    { path: '/menu', section: 'Desserts', label: 'desserts' },
    // Fix exact casing to match what's defined in the MenuPage
    { path: '/menu', section: 'Make Your Own Salad', label: 'makeYourOwnSalad' },
    { path: '/menu', section: 'Make Your Own Fruit Salad', label: 'makeYourOwnFruitSalad' },
    { path: '/premium', section: '', label: 'premium' },
  ]

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ar' : 'en'
    changeLanguage(newLanguage)
  }

  const handleSectionNavigation = (section) => {
    // For debugging - log what section we're trying to navigate to
    console.log('Navbar requesting navigation to:', section)
    return { scrollTo: section }
  }

  return (
    <Box bg={bgColor} px={'5%'} py={1} position="fixed" w="90%" zIndex="10">
      <Flex h={16} alignItems="center" justifyContent="space-between" w="100%" mx="auto" px={2}>
        {/* Logo */}
        <Box mx={1}>
          <Link to="/">
            <Img src={logoIcon} w={{ base: 16, md: 20 }} alt={t('navbar.logoAlt')} />
          </Link>
        </Box>

        {/* Desktop Menu */}
        <Flex
          display={{ base: 'none', md: 'flex' }}
          alignItems="center"
          gap={{ md: 2, lg: 3 }}
          flexGrow={1}
          justifyContent="center"
        >
          {menuSections.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              state={item.section ? handleSectionNavigation(item.section) : undefined}
              className="nav-link"
            >
              <Button variant={'underlined'}>
                <small>{t(`navbar.${item.label}`)}</small>
              </Button>
            </Link>
          ))}

          {/* Cart IconButton */}
          <Link to="/cart">
            <IconButton
              aria-label={t('navbar.cart')}
              icon={<FaShoppingCart />}
              variant="ghost"
              size="sm"
            />
          </Link>
        </Flex>

        {/* Right Controls - Desktop */}
        <HStack spacing={{ md: 3, lg: 4 }} display={{ base: 'none', md: 'flex' }}>
          <ProfileDD />
          <IconButton
            aria-label={t('common.toggleDarkMode')}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          <Button onClick={toggleLanguage} variant="ghost" minW="auto" px={2}>
            {currentLanguage.toUpperCase()}
          </Button>
        </HStack>

        {/* Mobile Controls */}
        <Flex display={{ base: 'flex', md: 'none' }} gap={2}>
          <Link to="/cart">
            <IconButton
              aria-label={t('navbar.cart')}
              icon={<FaShoppingCart />}
              variant="ghost"
              size="sm"
            />
          </Link>
          <IconButton
            aria-label={t('common.toggleDarkMode')}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          <IconButton
            aria-label={isOpen ? t('common.close') : t('common.open')}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
            size="sm"
          />
        </Flex>
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box pb={4} display={{ base: 'block', md: 'none' }}>
          <VStack spacing={3} px={4}>
            <Link to="/" w="full" onClick={onClose}>
              <Button variant="underlined" w="full">
                {t('navbar.home')}
              </Button>
            </Link>

            {/* Add links to menu sections in mobile view */}
            {menuSections.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                state={item.section ? handleSectionNavigation(item.section) : undefined}
                w="full"
                onClick={onClose}
              >
                <Button variant="underlined" w="full">
                  {t(`navbar.${item.label}`)}
                </Button>
              </Link>
            ))}

            <Button w="full" onClick={onProfileModalOpen}>
              {t('navbar.profile')}
            </Button>
            <Button w="full" onClick={toggleLanguage}>
              {currentLanguage.toUpperCase()}
            </Button>
          </VStack>
        </Box>
      )}

      {/* Mobile Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal isOpen={isProfileModalOpen} onClose={onProfileModalClose} />
      )}
    </Box>
  )
}
