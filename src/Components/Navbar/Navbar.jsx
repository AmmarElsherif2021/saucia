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

export const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isProfileModalOpen, 
    onOpen: onProfileModalOpen, 
    onClose: onProfileModalClose 
  } = useDisclosure();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  // Dropdown options for the user menu
  const userMenuOptions = [
    { value: "profile", label: "Profile" },
    { value: "settings", label: "Settings" },
    { value: "logout", label: "Logout" },
  ];

  const handleUserMenuSelect = (value) => {
    if (value === "logout") {
      console.log("Logging out...");
    } else {
      console.log(`Navigating to ${value}`);
    }
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
        <Flex display={{ base: "none", md: "flex" }} alignItems="center" gap={8} ml="auto" mr={4}>
          <Link to="/cart">
            <Button variant="underlined" colorScheme="brand">
              Cart
            </Button>
          </Link>
          <Link to="/menu">
            <Button variant="underlined" colorScheme="brand">
              Menu
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="underlined" colorScheme="brand">
              About
            </Button>
          </Link>
        </Flex>

        {/* User Menu and Theme Toggle - Desktop */}
        <HStack spacing={2} display={{ base: "none", md: "flex" }}>
          <ProfileDD />
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </HStack>
         
        {/* Mobile Controls */}
        <Flex display={{ base: "flex", md: "none" }}>
          {/* Theme Toggle - Mobile */}
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            mr={2}
          />
          
          {/* Hamburger Menu - Mobile */}
          <IconButton
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
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
                Home
              </Button>
            </Link>
            <Link to="/cart" onClick={onClose}>
              <Button variant="underlined" w="70px">
                Cart
              </Button>
            </Link>
            <Link to="/menu" onClick={onClose}>
              <Button variant="underlined" w="70px">
                Menu
              </Button>
            </Link>
            <Link to="/about" onClick={onClose}>
              <Button variant="underlined" w="70px">
                About
              </Button>
            </Link>
            <Button 
              variant="underlined" 
              w="70px" 
              onClick={onProfileModalOpen}
            >
              Profile
            </Button>
          </VStack>
        </Box>
      )}
        
      {/* Mobile Profile Modal */}
      {isProfileModalOpen && 
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={onProfileModalClose} 
        />
      }
    </Box>
  );
};