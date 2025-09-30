import { useState, useEffect, useMemo, useCallback } from 'react'
import {
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
  Card,
  CardBody,
  CardHeader,
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
import { 
  useOrderItems, 
  useSubscriptionStats, 
  formatDeliveryDate, 
  formatDeliveryTime,
  getOrderStatusColor,
  DELIVERY_TIME_OPTIONS 
} from './orderUtils'

const PlanSettingsModal = ({ isOpen, onClose, subscription, orders = [], subscriptionStats }) => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { user, currentSubscription, refreshSubscription } = useAuthContext()
  const { 
    updateSubscription, 
    activateOrder, 
    pauseSubscription, 
    resumeSubscription,
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

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 PlanSettingsModal Data Debug:', {
        subscription: subscription,
        ordersCount: orders?.length,
        subscriptionStats: subscriptionStats,
        addressesCount: addresses?.length
      });
    }
  }, [isOpen, subscription, orders, subscriptionStats, addresses]);

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

    console.log('📊 Orders Analysis:', {
      totalOrders: orders.length,
      ordersByStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {})
    });

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
      console.log('📍 Fetched addresses:', data)
    } catch (error) {
      handleError(error, 'premium.failedToLoadAddresses')
    } finally {
      setIsLoadingAddresses(false)
    }
  }, [isOpen, handleError])

  // Initialize component data
  const initializeComponentData = useCallback(() => {
    if (!subscription) return

    console.log('⚙️ Initializing component data:', {
      subscriptionDeliveryTime: subscription.preferred_delivery_time,
      deliveryAddressId: subscription.delivery_address_id,
      addressesCount: addresses.length
    });

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
      console.log('⏸️ Pausing subscription:', subscription.id);
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
  }, [subscription, onPauseDialogClose, pauseSubscription, showToast, handleError])

  const handleResumeSubscription = useCallback(async () => {
    if (!subscription) return

    setLoading(true)
    try {
      console.log('▶️ Resuming subscription:', subscription.id);
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
      console.log('🔄 Updating delivery settings:', {
        subscriptionId: currentSubscription.id,
        deliveryTime: deliveryTimeString,
        selectedAddress: selectedAddress
      });

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
      handleError(error, 'premium.failedToUpdateDeliverySettings');
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

      console.log('🎯 Activating order:', {
        orderId,
        deliveryTime: `${deliveryTime.hours}:${deliveryTime.minutes}`,
        deliveryDate: deliveryDateTime.toISOString()
      });

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

  const renderOrdersList = () => (
    <Card>
      <CardHeader>
        <HStack>
          <Icon as={FiCalendar} color="brand.500" />
          <Text fontWeight="bold">{t('premium.orders')}</Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <Tabs>
          <TabList>
            <Tab>
              <HStack>
                <Text>{t('premium.activeOrders')}</Text>
                {nonDeliveredOrders.length > 0 && (
                  <Badge colorScheme="blue" ml={1}>
                    {nonDeliveredOrders.length}
                  </Badge>
                )}
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <Text>{t('premium.deliveredOrders')}</Text>
                {deliveredOrders.length > 0 && (
                  <Badge colorScheme="gray" ml={1}>
                    {deliveredOrders.length}
                  </Badge>
                )}
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {hasOrdersInProgress && (
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{t('premium.orderInProgress')}</AlertTitle>
                    <AlertDescription>
                      {t('premium.orderInProgressMessage')}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              {nonDeliveredOrders.length > 0 ? (
                <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
                  {nonDeliveredOrders.map((order) => renderOrderCard(order, true))}
                </VStack>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>{t('premium.noActiveOrders')}</AlertTitle>
                  <AlertDescription>
                    {t('premium.noActiveOrdersMessage')}
                  </AlertDescription>
                </Alert>
              )}
            </TabPanel>

            <TabPanel px={0}>
              {deliveredOrders.length > 0 ? (
                <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
                  {deliveredOrders.map((order) => renderOrderCard(order, false))}
                </VStack>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  <AlertTitle>{t('premium.noDeliveredOrders')}</AlertTitle>
                  <AlertDescription>
                    {t('premium.noDeliveredOrdersMessage')}
                  </AlertDescription>
                </Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  )

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