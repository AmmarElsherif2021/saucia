import { useState, useReducer, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Checkbox,
  Stack,
  Select,
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
} from '@chakra-ui/react'
import { ALT, TXT, BTN } from '../../Components/ComponentsTrial'
import saladIcon from '../../assets/menu/salad.svg'
import paymentIcon from '../../assets/payment.svg'
import orderIcon from '../../assets/order.svg'
import MapModal from './MapModal'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../Contexts/UserContext'
import { updateUserProfile } from '../../API/users'
import { createOrder } from '../../API/orders'

// Checkout state
const initialState = {
  isSubmitting: false,
  paymentMethod: '',
  orderInfo: {
    fullName: '',
    email: '',
    phoneNumber: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    saveAddress: false,
    saveCard: false,
  },
  paymentInfo: {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  },
  orderSummary: {
    subtotal: 45.99,
    deliveryFee: 5.0,
    promoDiscount: 10.0,
    total: 40.99,
  },
}

// Reducer function to manage checkout state
function checkoutReducer(state, action) {
  switch (action.type) {
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload }
    case 'SET_ORDER_INFO':
      return {
        ...state,
        orderInfo: { ...state.orderInfo, ...action.payload },
      }
    case 'SET_PAYMENT_INFO':
      return {
        ...state,
        paymentInfo: { ...state.paymentInfo, ...action.payload },
      }
    case 'SET_ORDER_SUMMARY':
      return {
        ...state,
        orderSummary: { ...state.orderSummary, ...action.payload },
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
          {icon 
            && 
          <Box 
            as="img" 
            src={icon} 
            alt={`${title} icon`} 
            boxSize="48px" 
            p={1} 
            mx={4} 
            bg={"whiteAlpha.900"} 
            borderRadius="50%"
            />}
          <Heading size="md" color={titleColor || 'gray.800'}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  )
}

// Payment Method Input Components
const PaymentMethodInputs = ({ paymentMethod, paymentInfo, onPaymentInfoChange, t, colorMode }) => {
  switch (paymentMethod) {
    case 'credit-card':
      return (
        <Stack spacing={3} maxW={'90%'}>
          <FormControl>
            <FormLabel fontSize="sm">{t('checkout.cardNumber')}</FormLabel>
            <Input
              placeholder={t('checkout.cardNumberPlaceholder') || '1234 5678 9012 3456'}
              variant="ghost"
              maxLength={19}
              value={paymentInfo.cardNumber}
              onChange={(e) => onPaymentInfoChange('cardNumber', e.target.value)}
              bg={colorMode === 'dark' ? 'gray.800' : 'warning.100'}
            />
          </FormControl>

          <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl>
              <FormLabel fontSize="sm">{t('checkout.expiryDate')}</FormLabel>
              <Input
                placeholder={t('checkout.expiryDatePlaceholder') || 'MM/YY'}
                variant="ghost"
                maxLength={5}
                value={paymentInfo.expiryDate}
                onChange={(e) => onPaymentInfoChange('expiryDate', e.target.value)}
                bg={colorMode === 'dark' ? 'gray.800' : 'warning.100'}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">CVV</FormLabel>
              <Input
                placeholder="123"
                variant="ghost"
                maxLength={3}
                type="password"
                value={paymentInfo.cvv}
                onChange={(e) => onPaymentInfoChange('cvv', e.target.value)}
                bg={colorMode === 'dark' ? 'gray.800' : 'warning.100'}
              />
            </FormControl>
          </Flex>

          <FormControl>
            <FormLabel fontSize="sm">{t('checkout.nameOnCard')}</FormLabel>
            <Input
              placeholder={t('checkout.cardholderNamePlaceholder') || 'John Doe'}
              variant="ghost"
              value={paymentInfo.nameOnCard}
              onChange={(e) => onPaymentInfoChange('nameOnCard', e.target.value)}
              bg={colorMode === 'dark' ? 'gray.800' : 'warning.100'}
            />
          </FormControl>

          <Checkbox colorScheme="brand" mt={2}>
            {t('checkout.saveThisCardForFuturePayments')}
          </Checkbox>
        </Stack>
      )

    case 'paypal':
      return (
        <VStack spacing={4} align="stretch" maxW={'90%'}>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            {t('checkout.paypalRedirectMessage') ||
              'You will be redirected to PayPal to complete your payment'}
          </Alert>
          <Button colorScheme="brand" leftIcon={<Text>PayPal</Text>} width="full">
            {t('checkout.continueWithPayPal') || 'Continue with PayPal'}
          </Button>
        </VStack>
      )

    case 'cash-on-delivery':
      return (
        <VStack spacing={4} align="stretch" maxW={'90%'}>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            {t('checkout.cashOnDeliveryMessage') ||
              'You will pay in cash when your order is delivered'}
          </Alert>
          <Text fontSize="sm" color="gray.600">
            {t('checkout.cashOnDeliveryNote') || 'Please have exact change ready for delivery'}
          </Text>
        </VStack>
      )

    default:
      return null
  }
}

// Order Confirmation Modal
const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, orderData, isSubmitting, t }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('checkout.confirmOrder') || 'Confirm Your Order'}</ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>
                {t('checkout.deliveryInformation')}
              </Text>
              <Text fontSize="sm">
                <strong>{t('checkout.fullName')}:</strong> {orderData.orderInfo.fullName}
              </Text>
              <Text fontSize="sm">
                <strong>{t('checkout.phoneNumber')}:</strong> {orderData.orderInfo.phoneNumber}
              </Text>
              <Text fontSize="sm">
                <strong>{t('checkout.deliveryAddress')}:</strong>{' '}
                {orderData.orderInfo.deliveryAddress}
              </Text>
              <Text fontSize="sm">
                <strong>{t('checkout.city')}:</strong> {orderData.orderInfo.city}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                {t('checkout.paymentMethod')}
              </Text>
              <Text fontSize="sm" textTransform="capitalize">
                {orderData.paymentMethod.replace('-', ' ')}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                {t('checkout.orderSummary')}
              </Text>
              <Flex justify="space-between">
                <Text fontSize="sm">{t('checkout.subtotal')}:</Text>
                <Text fontSize="sm">${orderData.orderSummary.subtotal.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="sm">{t('checkout.deliveryFee')}:</Text>
                <Text fontSize="sm">${orderData.orderSummary.deliveryFee.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="sm">{t('checkout.promoDiscount')}:</Text>
                <Text fontSize="sm" color="green.500">
                  -${orderData.orderSummary.promoDiscount.toFixed(2)}
                </Text>
              </Flex>
              <Divider my={2} />
              <Flex justify="space-between" fontWeight="bold">
                <Text>{t('checkout.total')}:</Text>
                <Text>${orderData.orderSummary.total.toFixed(2)}</Text>
              </Flex>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button
            colorScheme="brand"
            onClick={onConfirm}
            isLoading={isSubmitting}
            loadingText={t('checkout.processing') || 'Processing...'}
          >
            {t('checkout.confirmOrder') || 'Confirm Order'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const CheckoutPage = () => {
  // Hooks and context
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { user, userAddress, setUser } = useUser()
  const toast = useToast()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  useEffect(() => {
    console.log(`Current user from context to checkout page:`, user)
  }, [user])
  // Checkout state
  const [state, dispatch] = useReducer(checkoutReducer, {
    ...initialState,
    orderInfo: {
      ...initialState.orderInfo,
      userId: user?.id || '',
      user: {
        id: user?.id || '',
        email: user?.email || '',
        displayName: user?.displayName || '',
        phoneNumber: user?.phoneNumber || '',
      },
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      deliveryAddress: userAddress?.display_name || user?.defaultAddress || '',
    },
  })

  const { isSubmitting, paymentMethod, orderInfo, paymentInfo, orderSummary } = state

  // Modal controls
  const {
    isOpen: isConfirmationOpen,
    onOpen: onOpenConfirmation,
    onClose: onCloseConfirmation,
  } = useDisclosure()

  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()

  // Event handlers
  const handleOrderInfoChange = (field, value) => {
    dispatch({
      type: 'SET_ORDER_INFO',
      payload: { [field]: value },
    })
  }

  const handlePaymentInfoChange = (field, value) => {
    dispatch({
      type: 'SET_PAYMENT_INFO',
      payload: { [field]: value },
    })
  }

  const handleOpenConfirmation = () => {
    if (!paymentMethod) {
      toast({
        title: t('checkout.paymentMethodRequired') || 'Payment Method Required',
        description: t('checkout.pleaseSelectPaymentMethod') || 'Please select a payment method',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!orderInfo.fullName || !orderInfo.phoneNumber || !orderInfo.deliveryAddress) {
      toast({
        title: t('checkout.requiredFieldsMissing') || 'Required Fields Missing',
        description: t('checkout.pleaseFillAllRequiredFields') || 'Please fill all required fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    onOpenConfirmation()
  }

  const handleConfirmOrder = async () => {
    dispatch({ type: 'START_SUBMISSION' })
    onCloseConfirmation()

    try {
      if (!user?.uid) throw new Error('User not authenticated')

      const deliveryAddress = orderInfo.deliveryAddress || user?.defaultAddress

      // Prepare order data - aligned with Order model attributes
      const orderData = {
        userId: user.uid,
        user: {
          id: user.uid,
          displayName: user.displayName,
          email: user.email,
          phoneNumber: orderInfo.phoneNumber,
        },
        items: [], // Add actual items here
        meals: [], // Add actual meals here
        totalPrice: orderSummary.total,
        subtotal: orderSummary.subtotal,
        tax: 0,
        discount: orderSummary.promoDiscount,
        deliveryFee: orderSummary.deliveryFee,
        status: 'pending',
        isPaid: paymentMethod === 'cash-on-delivery' ? false : true,
        paymentMethod: paymentMethod,
        paymentId: paymentMethod === 'cash-on-delivery' ? '' : `payment_${Date.now()}`,
        paymentDate: paymentMethod === 'cash-on-delivery' ? null : new Date().toISOString(),
        deliveryAddress: deliveryAddress,
        deliveryInstructions: orderInfo.deliveryInstructions || '',
        deliveryDate: null,
        contactPhone: orderInfo.phoneNumber,
        notes: orderInfo.notes || '',
        couponCode: orderInfo.couponCode || '',
      }

      // Create order
      const createdOrder = await createOrder(user.uid, orderData)

      // Update user profile if needed
      if (orderInfo.saveAddress && deliveryAddress) {
        const userProfileUpdates = {
          firstName: orderInfo.fullName.split(' ')[0] || '',
          lastName: orderInfo.fullName.split(' ').slice(1).join(' ') || '',
          phoneNumber: orderInfo.phoneNumber,
        }

        // Update addresses - handle array correctly
        const updatedAddresses = [...(user?.addresses || [])]
        const addressExists = updatedAddresses.some((addr) => addr.address === deliveryAddress)

        if (deliveryAddress && !addressExists) {
          updatedAddresses.push({
            id: `addr_${Date.now()}`,
            address: deliveryAddress,
            isDefault: true,
            createdAt: new Date().toISOString(),
          })
        }

        const profileUpdateData = {
          ...userProfileUpdates,
          addresses: updatedAddresses,
          defaultAddress: deliveryAddress,
        }

        await updateUserProfile(user.uid, profileUpdateData)

        // Update local user context
        setUser((prev) => ({
          ...prev,
          ...userProfileUpdates,
          addresses: updatedAddresses,
          defaultAddress: deliveryAddress,
        }))
      }

      toast({
        title: t('checkout.orderPlacedSuccessfully') || 'Order Placed Successfully',
        description:
          t('checkout.orderConfirmationSent') || 'Order confirmation has been sent to your email',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      navigate(`/order-confirmation/${createdOrder.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      dispatch({ type: 'END_SUBMISSION' })

      toast({
        title: t('checkout.orderFailed') || 'Order Failed',
        description: error.message || t('checkout.failedToPlaceOrder') || 'Failed to place order',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Responsive grid columns
  const gridColumns = useBreakpointValue({ base: 1, md: 3 })

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
      minHeight="100vh"
    >
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.500">
          {t('checkout.deliveryInformation')}
        </Heading>

        <SimpleGrid columns={gridColumns} spacing={6}>
          {/* Delivery Information */}
          <Section
            title={t('checkout.deliveryInformation')}
            bgColor="brand"
            titleColor="gray.800"
            icon={saladIcon}
          >
            <Stack spacing={3}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('checkout.fullName')}</FormLabel>
                <Input
                  placeholder={t('checkout.enterYourFullName') || 'Enter your full name'}
                  variant="ghost"
                  maxW={'85%'}
                  value={orderInfo.displayName}
                  onChange={(e) => handleOrderInfoChange('fullName', e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('checkout.phoneNumber')}</FormLabel>
                <Input
                  placeholder={t('checkout.yourPhoneNumber') || 'Your phone number'}
                  variant="ghost"
                  maxW={'85%'}
                  value={orderInfo.phoneNumber}
                  onChange={(e) => handleOrderInfoChange('phoneNumber', e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('checkout.deliveryAddress')}</FormLabel>
                <Input
                  placeholder={t('checkout.enterDeliveryAddress') || 'Enter delivery address'}
                  variant="ghost"
                  maxW={'85%'}
                  value={userAddress?.display_name || orderInfo.deliveryAddress}
                  onChange={(e) => handleOrderInfoChange('deliveryAddress', e.target.value)}
                />
                <Button mt={2} size="sm" variant="outline" colorScheme="brand" onClick={onOpenMap}>
                  {t('checkout.selectOnMap') || 'Select on Map'}
                </Button>
              </FormControl>
              <FormControl>
                <Input
                  placeholder={t('checkout.specialInstructions')}
                  value={orderInfo.notes}
                  variant="ghost"
                  maxW={'85%'}
                  onChange={(e) => handleOrderInfoChange('notes', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <Input
                  placeholder={t('checkout.couponCode')}
                  value={orderInfo.couponCode}
                  variant={"ghost"}
                  maxW={'85%'}
                  onChange={(e) => handleOrderInfoChange('couponCode', e.target.value)}
                />
              </FormControl>
              <FormControl>
                <Input
                  placeholder={
                    t('checkout.deliveryInstructions') || 'Optional delivery instructions'
                  }
                  variant="ghost"
                  maxW={'85%'}
                  value={orderInfo.deliveryInstructions}
                  onChange={(e) => handleOrderInfoChange('deliveryInstructions', e.target.value)}
                />
              </FormControl>

              <Checkbox
                colorScheme="brand"
                mt={2}
                isChecked={orderInfo.saveAddress}
                onChange={(e) => handleOrderInfoChange('saveAddress', e.target.checked)}
              >
                {t('checkout.saveAddress') || 'Save this address for future orders'}
              </Checkbox>
            </Stack>
          </Section>

          {/* Payment Details */}
          <Section title={t('checkout.paymentDetails')} bgColor="warning" icon={paymentIcon}>
            <FormControl mb={4}>
              <FormLabel fontSize="sm">{t('checkout.paymentMethod')}</FormLabel>
              <Select
                placeholder={t('checkout.selectPaymentMethod') || 'Select payment method'}
                focusBorderColor="warning.500"
                bg={colorMode === 'dark' ? 'gray.800' : 'warning.100'}
                onChange={(e) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: e.target.value })}
              >
                <option value="credit-card">{t('checkout.creditCard') || 'Credit Card'}</option>
                <option value="paypal">{t('checkout.paypal') || 'PayPal'}</option>
                <option value="cash-on-delivery">
                  {t('checkout.cashOnDelivery') || 'Cash on Delivery'}
                </option>
              </Select>
            </FormControl>

            <PaymentMethodInputs
              paymentMethod={paymentMethod}
              paymentInfo={paymentInfo}
              onPaymentInfoChange={handlePaymentInfoChange}
              t={t}
              colorMode={colorMode}
            />
          </Section>

          {/* Order Summary */}
          <Section title={t('checkout.orderSummary')} bgColor="accent" icon={orderIcon}>
            <Stack spacing={3}>
              <Flex justify="space-between" mb={2}>
                <Text>{t('checkout.subtotal')}:</Text>
                <Text fontWeight="bold">${orderSummary.subtotal.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>{t('checkout.deliveryFee')}:</Text>
                <Text fontWeight="bold">${orderSummary.deliveryFee.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>{t('checkout.promoDiscount')}:</Text>
                <Text fontWeight="bold" color="green.500">
                  -${orderSummary.promoDiscount.toFixed(2)}
                </Text>
              </Flex>

              <Divider />

              <Flex justify="space-between" mb={4}>
                <Text fontWeight="bold">{t('checkout.total')}:</Text>
                <Text fontWeight="bold" fontSize="lg" color="gray.800">
                  ${orderSummary.total.toFixed(2)}
                </Text>
              </Flex>

              <ALT
                message={{
                  title: t('checkout.orderMinimum') || 'Order Minimum',
                  description:
                    t('checkout.orderMinimumDescription') || 'Minimum order amount is $25',
                }}
                type="info"
                dismissible
              />

              <Button
                colorScheme="brand"
                size="lg"
                width="full"
                onClick={handleOpenConfirmation}
                isLoading={isSubmitting}
                loadingText={t('checkout.processing') || 'Processing...'}
              >
                {t('checkout.placeOrder') || 'Place Order'}
              </Button>

              <Button mt={2} variant="ghost" width="full" onClick={() => navigate('/menu')}>
                {t('checkout.backToMenu') || 'Back to Menu'}
              </Button>
            </Stack>
          </Section>
        </SimpleGrid>
      </VStack>

      {/* Modals */}
      <MapModal
        isOpen={isMapOpen}
        onClose={onCloseMap}
        onSelectLocation={(location) => {
          handleOrderInfoChange('deliveryAddress', location.display_name || location.address)
          onCloseMap()
        }}
      />

      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={onCloseConfirmation}
        onConfirm={handleConfirmOrder}
        orderData={state}
        isSubmitting={isSubmitting}
        t={t}
      />
    </Box>
  )
}

export default CheckoutPage
