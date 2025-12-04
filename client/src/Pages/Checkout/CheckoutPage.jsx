import React, { useReducer, useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react'
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Stack,
  useColorMode,
  useToast,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useBreakpointValue,
  Divider,
  Badge,
  HStack,
  Radio,
  RadioGroup,
  Spinner,
} from '@chakra-ui/react'
import saladIcon from '../../assets/menu/salad.svg'
import paymentIcon from '../../assets/payment.svg'
import orderIcon from '../../assets/order.svg'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useUserProfile } from '../../Hooks/userHooks'
import { useGetAddresses } from '../../Hooks/useRestaurantAddress'
import { useOrders } from '../../Hooks/useOrders'
import { useCart } from '../../Contexts/CartContext'

// Safe lazy loading function
const safeLazy = (importFn, componentName) => {
  return React.lazy(() =>
    importFn()
      .then(module => ({ default: module.default }))
      .catch(error => {
        console.error(`Failed to load ${componentName}:`, error);
        return { 
          default: () => (
            <Box textAlign="center" p={4}>
              <Text color="red.500">Failed to load {componentName}</Text>
              <Button 
                onClick={() => window.location.reload()}
                colorScheme="blue"
                mt={2}
              >
                Retry
              </Button>
            </Box>
          )
        };
      })
  );
}

// Lazy load components
const MapModal = safeLazy(() => import('./MapModal.jsx'), 'MapModal');
const AddressList = safeLazy(() => import('./AddressesList.jsx'), 'AddressList');

const initialState = {
  isSubmitting: false,
  paymentMethod: 'cash-on-delivery',
  deliveryOption: 'pickup',
  selectedPickupAddress: null,
  orderInfo: {
    fullName: '',
    phoneNumber: '',
    email: '',
    notes: '',
    deliveryAddress: '',
    city: '',
  },
  orderSummary: {
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
  },
}

function checkoutReducer(state, action) {
  switch (action.type) {
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload }
    case 'SET_DELIVERY_OPTION':
      return { ...state, deliveryOption: action.payload }
    case 'SET_PICKUP_ADDRESS':
      return { ...state, selectedPickupAddress: action.payload }
    case 'SET_ORDER_INFO':
      return {
        ...state,
        orderInfo: { ...state.orderInfo, ...action.payload },
      }
    case 'SET_ORDER_SUMMARY':
      return {
        ...state,
        orderSummary: { ...state.orderSummary, ...action.payload },
      }
    case 'INITIALIZE_USER_DATA':
      return {
        ...state,
        orderInfo: { ...state.orderInfo, ...action.payload },
      }
    case 'START_SUBMISSION':
      return { ...state, isSubmitting: true }
    case 'END_SUBMISSION':
      return { ...state, isSubmitting: false }
    default:
      return state
  }
}

const Section = ({ title, children, bgColor, titleColor, icon }) => {
  const { colorMode } = useColorMode()
  const padding = useBreakpointValue({ base: 4, md: 6 })

  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.700' : `${bgColor}.200`}
      borderRadius="45px"
      borderWidth="3px"
      borderColor="brand.700"
      p={padding}
      position="relative"
      overflow="hidden"
      height="100%"
      minHeight="500px"
    >
      <Box position="relative" zIndex="1">
        <Flex align="center" mb={4}>
          {icon && (
            <Box
              as="img"
              src={icon}
              alt={`${title} icon`}
              boxSize="48px"
              p={1}
              mx={4}
              bg={'whiteAlpha.900'}
              borderRadius="50%"
            />
          )}
          <Heading size="md" color={titleColor || 'gray.800'}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  )
}

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, orderData, isSubmitting, t }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('confirmOrder') || 'Confirm Your Order'}</ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>
                {t('contactInformation') || 'Contact Information'}
              </Text>
              <Text fontSize="sm">
                <strong>{t('fullName') || 'Name'}:</strong> {orderData.orderInfo.fullName}
              </Text>
              <Text fontSize="sm">
                <strong>{t('phoneNumber') || 'Phone'}:</strong> {orderData.orderInfo.phoneNumber}
              </Text>
              {orderData.orderInfo.email && (
                <Text fontSize="sm">
                  <strong>{t('email') || 'Email'}:</strong> {orderData.orderInfo.email}
                </Text>
              )}
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                {t('pickupLocation') || 'Pickup Location'}
              </Text>
              <Text fontSize="sm">
                {orderData.selectedPickupAddress?.display_name || orderData.selectedPickupAddress?.label || orderData.orderInfo.deliveryAddress}
              </Text>
              {orderData.selectedPickupAddress?.address_line1 && (
                <Text fontSize="sm" color="gray.600">
                  {orderData.selectedPickupAddress.address_line1}
                </Text>
              )}
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                {t('paymentMethod') || 'Payment Method'}
              </Text>
              <Text fontSize="sm">
                Cash on Pickup
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                {t('orderSummary') || 'Order Summary'}
              </Text>
              <Flex justify="space-between">
                <Text fontSize="sm">{t('subtotal') || 'Subtotal'}:</Text>
                <Text fontSize="sm">${orderData.orderSummary.subtotal.toFixed(2)}</Text>
              </Flex>
              <Divider my={2} />
              <Flex justify="space-between" fontWeight="bold">
                <Text>{t('total') || 'Total'}:</Text>
                <Text>${orderData.orderSummary.total.toFixed(2)}</Text>
              </Flex>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t('cancel') || 'Cancel'}
          </Button>
          <Button
            colorScheme="brand"
            onClick={onConfirm}
            isLoading={isSubmitting}
            loadingText={t('processing') || 'Processing...'}
          >
            {t('confirmOrder') || 'Confirm Order'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Simple Address List Component (fallback)
const SimpleAddressList = ({ addresses, selectedAddress, onSelectAddress, isLoading }) => {
  if (isLoading) {
    return <Spinner size="sm" />;
  }

  if (!addresses || addresses.length === 0) {
    return (
      <Alert status="warning" size="sm">
        <AlertIcon />
        No restaurant locations available
      </Alert>
    );
  }

  return (
    <RadioGroup
      value={selectedAddress?.id ? String(selectedAddress.id) : ''}
      onChange={(value) => {
        const address = addresses.find(addr => String(addr.id) === value);
        if (address) onSelectAddress(address);
      }}
    >
      <Stack spacing={3}>
        {addresses.map((address) => (
          <Box
            key={String(address.id)}
            p={3}
            borderWidth="2px"
            borderRadius="md"
            borderColor={
              selectedAddress?.id === address.id
                ? 'brand.500'
                : 'gray.200'
            }
            bg={
              selectedAddress?.id === address.id
                ? 'brand.50'
                : 'transparent'
            }
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: 'brand.400' }}
          >
            <Radio value={String(address.id)} colorScheme="brand">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="sm">{address.label}</Text>
                  {address.is_default && (
                    <Badge colorScheme="green" fontSize="xs">Default</Badge>
                  )}
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  {address.address_line1}
                </Text>
                {address.address_line2 && (
                  <Text fontSize="xs" color="gray.500">
                    {address.address_line2}
                  </Text>
                )}
                {address.city && (
                  <Text fontSize="xs" color="gray.500">
                    {address.city}
                  </Text>
                )}
              </VStack>
            </Radio>
          </Box>
        ))}
      </Stack>
    </RadioGroup>
  );
};

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { user } = useAuthContext()
  const { cart, clearCart } = useCart()
  const toast = useToast()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()

  const { data: userProfile, isLoading: profileLoading } = useUserProfile()
  
  // FIX: Pass 'restaurant' as external_id to the hook directly
  const { 
    addresses, 
    defaultAddress, 
    isLoading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses
  } = useGetAddresses() // Pass the external_id here
  
  const { createOrder,createInstantOrder } = useOrders()
  const [state, dispatch] = useReducer(checkoutReducer, initialState)
  const { isSubmitting, paymentMethod, deliveryOption, selectedPickupAddress, orderInfo, orderSummary } = state
  
  const {
    isOpen: isConfirmationOpen,
    onOpen: onOpenConfirmation,
    onClose: onCloseConfirmation,
  } = useDisclosure()

  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()

  const inputProps = useMemo(() => ({
    variant: "ghost",
    bg: colorMode === 'dark' ? 'gray.800' : 'brand.100',
    focusBorderColor: "brand.500",
    maxW: '85%'
  }), [colorMode])

  // FIX: Remove manual fetchAddresses call since the hook handles it automatically
  // Log addresses for debugging
  useEffect(() => {
    if (addresses) {
      //console.log('📍 Available restaurant addresses:', addresses);
      
      // Auto-select default address if none selected and addresses are loaded
      if (!selectedPickupAddress && addresses.length > 0) {
        const defaultAddr = addresses.find(addr => addr.is_default) || addresses[0];
        if (defaultAddr) {
          //console.log('🔄 Auto-selecting default address:', defaultAddr);
          handleSelectPickupAddress(defaultAddr);
        }
      }
    }
    if (addressesError) {
      console.error('❌ Address fetch error:', addressesError);
    }
  }, [addresses, addressesError])

  // Initialize user data if authenticated
  useEffect(() => {
    if (userProfile && addresses && addresses.length > 0 && !profileLoading) {
      const defaultAddr = addresses.find(addr => addr.is_default) || addresses[0];
      
      dispatch({
        type: 'INITIALIZE_USER_DATA',
        payload: {
          email: user?.email || '',
          phoneNumber: userProfile.phone_number || '',
          fullName: userProfile.display_name || userProfile.full_name || 'anon',
          deliveryAddress: defaultAddr ? 
            `${defaultAddr.address_line1}${defaultAddr.address_line2 ? ', ' + defaultAddr.address_line2 : ''}, ${defaultAddr.city}` : '',
          city: defaultAddr?.city || '',
        },
      });

      // Set default pickup address if not already set
      if (defaultAddr && !selectedPickupAddress) {
        dispatch({ type: 'SET_PICKUP_ADDRESS', payload: defaultAddr });
      }
    }
  }, [userProfile, addresses, profileLoading, user?.email, selectedPickupAddress])

  // Update order summary from cart
  useEffect(() => {
    if (cart?.orderMetadata) {
      dispatch({
        type: 'SET_ORDER_SUMMARY',
        payload: {
          subtotal: cart.orderMetadata.subtotal || 0,
          deliveryFee: 0,
          discount: 0,
          total: cart.orderMetadata.total_amount || cart.orderMetadata.subtotal || 0,
        }
      })
      
      // Sync special instructions from cart metadata
      if (cart.orderMetadata.client_instructions) {
        dispatch({
          type: 'SET_ORDER_INFO',
          payload: { notes: cart.orderMetadata.client_instructions }
        })
      }
    }
  }, [cart])

  const handleOrderInfoChange = useCallback((field, value) => {
    dispatch({
      type: 'SET_ORDER_INFO',
      payload: { [field]: value },
    })
  }, [])

  const handleSelectPickupAddress = useCallback((address) => {
    dispatch({ type: 'SET_PICKUP_ADDRESS', payload: address });
    
    // Also update the delivery address in orderInfo
    const formattedAddress = `${address.address_line1}${address.address_line2 ? ', ' + address.address_line2 : ''}, ${address.city}`;
    handleOrderInfoChange('deliveryAddress', formattedAddress);
    handleOrderInfoChange('city', address.city);
    
    toast({
      title: 'Location Selected',
      description: `Selected: ${address.label}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [handleOrderInfoChange, toast])

  const handleOpenConfirmation = useCallback(() => {
  // Validate required fields
  if (!orderInfo.fullName || orderInfo.fullName.trim().length < 3) {
    toast({
      title: t('nameRequired') || 'Name Required',
      description: t('pleaseEnterName') || 'Please enter your full name',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    })
    return
  }

  // Validate phone number (Saudi format) - REQUIRED for all orders
  const phoneRegex = /^(\+966|00966|966)?5\d{8}$/
  const cleanPhone = orderInfo.phoneNumber.replace(/\s+/g, '')
  
  if (!orderInfo.phoneNumber || !phoneRegex.test(cleanPhone)) {
    toast({
      title: t('invalidPhone') || 'Phone Number Required',
      description: t('saudiPhoneRequired') || 'Please enter a valid Saudi phone number starting with +966 5 (required for order confirmation)',
      status: 'warning',
      duration: 4000,
      isClosable: true,
    })
    return
  }

  // Validate pickup address is selected
  if (!selectedPickupAddress) {
    toast({
      title: t('pickupLocationRequired') || 'Pickup Location Required',
      description: t('pleaseSelectPickupLocation') || 'Please select a pickup location',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    })
    return
  }

  // Validate cart has items
  if (!cart?.meals || cart.meals.length === 0) {
    toast({
      title: t('emptyCart') || 'Empty Cart',
      description: t('addItemsToCart') || 'Please add items to your cart before checkout',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    })
    return
  }

  onOpenConfirmation()
}, [orderInfo, selectedPickupAddress, cart, toast, t, onOpenConfirmation])

  // Replace the handleConfirmOrder function in CheckoutPage.jsx

const handleConfirmOrder = async () => {
  dispatch({ type: 'START_SUBMISSION' });
  onCloseConfirmation();
  try {
    if (!orderInfo.phoneNumber) {
      throw new Error('Contact number information is required');
    }

    if (!selectedPickupAddress) {
      throw new Error('Pickup location is required');
    }

    if (!cart?.meals || cart.meals.length === 0) {
      throw new Error('Cart is empty');
    }

    // Prepare order_meals with all required fields
    const orderMeals = cart.meals.map(meal => ({
      meal_id: meal.meal_id,
      quantity: meal.quantity || 1,
      unit_price: parseFloat(meal.unit_price || meal.base_price || 0),
      total_price: parseFloat(meal.total_price || (meal.unit_price * meal.quantity) || 0),
      name: meal.name || '',
      name_arabic: meal.name_arabic || null,
      description: meal.description || null,
      calories: meal.calories || 0,
      protein_g: meal.protein_g || 0,
      carbs_g: meal.carbs_g || 0,
      fat_g: meal.fat_g || 0,
      customization_notes: meal.customization_notes || null,
    }));

    // Prepare order_items if any (additives/sides)
    const orderItems = cart.meals.flatMap(meal => 
      (meal.selectedItems || []).map(item => ({
        item_id: item.item_id || item.id,
        meal_id: meal.meal_id, // Link to parent meal
        quantity: item.quantity || 1,
        unit_price: parseFloat(item.unit_price || item.price || 0),
        total_price: parseFloat(item.total_price || (item.unit_price * item.quantity) || 0),
        name: item.name || '',
        name_arabic: item.name_arabic || null,
        category: item.category || null,
      }))
    );

    // Calculate totals
    const subtotal = parseFloat(orderSummary.subtotal || 0);
    const deliveryFee = parseFloat(orderSummary.deliveryFee || 0);
    const discount = parseFloat(orderSummary.discount || 0);
    const taxAmount = parseFloat(orderSummary.tax_amount || 0);
    const total = subtotal + deliveryFee + taxAmount - discount;

    // Prepare order data - DO NOT include order_number
    const orderData = {
      // User info (null for guest orders)
      user_id: user?.id || null,
      subscription_id: null,
      
      // Items and meals
      order_meals: orderMeals,
      order_items: orderItems,
      
      // Pricing
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discount,
      tax_amount: taxAmount,
      total_amount: total,
      
      // Order status
      status: 'pending',
      payment_status: 'pending',
      payment_method: paymentMethod === 'cash-on-delivery' ? 'cash' : paymentMethod,
      
      // REQUIRED: Contact phone
      contact_phone: orderInfo.phoneNumber,
      
      // Delivery/Pickup information
      delivery_address_id: selectedPickupAddress.id,
      delivery_instructions: orderInfo.notes || null,
      special_instructions: orderInfo.notes || null,
      
      // Optional fields
      coupon_code: null,
      loyalty_points_used: 0,
      loyalty_points_earned: 0,
      scheduled_delivery_date: null,
      subscription_meal_index: null,
    };

    console.log('📦 Creating order with data:', JSON.stringify(orderData));
    
    // Call the createInstantOrder API
    const createdOrder = await createInstantOrder(orderData);
    
    console.log('✅ Order created successfully:', {
      id: createdOrder.id,
      order_number: createdOrder.order_number
    });

    // Clear cart after successful order
    clearCart();

    toast({
      title: t('orderPlacedSuccessfully') || 'Order Placed Successfully',
      description: `Order #${createdOrder.order_number} is ready for pickup`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });

    // Navigate to menu or order confirmation
    navigate('/menu');

  } catch (error) {
    console.error('❌ Error placing order:', error);
    dispatch({ type: 'END_SUBMISSION' });

    toast({
      title: t('orderFailed') || 'Order Failed',
      description: error.message || 'Failed to place order. Please try again.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }
};
  const gridColumns = useBreakpointValue({ base: 1, md: 3 })

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
      minHeight="100vh"
    >
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.500">
          {t('checkout') || 'Checkout'}
        </Heading>

        <SimpleGrid columns={gridColumns} spacing={6}>
          {/* Contact Information Section */}
          <Section
            title={t('contactInformation') || 'Contact Information'}
            bgColor="brand"
            titleColor="gray.800"
            icon={saladIcon}
          >
            <Stack spacing={3}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('fullName') || 'Full Name'}</FormLabel>
                <Input
                  placeholder={t('enterYourFullName') || 'Enter your full name'}
                  value={orderInfo.fullName}
                  onChange={(e) => handleOrderInfoChange('fullName', e.target.value)}
                  {...inputProps}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">
                  {t('phoneNumber') || 'Phone Number'} 
                  <Badge ml={2} colorScheme="green">Saudi</Badge>
                </FormLabel>
                <Input
                  placeholder="+966 5XX XXX XXX"
                  value={orderInfo.phoneNumber}
                  onChange={(e) => handleOrderInfoChange('phoneNumber', e.target.value)}
                  {...inputProps}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Required: Saudi mobile number starting with +966 5
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">
                  {t('emailAddress') || 'Email Address'} 
                  <Badge ml={2} colorScheme="gray">Optional</Badge>
                </FormLabel>
                <Input
                  type="email"
                  placeholder={t('yourEmailAddress') || 'your@email.com'}
                  value={orderInfo.email}
                  onChange={(e) => handleOrderInfoChange('email', e.target.value)}
                  {...inputProps}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">
                  {t('specialInstructions') || 'Special Instructions'}
                </FormLabel>
                <Input
                  placeholder={t('anySpecialRequests') || 'Any special requests?'}
                  value={orderInfo.notes}
                  onChange={(e) => handleOrderInfoChange('notes', e.target.value)}
                  {...inputProps}
                />
              </FormControl>
            </Stack>
          </Section>

          {/* Pickup Location Section */}
          <Section 
            title={t('pickupLocation') || 'Pickup Location'} 
            bgColor="warning" 
            icon={paymentIcon}
          >
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md" size="sm">
                <AlertIcon />
                <Text fontSize="sm">
                  {t('pickupOnly') || 'Pickup only. Delivery coming soon!'}
                </Text>
              </Alert>

              {addressesLoading ? (
                <VStack spacing={2}>
                  <Spinner size="sm" color="brand.500" />
                  <Text fontSize="sm" color="gray.500">Loading locations...</Text>
                </VStack>
              ) : addressesError ? (
                <Alert status="error" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">Error loading locations: {addressesError}</Text>
                  <Button 
                    size="xs" 
                    mt={2} 
                    onClick={refetchAddresses}
                    colorScheme="brand"
                  >
                    Retry
                  </Button>
                </Alert>
              ) : addresses && addresses.length > 0 ? (
                <>
                  <SimpleAddressList
                    addresses={addresses}
                    selectedAddress={selectedPickupAddress}
                    onSelectAddress={handleSelectPickupAddress}
                    isLoading={addressesLoading}
                  />
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    colorScheme="brand" 
                    onClick={onOpenMap}
                  >
                    📍 {t('viewOnMap') || 'View on Map'}
                  </Button>

                  {selectedPickupAddress && (
                    <Alert status="success" size="sm" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="medium">Selected:</Text>
                        <Text fontSize="xs">{selectedPickupAddress.label}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {selectedPickupAddress.address_line1}
                        </Text>
                      </Box>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Text fontSize="sm">No restaurant locations available. Please contact support.</Text>
                </Alert>
              )}
            </VStack>
          </Section>

          {/* Order Summary Section */}
          <Section 
            title={t('orderSummary') || 'Order Summary'} 
            bgColor="accent" 
            icon={orderIcon}
          >
            <VStack spacing={4} align="stretch">
              {/* Cart Items List */}
              <Box maxH="250px" overflowY="auto" pr={2}>
                {cart?.meals?.length > 0 ? (
                  cart.meals.map((meal, index) => (
                    <Box key={meal.temp_meal_id || index} mb={3} pb={2} borderBottomWidth="1px">
                      <Flex justify="space-between" align="start">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {meal.quantity}x {meal.name}
                          </Text>
                          {meal.selectedItems && meal.selectedItems.length > 0 && (
                            <VStack align="start" pl={4} mt={1} spacing={0}>
                              {meal.selectedItems.map((item, idx) => (
                                <Text key={idx} fontSize="xs" color="gray.600">
                                  + {item.quantity}x {item.name}
                                </Text>
                              ))}
                            </VStack>
                          )}
                        </VStack>
                        <Text fontSize="sm" fontWeight="bold" ml={2}>
                          ${meal.total_price.toFixed(2)}
                        </Text>
                      </Flex>
                    </Box>
                  ))
                ) : (
                  <Alert status="warning" size="sm">
                    <AlertIcon />
                    Cart is empty
                  </Alert>
                )}
              </Box>

              <Divider />

              {/* Price Summary */}
              <Stack spacing={2}>
                <Flex justify="space-between">
                  <Text fontSize="sm">{t('subtotal') || 'Subtotal'}:</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    ${orderSummary.subtotal.toFixed(2)}
                  </Text>
                </Flex>

                <Divider />

                <Flex justify="space-between">
                  <Text fontWeight="bold" fontSize="lg">
                    {t('total') || 'Total'}:
                  </Text>
                  <Text fontWeight="bold" fontSize="lg" color="brand.600">
                    ${orderSummary.total.toFixed(2)}
                  </Text>
                </Flex>
              </Stack>

              <Alert status="info" fontSize="sm" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Cash on Pickup</Text>
                  <Text fontSize="xs">Pay when you collect your order</Text>
                </VStack>
              </Alert>

              <Button
                colorScheme="brand"
                size="lg"
                width="full"
                onClick={handleOpenConfirmation}
                isLoading={isSubmitting}
                loadingText={t('processing') || 'Processing...'}
                isDisabled={cart?.meals?.length === 0 || isSubmitting || !selectedPickupAddress}
              > 
                {t('placeOrder') || 'Place Order'}
              </Button>
            </VStack>
          </Section>
        </SimpleGrid>
      </VStack>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={onCloseConfirmation}
        onConfirm={handleConfirmOrder}
        orderData={state}
        isSubmitting={isSubmitting}
        t={t}
      />

      {/* Map Modal for Pickup Locations */}
      <Suspense fallback={
        <Box textAlign="center" p={4}>
          <Spinner size="md" color="brand.500" />
          <Text fontSize="sm" color="gray.500" mt={2}>Loading map...</Text>
        </Box>
      }>
        <MapModal
          isOpen={isMapOpen}
          onClose={onCloseMap}
          addresses={addresses}
          selectedAddress={selectedPickupAddress}
          onSelectAddress={handleSelectPickupAddress}
          loading={addressesLoading}
          error={addressesError}
        />
      </Suspense>
    </Box>
  )
}