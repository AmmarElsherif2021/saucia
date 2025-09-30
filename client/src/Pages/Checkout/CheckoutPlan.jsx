import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react'
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
  Image,
  useDisclosure,
  useBreakpointValue,
  Container,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useElements } from '../../Contexts/ElementsContext'
import { MealPlanCard } from './MealPlanCard'
import ConfirmPlanModal from './ConfirmPlanModal'
import SubscriptionSummary from './SubscriptionSummarySection'

// Import icons
import paymentIcon from '../../assets/payment.svg'
import orderIcon from '../../assets/order.svg'
import saladIcon from '../../assets/menu/salad.svg'
import locationPin from '../../assets/locationPin.svg'

// Hooks
import { useUserProfile, useUserAddresses, useRestaurantAddresses } from '../../Hooks/userHooks'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext'

//Map
const MapModal = lazy(() => import('./MapModal'));

// ============================================================================
// CONSTANTS
// ============================================================================
const PAYMENT_METHODS = {
  CASH: 'cash-at-restaurant',
  CREDIT_CARD: 'credit-card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple-pay',
  GOOGLE_PAY: 'google-pay',
}

const SUBSCRIPTION_STATUS = {
  PENDING: 'pending_payment',
  ACTIVE: 'active',
}

const INVALID_DELIVERY_DAYS = [5, 6] // Friday and Saturday

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Calculate delivery date skipping Fridays and Saturdays
 */
const calculateDeliveryDate = (startDate, mealIndex) => {
  console.log('📅 calculateDeliveryDate called:', { startDate, mealIndex })
  
  const date = new Date(startDate);
  let validDays = 0;
  
  const startDayOfWeek = date.getDay();
  if (!INVALID_DELIVERY_DAYS.includes(startDayOfWeek)) {
    validDays = 1;
  }
  
  while (validDays <= mealIndex) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    
    if (!INVALID_DELIVERY_DAYS.includes(dayOfWeek)) {
      validDays++;
    }
  }
  
  console.log('📅 Calculated delivery date:', date)
  return date;
}

/**
 * Get color value from theme
 */
const getThemeColor = (theme, colorKey, shade) => {
  try {
    return theme.colors[colorKey]?.[shade] || `${colorKey}.${shade}`
  } catch (e) {
    console.warn('⚠️ Failed to get theme color:', { colorKey, shade, error: e })
    return `${colorKey}.${shade}`
  }
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

/**
 * Enhanced Section Component with clean outlined design
 */
const Section = ({ title, children, bgColor = 'brand', titleColor, icon, isLoading = false }) => {
  const { colorMode } = useColorMode()
  const theme = useTheme()
  const padding = useBreakpointValue({ base: 4, md: 5 })
  const borderRadius = useBreakpointValue({ base: 'lg', md: 'xl' })

  const cardBg = useColorModeValue(`${bgColor}.200`, 'gray.700')
  const cardBorder = useColorModeValue(`${bgColor}.400`, 'gray.600')
  const iconBg = useColorModeValue(`${bgColor}.100`, 'gray.600')
  const iconBorder = useColorModeValue(`${bgColor}.200`, 'gray.500')
  const headingColor = titleColor || useColorModeValue(`${bgColor}.700`, 'white')

  console.log('🎨 Section rendered:', { title, bgColor, isLoading, colorMode })
  
  if (isLoading) {
    return (
      <Card 
        h="400px"
        borderRadius={borderRadius}
        overflow="hidden"
        position="relative"
        bg={useColorModeValue(`${bgColor}.100`, 'gray.700')}
        border="2px solid"
        borderColor={useColorModeValue(`${bgColor}.200`, 'gray.600')}
        boxShadow="none"
      >
        <CardBody p={padding}>
          <Skeleton height="40px" mb={4} borderRadius="md" />
          <SkeletonText noOfLines={6} spacing="4" skeletonHeight="16px" />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card
      position="relative"
      overflow="hidden"
      height="fit-content"
      minHeight={{ base: '300px', md: '400px' }}
      borderRadius={borderRadius}
      bg={cardBg}
      boxShadow="none"
      border="2px solid"
      borderColor={cardBorder}
      transition="all 0.2s ease"
    >
      <CardBody p={padding}>
        <Flex align="center" mb={5} gap={3}>
          {icon && (
            <Flex
              align="center"
              justify="center"
              boxSize={{ base: "36px", md: "40px" }}
              borderRadius="10px"
              bg={iconBg}
              border="1px solid"
              borderColor={iconBorder}
            >
              <Image
                src={icon}
                alt={`${title} icon`}
                boxSize={{ base: "18px", md: "20px" }}
              />
            </Flex>
          )}
          <Heading 
            size={{ base: "md", md: "lg" }} 
            color={headingColor}
            fontWeight="600"
          >
            {title}
          </Heading>
        </Flex>
        {children}
      </CardBody>
    </Card>
  )
}

/**
 * Reusable Alert Component
 */
const InfoAlert = ({ status = 'info', title, message, colorMode }) => {
  const bgColors = {
    info: colorMode === 'dark' ? 'blue.800' : 'blue.50',
    success: colorMode === 'dark' ? 'green.800' : 'green.50',
    warning: colorMode === 'dark' ? 'orange.800' : 'orange.50',
    error: colorMode === 'dark' ? 'red.800' : 'red.50',
  }

  const borderColors = {
    info: colorMode === 'dark' ? 'blue.600' : 'blue.200',
    success: colorMode === 'dark' ? 'green.600' : 'green.200',
    warning: colorMode === 'dark' ? 'orange.600' : 'orange.200',
    error: colorMode === 'dark' ? 'red.600' : 'red.200',
  }

  const iconColors = {
    info: 'blue.500',
    success: 'green.500',
    warning: 'orange.500',
    error: 'red.500',
  }

  console.log('⚠️ InfoAlert rendered:', { status, title })

  return (
    <Alert 
      status={status}
      borderRadius="md"
      bg={bgColors[status]}
      borderColor={borderColors[status]}
      borderWidth="1px"
      variant="subtle"
    >
      <AlertIcon color={iconColors[status]} />
      <Box>
        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="500">
          {title}
        </Text>
        {message && (
          <Text fontSize="sm" mt={1}>
            {message}
          </Text>
        )}
      </Box>
    </Alert>
  )
}

/**
 * Payment Method Inputs Component
 */
const PaymentMethodInputs = ({ paymentMethod, t, colorMode }) => {
  console.log('💳 PaymentMethodInputs rendered:', { paymentMethod, colorMode })

  const ComingSoonAlert = ({ methodName }) => (
    <VStack spacing={4} align="stretch" maxW={{ base: "100%", md: "90%" }}>
      <InfoAlert
        status="info"
        title={t('checkout.comingSoonTitle', { method: methodName }) || `${methodName} Coming Soon`}
        message={t('checkout.comingSoonMessage') || 'This payment method will be available soon. Please use cash payment at the restaurant.'}
        colorMode={colorMode}
      />
      <Button 
        colorScheme="gray" 
        width="full"
        size="md"
        borderRadius="md"
        variant="outline"
        isDisabled
      >
        {t('checkout.unavailable', { method: methodName }) || `${methodName} Unavailable`}
      </Button>
    </VStack>
  );

  if (paymentMethod === PAYMENT_METHODS.CASH) {
    return (
      <VStack spacing={4} align="stretch" maxW={{ base: "100%", md: "90%" }}>
        <InfoAlert
          status="success"
          title={t('checkout.cashPaymentTitle') || 'Cash Payment at Restaurant'}
          message={t('checkout.cashPaymentMessage') || 'Your subscription will be activated when you pay in cash at the restaurant during pickup.'}
          colorMode={colorMode}
        />
        
        <Box
          p={3}
          borderRadius="md"
          bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
          border="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
        >
          <Text fontSize="sm" fontWeight="500" mb={2}>
            {t('checkout.paymentInstructions') || 'Payment Instructions:'}
          </Text>
          <Text fontSize="sm">
            {t('checkout.cashInstructions') || '1. Complete your subscription order online\n2. Visit the selected restaurant location\n3. Pay in cash to activate your subscription\n4. Start enjoying your meals!'}
          </Text>
        </Box>
      </VStack>
    )
  }

  if ([PAYMENT_METHODS.CREDIT_CARD, PAYMENT_METHODS.PAYPAL, PAYMENT_METHODS.APPLE_PAY, PAYMENT_METHODS.GOOGLE_PAY].includes(paymentMethod)) {
    const methodNames = {
      [PAYMENT_METHODS.CREDIT_CARD]: 'Credit Card',
      [PAYMENT_METHODS.PAYPAL]: 'PayPal',
      [PAYMENT_METHODS.APPLE_PAY]: 'Apple Pay',
      [PAYMENT_METHODS.GOOGLE_PAY]: 'Google Pay',
    }
    
    return <ComingSoonAlert methodName={methodNames[paymentMethod]} />
  }

  return (
    <VStack spacing={4} align="stretch" maxW={{ base: "100%", md: "90%" }}>
      <InfoAlert
        status="info"
        title={t('checkout.selectPaymentMethodFirst') || 'Please select a payment method to continue'}
        colorMode={colorMode}
      />
    </VStack>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CheckoutPlan = () => {
  console.log('🚀 CheckoutPlan component mounted')

  // ============================================================================
  // HOOKS - ALL AT TOP LEVEL
  // ============================================================================
  
  // Context hooks
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
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext()
  
  // Responsive breakpoints
  const gridColumns = useBreakpointValue({ 
    base: 1, 
    lg: 2,
    xl: 3 
  })
  
  // Data fetching hooks
  const { createSubscription } = useUserSubscriptions();
  const { data: profile } = useUserProfile();
  const { addresses: userAddresses, isLoading: isLoadingAddresses } = useUserAddresses();
  const { addresses: restaurantAddresses, isLoading: isLoadingRestaurantAddresses } = useRestaurantAddresses();
  
  // Modal controls
  const {
    isOpen: isConfirmationOpen,
    onOpen: onOpenConfirmation,
    onClose: onCloseConfirmation,
  } = useDisclosure()
  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()

  // Local state
  const [billingInfo, setBillingInfo] = useState({
    fullName:user.displayName || profile.display_name,
    email: profile.email,
    phoneNumber: profile.phone_number,
    deliveryAddress: '',
  });
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.CASH)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============================================================================
  // DEBUG LOGGING FOR ALL CONSUMED DATA
  // ============================================================================
  
  useEffect(() => {
    console.group('📊 CheckoutPlan - Data State')
    console.log('👤 User:', user)
    console.log('📝 Profile:', profile)
    console.log('📍 User Addresses:', userAddresses)
    console.log('🏪 Restaurant Addresses:', restaurantAddresses)
    console.log('🥗 Signature Salads:', signatureSalads)
    console.log('📦 Subscription Data:', subscriptionData)
    console.log('💳 Payment Method:', paymentMethod)
    console.log('📋 Billing Info:', billingInfo)
    console.log('✅ Is Subscription Valid:', isSubscriptionValid)
    console.log('🌐 Current Language:', currentLanguage)
    console.log('🎨 Color Mode:', colorMode)
    console.log('⏳ Loading States:', { 
      isLoadingAddresses, 
      isLoadingRestaurantAddresses,
      isSubmitting 
    })
    console.groupEnd()
  }, [
    user, 
    profile, 
    userAddresses, 
    restaurantAddresses, 
    signatureSalads, 
    subscriptionData, 
    paymentMethod, 
    billingInfo, 
    isSubscriptionValid,
    currentLanguage,
    colorMode,
    isLoadingAddresses,
    isLoadingRestaurantAddresses,
    isSubmitting
  ])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================
  
  const defaultAddress = useMemo(() => {
    const result = userAddresses?.find(addr => addr.is_default) || userAddresses?.[0]
    console.log('🏠 Default Address:', result)
    return result
  }, [userAddresses]);

  const { today, startDate, formattedEndDate } = useMemo(() => {
    const today = new Date();
    const startDate = subscriptionData?.start_date || today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    let endDateObj;
    if (subscriptionData?.end_date) {
      endDateObj = new Date(subscriptionData.end_date);
    } else {
      const lastMealIndex = (subscriptionData?.total_meals || 12) - 1;
      const startDateForDelivery = subscriptionData?.start_date 
        ? new Date(subscriptionData.start_date) 
        : new Date(today);
      endDateObj = calculateDeliveryDate(startDateForDelivery, lastMealIndex);
    }
    
    const formattedEndDate = endDateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    console.log('📅 Date Calculations:', { today, startDate, endDate: endDateObj, formattedEndDate })

    return { today, startDate, endDate: endDateObj, formattedEndDate };
  }, [subscriptionData?.start_date, subscriptionData?.end_date, subscriptionData?.total_meals]);

  const selectedMealObjects = useMemo(() => {
    const result = subscriptionData?.meals
      ?.map(id => signatureSalads?.find(meal => meal.id === id))
      .filter(Boolean) || [];
    
    console.log('🍽️ Selected Meal Objects:', result)
    return result
  }, [subscriptionData?.meals, signatureSalads]);

  const inputProps = useMemo(() => ({
    variant: "outline",
    bg: colorMode === 'dark' ? 'gray.700' : 'white',
    borderWidth: "2px",
    borderColor: colorMode === 'dark' ? 'gray.500' : 'gray.300',
    focusBorderColor: "brand.500",
    size: { base: 'md', md: 'md' },
    _hover: {
      borderColor: colorMode === 'dark' ? 'gray.400' : 'brand.400'
    },
    _focus: {
      bg: 'transparent',
      borderColor: 'brand.500',
    }
  }), [colorMode]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleBillingInfoChange = useCallback((field, value) => {
    console.log('📝 Billing Info Changed:', { field, value })
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const showToast = useCallback((title, description, status, duration = 3000) => {
    console.log('🔔 Toast shown:', { title, description, status })
    toast({
      title,
      description,
      status,
      duration,
      isClosable: false,
    })
  }, [toast]);

  const handleOpenConfirmation = useCallback(() => {
    console.log('🎯 Handle Open Confirmation called')
    
    if (!paymentMethod) {
      showToast(
        t('checkout.paymentMethodRequired'),
        t('checkout.pleaseSelectPaymentMethod'),
        'warning'
      )
      return
    }

    const { fullName, email, deliveryAddress } = billingInfo;
    if (!fullName || !email || !deliveryAddress) {
      showToast(
        t('checkout.requiredFieldsMissing'),
        t('checkout.pleaseFillAllRequiredFields'),
        'warning'
      )
      return
    }

    console.log('✅ Validation passed, opening confirmation modal')
    onOpenConfirmation()
  }, [paymentMethod, billingInfo, showToast, t, onOpenConfirmation]);

  const handleAddSignatureSalad = useCallback((mealId) => {
    console.log('➕ Adding meal:', mealId)
    addMeal(mealId);
  }, [addMeal]);

  const handleRemoveMeal = useCallback((mealId) => {
    console.log('➖ Removing meal:', mealId)
    removeMeal(mealId);
  }, [removeMeal]);

  const handleConfirmSubscription = useCallback(async () => {
    console.log('🎯 Confirming subscription...')
    setIsSubmitting(true);
    onCloseConfirmation();

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const subscriptionStatus = paymentMethod === PAYMENT_METHODS.CASH 
        ? SUBSCRIPTION_STATUS.PENDING 
        : SUBSCRIPTION_STATUS.ACTIVE;

      console.log('📦 Updating subscription data with status:', subscriptionStatus)
      
      updateSubscriptionData({
        delivery_address_id: subscriptionData?.delivery_address_id,
        preferred_delivery_time: subscriptionData?.preferred_delivery_time,
        payment_method: paymentMethod,
        status: subscriptionStatus
      });

      const subscriptionPayload = getSubscriptionPayload(user.id);
      console.log('📤 Subscription Payload:', subscriptionPayload)

      await createSubscription(subscriptionPayload);

      const isCashPayment = paymentMethod === PAYMENT_METHODS.CASH
      
      showToast(
        isCashPayment ? t('checkout.subscriptionPending') : t('checkout.subscriptionSuccessful'),
        isCashPayment ? t('checkout.pendingPaymentMessage') : t('checkout.premiumPlanActive'),
        isCashPayment ? 'info' : 'success',
        5000
      );

      const redirectPath = isCashPayment 
        ? '/account?subscription=pending' 
        : '/account?subscription=success'
      
      console.log('🔄 Navigating to:', redirectPath)
      navigate(redirectPath);
    } catch (error) {
      console.error('❌ Error confirming subscription:', error);
      setIsSubmitting(false);

      showToast(
        t('checkout.subscriptionFailed'),
        error.message || t('checkout.failedToUpdatePlanSubscription'),
        'error',
        5000
      );
    }
  }, [
    user?.id, 
    paymentMethod, 
    subscriptionData, 
    updateSubscriptionData, 
    getSubscriptionPayload, 
    createSubscription, 
    showToast, 
    t, 
    navigate, 
    onCloseConfirmation
  ]);
  
  const handleSelectLocation = useCallback((addressData) => {
    console.log('📍 Location selected:', addressData)
    setBillingInfo(prev => ({ 
      ...prev, 
      deliveryAddress: addressData.display_name 
    }));
    updateSubscriptionData({
      delivery_address_id: addressData.id
    });
  }, [updateSubscriptionData]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    if (profile && restaurantAddresses && restaurantAddresses.length > 0) {
      console.log('🔄 Initializing billing info from profile and restaurant addresses')
      
      setBillingInfo({
        fullName: profile.display_name || '',
        email: user?.email || '',
        phoneNumber: profile.phone_number || '',
        deliveryAddress: restaurantAddresses[0].display_name || '',
      });

      updateSubscriptionData({
        delivery_address_id: restaurantAddresses[0].id
      });
    }
  }, [profile, restaurantAddresses, user?.email, updateSubscriptionData]);

  // ============================================================================
  // RENDER
  // ============================================================================
  
  // Early return for loading state
  if (!subscriptionData) {
    console.log('⏳ No subscription data, showing loading skeleton')
    return (
      <Box
        minHeight="100vh"
        bg={colorMode === 'dark' ? 'gray.800' : 'none'}
        p={4}
      >
        <Container maxW="7xl" py={8}>
          <SimpleGrid columns={gridColumns} spacing={6}>
            <Section isLoading />
            <Section isLoading />
            <Section isLoading />
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  console.log('✅ Rendering main checkout content')

  return (
    <Box
      minHeight="100vh"
      bg={colorMode === 'dark' ? 'gray.800' : 'none'}
    >
      <Container maxW="7xl" py={{ base: 4, md: 8 }}>
        <VStack spacing={6} mb={8}>
          <Heading
            size="xl"
            textAlign="center"
            color={colorMode === 'dark' ? 'white' : 'brand.700'}
            fontWeight="600"
          >
            {t('checkout.completeYourOrder') || 'Complete Your Order'}
          </Heading>
          <Text
            fontSize="md"
            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            textAlign="center"
            maxW="2xl"
          >
            {t('checkout.reviewAndConfirm') || 'Review your subscription details and complete your order'}
          </Text>
        </VStack>

        <SimpleGrid columns={gridColumns} spacing={6} gap={6}>
          {/* Billing Information Section */}
          <Section title={t('checkout.billingInformation')} bgColor="teal" icon={saladIcon}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'brand.700'}>
                  {t('checkout.fullName')}
                </FormLabel>
                <Input
                  placeholder={t('checkout.enterYourFullName')}
                  value={billingInfo.fullName}
                  onChange={(e) => handleBillingInfoChange('fullName', e.target.value)}
                  {...inputProps}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'brand.700'}>
                  {t('checkout.emailAddress')}
                </FormLabel>
                <Input
                  type="email"
                  placeholder={t('checkout.yourEmailAddress')}
                  value={billingInfo.email}
                  onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                  {...inputProps}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'brand.700'}>
                  {t('checkout.phoneNumber')}
                </FormLabel>
                <Input
                  placeholder={t('checkout.yourPhoneNumber')}
                  value={billingInfo.phoneNumber}
                  onChange={(e) => handleBillingInfoChange('phoneNumber', e.target.value)}
                  {...inputProps}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'brand.700'}>
                  {t('checkout.deliveryAddress')}
                </FormLabel>
                
                <InfoAlert
                  status="info"
                  title={t('checkout.deliveryRestrictionTitle') || 'Pickup Only'}
                  message={t('checkout.deliveryRestrictionMessage') || 'Currently we only offer pickup from our restaurant locations. Delivery service will be available soon.'}
                  colorMode={colorMode}
                />

                <Box mt={3}>
                  {isLoadingRestaurantAddresses ? (
                    <Skeleton height="40px" borderRadius="md" />
                  ) : (
                    <Select
                      placeholder={t('checkout.selectRestaurantLocation') || "Select restaurant location"}
                      value={billingInfo.deliveryAddress}
                      onChange={(e) => {
                        const selectedAddress = restaurantAddresses.find(addr => addr.display_name === e.target.value);
                        handleBillingInfoChange('deliveryAddress', e.target.value);
                        if (selectedAddress) {
                          updateSubscriptionData({
                            delivery_address_id: selectedAddress.id
                          });
                        }
                      }}
                      bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                      borderWidth="2px"
                      borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.300'}
                      size="md"
                      _hover={{
                        borderColor: colorMode === 'dark' ? 'gray.400' : 'brand.400'
                      }}
                    >
                      {restaurantAddresses?.map((address) => (
                        <option key={address.id} value={address.display_name}>
                          {address.label} - {address.address_line1}, {address.city}
                        </option>
                      ))}
                    </Select>
                  )}
                </Box>
                
                <Flex justifyContent="flex-end" mt={2}>
                  <Button 
                    onClick={onOpenMap}
                    size="sm"
                    variant="outline"
                    leftIcon={<Image src={locationPin} alt="Location Pin" boxSize="16px" />}
                  >
                    {t('checkout.viewOnMap') || 'View on Map'}
                  </Button>
                </Flex>
                
                <Suspense fallback={<div>Loading map...</div>}>
                  <MapModal
                    isOpen={isMapOpen}
                    onClose={onCloseMap}
                    onSelectLocation={handleSelectLocation}
                    restaurantAddresses={restaurantAddresses}
                  />
                </Suspense>
              </FormControl>

              <Box
                p={3}
                borderRadius="md"
                bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
                border="1px solid"
                borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
              >
                <Checkbox colorScheme="brand" fontSize="sm">
                  {t('checkout.sendMePlanUpdatesAndNotifications')}
                </Checkbox>
              </Box>
            </Stack>
          </Section>

          {/* Payment Details Section */}
          <Section title={t('checkout.paymentDetails')} bgColor="secondary" icon={paymentIcon}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
                  {t('checkout.paymentMethod')}
                </FormLabel>
                <Select
                  placeholder={t('checkout.selectPaymentMethod')}
                  focusBorderColor="secondary.500"
                  bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                  borderWidth="2px"
                  borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.300'}
                  onChange={(e) => {
                    console.log('💳 Payment method changed:', e.target.value)
                    setPaymentMethod(e.target.value)
                  }}
                  value={paymentMethod}
                  size="md"
                  _hover={{
                    borderColor: colorMode === 'dark' ? 'gray.400' : 'brand.400'
                  }}
                >
                  <option value={PAYMENT_METHODS.CASH}>
                    {t('checkout.cashAtRestaurant') || 'Cash at Restaurant'}
                  </option>
                  <option value={PAYMENT_METHODS.CREDIT_CARD} disabled>
                    {t('checkout.creditCard') || 'Credit Card'} ({t('checkout.comingSoon') || 'Coming Soon'})
                  </option>
                  <option value={PAYMENT_METHODS.PAYPAL} disabled>
                    {t('checkout.paypal') || 'PayPal'} ({t('checkout.comingSoon') || 'Coming Soon'})
                  </option>
                  <option value={PAYMENT_METHODS.APPLE_PAY} disabled>
                    {t('checkout.applePay') || 'Apple Pay'} ({t('checkout.comingSoon') || 'Coming Soon'})
                  </option>
                  <option value={PAYMENT_METHODS.GOOGLE_PAY} disabled>
                    {t('checkout.googlePay') || 'Google Pay'} ({t('checkout.comingSoon') || 'Coming Soon'})
                  </option>
                </Select>
                
                <Text fontSize="xs" color="gray.500" mt={2}>
                  {t('checkout.paymentMethodInfo') || 'Currently only cash payments at the restaurant are available. Online payments coming soon.'}
                </Text>
              </FormControl>

              <PaymentMethodInputs paymentMethod={paymentMethod} t={t} colorMode={colorMode} />
            </VStack>
          </Section>

          {/* Subscription Summary Section */}
          <Section title={t('checkout.subscriptionSummary')} bgColor="brand" icon={orderIcon}>
            <SubscriptionSummary />
            <Button
              colorScheme="brand"
              size="md"
              width="full"
              onClick={handleOpenConfirmation}
              isLoading={isSubmitting}
              loadingText={t('checkout.processing')}
              isDisabled={!userAddresses || !isSubscriptionValid}
              mt={5}
              borderRadius="md"
              fontWeight="500"
              variant="solid"
              _hover={{
                transform: 'translateY(-1px)',
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition="all 0.2s"
            >
              {t('checkout.completeSubscription')}
            </Button>
          </Section>
        </SimpleGrid>

        {/* Confirmation Modal */}
        {isConfirmationOpen && (
          <ConfirmPlanModal
            isOpen={isConfirmationOpen}
            onClose={onCloseConfirmation}
            selectedMeals={selectedMealObjects}  
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
        )}
      </Container>
    </Box>
  )
}

export default CheckoutPlan