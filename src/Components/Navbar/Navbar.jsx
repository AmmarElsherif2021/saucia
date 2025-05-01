import { useState } from "react";
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
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import logoIcon from "../../assets/logo.png";
import { ProfileDD } from "./profileDD.jsx";
import { ProfileModal } from "./ProfileModal";
import { useI18nContext } from "../../Contexts/I18nContext.jsx";

export const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isProfileModalOpen,
    onOpen: onProfileModalOpen,
    onClose: onProfileModalClose,
  } = useDisclosure();
  const [language, setLanguage] = useState("EN");
  const { t, currentLanguage, changeLanguage}= useI18nContext() 

  const bgColor = useColorModeValue("white", "brand.900");
  const textColor = useColorModeValue("brand.900", "white");

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "ar" : "en";
    changeLanguage(newLanguage);
  };

  return (
    <Box bg={bgColor} py={1} px={4} position="fixed" w="97%" paddingX={6} zIndex="10">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        mx="auto"
      >
        {/* Logo */}
        <Box fontWeight="bold" fontSize="lg" color={textColor}>
          <Link to="/">
            <Img src={logoIcon} w={20} />
          </Link>
        </Box>

        {/* Desktop Menu */}
        <Flex display={{ base: "none", md: "flex"}} alignItems="center" gap={2} mx="20%" >
          <Link to="/cart">
            <Button variant="underlined" colorScheme="brand" size={"sm"}>
              {t("navbar.cart")} {/* Translate "Cart" */}
            </Button>
          </Link>
          <Link to="/menu">
            <Button variant="underlined" colorScheme="brand" size={"sm"}>
              {t("navbar.menu")} {/* Translate "Menu" */}
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="underlined" colorScheme="brand" size={"sm"}>
              {t("navbar.about")} {/* Translate "About" */}
            </Button>
          </Link>
          <Link to="/premium" onClick={onClose} >
              <Button variant="underlined" w="70px" size={"sm"}>
                {t("premium.getPremium")} 
              </Button>
            </Link>
        </Flex>

        {/* User Menu, Theme Toggle, and Language Toggle - Desktop */}
        <HStack spacing={2} display={{ base: "none", md: "flex" }}>
          <ProfileDD />
          <IconButton
            aria-label={t("common.toggleDarkMode")} // Translate "Toggle Dark Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          <Button onClick={toggleLanguage} variant="ghost">
            {language}
          </Button>
        </HStack>

        {/* Mobile Controls */}
        <Flex display={{ base: "flex", md: "none" }}>
          {/* Theme Toggle - Mobile */}
          <IconButton
            aria-label={t("common.toggleDarkMode")} // Translate "Toggle Dark Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={2}
          />

          {/* Hamburger Menu - Mobile */}
          <IconButton
            aria-label={isOpen ? t("common.close") : t("common.open")} // Translate "Close" and "Open"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
          />
        </Flex>
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box pb={4} display={{ base: "block", md: "none" }}>
          <VStack alignItems="center" spacing={4} w="100%">
            <Link to="/" onClick={onClose}>
              <Button variant="underlined" w="70px">
                {t("navbar.home")} 
              </Button>
            </Link>
            <Link to="/cart" onClick={onClose}>
              <Button variant="underlined" w="70px">
                {t("navbar.cart")} 
              </Button>
            </Link>
            <Link to="/menu" onClick={onClose}>
              <Button variant="underlined" w="70px">
                {t("navbar.menu")} 
              </Button>
            </Link>
            <Link to="/about" onClick={onClose}>
              <Button variant="underlined" w="70px">
                {t("navbar.about")} 
              </Button>
            </Link>
            <Link to="/premium" onClick={onClose}>
              <Button variant="underlined" w="70px">
                {t("premium.getPremium")} 
              </Button>
            </Link>
            <Button
              variant="underlined"
              w="70px"
              onClick={onProfileModalOpen}
            >
              {t("navbar.profile")} 
            </Button>
            <Button onClick={toggleLanguage} variant="ghost" w="70px">
              {language}
            </Button>
          </VStack>
        </Box>
      )}

      {/* Mobile Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={onProfileModalClose}
        />
      )}
    </Box>
  );
};