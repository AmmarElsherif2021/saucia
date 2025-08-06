import { motion } from 'framer-motion'
import {
  Box,
  Badge,
  HStack,
  useColorModeValue,
  Container,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect } from 'react'

export const ScrollingBadgesTrail = ({ className = "" }) => {
  const { t } = useTranslation()
  const scrollContainerRef = useRef(null)

  // Color values for theming
  const badgeBg = useColorModeValue('brand.50', 'brand.800')
  const badgeColor = useColorModeValue('brand.700', 'brand.200')
  const badgeHoverBg = useColorModeValue('brand.100', 'brand.700')
  const badgeHoverColor = useColorModeValue('brand.800', 'brand.100')

  // Menu sections moved from Navbar
  const badgeSections = [
    { path: '/menu', section: 'Our signature salad', label: 'signatureSalad' },
    { path: '/menu', section: 'Soups', label: 'soups' },
    { path: '/menu', section: 'Desserts', label: 'desserts' },
    { path: '/menu', section: 'Make Your Own Salad', label: 'makeYourOwnSalad' },
    { path: '/menu', section: 'Make Your Own Fruit Salad', label: 'makeYourOwnFruitSalad' },
  ]

  const handleSectionNavigation = (section) => {
    return { scrollTo: section }
  }

  // Enable smooth scrolling behavior
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.style.scrollBehavior = 'smooth'
    }
  }, [])

  const badgeVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <Box
      className={className}
      position="relative"
      w="100%"
      py={{ base: 3, md: 4 }}
    >
      {/* Gradient overlays for fade effect */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="40px"
        
        zIndex={2}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        w="40px"
        bgGradient={useColorModeValue(
          'linear(to-l, white, transparent)',
          'linear(to-l, gray.800, transparent)'
        )}
        zIndex={2}
        pointerEvents="none"
      />

      <Container maxW="100%" px={0}>
        <Box
          as={motion.div}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          position="relative"
        >
          {/* Scrollable container */}
          <Box
            ref={scrollContainerRef}
            overflowX="auto"
            overflowY="hidden"
            w="100%"
            css={{
              // Hide scrollbar but keep functionality
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              '-ms-overflow-style': 'none',  // IE and Edge
              'scrollbar-width': 'none',     // Firefox
              // Enable smooth momentum scrolling on iOS
              '-webkit-overflow-scrolling': 'touch',
            }}
          >
            {/* Content container */}
            <HStack 
              spacing={4} 
              px={6}
              py={2}
              minW="max-content"
              align="center"
              justify={"center"}
            >
              {badgeSections.map((item, index) => (
                <motion.div
                  key={`${item.label}`}
                  variants={badgeVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{ display: 'inline-block' }}
                >
                  <Link
                    to={item.path}
                    state={handleSectionNavigation(item.section)}
                  >
                    <Badge
                      variant="subtle"
                      colorScheme="brand"
                      px={4}
                      py={2}
                      borderRadius="md"
                      fontSize={{ base: 'xs', md: 'sm' }}
                      fontWeight="semibold"
                      bg={badgeBg}
                      color={badgeColor}
                      border="2px solid"
                      borderColor={useColorModeValue('brand.500', 'brand.400')}
                      cursor="pointer"
                      whiteSpace="nowrap"
                      userSelect="none"
                      _hover={{
                        bg: badgeHoverBg,
                        color: badgeHoverColor,
                        borderColor: useColorModeValue('brand.300', 'brand.500'),
                        shadow: 'md',
                      }}
                      _active={{
                        transform: 'scale(0.95)',
                      }}
                      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    >
                      {t(`navbar.${item.label}`)}
                    </Badge>
                  </Link>
                </motion.div>
              ))}
            </HStack>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}