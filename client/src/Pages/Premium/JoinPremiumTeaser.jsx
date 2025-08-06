import { 
  Box, 
  Heading, 
  Flex, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  IconButton,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Icon
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@chakra-ui/icons'
import { PlanCard } from '../../Components/Cards'
import { useTranslation } from 'react-i18next'
import { useElements } from '../../Contexts/ElementsContext'
import { enrichPlansWithImages } from './planImageUtils'
import { useState, useEffect } from 'react'

export const JoinPremiumTeaser = ({ explorePlans, newMember }) => {
  const { plans, elementsLoading } = useElements()
  const { t } = useTranslation()
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Theme values
  const bgGradient = useColorModeValue(
    'linear(135deg, brand.500 0%, brand.600 50%, brand.700 100%)',
    'linear(135deg, brand.600 0%, brand.700 50%, brand.800 100%)'
  )
  const cardBg = useColorModeValue('whiteAlpha.900', 'whiteAlpha.100')
  const textColor = useColorModeValue('white', 'gray.100')
  const accentColor = useColorModeValue('yellow.300', 'yellow.200')

  // Enrich plans with proper image URLs
  const processedPlans = enrichPlansWithImages(plans)

  // Auto-play functionality for multiple plans
  useEffect(() => {
    if (processedPlans.length > 1 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentPlanIndex((prev) => (prev + 1) % processedPlans.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [processedPlans.length, isAutoPlaying])

  // Navigation handlers
  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentPlanIndex((prev) => 
      prev === 0 ? processedPlans.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentPlanIndex((prev) => (prev + 1) % processedPlans.length)
  }

  const goToSlide = (index) => {
    setIsAutoPlaying(false)
    setCurrentPlanIndex(index)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    })
  }

  // Loading state
  if (elementsLoading) {
    return (
      <Box
        bgGradient={bgGradient}
        p={8}
        borderRadius="3xl"
        position="relative"
        overflow="hidden"
      >
        <VStack spacing={6}>
          <Box
            w="60px"
            h="60px"
            borderRadius="full"
            bg="whiteAlpha.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={StarIcon} w={6} h={6} color={accentColor} />
          </Box>
          <Text color={textColor} fontSize="lg">
            {t('premium.loadingPremiumPlans')}
          </Text>
        </VStack>
      </Box>
    )
  }

  // Error state - no plans found
  if (!plans || plans.length === 0) {
    return (
      <Box
        bgGradient={bgGradient}
        p={8}
        borderRadius="3xl"
        position="relative"
        overflow="hidden"
      >
        <VStack spacing={6}>
          <Heading as="h2" size="xl" color={textColor} textAlign="center">
            {newMember ? t('premium.join') : t('premium.change')} {t('premium.premiumPlans')}
          </Heading>
          <Text color="red.300" fontSize="lg">
            {t('premium.noPremiumPlansFound')}
          </Text>
        </VStack>
      </Box>
    )
  }

  // Single plan display
  if (processedPlans.length === 1) {
    return (
      <Box
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        bgGradient={bgGradient}
        p={8}
        borderRadius="3xl"
        position="relative"
        overflow="hidden"
      >
        {/* Background decoration */}
        <Box
          position="absolute"
          top="-50px"
          right="-50px"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="whiteAlpha.100"
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="-30px"
          left="-30px"
          w="150px"
          h="150px"
          borderRadius="full"
          bg="whiteAlpha.50"
          zIndex={0}
        />

        <VStack spacing={8} position="relative" zIndex={1}>
          <motion.div variants={itemVariants}>
            <VStack spacing={4} textAlign="center">
              <Badge
                colorScheme="yellow"
                px={4}
                py={1}
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
              >
                {t('premium.exclusive')}
              </Badge>
              <Heading as="h2" size="xl" color={textColor}>
                {newMember ? t('premium.join') : t('premium.change')} {t('premium.premiumPlans')}
              </Heading>
              <Text color={textColor} fontSize="lg" maxW="md">
                {t('premium.unlockExclusiveFeatures')}
              </Text>
            </VStack>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Box
              bg={cardBg}
              borderRadius="2xl"
              p={6}
              shadow="2xl"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <PlanCard plan={processedPlans[0]} />
            </Box>
          </motion.div>
        </VStack>
      </Box>
    )
  }

  // Multiple plans display with custom slider
  return (
    <Box
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      bgGradient={bgGradient}
      p={8}
      borderRadius="3xl"
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        w="200px"
        h="200px"
        borderRadius="full"
        bg="whiteAlpha.100"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        w="150px"
        h="150px"
        borderRadius="full"
        bg="whiteAlpha.50"
        zIndex={0}
      />

      <VStack spacing={8} position="relative" zIndex={1}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <VStack spacing={4} textAlign="center">
            <Badge
              colorScheme="yellow"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="bold"
            >
              {t('premium.exclusive')}
            </Badge>
            <Heading as="h2" size="xl" color={textColor}>
              {newMember ? t('premium.join') : t('premium.change')} {t('premium.premiumPlans')}
            </Heading>
            <Text color={textColor} fontSize="lg" maxW="md">
              {t('premium.unlockExclusiveFeatures')}
            </Text>
          </VStack>
        </motion.div>

        {/* Plans Slider */}
        <motion.div variants={itemVariants}>
          <VStack spacing={6}>
            {/* Slider Container */}
            <Box
              position="relative"
              w={{ base: "100%", md: "500px" }}
              h="auto"
              overflow="hidden"
            >
              <AnimatePresence mode="wait" custom={currentPlanIndex}>
                <Box
                  as={motion.div}
                  key={currentPlanIndex}
                  custom={currentPlanIndex}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  position="relative"
                >
                  <Box
                    bg={cardBg}
                    borderRadius="2xl"
                    p={6}
                    shadow="2xl"
                    backdropFilter="blur(10px)"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    <PlanCard plan={processedPlans[currentPlanIndex]} />
                  </Box>
                </Box>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {processedPlans.length > 1 && (
                <>
                  <IconButton
                    aria-label="Previous plan"
                    icon={<ChevronLeftIcon />}
                    position="absolute"
                    left="-20px"
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={goToPrevious}
                    variant="solid"
                    colorScheme="whiteAlpha"
                    bg="whiteAlpha.200"
                    color={textColor}
                    _hover={{
                      bg: "whiteAlpha.300",
                      transform: "translateY(-50%) scale(1.1)"
                    }}
                    size="lg"
                    borderRadius="full"
                    backdropFilter="blur(10px)"
                  />
                  <IconButton
                    aria-label="Next plan"
                    icon={<ChevronRightIcon />}
                    position="absolute"
                    right="-20px"
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={goToNext}
                    variant="solid"
                    colorScheme="whiteAlpha"
                    bg="whiteAlpha.200"
                    color={textColor}
                    _hover={{
                      bg: "whiteAlpha.300",
                      transform: "translateY(-50%) scale(1.1)"
                    }}
                    size="lg"
                    borderRadius="full"
                    backdropFilter="blur(10px)"
                  />
                </>
              )}
            </Box>

            {/* Dots Indicator */}
            {processedPlans.length > 1 && (
              <HStack spacing={2}>
                {processedPlans.map((_, index) => (
                  <Box
                    key={index}
                    as="button"
                    w={currentPlanIndex === index ? "24px" : "8px"}
                    h="8px"
                    borderRadius="full"
                    bg={currentPlanIndex === index ? accentColor : "whiteAlpha.400"}
                    onClick={() => goToSlide(index)}
                    transition="all 0.3s ease"
                    _hover={{
                      bg: currentPlanIndex === index ? accentColor : "whiteAlpha.600",
                      transform: "scale(1.2)"
                    }}
                    cursor="pointer"
                  />
                ))}
              </HStack>
            )}

            {/* Plan Counter */}
            {processedPlans.length > 1 && (
              <Text color="whiteAlpha.800" fontSize="sm">
                {currentPlanIndex + 1} {t('common.of')} {processedPlans.length} {t('premium.plans')}
              </Text>
            )}
          </VStack>
        </motion.div>
      </VStack>
    </Box>
  )
}