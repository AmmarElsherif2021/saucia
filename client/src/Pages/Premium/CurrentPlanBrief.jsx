import { Text, Flex, Box, Button, Collapse, Spinner, Badge } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { CircularPlanAvatar } from './PlanAvatar'
import PlanSettingsModal from './PlanSettingsModal'

export const CurrentPlanBrief = () => {
  const [showDetails, setShowDetails] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [subscriptionStats, setSubscriptionStats] = useState(null)
  
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { user, currentSubscription, isSubscriptionLoading } = useAuthContext()
  const { orders, nextMeal, isLoading: ordersLoading, nextMealLoading } = useUserSubscriptions()
  
  const isArabic = currentLanguage === 'ar'

  // Calculate subscription statistics
  useEffect(() => {
    if (orders && orders.length > 0 && currentSubscription) {
      const totalMeals = currentSubscription.total_meals
      const consumedMeals = currentSubscription.consumed_meals || 0
      const pendingMeals = orders.filter(order => 
        ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
      ).length
      
      setSubscriptionStats({
        totalMeals,
        consumedMeals,
        pendingMeals,
        remainingMeals: totalMeals - consumedMeals
      })
    }
  }, [orders, currentSubscription])

  if (isSubscriptionLoading || ordersLoading) {
    return (
      <Flex justify="center" py={6} borderRadius={'35px'} bg="brand.100" alignItems="center">
        <Spinner size="md" color="brand.500" />
        <Text ml={3}>{t('loadingPlanDetails')}...</Text>
      </Flex>
    )
  }

  if (!currentSubscription) {
    return <Text>{t('notSubscribedToAnyPlan')}.</Text>
  }

  const plan = currentSubscription.plans
  const nextOrder = nextMeal || orders?.find(order => 
    ['pending', 'confirmed'].includes(order.status)
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green'
      case 'paused': return 'orange'
      case 'pending': return 'teal'
      case 'completed': return 'black'
      default: return 'gray'
    }
  }

  const formatDeliveryTime = (timeString) => {
    if (!timeString) return t('premium.notSet')
    return timeString.slice(0, 5) // Remove seconds if present
  }

  return (
    <Box borderRadius={'35px'} bg="brand.100" borderColor={'brand.500'} p={6} mb={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text>
          {t('premium.currentlySubscribedToThe')}{' '}
          <strong>{isArabic ? plan?.title_arabic : plan?.title}</strong>.
        </Text>
        <Badge colorScheme={getStatusColor(currentSubscription.status)} size="lg">
          {t(currentSubscription.status)}
        </Badge>
      </Flex>

      <Flex mt={4} alignItems="center" flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={4}>
        <CircularPlanAvatar 
          plan={plan}
          size="85px"
        />

        <Box flex="1">
          <Flex mt={2} gap={2} flexWrap="wrap">
            <Badge colorScheme="green">
              {t('premium.kcal')}: {plan?.kcal || 0}
            </Badge>
            <Badge colorScheme="brand">
              {t('premium.carbs')}: {plan?.carb || 0}g
            </Badge>
            <Badge colorScheme="red">
              {t('premium.protein')}: {plan?.protein || 0}g
            </Badge>
          </Flex>

          {subscriptionStats && (
            <Flex mt={2} gap={2} flexWrap="wrap">
              <Badge colorScheme="teal" variant="outline">
                {t('premium.totalMeals')}: {subscriptionStats.totalMeals}
              </Badge>
              <Badge colorScheme="green" variant="outline">
                {t('premium.consumed')}: {subscriptionStats.consumedMeals}
              </Badge>
              <Badge colorScheme="orange" variant="outline">
                {t('premium.remaining')}: {subscriptionStats.remainingMeals}
              </Badge>
            </Flex>
          )}

          {nextOrder && (
            <Box mt={3} p={3} bg="secondary.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                <strong>{t('premium.nextScheduledMeal')}:</strong>
              </Text>
              
              {nextOrder.order_meals?.[0] && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {isArabic ? 
                    nextOrder.order_meals[0].name_arabic || nextOrder.order_meals[0].name : 
                    nextOrder.order_meals[0].name
                  }
                </Text>
              )}

              {nextOrder.scheduled_delivery_date && (
                <Text fontSize="sm" color="gray.600">
                  <strong>{t('premium.deliveryDate')}:</strong>{' '}
                  {new Date(nextOrder.scheduled_delivery_date).toLocaleDateString(
                    isArabic ? 'ar-EG' : 'en-US'
                  )}
                </Text>
              )}

              <Text fontSize="sm" color="gray.600">
                <strong>{t('premium.preferredTime')}:</strong>{' '}
                {formatDeliveryTime(currentSubscription.preferred_delivery_time)}
              </Text>

              {nextOrder.user_addresses && (
                <Text fontSize="sm" color="gray.600">
                  <strong>{t('premium.deliveryAddress')}:</strong>{' '}
                  {nextOrder.user_addresses.label} - {nextOrder.user_addresses.address_line1}
                </Text>
              )}

              <Badge 
                mt={2} 
                colorScheme={nextOrder.status === 'confirmed' ? 'green' : 'blue'}
                size="sm"
              >
                {t(`admin.order_status.${nextOrder.status}`)}
              </Badge>
            </Box>
          )}
        </Box>

        <Flex direction="column" gap={2}>
          <Button 
            onClick={() => setShowDetails(!showDetails)} 
            colorScheme="brand" 
            size="sm"
            variant="outline"
          >
            {showDetails ? t('premium.hideDetails') : t('premium.showDetails')}
          </Button>
          
          <Button
            onClick={() => setIsSettingsModalOpen(true)}
            colorScheme="brand"
            size="sm"
          >
            {t('premium.managePlan')}
          </Button>
        </Flex>
      </Flex>

      <Collapse in={showDetails} animateOpacity>
        <Box mt={4} p={4} bg="secondary.100" borderRadius="md">
          <Text fontWeight="medium" mb={3}>
            {t('premium.subscriptionDetails')}
          </Text>

          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            <Box flex="1">
              <Text fontSize="sm" mb={2}>
                <strong>{t('premium.planName')}:</strong>{' '}
                {isArabic ? plan?.title_arabic : plan?.title}
              </Text>

              <Text fontSize="sm" mb={2}>
                <strong>{t('premium.subscriptionId')}:</strong>{' '}
                {currentSubscription.id.slice(0, 8)}...
              </Text>

              <Text fontSize="sm" mb={2}>
                <strong>{t('premium.startDate')}:</strong>{' '}
                {new Date(currentSubscription.start_date).toLocaleDateString(
                  isArabic ? 'ar-EG' : 'en-US'
                )}
              </Text>

              {currentSubscription.end_date && (
                <Text fontSize="sm" mb={2}>
                  <strong>{t('premium.endDate')}:</strong>{' '}
                  {new Date(currentSubscription.end_date).toLocaleDateString(
                    isArabic ? 'ar-EG' : 'en-US'
                  )}
                </Text>
              )}

              <Text fontSize="sm" mb={2}>
                <strong>{t('premium.pricePerMeal')}:</strong>{' '}
                {currentSubscription.price_per_meal} {t('currency.sar')}
              </Text>
            </Box>

            <Box flex="1">
              {subscriptionStats && (
                <>
                  <Text fontSize="sm" mb={2}>
                    <strong>{t('premium.subscriptionProgress')}:</strong>
                  </Text>
                  
                  <Box bg="gray.200" borderRadius="full" h="8px" mb={2}>
                    <Box
                      bg="brand.500"
                      h="8px"
                      borderRadius="full"
                      width={`${(subscriptionStats.consumedMeals / subscriptionStats.totalMeals) * 100}%`}
                    />
                  </Box>

                  <Text fontSize="xs" color="gray.600" mb={3}>
                    {subscriptionStats.consumedMeals} / {subscriptionStats.totalMeals} {t('premium.mealsConsumed')}
                  </Text>

                  <Text fontSize="sm" mb={1}>
                    <strong>{t('premium.autoRenewal')}:</strong>{' '}
                    {currentSubscription.auto_renewal ? t('premium.enabled') : t('premium.disabled')}
                  </Text>
                </>
              )}

              {orders && orders.length > 0 && (
                <Text fontSize="sm">
                  <strong>{t('premium.pendingOrders')}:</strong>{' '}
                  {orders.filter(order => 
                    ['pending', 'confirmed', 'preparing'].includes(order.status)
                  ).length}
                </Text>
              )}
            </Box>
          </Flex>
        </Box>
      </Collapse>

      <PlanSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        subscription={currentSubscription}
        orders={orders}
        subscriptionStats={subscriptionStats}
      />
    </Box>
  )
}