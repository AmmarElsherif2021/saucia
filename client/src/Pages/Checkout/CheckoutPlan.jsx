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
  Badge,
  Divider,
  Alert,
  AlertIcon,
  Image,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react'
import MapModal from './MapModal'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useElements } from '../../Contexts/ElementsContext'
import { MealPlanCard } from './MealPlanCard'
import ConfirmPlanModal from './ConfirmPlanModal'
import CustomizableMealSelectionModal from './CustomizableMealSelectionModal'

// Import icons
import paymentIcon from '../../assets/payment.svg'
import orderIcon from '../../assets/order.svg'
import saladIcon from '../../assets/menu/salad.svg'
import locationPin from '../../assets/locationPin.svg'

//Hooks
import { useUserProfile, useUserAddresses } from '../../hooks/userHooks'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext'
import SubscriptionSummary from './SubscriptionSummarySection'

//Checkout state
const initialState = {
  isSubmitting: false,
  paymentMethod: '',
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
      maxHeight="235vh"
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
  const {
    subscriptionData,
    updateSubscriptionData,
    addMeal,
    removeMeal,
    getSubscriptionPayload,
    isSubscriptionValid,
  } = useChosenPlanContext();
  
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { user } = useAuthContext();
  const { signatureSalads } = useElements()
  const toast = useToast()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  
  // Fetch user profile and addresses
  const { createSubscription } = useUserSubscriptions();
  const { data: profile } = useUserProfile();
  const { 
    addresses: userAddresses, 
    isLoading: isLoadingAddresses 
  } = useUserAddresses();
  const defaultAddress = userAddresses.find(addr => addr.is_default) || userAddresses[0];

  // Local state for billing info (non-subscription related)
  const [billingInfo, setBillingInfo] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    deliveryAddress: defaultAddress?.display_name || user?.defaultAddress || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal controls
  const {
    isOpen: isConfirmationOpen,
    onOpen: onOpenConfirmation,
    onClose: onCloseConfirmation,
  } = useDisclosure()

  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()
  
  // Constants
  const today = new Date()
  const startDate = subscriptionData.start_date || today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const endDate = subscriptionData.end_date ? new Date(subscriptionData.end_date) : calculateEndDate(today, subscriptionData.total_meals || 12)
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Event handlers
  const handleBillingInfoChange = (field, value) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

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

  // helper function to get selected meal objects
  const getSelectedMealObjects = () => {
    return subscriptionData.meals
      .map(id => signatureSalads.find(meal => meal.id === id))
      .filter(Boolean);
  };

  // handleAddSignatureSalad accept ID
  const handleAddSignatureSalad = (mealId) => {
    addMeal(mealId);
  };

  const handleRemoveMeal = (mealId) => {
    removeMeal(mealId);
  };

  const handleConfirmSubscription = async () => {
    setIsSubmitting(true);
    onCloseConfirmation();

    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Update subscription data with final details
      updateSubscriptionData({
        delivery_address_id: subscriptionData.delivery_address_id,
        preferred_delivery_time: subscriptionData.preferred_delivery_time,
        payment_method_id: paymentMethod,
        status: 'active'
      });

      // Get final payload from context
      const subscriptionPayload = getSubscriptionPayload(user.id);

      // Create subscription with the payload
      await createSubscription(subscriptionPayload);

      toast({
        title: t('checkout.subscriptionSuccessful'),
        description: t('checkout.premiumPlanActive'),
        status: 'success',
        duration: 5000,
        isClosable: false,
      });

      navigate('/account?subscription=success');
    } catch (error) {
      console.error('Error confirming subscription:', error);
      setIsSubmitting(false);

      toast({
        title: t('checkout.subscriptionFailed'),
        description: error.message || t('checkout.failedToUpdatePlanSubscription'),
        status: 'error',
        duration: 5000,
        isClosable: false,
      });
    }
  };

  //Location
  const handleSelectLocation = (addressData) => {
    setBillingInfo(prev => ({ 
      ...prev, 
      deliveryAddress: addressData.display_name 
    }));
    updateSubscriptionData({
      delivery_address_id: addressData.id
    });
  };
  
  const handleAddressInputChange = (e) => {
    handleBillingInfoChange('deliveryAddress', e.target.value);
  };
  
  // Responsive grid columns
  const gridColumns = useBreakpointValue({ base: 1, md: 3 })
  
  // Initialize billing info with user data
  useEffect(() => {
    if (profile && userAddresses) {
      const defaultAddress = userAddresses.find(addr => addr.is_default) || userAddresses[0];
      
      const newBillingInfo = {
        fullName: profile.display_name || '',
        email: user?.email || '',
        phoneNumber: profile.phone_number || '',
        deliveryAddress: defaultAddress ? 
          (defaultAddress.display_name || `${defaultAddress.address_line1}, ${defaultAddress.city}`) : '',
      };

      setBillingInfo(newBillingInfo);
    }
  }, [profile, userAddresses, user]);

  return (
    <Box
      p={{ base: 4, md: 6 }}
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
      minHeight="100vh"
    >
      {/* ... existing UI components ... */}

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
                    value={billingInfo.deliveryAddress}
                    onChange={handleAddressInputChange}
                  />
                  <Button mx={2} onClick={onOpenMap}>
                    <Image src={locationPin} alt="Location Pin" boxSize="30px" />
                  </Button>
                </Flex>
                {/* Updated MapModal */}
               <MapModal
                isOpen={isMapOpen}
                onClose={onCloseMap}
                onSelectLocation={handleSelectLocation} 
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
              onChange={(e) => setPaymentMethod(e.target.value)}
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
          <SubscriptionSummary/>
        <Button
          colorScheme="brand"
          size="sm"
          width="full"
          onClick={handleOpenConfirmation}
          isLoading={isSubmitting}
          loadingText={t('checkout.processing')}
          isDisabled={!userAddresses || !isSubscriptionValid}
        >
          {t('checkout.completeSubscription')}
        </Button>
        </Section>
      </SimpleGrid>

      {/* ConfirmPlanModal */}
      <ConfirmPlanModal
        isOpen={isConfirmationOpen}
        onClose={onCloseConfirmation}
        selectedMeals={getSelectedMealObjects()}  
        handleAddSignatureSalad={handleAddSignatureSalad} 
        handleRemoveMeal={handleRemoveMeal}
        handleConfirmSubscription={handleConfirmSubscription}
        userPlan={userAddresses}
        signatureSalads={signatureSalads}
        startDate={startDate}
        formattedEndDate={formattedEndDate}
        isSubmitting={isSubmitting}
        t={t}
        MealPlanCard={MealPlanCard}
        today={today}
        calculateDeliveryDate={calculateDeliveryDate}
      />
    </Box>
  )
}

export default CheckoutPlan