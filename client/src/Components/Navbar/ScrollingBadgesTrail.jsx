import { motion } from 'framer-motion'
import {
  Box,
  HStack,
  useColorModeValue,
  Container,
  Image,
  Text,
  Flex,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect, useMemo } from 'react'
import { useElements } from '../../Contexts/ElementsContext'
import { useI18nContext } from '../../Contexts/I18nContext'

// Import icons
import makeSaladIcon from '../../assets/menu/fruit-salad.svg'
import proteinIcon from '../../assets/menu/protein.svg'
import cheeseIcon from '../../assets/menu/cheese.svg'
import extrasIcon from '../../assets/menu/extras.svg'
import dressingsIcon from '../../assets/menu/dressings.svg'
import saladIcon from '../../assets/menu/salad.svg'
import soupIcon from '../../assets/menu/soup.svg'
import fruitIcon from '../../assets/menu/fruit.svg'
import dessertIcon from '../../assets/menu/dessert.svg'

// Icon mapping for sections
const SECTION_ICONS = {
  'Salads': saladIcon,
  'Soups': soupIcon,
  'Proteins': proteinIcon,
  'Cheese': cheeseIcon,
  'cheeses': cheeseIcon,
  'Extras': extrasIcon,
  'Dressings': dressingsIcon,
  'Fruits': fruitIcon,
  'make your own salad': makeSaladIcon,
  'Make your own fruit salad': fruitIcon,
  'Our signature salad': saladIcon,
  'Juices': fruitIcon,
  'Desserts': dessertIcon,
}

// Color palette matching MenuPage themes
const SECTION_COLORS = {
  'Salads': '#da8652ff',
  'Soups': '#edd584',
  'Proteins': '#df6464ff',
  'cheeses': '#62c5b8',
  'Extras': '#1fa28e',
  'Dressings': '#d7b741',
  'Fruits': '#91e08b',
  'make your own salad': '#eb9a7a',
  'Make your own fruit salad': '#d0f39c',
  'Our signature salad': '#47d095',
  'Juices': '#c2ea98',
  'Desserts': '#86e4e3',
  'Default': '#f179b5'
}

const getSectionColor = (sectionName) => {
  return SECTION_COLORS[sectionName] || SECTION_COLORS.Default
}

const getSectionIcon = (sectionName) => {
  return SECTION_ICONS[sectionName] || makeSaladIcon
}

export const ScrollingBadgesTrail = ({ className = "" }) => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const scrollContainerRef = useRef(null)
  const { meals = [] } = useElements()

  // Generate sections dynamically from available meals
  const sections = useMemo(() => {
    if (!meals.length) return []

    try {
      const availableMeals = meals.filter(meal => 
        meal?.id && meal.is_available === true
      )

      const sectionsMap = new Map()

      availableMeals.forEach(meal => {
        if (!meal?.id) return
        
        const sectionName = String(meal.section || 'Other').trim()
        
        if (!sectionsMap.has(sectionName)) {
          sectionsMap.set(sectionName, {
            name: sectionName,
            name_arabic: meal.section_arabic || sectionName,
            icon: getSectionIcon(sectionName),
            color: getSectionColor(sectionName)
          })
        }
      })

      return Array.from(sectionsMap.values())
    } catch (error) {
      console.error('Error generating sections:', error)
      return []
    }
  }, [meals])

  // Background and hover colors
  const bgColor = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSectionNavigation = (sectionName) => {
    return { scrollTo: sectionName }
  }

  // Enable smooth scrolling behavior
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.style.scrollBehavior = 'smooth'
    }
  }, [])

  const badgeVariants = {
    initial: { opacity: 0, scale: 0.8, y: 15 },
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
      scale: 0.96,
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
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  }

  // Don't render if no sections available
  if (!sections.length) {
    return null
  }

  return (
    <Box
      className={className}
      position="relative"
      w="100%"
      py={{ base: 3, md: 4 }}
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
    >
      {/* Gradient overlays for fade effect */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="40px"
        bgGradient={useColorModeValue(
          'linear(to-r, white, transparent)',
          'linear(to-r, gray.800, transparent)'
        )}
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

      <Container maxW="container.xl" px={{ base: 2, md: 4 }}>
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
              spacing={{ base: 2, md: 3 }} 
              px={{ base: 2, md: 4 }}
              py={2}
              minW="max-content"
              align="center"
              justify={{ base: "flex-start", md: "center" }}
            >
              {sections.map((section, index) => {
                const sectionColor = section.color
                
                return (
                  <motion.div
                    key={`${section.name}-${index}`}
                    variants={badgeVariants}
                    whileHover="hover"
                    whileTap="tap"
                    style={{ display: 'inline-block' }}
                  >
                    <Link
                      to="/menu"
                      state={handleSectionNavigation(section.name)}
                    >
                      <Flex
                        align="center"
                        gap={2}
                        px={{ base: 3, md: 4 }}
                        py={{ base: 2, md: 2.5 }}
                        borderRadius="full"
                        bg={bgColor}
                        border="2px solid"
                        borderColor={sectionColor}
                        cursor="pointer"
                        whiteSpace="nowrap"
                        userSelect="none"
                        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                          bg: hoverBg,
                          shadow: 'md',
                          transform: 'translateY(-2px)',
                        }}
                        _active={{
                          transform: 'scale(0.96) translateY(0px)',
                        }}
                      >
                        {/* Icon */}
                        <Image
                          src={section.icon}
                          alt={section.name}
                          boxSize={{ base: "20px", md: "24px" }}
                          objectFit="contain"
                          filter={useColorModeValue('none', 'brightness(0.9)')}
                        />
                        
                        {/* Section name */}
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          fontWeight="600"
                          color={sectionColor}
                          lineHeight="1.2"
                        >
                          {currentLanguage === 'ar' ? section.name_arabic : section.name}
                        </Text>
                      </Flex>
                    </Link>
                  </motion.div>
                )
              })}
            </HStack>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}