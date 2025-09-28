import { Text, Flex, Box, Button, Collapse, Spinner, Badge, useDisclosure, useBreakpointValue } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
// MOCK DATA FOR TESTING - Comment out actual imports below
import { useI18nContext } from '../../Contexts/I18nContext'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { CircularPlanAvatar } from './PlanAvatar'
import PlanSettingsModal from './PlanSettingsModal'

// MOCK DATA FOR TESTING PURPOSES
// const mockData = {
//   currentLanguage: 'en',
//   user: { id: 'user-123', name: 'Test User' },
//   currentSubscription: {
//     id: 'sub-1234567890abcdef',
//     status: 'active',
//     total_meals: 30,
//     consumed_meals: 12,
//     start_date: '2023-10-15T00:00:00Z',
//     end_date: '2023-11-15T00:00:00Z',
//     price_per_meal: 25,
//     auto_renewal: true,
//     preferred_delivery_time: '13:30:00',
//     plans: {
//       title: 'Premium Fitness Plan',
//       title_arabic: 'بريميوم فيتنس بلان',
//       kcal: 450,
//       carb: 45,
//       protein: 35,
//       fat: 12
//     }
//   },
//   orders: [
//     {
//       id: 'order-1',
//       status: 'confirmed',
//       scheduled_delivery_date: '2023-10-28T00:00:00Z',
//       order_meals: [
//         {
//           name: 'Grilled Chicken with Quinoa',
//           name_arabic: 'دجاج مشوي مع الكينوا'
//         }
//       ],
//       user_addresses: {
//         label: 'Home',
//         address_line1: '123 Main Street, Riyadh'
//       }
//     },
//     {
//       id: 'order-2',
//       status: 'preparing',
//       scheduled_delivery_date: '2023-10-29T00:00:00Z',
//       order_meals: [
//         {
//           name: 'Salmon with Sweet Potato',
//           name_arabic: 'سمك السلمون مع البطاطا الحلوة'
//         }
//       ],
//       user_addresses: {
//         label: 'Office',
//         address_line1: '456 Business District, Riyadh'
//       }
//     }
//   ],
//   nextMeal: {
//     id: 'order-1',
//     status: 'confirmed',
//     scheduled_delivery_date: '2023-10-28T00:00:00Z',
//     order_meals: [
//       {
//         name: 'Grilled Chicken with Quinoa',
//         name_arabic: 'دجاج مشوي مع الكينوا'
//       }
//     ],
//     user_addresses: {
//       label: 'Home',
//       address_line1: '123 Main Street, Riyadh'
//     }
//   }
// };

export const CurrentPlanBrief = () => {
  const { isOpen: showDetails, onToggle: toggleDetails } = useDisclosure()
  const { isOpen: isSettingsModalOpen, onOpen: openSettingsModal, onClose: closeSettingsModal } = useDisclosure()
  const [subscriptionStats, setSubscriptionStats] = useState(null)
  
  const { t } = useTranslation()
  // MOCK DATA FOR TESTING - Comment out actual context usage
  const { currentLanguage } = useI18nContext()
  const { user, currentSubscription, isSubscriptionLoading } = useAuthContext()
  const { orders, nextMeal, isLoading: ordersLoading, nextMealLoading } = useUserSubscriptions()
  
  // Using mock data instead
  // const currentLanguage = mockData.currentLanguage;
  // const user = mockData.user;
  // const currentSubscription = mockData.currentSubscription;
  // const isSubscriptionLoading = false;
  // const orders = mockData.orders;
  // const nextMeal = mockData.nextMeal;
  // const ordersLoading = false;
  // const nextMealLoading = false;
  
  const isArabic = currentLanguage === 'ar'
  
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' })
  const avatarSize = useBreakpointValue({ base: '70px', md: '85px' })

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
      <Flex
      justify="center"
      alignItems="center"
      py={8}
      sx={{
        borderRadius: "xl",
        bg: "white",
        border: "3px solid",
        borderColor: "brand.500",
      }}
      >
      <Spinner size="md" color="brand.500" thickness="3px" />
      <Text ml={3} color="brand.600">{t('loadingPlanDetails')}...</Text>
      </Flex>
    )
  }

  if (!currentSubscription) {
    return (
      <Box 
        p={6} 
        borderRadius="xl" 
        bg="white" 
        boxShadow="md"
        textAlign="center"
        border="1px"
        borderColor="brand.100"
      >
        <Text color="brand.600">{t('notSubscribedToAnyPlan')}.</Text>
      </Box>
    )
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
      default: return 'brand'
    }
  }

  const formatDeliveryTime = (timeString) => {
    if (!timeString) return t('premium.notSet')
    return timeString.slice(0, 5) // Remove seconds if present
  }

  return (
    <Box 
      
      p={{ base: 4, md: 6 }} 
      mb={6}
          sx={{
        borderRadius: "xl",
        bg: "white",
        border: "2px solid",
        borderColor: "brand.500",
      }}
    >
      {/* Header Section */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={4}
        direction={{ base: 'column', sm: 'row' }}
        gap={3}
      >
        <Text 
          fontSize={{ base: 'lg', md: 'xl' }} 
          fontWeight="semibold"
          textAlign={isArabic ? 'right' : 'left'}
          color="brand.600"
        >
          {t('premium.currentlySubscribedToThe')}{' '}
          <Text as="span" fontSize={"sm"} color="teal.700" mb={2} bg={"teal.200"} p={1} borderRadius="md" display="inline-block">
            {isArabic ? plan?.title_arabic : plan?.title}
          </Text>
        </Text>
        <Badge 
          colorScheme={getStatusColor(currentSubscription.status)} 
          size="lg"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          textTransform="capitalize"
        >
          {t(currentSubscription.status)}
        </Badge>
      </Flex>

      {/* Main Content */}
      <Flex 
        direction={{ base: 'column', md: 'row' }}
        alignItems="flex-start" 
        flexWrap={{ base: 'wrap', md: 'nowrap' }} 
        gap={{ base: 4, md: 6 }}
      >
        {/* Plan Avatar */}
        <Flex 
          justify="center" 
          align="center" 
          flexShrink={0}
          mx="auto"
        >
          <CircularPlanAvatar 
            plan={plan}
            size={avatarSize}
          />
        </Flex>

        {/* Plan Details */}
        <Box flex="1" minW="0">
          {/* Nutrition Badges */}
          <Flex mt={2} gap={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
            <Badge colorScheme="brand" variant="solid" fontSize="xs" px={2} py={1} borderRadius="md">
              {t('premium.kcal')}: {plan?.kcal || 0}
            </Badge>
            <Badge colorScheme="teal" variant="solid" fontSize="xs" px={2} py={1} borderRadius="md">
              {t('premium.carbs')}: {plan?.carb || 0}g
            </Badge>
            <Badge colorScheme="warning" variant="solid" fontSize="xs" px={2} py={1} borderRadius="md">
              {t('premium.protein')}: {plan?.protein || 0}g
            </Badge>
            <Badge colorScheme="orasecondarynge" variant="solid" fontSize="xs" px={2} py={1} borderRadius="md">
              {t('premium.fat')}: {plan?.fat || 0}g
            </Badge>
          </Flex>

          {/* Meal Stats */}
          {subscriptionStats && (
            <Flex mt={4} gap={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
              <Badge colorScheme="teal" variant="outline" px={2} py={1} borderRadius="md">
                {t('premium.totalMeals')}: {subscriptionStats.totalMeals}
              </Badge>
              <Badge colorScheme="green" variant="outline" px={2} py={1} borderRadius="md">
                {t('premium.consumed')}: {subscriptionStats.consumedMeals}
              </Badge>
              <Badge colorScheme="orange" variant="outline" px={2} py={1} borderRadius="md">
                {t('premium.remaining')}: {subscriptionStats.remainingMeals}
              </Badge>
            </Flex>
          )}

          {/* Next Meal Info */}
          {nextOrder && (
            <Box 
              mt={4} 
              p={4} 
              bg="secondary.100" 
              borderRadius="lg"
              border="2px"
              borderColor="brand.400"
            >
              <Text fontSize="sm" fontWeight="semibold" color="teal.700" mb={2} bg={"teal.200"} p={1} borderRadius="md" display="inline-block">
                {t('premium.nextScheduledMeal')}
              </Text>
              
              {nextOrder.order_meals?.[0] && (
                <Text fontSize="xs" color="brand.700" mb={2}>
                  {isArabic ? 
                    nextOrder.order_meals[0].name_arabic || nextOrder.order_meals[0].name : 
                    nextOrder.order_meals[0].name
                  }
                </Text>
              )}

              <Flex direction="column" gap={1}>
                {nextOrder.scheduled_delivery_date && (
                  <Flex align="center" fontSize="xs" color="brand.600">
                    <Text fontSize="xs" mx={2}>{t('premium.deliveryDate')}:</Text>
                    {new Date(nextOrder.scheduled_delivery_date).toLocaleDateString(
                      isArabic ? 'ar-EG' : 'en-US'
                    )}
                  </Flex>
                )}

                <Flex align="center" fontSize="xs" color="brand.600">
                  <Text fontSize="xs" mx={2}>{t('premium.preferredTime')}:</Text>
                  {formatDeliveryTime(currentSubscription.preferred_delivery_time)}
                </Flex>

                {nextOrder.user_addresses && (
                  <Flex align="flex-start" fontSize="xs" color="brand.600">
                    <Text fontSize="xs" mx={2} flexShrink={0}>{t('premium.deliveryAddress')}</Text>
                    <Text>
                      {nextOrder.user_addresses.label} - {nextOrder.user_addresses.address_line1}
                    </Text>
                  </Flex>
                )}
              </Flex>

              <Badge 
                mt={3} 
                colorScheme={nextOrder.status === 'confirmed' ? 'brand' : 'orang'}
                size="sm"
                px={2}
                py={1}
                borderRadius="md"
              >
                {t(`admin.order_status.${nextOrder.status}`)}
              </Badge>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Flex 
          direction="column" 
          gap={3} 
          w={{ base: '100%', md: 'auto' }}
          mt={{ base: 2, md: 0 }}
        >
          <Button 
            onClick={toggleDetails} 
            colorScheme="brand" 
            size={buttonSize}
            variant={showDetails ? "solid" : "outline"}
            rightIcon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
            width={{ base: '100%', md: 'auto' }}
          >
            {showDetails ? t('premium.hideDetails') : t('premium.showDetails')}
          </Button>
          
          <Button
            onClick={openSettingsModal}
            colorScheme="brand"
            size={buttonSize}
            width={{ base: '100%', md: 'auto' }}
          >
            {t('premium.managePlan')}
          </Button>
        </Flex>
      </Flex>

      {/* Expandable Details Section */}
      <Collapse in={showDetails} animateOpacity>
        <Box 
          mt={5} 
          p={5} 
          bg="brand.50" 
          borderRadius="lg"
          border="2px"
          borderColor="brand.300"
        >
          <Text fontWeight="semibold" mb={2} fontSize="lg" color="brand.700">
            {t('premium.subscriptionDetails')}
          </Text>

          <Flex 
            direction={{ base: 'column', lg: 'row' }} 
            gap={6}
          >
            {/* Subscription Info */}
            <Box flex="1">
              <DetailItem 
                label={t('premium.planName')}
                value={isArabic ? plan?.title_arabic : plan?.title}
              />
              
              <DetailItem 
                label={t('premium.subscriptionId')}
                value={`${currentSubscription.id.slice(0, 8)}...`}
              />
              
              <DetailItem 
                label={t('premium.startDate')}
                value={new Date(currentSubscription.start_date).toLocaleDateString(
                  isArabic ? 'ar-EG' : 'en-US'
                )}
              />
              
              {currentSubscription.end_date && (
                <DetailItem 
                  label={t('premium.endDate')}
                  value={new Date(currentSubscription.end_date).toLocaleDateString(
                    isArabic ? 'ar-EG' : 'en-US'
                  )}
                />
              )}
              
              <DetailItem 
                label={t('premium.pricePerMeal')}
                value={`${currentSubscription.price_per_meal} ${t('currency.sar')}`}
              />
            </Box>

            {/* Progress and Stats */}
            <Box flex="1">
              {subscriptionStats && (
                <>
                  <Text fontSize="xs"  mb={2} color="brand.700">
                    {t('premium.subscriptionProgress')}
                  </Text>
                  
                  <Box position="relative" mb={3}>
                    <Box 
                      bg="brand.200" 
                      borderRadius="full" 
                      h="10px" 
                      width="100%"
                    >
                      <Box
                        h="10px"
                        width={`${Math.min(100, (subscriptionStats.consumedMeals / subscriptionStats.totalMeals) * 100)}%`}
                        transition="width 0.5s ease"
                        my={3}
                        bg={"brand.600"} 
                        color="brand.50"
                        flexDirection={"inline"}
                      />
                    </Box>
                   <Box flex={1} display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    <Text 
                      fontSize="xs" 
                      color="brand.50"
                      bg={"brand.600"}
                      m={3}
                      p={1}
                      w={"fit-content"}
                      borderRadius="md"
                    >
                      {Math.round((subscriptionStats.consumedMeals / subscriptionStats.totalMeals) * 100)}%
                    </Text>
                    <Text 
                     fontSize="xs" 
                      color="brand.50"
                      bg={"brand.600"}
                      m={3}
                      p={1}
                      w={"fit-content"}
                      borderRadius="md"
                      >
                    {subscriptionStats.consumedMeals} / {subscriptionStats.totalMeals} {t('premium.mealsConsumed')}
                  </Text>
                   </Box>
                  </Box>



                  <DetailItem 
                    label={t('premium.autoRenewal')}
                    value={currentSubscription.auto_renewal ? t('premium.enabled') : t('premium.disabled')}
                    valueColor={currentSubscription.auto_renewal ? "green.600" : "red.600"}
                  />
                </>
              )}

              {orders && orders.length > 0 && (
                <DetailItem 
                  label={t('premium.pendingOrders')}
                  value={orders.filter(order => 
                    ['pending', 'confirmed', 'preparing'].includes(order.status)
                  ).length}
                />
              )}
            </Box>
          </Flex>
        </Box>
      </Collapse>

      <PlanSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
        subscription={currentSubscription}
        orders={orders}
        subscriptionStats={subscriptionStats}
      />
    </Box>
  )
}

// Helper component for detail items
const DetailItem = ({ label, value, valueColor = "brand.600" }) => (
  <Flex 
    justify="space-between" 
    py={1} 
    borderBottom="1px" 
    borderColor="brand.100"
    direction={{ base: 'column', sm: 'row' }}
    gap={1}
  >
    <Text fontSize="xs" color="brand.700">
      {label}
    </Text>
    <Text fontSize="xs" color={valueColor} textAlign={{ base: 'left', sm: 'right' }}>
      {value}
    </Text>
  </Flex>
)

// Icon components (would typically import from react-icons)
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)