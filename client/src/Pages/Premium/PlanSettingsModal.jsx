import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Spacer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Icon,
  Select,
  useToast,
  Spinner,
  SimpleGrid,
  Divider,
  Progress,
  IconButton,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react'
import { 
  CalendarIcon, 
  TimeIcon, 
  RepeatIcon 
} from '@chakra-ui/icons'
import {
  FiPlay,
  FiPause,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiSettings,
  FiTruck,
  FiUser,
  FiPackage,
  FiCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiLock
} from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { supabase } from '../../../supabaseClient'
import { ordersAPI } from '../../API/orderAPI'
import { 
  useOrderItems, 
  useSubscriptionStats, 
  formatDeliveryDate, 
  formatDeliveryTime,
  formatDate,         
  formatTime,           
  getOrderStatusColor as getStatusColor,
  DELIVERY_TIME_OPTIONS 
} from './orderUtils'
import PurchasePortal from './PurchasePortal'

const PlanSettingsModal = ({ isOpen, onClose, subscription, orders = [], subscriptionStats }) => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { user, currentSubscription, refreshSubscription } = useAuthContext()
  const { 
    updateSubscription, 
    activateOrder, 
    pauseSubscription, 
    resumeSubscription,
    subscriptionMeals,
    subscriptionOrders,
    ordersLoading,
    isUpdating,
    isActivatingOrder,
    isPausing,
    isResuming
  } = useUserSubscriptions()

  // State management
  const [loading, setLoading] = useState(false)
  const [deliveryTime, setDeliveryTime] = useState({ hours: '12', minutes: '00' })
  const [selectedAddress, setSelectedAddress] = useState('')
  const [addresses, setAddresses] = useState([])
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [activatingOrderId, setActivatingOrderId] = useState(null)
  
  // Pause confirmation dialog
  const { 
    isOpen: isPauseDialogOpen, 
    onOpen: onPauseDialogOpen, 
    onClose: onPauseDialogClose 
  } = useDisclosure()
  const cancelRef = useState(null)

  const toast = useToast()
  const isArabic = currentLanguage === 'ar'
  const plan = currentSubscription?.plans
  const { renderOrderItems } = useOrderItems()

  // Memoized computed values - consolidated logic
  const { 
    pendingOrders, 
    activeOrders, 
    deliveredOrders, 
    nonDeliveredOrders,
    hasOrdersInProgress,
    canActivatePendingOrders 
  } = useMemo(() => {
    if (!orders || !Array.isArray(orders)) {
      return {
        pendingOrders: [],
        activeOrders: [],
        deliveredOrders: [],
        nonDeliveredOrders: [],
        hasOrdersInProgress: false,
        canActivatePendingOrders: false
      }
    }

    const pending = orders.filter(order => order.status === 'pending')
    const active = orders.filter(order => order.status === 'active')
    const delivered = orders.filter(order => order.status === 'delivered')
    const nonDelivered = orders.filter(order => order.status !== 'delivered')
    
    const ordersInProgress = orders.filter(order => 
      order.status !== 'pending' && 
      order.status !== 'delivered' && 
      order.status !== 'cancelled'
    )
    
    const hasInProgress = ordersInProgress.length > 0
    const canActivate = !hasInProgress

    return {
      pendingOrders: pending,
      activeOrders: active,
      deliveredOrders: delivered,
      nonDeliveredOrders: nonDelivered,
      hasOrdersInProgress: hasInProgress,
      canActivatePendingOrders: canActivate
    }
  }, [orders])

  // Utility functions
  const getNextAvailableDate = useCallback(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }, [])

  const showToast = useCallback((title, description, status = 'success') => {
    toast({
      title: t(title),
      description: t(description),
      status,
      duration: 3000,
      isClosable: true,
    })
  }, [toast, t])

  const handleError = useCallback((error, errorKey = 'premium.unexpectedError') => {
    console.error('❌ PlanSettingsModal Error:', error)
    showToast('premium.error', errorKey, 'error')
  }, [showToast])

  // Data fetching
  const fetchAddresses = useCallback(async () => {
    if (!isOpen) return
    
    setIsLoadingAddresses(true)
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('is_default', { ascending: false })
      
      if (error) throw error
      setAddresses(data || [])
    } catch (error) {
      handleError(error, 'premium.failedToLoadAddresses')
    } finally {
      setIsLoadingAddresses(false)
    }
  }, [isOpen, handleError])

  // Initialize component data
  const initializeComponentData = useCallback(() => {
    if (!subscription) return

    // Set delivery time
    if (subscription.preferred_delivery_time) {
      const [hours, minutes] = subscription.preferred_delivery_time.split(':')
      setDeliveryTime({ hours: hours || '12', minutes: minutes || '00' })
    }

    // Set selected address
    if (addresses.length > 0) {
      if (subscription.delivery_address_id) {
        const address = addresses.find(addr => addr.id === subscription.delivery_address_id)
        if (address) {
          setSelectedAddress(subscription.delivery_address_id)
          return
        }
      }
      
      // Fallback to default or first address
      const defaultAddress = addresses.find(addr => addr.is_default)
      setSelectedAddress(defaultAddress ? defaultAddress.id : addresses[0].id)
    }
  }, [subscription, addresses])

  // Effects
  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  useEffect(() => {
    initializeComponentData()
  }, [initializeComponentData])

  // Event handlers
  const handlePlanStatusToggle = useCallback(async () => {
    if (!subscription) return

    if (subscription.status === 'active') {
      onPauseDialogOpen()
      return
    }

    await handleResumeSubscription()
  }, [subscription, onPauseDialogOpen])

  const handlePauseConfirmation = useCallback(async () => {
    if (!subscription) return

    onPauseDialogClose()
    setLoading(true)
    
    try {
      await pauseSubscription({ 
        subscriptionId: subscription.id, 
        pauseReason: 'User requested pause' 
      })
      
      await refreshSubscription()
      showToast('premium.success', 'premium.planPausedSuccessfully')
    } catch (error) {
      handleError(error, 'premium.failedToUpdatePlanStatus')
    } finally {
      setLoading(false)
    }
  }, [subscription, onPauseDialogClose, pauseSubscription, refreshSubscription, showToast, handleError])

  const handleResumeSubscription = useCallback(async () => {
    if (!subscription) return

    setLoading(true)
    try {
      await resumeSubscription({ subscriptionId: subscription.id })
      await refreshSubscription()
      showToast('premium.success', 'premium.planResumedSuccessfully')
    } catch (error) {
      handleError(error, 'premium.failedToUpdatePlanStatus')
    } finally {
      setLoading(false)
    }
  }, [subscription, resumeSubscription, refreshSubscription, showToast, handleError])

  const handleDeliverySettingsUpdate = useCallback(async () => {
    if (!currentSubscription) return

    setLoading(true)
    try {
      const deliveryTimeString = `${deliveryTime.hours}:${deliveryTime.minutes}:00`

      await updateSubscription({
        subscriptionId: currentSubscription.id,
        subscriptionData: {
          preferred_delivery_time: deliveryTimeString,
          delivery_address_id: selectedAddress,
        }
      })

      await refreshSubscription()
      showToast('premium.success', 'premium.deliverySettingsUpdated')
    } catch (error) {
      handleError(error, 'premium.failedToUpdateDeliverySettings')
    } finally {
      setLoading(false)
    }
  }, [currentSubscription, deliveryTime, selectedAddress, updateSubscription, refreshSubscription, showToast, handleError])

  const handleActivateOrderFromList = useCallback(async (orderId) => {
    if (!canActivatePendingOrders) {
      showToast('premium.error', 'premium.cannotActivateWhileOrderInProgress', 'error')
      return
    }

    const defaultDate = getNextAvailableDate()
    
    setActivatingOrderId(orderId)
    
    try {
      const deliveryDateTime = new Date(defaultDate)
      deliveryDateTime.setHours(
        parseInt(deliveryTime.hours),
        parseInt(deliveryTime.minutes),
        0
      )

      await activateOrder({
        orderId: orderId,
        deliveryTime: `${deliveryTime.hours}:${deliveryTime.minutes}`,
        deliveryDate: deliveryDateTime.toISOString()
      })

      await refreshSubscription()
      showToast('premium.success', 'premium.mealActivatedSuccessfully')
    } catch (error) {
      handleError(error, 'premium.failedToActivateMeal')
    } finally {
      setActivatingOrderId(null)
    }
  }, [canActivatePendingOrders, getNextAvailableDate, deliveryTime, activateOrder, refreshSubscription, showToast, handleError])


// Handle meal confirmation from PurchasePortal
const handleMealConfirmed = useCallback(async (selectedMeal, mealIndex) => {
    console.log('🎯 Meal confirmed in PlanSettingsModal');
    
    try {
      setLoading(true);

      // Calculate totals
      const calculateMealTotals = (mealGroup) => {
        if (!Array.isArray(mealGroup)) return { calories: 0, protein: 0, carbs: 0, fats: 0, weight: 0 };
        return mealGroup.reduce((totals, item) => ({
          calories: totals.calories + (item.calories || 0),
          protein: totals.protein + (item.protein_g || item.protein || 0),
          carbs: totals.carbs + (item.carbs_g || item.carbs || 0),
          fats: totals.fats + (item.fat_g || item.fats || 0),
          weight: totals.weight + (item.weight || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0, weight: 0 });
      };

      const mealTotals = calculateMealTotals(selectedMeal);
      
      // Get next order number
      const { data: existingOrders } = await supabase
        .from('orders')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1);
      
      const nextOrderNumber = (existingOrders?.[0]?.order_number || 0) + 1;
      
      // Calculate pricing (simplified - can be enhanced)
      const subtotal = mealTotals.calories * 0.01; // Example pricing
      const taxAmount = subtotal * 0.15;
      const deliveryFee = 5.00;
      const totalAmount = subtotal + taxAmount + deliveryFee;

      // Prepare order data
      const orderData = {
        user_id: user?.id,
        subscription_id: subscription?.id,
        order_number: nextOrderNumber,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        discount_amount: 0,
        delivery_fee: parseFloat(deliveryFee.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        status: "pending",
        payment_status: "pending",
        delivery_address_id: selectedAddress || null,
        contact_phone: user?.phone || null,
        loyalty_points_earned: Math.floor(totalAmount),
        subscription_meal_index: mealIndex,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Map selected items to proper format
      const selectedItemsForOrder = selectedMeal.map(item => ({
        item_id: item.id,
        meal_id: item.meal_id, // If items are grouped by meal
        quantity: 1,
        unit_price: item.price || 0,
        name: item.name,
        name_arabic: item.name_arabic,
        category: item.category
      }));

      // Use the orderAPI helper to create order with plan meals
      
      const completeOrder = ordersAPI.createOrderFromPlan(
        orderData,
        subscription?.plan_id,
        selectedItemsForOrder
      );

      console.log('📦 Complete order created:', completeOrder);

      await refreshSubscription();
      showToast('premium.success', 'premium.mealPurchasedSuccessfully');
      
    } catch (error) {
      console.error('❌ Error:', error);
      handleError(error, 'premium.failedToPurchaseMeal');
    } finally {
      setLoading(false);
    }
}, [user, subscription, selectedAddress, deliveryTime, refreshSubscription, showToast, handleError]);
  // Component renderers
  const renderOrderCard = useCallback((order, showActivateButton = false) => (
    <Box
      key={order.id}
      p={4}
      border="1px solid"
      borderColor={order.status === 'active' ? 'green.200' : 
                   order.status === 'delivered' ? 'gray.200' : 'gray.200'}
      borderRadius="md"
      bg={order.status === 'delivered' ? 'gray.50' : 
          order.status === 'active' ? 'green.100' : 'white'}
      opacity={(!canActivatePendingOrders && order.status === 'pending') ? 0.6 : 1}
    >
      
      <HStack justify="space-between" align="start">
        <VStack align="start" spacing={2} flex={1}>
          <HStack wrap="wrap">
            <Text fontWeight="medium">#{order.order_number}</Text>
            <Badge colorScheme={getOrderStatusColor(order.status)} size="sm">
              {t(`admin.order_status.${order.status}`)}
            </Badge>
            {order.status === 'pending' && !hasOrdersInProgress && (
              <Badge colorScheme="yellow" size="sm">
                {t('premium.readyToActivate')}
              </Badge>
            )}
            {order.status === 'pending' && hasOrdersInProgress && (
              <Badge colorScheme="red" size="sm">
                <HStack spacing={1}>
                  <Icon as={FiLock} size="10px" />
                  <Text>{t('premium.locked')}</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
          
          {renderOrderItems(order, isArabic, true)}
          
          <HStack spacing={4} fontSize="sm" color="gray.600">
            {order.scheduled_delivery_date && (
              <HStack>
                <Icon as={FiClock} size="14px" />
                <Text>
                  {formatDeliveryDate(order.scheduled_delivery_date, isArabic)}
                </Text>
              </HStack>
            )}
            {order.created_at && (
              <HStack>
                <Icon as={FiCalendar} size="14px" />
                <Text>
                  {t('premium.created')}: {formatDeliveryDate(order.created_at, isArabic)}
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>

        {showActivateButton && order.status === 'pending' && (
          <Tooltip 
            label={
              canActivatePendingOrders 
                ? t('premium.activateThisOrder') 
                : t('premium.cannotActivateWhileOrderInProgress')
            } 
            hasArrow
          >
            <IconButton
              icon={canActivatePendingOrders ? <Icon as={FiCheckCircle} /> : <Icon as={FiLock} />}
              colorScheme={canActivatePendingOrders ? "green" : "gray"}
              size="sm"
              variant="outline"
              onClick={() => handleActivateOrderFromList(order.id)}
              isDisabled={!canActivatePendingOrders}
              isLoading={activatingOrderId === order.id}
              loadingText={t('premium.activating')}
              aria-label={t('premium.activateOrder')}
            />
          </Tooltip>
        )}
      </HStack>
    </Box>
  ), [canActivatePendingOrders, hasOrdersInProgress, renderOrderItems, handleActivateOrderFromList, activatingOrderId, t, isArabic])

  const renderCurrentPlanOverview = () => (
    <Card>
      <CardHeader>
        <HStack>
          <Icon as={FiUser} color="brand.500" />
          <Text fontWeight="bold">{t('premium.currentPlan')}</Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text>{t('premium.planName')}:</Text>
              <Text fontWeight="medium">
                {isArabic ? plan?.title_arabic || plan?.title : plan?.title}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text>{t('premium.planStatus')}:</Text>
              <Badge colorScheme={subscription.status === 'active' ? 'green' : 'orange'}>
                {t(subscription.status)}
              </Badge>
            </HStack>
          </VStack>

          <VStack align="stretch" spacing={3}>
            {subscriptionStats && (
              <>
                <HStack justify="space-between">
                  <Text>{t('premium.totalMeals')}:</Text>
                  <Badge colorScheme="blue">{subscriptionStats.totalMeals}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>{t('premium.consumedMeals')}:</Text>
                  <Badge colorScheme="green">{subscriptionStats.consumedMeals}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>{t('premium.remainingMeals')}:</Text>
                  <Badge colorScheme="orange">{subscriptionStats.remainingMeals}</Badge>
                </HStack>
                <Box>
                  <Text fontSize="sm" mb={2}>{t('premium.progress')}:</Text>
                  <Progress
                    value={(subscriptionStats.consumedMeals / subscriptionStats.totalMeals) * 100}
                    colorScheme="brand"
                    size="md"
                    borderRadius="md"
                  />
                </Box>
              </>
            )}
          </VStack>
        </SimpleGrid>
      </CardBody>
    </Card>
  )

  const renderPlanControl = () => (
    <Card>
      <CardHeader>
        <HStack>
          <Icon as={subscription.status === 'active' ? FiPause : FiPlay} color="brand.500" />
          <Text fontWeight="bold">{t('premium.planControl')}</Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <FormControl>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <FormLabel mb={0}>
                {subscription.status === 'active' 
                  ? t('premium.pausePlan') 
                  : t('premium.resumePlan')
                }
              </FormLabel>
              <Text fontSize="sm" color="gray.500">
                {subscription.status === 'active'
                  ? t('premium.temporarilyStopMealDeliveries')
                  : t('premium.resumeMealDeliveries')
                }
              </Text>
            </VStack>
            <Switch
              isChecked={subscription.status === 'active'}
              onChange={handlePlanStatusToggle}
              isDisabled={loading || isPausing || isResuming}
              colorScheme="brand"
              size="lg"
            />
          </HStack>
        </FormControl>

        {subscription.status === 'paused' && (
          <Alert status="warning" mt={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>{t('premium.planCurrentlyPaused')}</AlertTitle>
              <AlertDescription>
                {t('premium.pausedSince')}: {new Date(subscription.updated_at).toLocaleDateString()}
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </CardBody>
    </Card>
  )

  const renderDeliverySettings = () => (
    <Card>
      <CardHeader>
        <HStack>
          <Icon as={FiTruck} color="brand.500" />
          <Text fontWeight="bold">{t('premium.deliverySettings')}</Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <FormControl>
            <FormLabel>{t('premium.defaultDeliveryAddress')}</FormLabel>
            {isLoadingAddresses ? (
              <Spinner size="sm" />
            ) : (
              <Select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                placeholder={t('premium.selectAddress')}
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.address_line1}, {address.city}
                  </option>
                ))}
              </Select>
            )}
            {addresses.length === 0 && !isLoadingAddresses && (
              <Text fontSize="sm" color="gray.500" mt={1}>
                {t('premium.noAddressesAvailable')}
              </Text>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>{t('premium.defaultDeliveryTime')}</FormLabel>
            <Select
              value={`${deliveryTime.hours}:${deliveryTime.minutes}`}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':')
                setDeliveryTime({ hours, minutes })
              }}
            >
              {DELIVERY_TIME_OPTIONS.map(({ hour, minute, value }) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={handleDeliverySettingsUpdate}
            isLoading={loading || isUpdating}
            loadingText={t('premium.updating')}
            colorScheme="brand"
            size="sm"
          >
            {t('premium.updateDeliverySettings')}
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
const renderOrdersList = () => {
  // Order status swim lane configuration
  const swimLaneStages = [
    { status: 'pending', label: 'premium.pending', icon: FiClock, color: 'yellow' },
    { status: 'active', label: 'premium.active', icon: FiCheckCircle, color: 'blue' },
    { status: 'confirmed', label: 'premium.confirmed', icon: FiCheck, color: 'purple' },
    { status: 'preparing', label: 'premium.preparing', icon: FiPackage, color: 'teal' },
    { status: 'out_for_delivery', label: 'premium.outForDelivery', icon: FiTruck, color: 'orange' },
    { status: 'delivered', label: 'premium.delivered', icon: FiCheckCircle, color: 'green' },
  ]

  const getOrdersByStatus = (status) => {
    return subscriptionOrders?.filter(order => order.status === status) || []
  }

  const deliveredOrders = getOrdersByStatus('delivered')
  const displayedDeliveredOrders = deliveredOrders.slice(0, 3)
  const hasMoreDelivered = deliveredOrders.length > 3

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <HStack>
            <Icon as={FiCalendar} color="brand.500" />
            <Text fontWeight="bold">{t('premium.orderTracking')}</Text>
          </HStack>
          {subscriptionOrders?.length > 0 && (
            <Badge colorScheme="blue">
              {subscriptionOrders.length} {t('premium.total')}
            </Badge>
          )}
        </HStack>
      </CardHeader>
      <CardBody>
        {ordersLoading ? (
          <HStack justify="center" py={8}>
            <Spinner />
            <Text>{t('premium.loadingOrders')}</Text>
          </HStack>
        ) : subscriptionOrders?.length > 0 ? (
          <VStack align="stretch" spacing={6}>
            {/* Swim Lane Visualization */}
            <Box>
              <Text fontSize="sm" color="gray.600" mb={4}>
                {t('premium.orderJourney')}
              </Text>
              <Box 
                overflowX="auto" 
                pb={4}
                css={{
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '10px',
                  },
                }}
              >
                <HStack spacing={0} align="stretch" minW="max-content">
                  {swimLaneStages.map((stage, index) => {
                    const ordersInStage = stage.status === 'delivered' 
                      ? displayedDeliveredOrders 
                      : getOrdersByStatus(stage.status)
                    const totalInStage = stage.status === 'delivered' 
                      ? deliveredOrders.length 
                      : ordersInStage.length

                    return (
                      <Box key={stage.status} position="relative">
                        {/* Connector Line */}
                        {index < swimLaneStages.length - 1 && (
                          <Box
                            position="absolute"
                            top="28px"
                            right="-16px"
                            w="32px"
                            h="2px"
                            bg="gray.300"
                            zIndex={0}
                          />
                        )}
                        
                        {/* Stage Column */}
                        <VStack
                          w="200px"
                          p={3}
                          bg={ordersInStage.length > 0 ? `${stage.color}.50` : 'gray.50'}
                          borderRight="3px dashed"
                          borderY="none"
                          borderLeft="none"
                          borderColor={ordersInStage.length > 0 ? `${stage.color}.200` : 'gray.200'}
                          align="stretch"
                          spacing={3}
                          minH="300px"
                          position="relative"
                        >
                          {/* Stage Header */}
                          <VStack spacing={1}>
                            <Icon 
                              as={stage.icon} 
                              boxSize={6} 
                              color={ordersInStage.length > 0 ? `${stage.color}.500` : 'gray.400'}
                            />
                            <Text 
                              fontSize="sm" 
                              fontWeight="bold"
                              textAlign="center"
                              color={ordersInStage.length > 0 ? `${stage.color}.700` : 'gray.600'}
                            >
                              {t(stage.label)}
                            </Text>
                            <Badge 
                              colorScheme={ordersInStage.length > 0 ? stage.color : 'gray'}
                              fontSize="xs"
                            >
                              {totalInStage}
                            </Badge>
                          </VStack>

                          {/* Orders in Stage */}
                          <VStack 
                            align="stretch" 
                            spacing={2} 
                            flex={1}
                            overflowY="auto"
                            maxH="200px"
                            css={{
                              '&::-webkit-scrollbar': {
                                width: '4px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: 'transparent',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: '#cbd5e0',
                                borderRadius: '2px',
                              },
                            }}
                          >
                            {ordersInStage?.length > 0 ? (
                              ordersInStage.map((order) => (
                                <Card 
                                  key={order.id} 
                                  size="sm" 
                                  variant="outline" 
                                  bg="white"
                                  _hover={{ shadow: 'md', borderColor: `${stage.color}.400` }}
                                  transition="all 0.2s"
                                >
                                  <CardBody p={2}>
                                    <VStack align="stretch" spacing={1}>
                                      <HStack justify="space-between">
                                        <Text fontSize="xs" fontWeight="bold">
                                          #{order.order_number}
                                        </Text>
                                        {stage.status === 'pending' && (
                                          <Tooltip 
                                            label={
                                              canActivatePendingOrders 
                                                ? t('premium.activateThisOrder') 
                                                : t('premium.cannotActivateWhileOrderInProgress')
                                            } 
                                            hasArrow
                                          >
                                            <IconButton
                                              icon={canActivatePendingOrders ? <Icon as={FiCheckCircle} /> : <Icon as={FiLock} />}
                                              colorScheme={canActivatePendingOrders ? "green" : "gray"}
                                              size="xs"
                                              variant="ghost"
                                              onClick={() => handleActivateOrderFromList(order.id)}
                                              isDisabled={!canActivatePendingOrders}
                                              isLoading={activatingOrderId === order.id}
                                              aria-label={t('premium.activateOrder')}
                                            />
                                          </Tooltip>
                                        )}
                                      </HStack>
                                      
                                      {order.scheduled_delivery_date && (
                                        <HStack spacing={1}>
                                          <Icon as={FiClock} boxSize={2} color="gray.500" />
                                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                            {formatDeliveryDate(order.scheduled_delivery_date, isArabic)}
                                          </Text>
                                        </HStack>
                                      )}
                                      
                                      {renderOrderItems(order, isArabic, false)}
                                    </VStack>
                                  </CardBody>
                                </Card>
                              ))
                            ) : (
                              <Text fontSize="xs" color="gray.400" textAlign="center" py={4}>
                                {t('premium.noOrdersInStage')}
                              </Text>
                            )}
                            
                            {/* More Delivered Orders Indicator */}
                            {stage.status === 'delivered' && hasMoreDelivered && (
                              <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="gray"
                                onClick={() => {
                                  // Future: Navigate to user profile or expand view
                                  showToast('premium.info', 'premium.viewMoreInProfile', 'info')
                                }}
                              >
                                +{deliveredOrders.length - 3} {t('premium.more')}
                              </Button>
                            )}
                          </VStack>
                        </VStack>
                      </Box>
                    )
                  })}
                </HStack>
              </Box>
            </Box>

            {/* Cancelled Orders Section (if any) */}
            {getOrdersByStatus('cancelled').length > 0 && (
              <Box>
                <Divider mb={4} />
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
                  {t('premium.cancelledOrders')}
                </Text>
                <VStack align="stretch" spacing={2}>
                  {getOrdersByStatus('cancelled').map(order => (
                    <Box
                      key={order.id}
                      p={3}
                      bg="red.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="red.200"
                    >
                      <HStack justify="space-between">
                        <HStack>
                          <Text fontSize="sm" fontWeight="medium">#{order.order_number}</Text>
                          <Badge colorScheme="red" fontSize="xs">
                            {t('premium.cancelled')}
                          </Badge>
                        </HStack>
                        {order.created_at && (
                          <Text fontSize="xs" color="gray.600">
                            {formatDeliveryDate(order.created_at, isArabic)}
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        ) : (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>{t('premium.noOrders')}</AlertTitle>
              <AlertDescription>
                {t('premium.noOrdersMessage')}
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </CardBody>
    </Card>
  )
}
  const renderSubscriptionInfo = () => (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <Text fontWeight="medium">{t('premium.subscriptionDuration')}</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <HStack justify="space-between">
              <Text>{t('premium.startDate')}:</Text>
              <Text>{new Date(subscription.start_date).toLocaleDateString()}</Text>
            </HStack>
            {subscription.end_date && (
              <HStack justify="space-between">
                <Text>{t('premium.endDate')}:</Text>
                <Text>{new Date(subscription.end_date).toLocaleDateString()}</Text>
              </HStack>
            )}
            <HStack justify="space-between">
              <Text>{t('premium.autoRenewal')}:</Text>
              <Badge colorScheme={subscription.auto_renewal ? 'green' : 'gray'}>
                {subscription.auto_renewal ? t('premium.enabled') : t('premium.disabled')}
              </Badge>
            </HStack>
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>
  )

  const renderPauseConfirmationDialog = () => (
    <AlertDialog
      isOpen={isPauseDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={onPauseDialogClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <HStack>
              <Icon as={FiAlertTriangle} color="orange.500" />
              <Text>{t('premium.pausePlan')}</Text>
            </HStack>
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack align="start" spacing={3}>
              <Text>{t('premium.pausePlanConfirmationMessage')}</Text>
              <Alert status="warning" size="sm">
                <AlertIcon />
                <Text fontSize="sm">{t('premium.pausePlanWarning')}</Text>
              </Alert>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onPauseDialogClose}>
              {t('premium.cancel')}
            </Button>
            <Button 
              colorScheme="orange" 
              onClick={handlePauseConfirmation} 
              ml={3}
              isLoading={loading || isPausing}
              loadingText={t('premium.pausing')}
            >
              {t('premium.confirmPause')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )

  // Main render
  if (!subscription) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('premium.planSettings')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>{t('premium.noActivePlan')}</AlertTitle>
              <AlertDescription>{t('premium.pleaseSubscribeToAPlanFirst')}</AlertDescription>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="95%" maxH="90vh" overflowY="auto">
          <ModalHeader>
            <HStack>
              <Icon as={FiSettings} />
              <Text>{t('premium.planSettings')}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {renderCurrentPlanOverview()}
              
              {/* Enhanced PurchasePortal Integration */}
              {subscriptionOrders.filter((x)=>['pending','active', 'confirmed', 'preparing', 'out_for_delivery'].includes(x.status)).length> 0 ?
              <>
              <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>{t('premium.notAllowedToOrder')}</AlertTitle>
                  <AlertDescription>
                    {t('premium.notAllowedToOrderMessage')}
                  </AlertDescription>
                </Alert>
              </> 
              :
              <PurchasePortal
                subscriptionMeals={subscriptionMeals}
                onMealConfirmed={handleMealConfirmed}
                defaultOpen={false}
              />}
              
              {renderPlanControl()}
              {renderDeliverySettings()}
              {renderOrdersList()}
              {renderSubscriptionInfo()}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {renderPauseConfirmationDialog()}
    </>
  )
}

export default PlanSettingsModal