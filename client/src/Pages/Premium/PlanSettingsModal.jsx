import { useState, useEffect } from 'react'
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
  Tooltip
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
  FiCheckCircle
} from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { userAPI } from '../../API/userAPI'
import { supabase } from '../../../supabaseClient'

const PlanSettingsModal = ({ isOpen, onClose, subscription, orders, subscriptionStats }) => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { user, currentSubscription, refreshSubscription } = useAuthContext()
  const { 
    updateSubscription, 
    updateOrder, 
    activateOrder, 
    pauseSubscription, 
    resumeSubscription,
    isUpdating,
    isActivatingOrder,
    isPausing,
    isResuming
  } = useUserSubscriptions()

  const [loading, setLoading] = useState(false)
  const [deliveryTime, setDeliveryTime] = useState({ hours: '12', minutes: '00' })
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState('')
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [activatingOrderId, setActivatingOrderId] = useState(null);
  const toast = useToast()

  const isArabic = currentLanguage === 'ar'
  const plan = currentSubscription?.plans

  // Debug: Log all consumed data
  useEffect(() => {
    console.group('📊 PlanSettingsModal - Data Debug');
    console.log('🔴 Modal Props:', {
      isOpen,
      subscription,
      orders,
      subscriptionStats
    });
    console.log('🟡 Auth Context:', {
      user,
      currentSubscription,
      isArabic,
      currentLanguage
    });
    console.log('🟢 Component State:', {
      loading,
      deliveryTime,
      selectedAddress,
      selectedOrderId,
      selectedDeliveryDate,
      addresses: addresses.length,
      isLoadingAddresses,
      activatingOrderId
    });
    console.log('🔵 Hook States:', {
      isUpdating,
      isActivatingOrder,
      isPausing,
      isResuming
    });
    console.log('🟣 Computed Values:', {
      plan: plan?.title,
      pendingOrders: orders?.filter(order => order.status === 'pending')?.length || 0,
      activeOrders: orders?.filter(order => order.status === 'active')?.length || 0,
      totalOrders: orders?.length || 0
    });
    console.groupEnd();
  }, [isOpen, subscription, orders, subscriptionStats, user, currentSubscription, 
      loading, deliveryTime, selectedAddress, selectedOrderId, selectedDeliveryDate, 
      addresses, isLoadingAddresses, activatingOrderId, isUpdating, isActivatingOrder, 
      isPausing, isResuming, plan, isArabic, currentLanguage]);

  const getNextAvailableDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0];
    console.log('📅 Next available date:', dateString);
    return dateString;
  }

  const getOrderStatusColor = (status) => {
    const colorMap = {
      'pending': 'blue',
      'confirmed': 'green', 
      'preparing': 'orange',
      'out_for_delivery': 'purple',
      'delivered': 'gray',
      'cancelled': 'red',
      'active': 'green'
    };
    console.log(`🎨 Order status color for "${status}":`, colorMap[status] || 'gray');
    return colorMap[status] || 'gray';
  }

  // Helper to display order items from order_items table
  const renderOrderItems = (order) => {
    console.log('📦 Rendering order items for order:', order.id, order.order_items);
    
    if (!order.order_items || order.order_items.length === 0) {
      return <Text fontSize="sm" color="gray.500">{t('premium.noItems')}</Text>;
    }

    return (
      <VStack align="start" spacing={1} mt={2}>
        {order.order_items.map((item, index) => {
          console.log(`📋 Order item ${index}:`, item);
          return (
            <HStack key={index} spacing={2}>
              <Text fontSize="sm">• {isArabic ? item.name_arabic || item.name : item.name}</Text>
              {item.quantity > 1 && (
                <Badge fontSize="xs" colorScheme="gray">
                  x{item.quantity}
                </Badge>
              )}
              {item.category && (
                <Badge fontSize="xs" colorScheme="blue" variant="subtle">
                  {item.category}
                </Badge>
              )}
            </HStack>
          );
        })}
      </VStack>
    );
  };

  // Fetch addresses from the addresses table (not user_addresses)
  useEffect(() => {
    const fetchAddresses = async () => {
      console.log('🏠 Fetching addresses...');
      setIsLoadingAddresses(true);
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .order('is_default', { ascending: false });
        
        if (error) throw error;
        console.log('🏠 Addresses fetched:', data);
        setAddresses(data || []);
      } catch (error) {
        console.error('❌ Error fetching addresses:', error);
        toast({
          title: t('premium.error'),
          description: t('premium.failedToLoadAddresses'),
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  // Initialize state from subscription data
  useEffect(() => {
    console.log('🔄 Initializing state from subscription:', subscription);
    
    if (subscription) {
      // Parse delivery time if exists
      if (subscription.preferred_delivery_time) {
        const [hours, minutes] = subscription.preferred_delivery_time.split(':')
        const newDeliveryTime = { hours: hours || '12', minutes: minutes || '00' };
        console.log('⏰ Setting delivery time:', newDeliveryTime);
        setDeliveryTime(newDeliveryTime);
      }

      // Set selected address - using external_id for compatibility
      if (subscription.delivery_address_id && addresses.length > 0) {
        const address = addresses.find(addr => addr.id === subscription.delivery_address_id)
        if (address) {
          console.log('📍 Setting selected address from subscription:', address);
          setSelectedAddress(subscription.delivery_address_id)
        }
      } else if (addresses.length > 0) {
        // Select default address if available, otherwise first address
        const defaultAddress = addresses.find(addr => addr.is_default);
        const selectedAddr = defaultAddress ? defaultAddress.id : addresses[0].id;
        console.log('📍 Setting default/first address:', selectedAddr);
        setSelectedAddress(selectedAddr);
      }
    }
  }, [subscription, addresses])

  // Get available orders for activation
  const pendingOrders = orders?.filter(order => order.status === 'pending') || []
  const activeOrders = orders?.filter(order => order.status === 'active') || []
  
  console.log('📋 Order filtering results:', {
    totalOrders: orders?.length || 0,
    pendingOrders: pendingOrders.length,
    activeOrders: activeOrders.length
  });

  const handlePlanStatusToggle = async () => {
    if (!subscription) return

    console.log('🔄 Toggling plan status. Current status:', subscription.status);
    setLoading(true)
    try {
      const newStatus = subscription.status === 'active' ? 'paused' : 'active'
      console.log('🔄 New status will be:', newStatus);

      if (newStatus === 'paused') {
        await pauseSubscription({ 
          subscriptionId: subscription.id, 
          pauseReason: 'User requested pause' 
        })
      } else {
        await resumeSubscription({ subscriptionId: subscription.id })
      }

      // Refresh the subscription data
      refreshSubscription()

      console.log('✅ Plan status toggle successful');
      toast({
        title: t('premium.success'),
        description: newStatus === 'paused' 
          ? t('premium.planPausedSuccessfully')
          : t('premium.planResumedSuccessfully'),
        status: 'success',
        duration: 3000,
        isClosable: false,
      })
    } catch (error) {
      console.error('❌ Error updating plan status:', error)
      toast({
        title: t('premium.error'),
        description: t('premium.failedToUpdatePlanStatus'),
        status: 'error',
        duration: 3000,
        isClosable: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeliverySettingsUpdate = async () => {
    if (!subscription) return

    console.log('🚚 Updating delivery settings:', {
      deliveryTime,
      selectedAddress,
      subscriptionId: subscription.id
    });

    setLoading(true)
    try {
      const deliveryTimeString = `${deliveryTime.hours}:${deliveryTime.minutes}:00`

      await updateSubscription({
        subscriptionId: subscription.id,
        subscriptionData: {
          preferred_delivery_time: deliveryTimeString,
          delivery_address_id: selectedAddress,
        }
      })

      // Update delivery settings for pending orders
      await userAPI.updateDeliverySettings(subscription.id, {
        preferred_delivery_time: deliveryTimeString,
        delivery_address_id: selectedAddress,
        updatePendingOrders: true
      })

      // Refresh the subscription data
      refreshSubscription()

      console.log('✅ Delivery settings updated successfully');
      toast({
        title: t('premium.success'),
        description: t('premium.deliverySettingsUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: false,
      })
    } catch (error) {
      console.error('❌ Error updating delivery settings:', error)
      toast({
        title: t('premium.error'),
        description: t('premium.failedToUpdateDeliverySettings'),
        status: 'error',
        duration: 3000,
        isClosable: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleActivateNextMeal = async () => {
    if (!selectedOrderId || !selectedDeliveryDate) {
      console.warn('⚠️ Missing order or delivery date selection');
      toast({
        title: t('premium.error'),
        description: t('premium.pleaseSelectOrderAndDate'),
        status: 'error',
        duration: 3000,
      })
      return
    }

    console.log('🍽️ Activating meal:', {
      selectedOrderId,
      selectedDeliveryDate,
      deliveryTime
    });

    try {
      const deliveryDateTime = new Date(selectedDeliveryDate)
      deliveryDateTime.setHours(
        parseInt(deliveryTime.hours),
        parseInt(deliveryTime.minutes),
        0
      )

      console.log('📅 Computed delivery date time:', deliveryDateTime.toISOString());

      await activateOrder({
        orderId: selectedOrderId,
        deliveryTime: `${deliveryTime.hours}:${deliveryTime.minutes}`,
        deliveryDate: deliveryDateTime.toISOString()
      })

      // Refresh the subscription data
      refreshSubscription()

      console.log('✅ Meal activated successfully');
      toast({
        title: t('premium.success'),
        description: t('premium.mealActivatedSuccessfully'),
        status: 'success',
        duration: 3000,
      })

      // Reset selections
      setSelectedOrderId('')
      setSelectedDeliveryDate('')
    } catch (error) {
      console.error('❌ Error activating meal:', error)
      toast({
        title: t('premium.error'),
        description: t('premium.failedToActivateMeal'),
        status: 'error',
        duration: 3000,
      })
    }
  }

  // New function to activate order directly from Orders Overview
  const handleActivateOrderFromList = async (orderId) => {
    console.log('🎯 Activating order directly from list:', orderId);
    
    // Set default delivery date to tomorrow
    const defaultDate = getNextAvailableDate();
    
    setActivatingOrderId(orderId);
    
    try {
      const deliveryDateTime = new Date(defaultDate);
      deliveryDateTime.setHours(
        parseInt(deliveryTime.hours),
        parseInt(deliveryTime.minutes),
        0
      );

      console.log('📅 Activating with delivery date:', deliveryDateTime.toISOString());

      await activateOrder({
        orderId: orderId,
        deliveryTime: `${deliveryTime.hours}:${deliveryTime.minutes}`,
        deliveryDate: deliveryDateTime.toISOString()
      });

      // Refresh the subscription data
      refreshSubscription();

      console.log('✅ Order activated successfully from list');
      toast({
        title: t('premium.success'),
        description: t('premium.mealActivatedSuccessfully'),
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Error activating order from list:', error);
      toast({
        title: t('premium.error'),
        description: t('premium.failedToActivateMeal'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setActivatingOrderId(null);
    }
  };

  if (!subscription) {
    console.log('⚠️ No subscription found, showing info alert');
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
            {/* Current Plan Overview */}
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

            {/* Plan Control */}
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

            {/* Next Meal Activation - Keep existing functionality */}
            {pendingOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={FiPackage} color="brand.500" />
                    <Text fontWeight="bold">{t('premium.activateNextMeal')}</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        {t('premium.selectMealToActivate')}
                      </AlertDescription>
                    </Alert>

                    <FormControl>
                      <FormLabel>{t('premium.selectMeal')}</FormLabel>
                      <Select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        placeholder={t('premium.chooseMeal')}
                      >
                        {pendingOrders.map((order) => (
                          <option key={order.id} value={order.id}>
                            {order.order_meals?.[0] ? (
                              isArabic 
                                ? order.order_meals[0].name_arabic || order.order_meals[0].name
                                : order.order_meals[0].name
                            ) : `${t('premium.meal')} #${order.order_number}`}
                            {order.order_items && order.order_items.length > 0 && 
                              ` (${order.order_items.length} items)`
                            }
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>{t('premium.deliveryDate')}</FormLabel>
                        <input
                          type="date"
                          value={selectedDeliveryDate}
                          onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                          min={getNextAvailableDate()}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '2px solid #E2E8F0'
                          }}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>{t('premium.deliveryTime')}</FormLabel>
                        <Select
                          value={`${deliveryTime.hours}:${deliveryTime.minutes}`}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':')
                            setDeliveryTime({ hours, minutes })
                          }}
                        >
                          {['11', '12', '13', '14', '15', '16', '17', '18'].flatMap((hour) =>
                            ['00', '30'].map((minute) => (
                              <option key={`${hour}-${minute}`} value={`${hour}:${minute}`}>
                                {`${hour}:${minute}`}
                              </option>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </SimpleGrid>

                    <Button
                      onClick={handleActivateNextMeal}
                      isLoading={isActivatingOrder}
                      loadingText={t('premium.activating')}
                      colorScheme="brand"
                      leftIcon={<Icon as={FiCheck} />}
                      isDisabled={!selectedOrderId || !selectedDeliveryDate}
                    >
                      {t('premium.activateMeal')}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Delivery Settings */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiTruck} color="brand.500" />
                  <Text fontWeight="bold">{t('premium.deliverySettings')}</Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {/* Delivery Address */}
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

                  {/* Default Delivery Time */}
                  <FormControl>
                    <FormLabel>{t('premium.defaultDeliveryTime')}</FormLabel>
                    <Select
                      value={`${deliveryTime.hours}:${deliveryTime.minutes}`}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        setDeliveryTime({ hours, minutes })
                      }}
                    >
                      {['11', '12', '13', '14', '15', '16', '17', '18'].flatMap((hour) =>
                        ['00', '30'].map((minute) => (
                          <option key={`${hour}-${minute}`} value={`${hour}:${minute}`}>
                            {`${hour}:${minute}`}
                          </option>
                        ))
                      )}
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

            {/* Enhanced Orders Overview with Activation Buttons */}
            {orders && orders.length > 0 && (
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={FiCalendar} color="brand.500" />
                    <Text fontWeight="bold">{t('premium.ordersList')}</Text>
                    <Badge colorScheme="blue" ml={2}>
                      {orders.length} {t('premium.total')}
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
                    {orders.map((order) => (
                      <Box
                        key={order.id}
                        p={4}
                        border="1px solid"
                        borderColor={order.status === 'active' ? 'green.200' : 'gray.200'}
                        borderRadius="md"
                        bg={order.status === 'delivered' ? 'green.50' : 
                            order.status === 'active' ? 'green.100' : 'white'}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack wrap="wrap">
                              <Text fontWeight="medium">#{order.order_number}</Text>
                              <Badge colorScheme={getOrderStatusColor(order.status)} size="sm">
                                {t(`orderStatus.${order.status}`)}
                              </Badge>
                              {order.status === 'pending' && (
                                <Badge colorScheme="yellow" size="sm">
                                  {t('premium.readyToActivate')}
                                </Badge>
                              )}
                            </HStack>
                            
                            {/* Show order items */}
                            {renderOrderItems(order)}
                            
                            <HStack spacing={4} fontSize="sm" color="gray.600">
                              {order.scheduled_delivery_date && (
                                <HStack>
                                  <Icon as={FiClock} size="14px" />
                                  <Text>
                                    {new Date(order.scheduled_delivery_date).toLocaleDateString(
                                      isArabic ? 'ar-EG' : 'en-US'
                                    )}
                                  </Text>
                                </HStack>
                              )}
                              {order.created_at && (
                                <HStack>
                                  <Icon as={FiCalendar} size="14px" />
                                  <Text>
                                    {t('premium.created')}: {new Date(order.created_at).toLocaleDateString(
                                      isArabic ? 'ar-EG' : 'en-US'
                                    )}
                                  </Text>
                                </HStack>
                              )}
                            </HStack>
                          </VStack>

                          {/* Activation Button for Pending Orders */}
                          {order.status === 'pending' && (
                            <Tooltip label={t('premium.activateThisOrder')} hasArrow>
                              <IconButton
                                icon={<Icon as={FiCheckCircle} />}
                                colorScheme="green"
                                size="sm"
                                variant="outline"
                                onClick={() => handleActivateOrderFromList(order.id)}
                                isLoading={activatingOrderId === order.id}
                                loadingText={t('premium.activating')}
                                aria-label={t('premium.activateOrder')}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Subscription Duration Info */}
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
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PlanSettingsModal