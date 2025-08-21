import { Heading, Box, Button, VStack, useColorMode, Text, Alert, AlertIcon } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import CommonQuestions from './CommonQuestions'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../../Contexts/AuthContext'
import { useChosenPlanContext } from '../../../Contexts/ChosenPlanContext'
import { useElements } from '../../../Contexts/ElementsContext'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../../Contexts/I18nContext'

const JoinPlanPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthContext()
  const { chosenPlan, setSelectedPlan, subscriptionData } = useChosenPlanContext()
  const { plans } = useElements()
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isInitializing, setIsInitializing] = useState(true)
  const { colorMode } = useColorMode()
  const {currentLanguage} = useI18nContext()
  const isArabic = currentLanguage === 'ar';
  // Initialize plan from navigation state or redirect context
  useEffect(() => {
    const initializePlan = async () => {
      try {
        const stateData = location.state
        console.log('JoinPlan - location state:', stateData)
        console.log('JoinPlan - current chosen plan:', chosenPlan)

        // Check if we have plan data from navigation state
        if (stateData?.planId && plans?.length > 0) {
          const planFromState = plans.find(plan => plan.id === stateData.planId)
          
          if (planFromState && (!chosenPlan || chosenPlan.id !== planFromState.id)) {
            console.log('Setting plan from navigation state:', planFromState.title)
            await setSelectedPlan(planFromState)
            
            // Set term if provided
            if (stateData.selectedTerm && subscriptionData.selected_term !== stateData.selectedTerm) {
              // Update subscription data with selected term
              // This would typically be done through your context method
            }
          }
        }
        
        // If still no plan, try to get from pending redirect (fallback)
        if (!chosenPlan && plans?.length > 0) {
          const stored = localStorage.getItem('auth_pending_redirect')
          if (stored) {
            try {
              const redirectData = JSON.parse(stored)
              if (redirectData.planId) {
                const planFromStorage = plans.find(plan => plan.id === redirectData.planId)
                if (planFromStorage) {
                  console.log('Setting plan from stored redirect:', planFromStorage.title)
                  await setSelectedPlan(planFromStorage)
                }
              }
            } catch (e) {
              console.warn('Could not parse stored redirect:', e)
            }
          }
        }
      } catch (error) {
        console.error('Error initializing plan:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    if (plans?.length > 0) {
      initializePlan()
    } else if (!isInitializing) {
      setIsInitializing(false)
    }
  }, [plans, chosenPlan, setSelectedPlan, location.state, subscriptionData.selected_term])

  // Redirect to premium if user is not authenticated
  useEffect(() => {
    if (!isInitializing && !user) {
      navigate('/premium', { replace: true })
    }
  }, [user, navigate, isInitializing])

  const handleCompleteQuestions = () => {
    setCurrentStep(1)
  }

  const handleBackToPlans = () => {
    navigate('/premium')
  }

  const handleProceedToCheckout = () => {
    if (chosenPlan) {
      navigate('/checkout-plan', {
        state: {
          planId: chosenPlan.id,
          selectedTerm: subscriptionData.selected_term,
          fromJoinPlan: true
        }
      })
    } else {
      navigate('/checkout')
    }
  }

  if (isInitializing) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minH="100vh"
        bg={colorMode === "dark" ? "brand.900" : "white"}
      >
        <VStack spacing={4}>
          <Text>{t('common.loading')}</Text>
        </VStack>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box p={4}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">{t('premium.authenticationRequired')}</Text>
            <Text fontSize="sm">{t('premium.pleaseSignInToJoinPlan')}</Text>
          </Box>
        </Alert>
      </Box>
    )
  }

  return (
    <Box p={{ base: 4, md: 8 }} minH="100vh" overflowX={"none"} bg={colorMode === "dark" ? "brand.900" : "white"}>
      <VStack spacing={8} align="stretch">
        {/* Plan Context Display */}
        {chosenPlan && (
          <Alert
            display="flex"
            alignItems="flex-start"
            bg={colorMode === "dark" ? "blue.900" : "blue.50"}
            borderRadius="md"
            p={4}
            borderWidth={1}
            borderColor={colorMode === "dark" ? "blue.700" : "blue.200"}
          >
            <Box mt={1} mr={3}>
              <AlertIcon color="blue.400" boxSize={6} />
            </Box>
            <Box>
              <Text fontWeight="bold">
                {t('premium.joiningPlan')}: {isArabic ? chosenPlan.title_arabic : chosenPlan.title}
              </Text>
              <Text fontSize="sm">
                {subscriptionData.selected_term && (
                  <>{subscriptionData.selected_term} ({subscriptionData.total_meals} {t("checkout.mealSlot")})</>
                )}
              </Text>
            </Box>
          </Alert>
        )}

        {currentStep === 0 ? (
          <CommonQuestions onComplete={handleCompleteQuestions} />
        ) : (
          <Box bg={colorMode === "dark" ? "gray.800" : "white"} p={6} borderRadius="md" shadow="md">
            <Heading as="h2" size="md" mb={4}>
              {t('premium.confirmSubscription')}
            </Heading>
            
            {chosenPlan ? (
              <>
                <Text mb={4}>
                  {t('premium.subscribingTo')}: <strong>{chosenPlan.title}</strong>
                </Text>
                {subscriptionData.selected_term && (
                  <Text mb={4}>
                    {t('premium.selectedTerm')}: {subscriptionData.selected_term} 
                    ({subscriptionData.total_meals} {t('premium.meals')})
                  </Text>
                )}
                <Text mb={6}>
                  {t('premium.reviewBeforePayment')}
                </Text>

                <Button
                  colorScheme="brand"
                  size="lg"
                  width="full"
                  onClick={handleProceedToCheckout}
                >
                  {t('premium.proceedToPayment')}
                </Button>
              </>
            ) : (
              <>
                <Text mb={4} color="orange.500">
                  {t('premium.noPlanSelected')}
                </Text>
                <Text mb={6}>
                  {t('premium.pleaseSelectAPlanFirst')}
                </Text>
              </>
            )}
            
            <Button mt={4} variant="outline" width="full" onClick={handleBackToPlans}>
              {t('premium.backToPlans')}
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
export default JoinPlanPage