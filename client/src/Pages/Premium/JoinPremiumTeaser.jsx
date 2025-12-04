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
// MOCK DATA FOR TESTING - Comment out actual imports below
import { useElements } from '../../Contexts/ElementsContext'
import { enrichPlansWithImages } from './planImageUtils'
import { useState, useEffect } from 'react'
import { useI18nContext } from '../../Contexts/I18nContext'

// MOCK DATA FOR TESTING PURPOSES
// const mockPlans = [
//   {
//     id: 'plan-1',
//     title: 'Premium Fitness Plan',
//     title_arabic: 'بريميوم فيتنس بلان',
//     description: 'High-protein meals for fitness enthusiasts',
//     description_arabic: 'وجبات غنية بالبروتين لعشاق اللياقة البدنية',
//     kcal: 450,
//     carb: 45,
//     protein: 35,
//     fat: 12,
//     price: 750,
//     duration_days: 30,
//     total_meals: 30,
//     is_active: true,
//     image_url: '/images/plans/fitness-plan.jpg'
//   },,,


export const JoinPremiumTeaser = ({ explorePlans, newMember }) => {
  // MOCK DATA FOR TESTING - Comment out actual context usage
   const { plans, elementsLoading } = useElements()
  const { t } = useTranslation()
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const {currentLanguage}=useI18nContext();
  const isArabic = currentLanguage==='ar' ? true : false;
  
  // Using mock data instead
  // const plans = mockPlans;
  // const elementsLoading = false;

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
            {t('loadingPremiumPlans')}
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
            {newMember ? t('join') : t('change')} {t('premiumPlans')}
          </Heading>
          <Text color="red.300" fontSize="lg">
            {t('noPremiumPlansFound')}
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
                {t('exclusive')}
              </Badge>
              <Heading as="h2" size="xl" color={textColor}>
                {newMember ? t('join') : t('change')} {t('premiumPlans')}
              </Heading>
              <Text color={textColor} fontSize="lg" maxW="md">
                {t('unlockExclusiveFeatures')}
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
  // Multiple plans display with circular avatars
  return (
    <Box
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      bgGradient={bgGradient}
      p={4}
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
              {t('exclusive')}
            </Badge>
            <Heading as="h2" size="xl" color={textColor}>
              {newMember ? t('join') : t('change')} {t('premiumPlans')}
            </Heading>
            <Text color={textColor} fontSize="lg" maxW="md">
              {t('unlockExclusiveFeatures')}
            </Text>
          </VStack>
        </motion.div>

        {/* Circular Avatar Plans Grid */}
        <motion.div variants={itemVariants}>
          <SimpleGrid columns={{ base:2, md: 2 }} spacing={12} w="100%">
            {processedPlans.map((plan, index) => (
              <Box
                key={plan.id}
                as={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <VStack spacing={4}>
                
                  <Box
                    position="relative"
                    w={{ base: "100px", md: "130px", lg: "150px" }}
                    h={{ base: "100px", md: "130px", lg: "150px" }}
                    borderRadius="full"
                    overflow="hidden"
                    border="4px solid"
                    borderColor={accentColor}
                    bg={cardBg}
                    shadow="2xl"
                    cursor="pointer"
                    onClick={() => explorePlans && explorePlans()}
                  >
                    {plan.avatar_url ? (
                      <Box
                        as="img"
                        src={plan.avatar_url}
                        alt={plan.title}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                      />
                    ) : (
                      <Flex
                        w="100%"
                        h="100%"
                        align="center"
                        justify="center"
                        bgGradient="linear(to-br, brand.400, brand.600)"
                      >
                        <Icon as={StarIcon} w={12} h={12} color={accentColor} />
                      </Flex>
                    )}
                  </Box>

                  {/* Plan Info */}
                  <VStack spacing={2} textAlign="center">
                    <Text
                      color={textColor}
                      fontSize={["xs","xs", "sm", "xl"]}
                      fontWeight="bold"
                      noOfLines={1}
                    >
                      {!isArabic? plan.title:plan.title_arabic}
                    </Text>
                    
                    <HStack spacing={3} fontSize="sm" flexWrap="wrap" justify="center" >
                      <Text fontWeight={'thin'} bg={'brand.800'} color={"secondary.100"}>{plan.kcal} kcal</Text>
                    
                      <Text fontWeight={'thin'} bg={'brand.800'} color={"secondary.100"}>{plan.carb}gm carb</Text>
                    
                      <Text fontWeight={'thin'} bg={'brand.800'} color={"secondary.100"}>{plan.protein}gm protein</Text>

                    </HStack>
                    
                  </VStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </motion.div>  
      </VStack>
    </Box>
  )
}