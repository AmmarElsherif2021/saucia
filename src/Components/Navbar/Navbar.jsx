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
import { useTranslation } from "react-i18next";
import { useUser } from "../../Contexts/UserContext.jsx";
export const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isProfileModalOpen,
    onOpen: onProfileModalOpen,
    onClose: onProfileModalClose,
  } = useDisclosure();
  const { currentLanguage, changeLanguage}= useI18nContext();
  const {t}=useTranslation();
  const { user, loading, logout } = useUser(); // use this
  const bgColor = useColorModeValue("white", "brand.900");
  const textColor = useColorModeValue("brand.900", "white");

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "ar" : "en";
    changeLanguage(newLanguage);
  };

  return (
    <Box bg={bgColor} py={1} position="fixed" w={"100%"} maxW="100vw" paddingRight={12} zIndex="10">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        mx="auto"
      >
        {/* Logo */}
        <Box fontWeight="bold" fontSize="lg" color={textColor} mx={4}>
          <Link to="/">
            <Img src={logoIcon} w={20} alt={t("navbar.logoAlt")} />
          </Link>
        </Box>

        {/* Desktop Menu */}
        <Flex display={{ base: "none", md: "flex" }} alignItems="center" gap={4}>
          {["cart", "menu", "about", "premium"].map((item) => (
            <Link key={item} to={`/${item}`} onClick={onClose}>
              <Button variant="underlined" colorScheme="brand" size="sm">
                {t(`navbar.${item}`)}
              </Button>
            </Link>
          ))}
        </Flex>

        {/* User Menu, Theme Toggle, and Language Toggle - Desktop */}
        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          <ProfileDD />
          <IconButton
            aria-label={t("common.toggleDarkMode")}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          <Button onClick={toggleLanguage} variant="ghost">
            {currentLanguage.toUpperCase()}
          </Button>
        </HStack>

        {/* Mobile Controls */}
        <Flex display={{ base: "flex", md: "none" }}>
          <IconButton
            aria-label={t("common.toggleDarkMode")}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={2}
          />
          <IconButton
            aria-label={isOpen ? t("common.close") : t("common.open")}
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
            {["home", "cart", "menu", "about", "premium"].map((item) => (
              <Link key={item} to={`/${item}`} onClick={onClose}>
                <Button variant="underlined" w="70px">
                  {t(`navbar.${item}`)}
                </Button>
              </Link>
            ))}
            <Button
              variant="underlined"
              w="70px"
              onClick={onProfileModalOpen}
            >
              {t("navbar.profile")}
            </Button>
            <Button onClick={toggleLanguage} variant="ghost" w="70px">
              {currentLanguage.toUpperCase()}
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