import { useState, useReducer } from 'react'
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
  Badge,
  Divider,
  Alert,
  AlertIcon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react'
import MapModal from './MapModal'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../Contexts/UserContext'
import { updateUserProfile } from '../../API/users'
import { useElements } from '../../Contexts/ElementsContext'
import { MealCard } from './MealCard'
import ConfirmPlanModal from './ConfirmPlanModal'
import CustomizableMealSelectionModal from './CustomizableMealSelectionModal'

// Import icons
import paymentIcon from '../../assets/payment.svg'
import orderIcon from '../../assets/order.svg'
import saladIcon from '../../assets/menu/salad.svg'
import locationPin from '../../assets/locationPin.svg'
//Checkout state
const initialState = {
  isSubmitting: false,
  paymentMethod: '',
  period: 12,
  selectedMeals: [],
  customizedSalad: null,
  billingInfo: {
    fullName: '',
    email: '',
    phoneNumber: '',
    deliveryAddress: '',
    deliveryTime: '12:00',
  },
}

// Reducer function to manage checkout state
function checkoutReducer(state, action) {
  switch (action.type) {
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload }
    case 'SET_PERIOD':
      return { ...state, period: action.payload }
    case 'SET_SELECTED_MEALS':
      return { ...state, selectedMeals: action.payload }
    case 'SET_CUSTOMIZED_SALAD':
      return { ...state, customizedSalad: action.payload }
    case 'ADD_SIGNATURE_SALAD':
      return { ...state, selectedMeals: [...state.selectedMeals, action.payload] }
    case 'REMOVE_MEAL':
      return {
        ...state,
        selectedMeals: state.selectedMeals.filter((_, i) => i !== action.payload),
      }
    case 'SET_BILLING_INFO':
      return {
        ...state,
        billingInfo: { ...state.billingInfo, ...action.payload },
      }
    case 'START_SUBMISSION':
      return { ...state, isSubmitting: true }
    case 'END_SUBMISSION':
      return { ...state, isSubmitting: false }
    case 'RESET_MEALS':
      return { ...state, selectedMeals: [], customizedSalad: null }
    default:
      return state
  }
}

// Reusable Section Component with responsive improvements
const Section = ({ title, children, bgColor, titleColor, icon }) => {
  const { colorMode } = useColorMode()
  const padding = useBreakpointValue({ base: 4, md: 6 })

  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.700' : `${bgColor}.300`}
      borderRadius="45px"
      borderWidth="3px"
      borderColor={colorMode === 'dark' ? 'gray.600' : `${bgColor}.500`}
      p={padding}
      position="relative"
      overflow="hidden"
      height="100%"
      maxHeight="95vh"
      minHeight="85vh"
      my={20}
    >
      <Box position="relative" zIndex="1">
        <Flex align="center" mb={5}>
          {icon && (
            <Box
              as="img"
              src={icon}
              alt={`${title} icon`}
              boxSize="48px"
              mx={2}
              borderRadius={'50%'}
              p={1}
              bg={'whiteAlpha.900'}
            />
          )}
          <Heading size="md" color={titleColor || 'brand.900'}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  )
}

// Payment Method Input Components
const PaymentMethodInputs = ({ paymentMethod, t, colorMode }) => {
  switch (paymentMethod) {
    case 'credit-card':
      return (
        <Stack spacing={3} maxW={'90%'}>
          <FormControl>
            <FormLabel fontSize="sm">{t('checkout.cardNumber')}</FormLabel>
            <Input
              placeholder={t('checkout.cardNumberPlaceholder')}
              variant="ghost"
              maxLength={19}
            />
          </FormControl>

          <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl>
              <FormLabel fontSize="sm">{t('checkout.expiryDate')}</FormLabel>
              <Input
                placeholder={t('checkout.expiryDatePlaceholder')}
                variant="ghost"
                maxLength={5}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">CVV</FormLabel>
              <Input placeholder="123" variant="ghost" maxLength={3} type="password" />
            </FormControl>
          </Flex>

          <FormControl>
            <FormLabel fontSize="sm">{t('checkout.nameOnCard')}</FormLabel>
            <Input placeholder={t('checkout.cardholderNamePlaceholder')} variant="ghost" />
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
            {t('checkout.paypalRedirectMessage')}
          </Alert>
          <Button colorScheme="brand" leftIcon={<Text>PayPal</Text>} width="full">
            {t('checkout.continueWithPayPal')}
          </Button>
        </VStack>
      )

    case 'apple-pay':
    case 'google-pay':
      return (
        <VStack spacing={4} align="stretch" maxW={'90%'}>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            {t('checkout.completePaymentWith', {
              method: paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay',
            })}
          </Alert>
          <Button colorScheme={paymentMethod === 'apple-pay' ? 'blackAlpha' : 'brand'} width="full">
            {t('checkout.payWith', {
              method: paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay',
            })}
          </Button>
        </VStack>
      )

    default:
      return null
  }
}

// Date calculation utilities
const calculateDeliveryDate = (startDate, mealIndex) => {
  let date = new Date(startDate)
  let daysAdded = 0

  while (daysAdded <= mealIndex) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() !== 5 && date.getDay() !== 6) {
      daysAdded++
    }
  }

  return date
}

const calculateEndDate = (startDate, daysToAdd) => {
  let result = new Date(startDate)
  let daysAdded = 0

  while (daysAdded < daysToAdd) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 5 && result.getDay() !== 6) {
      daysAdded++
    }
  }

  return result
}

const CheckoutPlan = () => {
  // Hooks and context
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { user, userPlan, setUser, userAddress } = useUser()
  const { saladItems, signatureSalads } = useElements()
  const toast = useToast()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'

  //Checkout state
  const [state, dispatch] = useReducer(checkoutReducer, {
    ...initialState,
    billingInfo: {
      ...initialState.billingInfo,
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      deliveryAddress: userAddress || user?.defaultAddress || '',
      deliveryTime: user?.subscription?.deliveryTime || '12:00',
    },
  })

  const { isSubmitting, paymentMethod, period, selectedMeals, customizedSalad, billingInfo } = state

  // Modal controls
  const {
    isOpen: isConfirmationOpen,
    onOpen: onOpenConfirmation,
    onClose: onCloseConfirmation,
  } = useDisclosure()

  const {
    isOpen: isMealSelectionOpen,
    onOpen: onOpenMealSelection,
    onClose: onCloseMealSelection,
  } = useDisclosure()
  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()
  // Constants
  const today = new Date()
  const startDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const endDate = calculateEndDate(today, period)
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const subscriptionPrice = 49.99
  const discount = 10.0
  const totalPrice = subscriptionPrice - discount

  // Helper function to combine meals
  const getCombinedMeals = () => {
    const meals = [...selectedMeals]
    if (customizedSalad) {
      meals.push(customizedSalad)
    }
    // If no meals selected, use default signature salads
    return meals.length > 0 ? meals : signatureSalads.slice(0, period)
  }

  // Event handlers
  const handleBillingInfoChange = (field, value) => {
    dispatch({
      type: 'SET_BILLING_INFO',
      payload: { [field]: value },
    })
  }

  const handleOpenConfirmation = () => {
    if (!paymentMethod) {
      toast({
        title: t('checkout.paymentMethodRequired'),
        description: t('checkout.pleaseSelectPaymentMethod'),
        status: 'warning',
        duration: 3000,
        isClosable: false,
      })
      return
    }

    if (!billingInfo.fullName || !billingInfo.email || !billingInfo.deliveryAddress) {
      toast({
        title: t('checkout.requiredFieldsMissing'),
        description: t('checkout.pleaseFillAllRequiredFields'),
        status: 'warning',
        duration: 3000,
        isClosable: false,
      })
      return
    }

    onOpenConfirmation()
  }

  const handleSelectMeals = () => onOpenMealSelection()

  const handleConfirmCustomizedSalad = (selectedItems) => {
    const selectedItemIds = Object.keys(selectedItems)
    const items = saladItems.filter((item) => selectedItemIds.includes(item.id))

    dispatch({
      type: 'SET_CUSTOMIZED_SALAD',
      payload: {
        id: 'custom-salad-' + Date.now(),
        name: t('checkout.customSalad'),
        name_arabic: t('checkout.customSalad', { lng: 'ar' }),
        calories: items.reduce((sum, item) => sum + (item.calories || 0), 0),
        price: items.reduce((sum, item) => sum + (item.price || 0), 0),
        items,
        isCustom: true,
      },
    })
    onCloseMealSelection()
  }

  const handleAddSignatureSalad = (meal) => {
    dispatch({ type: 'ADD_SIGNATURE_SALAD', payload: meal })
  }

  const handleRemoveMeal = (index) => {
    dispatch({ type: 'REMOVE_MEAL', payload: index })
  }

  const handleConfirmSubscription = async () => {
    dispatch({ type: 'START_SUBMISSION' })
    onCloseConfirmation()

    try {
      if (!user?.uid) throw new Error('User not authenticated')

      const finalMeals = getCombinedMeals()
      const deliveryAddress = billingInfo.deliveryAddress || user?.defaultAddress

      // Prepare user profile updates
      const userProfileUpdates = {
        firstName: billingInfo.fullName.split(' ')[0] || '',
        lastName: billingInfo.fullName.split(' ').slice(1).join(' ') || '',
        phoneNumber: billingInfo.phoneNumber,
      }

      // Update addresses if new address provided
      const updatedAddresses = [...(user?.addresses || [])]
      if (deliveryAddress && !updatedAddresses.includes(deliveryAddress)) {
        updatedAddresses.push(deliveryAddress)
      }

      const subscriptionData = {
        subscription: {
          planId: userPlan?.id || 'premium-plan',
          planName: userPlan?.title || 'Premium Plan',
          startDate: today.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active',
          paymentMethod,
          price: totalPrice,
          mealsCount: period,
          consumedMeals: user?.subscription?.consumedMeals || 0, // Maintain existing consumed meals
          meals: finalMeals,
          deliveryAddress,
          deliveryTime: billingInfo.deliveryTime,
          autoRenewal: false,
          deliveryPaused: false,
          nextMealDate: calculateDeliveryDate(today, 0).toISOString(),
        },
        // Update personal information
        ...userProfileUpdates,
        addresses: updatedAddresses,
        defaultAddress: deliveryAddress,
      }

      await updateUserProfile(user.uid, subscriptionData)

      // Update local user context
      setUser((prev) => ({
        ...prev,
        ...userProfileUpdates,
        addresses: updatedAddresses,
        defaultAddress: deliveryAddress,
        subscription: subscriptionData.subscription,
      }))

      toast({
        title: t('checkout.subscriptionSuccessful'),
        description: t('checkout.premiumPlanActive'),
        status: 'success',
        duration: 5000,
        isClosable: false,
      })

      navigate('/account?subscription=success')
    } catch (error) {
      console.error('Error confirming subscription:', error)
      dispatch({ type: 'END_SUBMISSION' })

      toast({
        title: t('checkout.subscriptionFailed'),
        description: error.message || t('checkout.failedToUpdatePlanSubscription'),
        status: 'error',
        duration: 5000,
        isClosable: false,
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
      <VStack spacing={2} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.800">
          {t('checkout.completeYourSubscription')}
        </Heading>

        {!userPlan && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            {t('checkout.noPlanSelected')}
          </Alert>
        )}

        <SimpleGrid columns={gridColumns} spacing={4}>
          {/* Billing Information */}
          <Section title={t('checkout.billingInformation')} bgColor="teal" icon={saladIcon}>
            <Stack spacing={2}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('checkout.fullName')}</FormLabel>
                <Input
                  placeholder={t('checkout.enterYourFullName')}
                  variant="ghost"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                  maxW={'85%'}
                  value={billingInfo.fullName}
                  onChange={(e) => handleBillingInfoChange('fullName', e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('checkout.emailAddress')}</FormLabel>
                <Input
                  type="email"
                  maxW={'85%'}
                  placeholder={t('checkout.yourEmailAddress')}
                  variant="ghost"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                  value={billingInfo.email}
                  onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">{t('checkout.phoneNumber')}</FormLabel>
                <Input
                  placeholder={t('checkout.yourPhoneNumber')}
                  variant="ghost"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                  maxW={'85%'}
                  value={billingInfo.phoneNumber}
                  onChange={(e) => handleBillingInfoChange('phoneNumber', e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('checkout.deliveryAddress')}</FormLabel>
                <Flex alignItems="center" maxW={'85%'}>
                  <Input
                    placeholder={t('checkout.enterDeliveryAddress')}
                    variant="outlined"
                    bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                    focusBorderColor="brand.500"
                    maxW={'85%'}
                    value={userAddress?.display_name || billingInfo?.deliveryAddress?.display_name}
                    onChange={(e) => handleBillingInfoChange('deliveryAddress', e.target.value)}
                  />
                  <Button mx={2} onClick={onOpenMap}>
                    <Image src={locationPin} alt="Location Pin" boxSize="30px" />
                  </Button>
                </Flex>
                <MapModal
                  isOpen={isMapOpen}
                  onClose={onCloseMap}
                  onSelectLocation={() => console.log(`trying to set location`)}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">{t('checkout.deliveryTime')}</FormLabel>
                <Select
                  maxW={'85%'}
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                  value={billingInfo.deliveryTime}
                  onChange={(e) => handleBillingInfoChange('deliveryTime', e.target.value)}
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </Select>
              </FormControl>

              <Checkbox colorScheme="brand" mt={2}>
                {t('checkout.sendMePlanUpdatesAndNotifications')}
              </Checkbox>
            </Stack>
          </Section>

          {/* Payment Details */}
          <Section title={t('checkout.paymentDetails')} bgColor="secondary" icon={paymentIcon}>
            <FormControl mb={4}>
              <FormLabel fontSize="sm">{t('checkout.paymentMethod')}</FormLabel>
              <Select
                placeholder={t('checkout.selectPaymentMethod')}
                focusBorderColor="secondary.500"
                bg={colorMode === 'dark' ? 'gray.800' : 'secondary.100'}
                onChange={(e) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: e.target.value })}
              >
                <option value="credit-card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="apple-pay">Apple Pay</option>
                <option value="google-pay">Google Pay</option>
              </Select>
            </FormControl>

            <PaymentMethodInputs paymentMethod={paymentMethod} t={t} colorMode={colorMode} />
          </Section>

          {/* Subscription Summary */}
          <Section title={t('checkout.subscriptionSummary')} bgColor="warning" icon={orderIcon}>
            {!userPlan ? (
              <Text>{t('noPlanSelected')}</Text>
            ) : (
              <Box>
                <Flex alignItems="center" mb={2}>
                  <Image
                    src={userPlan.image || saladIcon}
                    alt={userPlan.title}
                    boxSize="60px"
                    borderRadius="25%"
                    bg={colorMode === 'dark' ? 'gray.700' : 'warning.100'}
                    mx={4}
                    p={2}
                  />
                  <Box>
                    <Heading size="xs">{isArabic ? userPlan.title_arabic : userPlan.title}</Heading>
                  </Box>
                </Flex>

                <Divider mb={1} />

                <Stack spacing={2}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">{t('premium.nutritionalInformation')}:</Text>
                    <Flex wrap="wrap" gap={1}>
                      <Badge fontSize="0.5em" colorScheme="green">
                        {t('kcal')}: {userPlan.kcal}
                      </Badge>
                      <Badge fontSize="0.5em" colorScheme="brand">
                        {t('carbs')}: {userPlan.carb}g
                      </Badge>
                      <Badge fontSize="0.5em" colorScheme="red">
                        {t('protein')}: {userPlan.protein}g
                      </Badge>
                    </Flex>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">{t('checkout.subscriptionPeriod')}:</Text>
                    <Select
                      px={3}
                      mx={4}
                      w="auto"
                      value={period}
                      onChange={(e) =>
                        dispatch({ type: 'SET_PERIOD', payload: Number(e.target.value) })
                      }
                      focusBorderColor="brand.500"
                      bg="warning.50"
                    >
                      {userPlan.periods?.map((periodOption, index) => (
                        <option key={index} value={periodOption}>
                          <span>
                            {' '}
                            {periodOption} {t('days')}{' '}
                          </span>
                        </option>
                      ))}
                    </Select>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm">{t('checkout.selectedMeals')}:</Text>
                    <Text fontSize="sm" color="brand.900">
                      {' '}
                      {getCombinedMeals().length}
                    </Text>
                  </Flex>
                </Stack>
              </Box>
            )}

            <Divider mb={2} />

            <Flex justify="space-between" mb={2}>
              <Text fontSize="sm">{t('checkout.monthlySubscription')}</Text>
              <Text fontSize="sm">${subscriptionPrice.toFixed(2)}</Text>
            </Flex>

            <Flex justify="space-between" mb={2}>
              <Text fontSize="sm">{t('checkout.newSubscriberDiscount')}</Text>
              <Text fontSize="sm" fontWeight="bold" color="green.500">
                -${discount.toFixed(2)}
              </Text>
            </Flex>

            <Divider my={1} />

            <Flex justify="space-between" mb={4}>
              <Text fontSize="sm" fontWeight="bold">
                {t('checkout.totalToday')}
              </Text>
              <Text fontSize="sm" fontWeight="bold" color="brand.800">
                ${totalPrice.toFixed(2)}
              </Text>
            </Flex>

            <Text fontSize="xs" color="gray.600" mb={4}>
              {t('checkout.subscriptionTerms')}
            </Text>

            <Button
              colorScheme="brand"
              size="sm"
              width="full"
              onClick={handleOpenConfirmation}
              isLoading={isSubmitting}
              loadingText={t('checkout.processing')}
              isDisabled={!userPlan}
            >
              {t('checkout.completeSubscription')}
            </Button>

            <Button mt={2} variant="ghost" width="full" onClick={() => navigate('/premium')}>
              {t('checkout.backToPlans')}
            </Button>
          </Section>
        </SimpleGrid>
      </VStack>

      {/* Modals */}
      <CustomizableMealSelectionModal
        isOpen={isMealSelectionOpen}
        onClose={onCloseMealSelection}
        onConfirm={handleConfirmCustomizedSalad}
        saladItems={saladItems}
        t={t}
        isArabic={isArabic}
      />

      <ConfirmPlanModal
        isOpen={isConfirmationOpen}
        onClose={onCloseConfirmation}
        handleSelectMeals={handleSelectMeals}
        handleAddSignatureSalad={handleAddSignatureSalad}
        handleRemoveMeal={handleRemoveMeal}
        handleConfirmSubscription={handleConfirmSubscription}
        userPlan={userPlan}
        customizedSalad={customizedSalad}
        selectedMeals={selectedMeals}
        signatureSalads={signatureSalads}
        startDate={startDate}
        formattedEndDate={formattedEndDate}
        isSubmitting={isSubmitting}
        t={t}
        MealCard={MealCard}
        today={today}
        calculateDeliveryDate={calculateDeliveryDate}
      />
    </Box>
  )
}

export default CheckoutPlan
