import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
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
    <Box bg={bgColor} px={"5%"} py={1} position="fixed" w="90%" zIndex="10">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        w="100%"
        mx="auto"
        px={4}
      >
        {/* Logo */}
        <Box mx={2}>
          <Link to="/">
            <Img src={logoIcon} w={{ base: 16, md: 20 }} alt={t("navbar.logoAlt")} />
          </Link>
        </Box>

        {/* Desktop Menu */}
        <Flex
          display={{ base: "none", md: "flex" }}
          alignItems="center"
          gap={{ md: 4, lg: 6 }}
          flexGrow={1}
          justifyContent="center"
        >
          {["menu", "about", "premium"].map((item) => (
            <Link key={item} to={`/${item}`}>
              <Button variant="underlined" colorScheme="brand" size="sm">
                {t(`navbar.${item}`)}
              </Button>
            </Link>
          ))}
          
          {/* Cart IconButton */}
          <Link to="/cart">
            <IconButton
              aria-label={t("navbar.cart")}
              icon={<FaShoppingCart />}
              variant="ghost"
              size="sm"
            />
          </Link>
        </Flex>

        {/* Right Controls - Desktop */}
        <HStack spacing={{ md: 3, lg: 4 }} display={{ base: "none", md: "flex" }}>
          <ProfileDD />
          <IconButton
            aria-label={t("common.toggleDarkMode")}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          <Button 
            onClick={toggleLanguage} 
            variant="ghost"
            minW="auto"
            px={2}
          >
            {currentLanguage.toUpperCase()}
          </Button>
        </HStack>

        {/* Mobile Controls */}
        <Flex display={{ base: "flex", md: "none" }} gap={2}>
          <Link to="/cart">
            <IconButton
              aria-label={t("navbar.cart")}
              icon={<FaShoppingCart />}
              variant="ghost"
              size="sm"
            />
          </Link>
          <IconButton
            aria-label={t("common.toggleDarkMode")}
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          <IconButton
            aria-label={isOpen ? t("common.close") : t("common.open")}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            onClick={isOpen ? onClose : onOpen}
            variant="ghost"
            size="sm"
          />
        </Flex>
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box pb={4} display={{ base: "block", md: "none" }}>
          <VStack spacing={3} px={4}>
            {["home", "menu", "about", "premium"].map((item) => (
              <Link key={item} to={`/${item}`} w="full" onClick={onClose}>
                <Button variant="underlined" w="full">
                  {t(`navbar.${item}`)}
                </Button>
              </Link>
            ))}
            <Button w="full" onClick={onProfileModalOpen}>
              {t("navbar.profile")}
            </Button>
            <Button w="full" onClick={toggleLanguage}>
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
