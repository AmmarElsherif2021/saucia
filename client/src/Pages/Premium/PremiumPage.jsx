import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Fade,
  Flex,
  Image,
  Badge,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Center,
  Divider,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'

import { useElements } from '../../Contexts/ElementsContext'
import { useAuthContext } from '../../Contexts/AuthContext'

import { CurrentPlanBrief } from './CurrentPlanBrief'
import { Link } from 'react-router-dom'
// Import plan images - you can maintain this mapping or handle it differently
import gainWeightPlanImage from '../../assets/premium/gainWeight.png'
import keepWeightPlanImage from '../../assets/premium/keepWeight.png'
import loseWeightPlanImage from '../../assets/premium/loseWeight.png'
import dailyMealPlanImage from '../../assets/premium/dailymealplan.png'
import saladsPlanImage from '../../assets/premium/proteinsaladplan.png'
import nonProteinsaladsPlanImage from '../../assets/premium/nonproteinsaladplan.png'
import { JoinPremiumTeaser } from './JoinPremiumTeaser'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'

// Map plan titles to images
const planImages = {
  'Protein Salad Plan': saladsPlanImage,
  'Non-Protein Salad Plan': nonProteinsaladsPlanImage,
  'Daily Plan': dailyMealPlanImage,
  'Gain Weight': gainWeightPlanImage,
  'Keep Weight': keepWeightPlanImage,
  'Lose Weight': loseWeightPlanImage,
}

const PlanCard = ({ plan, isUserPlan, onSelect }) => {
  const cardBg = useColorModeValue('secondary.500', 'gray.700')
  const borderColor = isUserPlan ? 'teal.400' : 'gray.200'
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  // Add the image to the plan object for easier access
  const planWithImage = {
    ...plan,
    image: planImages[plan.title] || dailyMealPlanImage,
  }

  return (
    <Box
      borderWidth={isUserPlan ? '2px' : 'none'}
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      p={4}
      position="relative"
      transition="transform 0.2s 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
      }}
    >
      {isUserPlan && (
        <Badge colorScheme="warning" position="absolute" top={2} right={2}>
          {t('premium.currentPlan')}
        </Badge>
      )}

      <Image
        src={planWithImage.image}
        alt={plan.title}
        borderRadius="md"
        height="150px"
        width="100%"
        objectFit="cover"
        mb={4}
        bg={useColorModeValue('gray.50', 'gray.600')}
      />

      <Heading as="h3" size="md" mb={2}>
        {isArabic ? plan.title_arabic : plan.title}
      </Heading>
      <Text mb={2}>
        <Badge colorScheme="error">
          {plan.periods?.length || 0} {t('premium.periods')}
        </Badge>
      </Text>

      <Flex justify="space-between" mt={3}>
        <Box>
          <Text fontSize="sm">
            {t('premium.kcal')}: {plan.kcal}
          </Text>
          <Text fontSize="sm">
            {t('premium.carbs')}: {plan.carb}g
          </Text>
          <Text fontSize="sm">
            {t('premium.protein')}: {plan.protein}g
          </Text>
        </Box>

        <Button
          size="sm"
          colorScheme={isUserPlan ? 'error' : 'brand'}
          onClick={() => onSelect(planWithImage)}
        >
          {isUserPlan ? t('premium.viewDetails') : t('premium.select')}
        </Button>
      </Flex>
    </Box>
  )
}

const PlanDetails = ({ plan }) => {
  const { t } = useTranslation()
  const currentLanguage = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  return (
    <Box>
      <Heading as="h3" size="sm" mb={2}>
        {isArabic ? plan.title_arabic : plan.title}
      </Heading>
      <Heading as="h4" size="xs" mb={2}>
        {t('premium.nutritionalInformation')}
      </Heading>

      <Flex mb={4} gap={4} flexWrap="wrap">
        <Badge colorScheme="green">
          {t('premium.kcal')}: {plan.kcal}
        </Badge>
        <Badge colorScheme="brand">
          {t('premium.carbs')}: {plan.carb}g
        </Badge>
        <Badge colorScheme="red">
          {t('premium.protein')}: {plan.protein}g
        </Badge>
      </Flex>

      <Heading as="h4" size="xs" mb={2}>
        {t('checkout.subscriptionPeriod')}
      </Heading>

      {plan.periods && plan.periods.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
          {plan.periods.map((period, index) => (
            <Box key={index} p={2} bg="gray.50" borderRadius="md">
              <Text>
                {period} {t('premium.daysSubscription')}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text>{t('premium.noSubscriptionPeriodsAvailable')}</Text>
      )}
    </Box>
  )
}

export const PremiumPage = () => {
  const { plans, elementsLoading } = useElements()
  const { 
    user, 
    userPlan, 
    updateUserSubscription,
    planLoading 
  } = useAuthContext();
  const [explorePlans, setExplorePlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [subscribing, setSubscribing] = useState(false)
  const { t } = useTranslation()
  const toast = useToast()
  //scrolling down
  const plansSectionRef = useRef(null)
  const detailsSectionRef = useRef(null)
  const plansContainerRef = useRef(null)
   //test effect
  useEffect(() => {
    console.log('PremiumPage mounted')
    console.log('USER HERE IS',JSON.stringify(user))},[]);
  // Set the selected plan to match the user's plan when loaded
  useEffect(() => {
    if (userPlan && !selectedPlan) {
      setSelectedPlan(userPlan)
    }
  }, [userPlan, selectedPlan])

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan)
    // Scroll to details section after a small delay
    setTimeout(() => {
      detailsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }, 50)
  }

  const toggleExplorePlans = () => {
    const newState = !explorePlans
    setExplorePlans(newState)

    if (newState) {
      setTimeout(() => {
        // Scroll to the bottom of the plans container
        plansContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }, 50)
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: t('premium.authenticationRequired'),
        description: t('premium.signInToSubscribe'),
        status: 'warning',
        duration: 5000,
        isClosable: false,
      })
      return
    }

    if (!selectedPlan) return

    try {
      setSubscribing(true)
      // Updated subscription call
      await updateUserSubscription({
        planId: selectedPlan.id,
        planName: selectedPlan.title,
        startDate: new Date().toISOString(),
        status: 'active'
      })
      toast({
        title: t('premium.planUpdated'),
        description: t('premium.nowSubscribedToPlan', { planTitle: selectedPlan.title }),
        status: 'success',
        duration: 5000,
        isClosable: false,
      })

      setExplorePlans(false)
    } catch (error) {
      toast({
        title: t('premium.subscriptionFailed'),
        description: error.message || t('premium.failedToUpdatePlanSubscription'),
        status: 'error',
        duration: 5000,
        isClosable: false,
      })
    } finally {
      setSubscribing(false)
    }
  }

  if (elementsLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
        </VStack>
      </Center>
    )
  }

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <VStack spacing={8} align="stretch">
        {!user && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            {t('premium.signInToSubscribe')}
          </Alert>
        )}

        {/* Current Plan Section */}
        <Box as={VStack} bg="white" p={6} borderRadius="xl" alignItems={'center'}>
          <JoinPremiumTeaser />
          {userPlan && (
            <CurrentPlanBrief
              plan={userPlan}
              loading={planLoading}
            />
          )}

          {userPlan && (
            <Button mt={4} colorScheme="brand" size="sm" onClick={toggleExplorePlans}>
              {explorePlans ? t('premium.hideAvailablePlans') : t('premium.exploreOtherPlans')}
            </Button>
          )}

          {!userPlan && !planLoading && (
            <Button mt={4} colorScheme="brand" onClick={toggleExplorePlans}>
              {t('premium.browseAvailablePlans')}
            </Button>
          )}
        </Box>
        {/* Available Plans Section */}

        {explorePlans && (
          <Fade in={explorePlans}>
            <Box bg="warning.100" p={6} borderRadius="xl" ref={plansContainerRef}>
              <Heading as="h2" size="md" mb={6}>
                {t('premium.availablePremiumPlans')}
              </Heading>

              {plans && plans.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={{
                        ...plan,
                        image: planImages[plan.title] || dailyMealPlanImage,
                      }}
                      isUserPlan={userPlan?.id === plan.id}
                      onSelect={handlePlanSelect}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Center p={8}>
                  <Text>{t('premium.noPlansAvailable')}</Text>
                </Center>
              )}
            </Box>
          </Fade>
        )}

        {/* Selected Plan Details Section */}
        {selectedPlan && explorePlans && (
          <Box bg="secondary.200" borderRadius={'xl'} p={6} ref={detailsSectionRef}>
            <Heading as="h2" size="md" mb={4}>
              {t('premium.planDetails')}
            </Heading>

            <PlanDetails plan={selectedPlan} />

            <Divider my={4} />

            {userPlan?.id !== selectedPlan.id && (
              <Link
                to="/premium/join"
                state={{ planId: selectedPlan.id }}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  mt={4}
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  isLoading={subscribing}
                  loadingText={t('premium.updatingSubscription')}
                  isDisabled={!user}
                >
                  {t('premium.subscribeToPlan')}
                </Button>
              </Link>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  )
}
export default PremiumPage
