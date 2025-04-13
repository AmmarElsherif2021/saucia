import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  IconButton,
  useColorMode,
  useDisclosure,
  Stack,
  useColorModeValue,
  Img,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import logoIcon from "../assets/logo.png";

export const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box bg={bgColor} py={1} px={4} position="fixed" w="99%" zIndex="10">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        maxW="1200px"
        mx="auto"
      >
        {/* Logo */}
        <Box fontWeight="bold" fontSize="lg" color={textColor}>
          <Link to="/"><Img src={logoIcon} w={20}/></Link>
        </Box>

        {/* Desktop Menu */}
        <Flex display={{ base: "none", md: "flex" }} alignItems="center" gap={4}>
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
          <Link to="/contact">
            <Button variant="underlined" colorScheme="brand">
              Contact
            </Button>
          </Link>
          <Link to="/">
            <Button variant="underlined" colorScheme="brand">
              login
            </Button>
          </Link>
          <IconButton
            aria-label="Toggle Color Mode"
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>

        {/* Mobile Menu Button */}
        <IconButton
          aria-label="Open Menu"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          display={{ base: "flex", md: "none" }}
          onClick={isOpen ? onClose : onOpen}
          variant="ghost"
        />
      </Flex>

      {/* Mobile Menu */}
      {isOpen && (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as="nav" spacing={4}>
            <Link to="/">
              <Button variant="underlined" w="100%" onClick={onClose}>
                Home
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="underlined" w="100%" onClick={onClose}>
                About
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="underlined" w="100%" onClick={onClose}>
                Contact
              </Button>
            </Link>
            <Button
              variant="ghost"
              w="100%"
              onClick={() => {
                toggleColorMode();
                onClose();
              }}
            >
              {colorMode === "light" ? "Dark Mode" : "Light Mode"}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};