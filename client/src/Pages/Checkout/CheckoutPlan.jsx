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
} from '@chakra-ui/react'
//import MapModal from './MapModal'
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
import { useUserProfile, useUserAddresses } from '../../Hooks/userHooks'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext'

//Map
const MapModal = lazy(() => import('./MapModal'));
// Date calculation utilities - moved outside component for better performance
const calculateDeliveryDate = (startDate, mealIndex) => {
  const date = new Date(startDate);
  let validDays = 0;
  
  // Check if start date is a valid delivery day
  const startDayOfWeek = date.getDay();
  if (startDayOfWeek !== 5 && startDayOfWeek !== 6) {
    validDays = 1; // Start date counts as the first valid day
  }
  
  while (validDays <= mealIndex) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    
    // Skip Fridays (5) and Saturdays (6)
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      ////console.log(`Day calculated ${dayOfWeek}`)
      validDays++;
    }
  }
  return date;
}

// Memoized Section Component
const Section = ({ title, children, bgColor, titleColor, icon }) => {
  const { colorMode } = useColorMode()
  const padding = useBreakpointValue({ base: 3, md: 6 })
  const borderRadius = useBreakpointValue({ base: '25px', md: '45px' })

  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.700' : `${bgColor}.300`}
      borderWidth="3px"
      borderColor={colorMode === 'dark' ? 'gray.600' : `${bgColor}.500`}
      position="relative"
      overflow="hidden"
      height="100%"
      borderRadius={borderRadius}
      p={padding}
      minHeight={{ base: 'auto', md: '85vh' }}
      my={{ base: 4, md: 20 }}
    >
      <Box position="relative" zIndex="1">
        <Flex align="center" mb={5}>
          {icon && (
            <Box
              as="img"
              src={icon}
              alt={`${title} icon`}
              boxSize={{ base: "32px", md: "48px" }}
              mx={2}
              borderRadius="50%"
              p={1}
              bg="whiteAlpha.900"
            />
          )}
          <Heading 
            size={{ base: "sm", md: "md" }} 
            color={titleColor || 'brand.900'}
          >
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  )
}

// Memoized Payment Method Inputs Component
const PaymentMethodInputs = ({ paymentMethod, t, colorMode }) => {
  const inputProps = useMemo(() => ({
    variant: "ghost",
    bg: colorMode === 'dark' ? 'gray.800' : 'brand.200',
    focusBorderColor: "brand.500"
  }), [colorMode]);

  switch (paymentMethod) {
    case 'credit-card':
      return (
        <Stack spacing={3} maxW={{ base: "100%", md: "90%" }}>
          <FormControl>
            <FormLabel fontSize={{ base: "xs", md: "sm" }}>{t('checkout.cardNumber')}</FormLabel>
            <Input
              placeholder={t('checkout.cardNumberPlaceholder')}
              maxLength={19}
              {...inputProps}
            />
          </FormControl>

          <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl>
              <FormLabel fontSize={{ base: "xs", md: "sm" }}>{t('checkout.expiryDate')}</FormLabel>
              <Input
                placeholder={t('checkout.expiryDatePlaceholder')}
                maxLength={5}
                {...inputProps}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize={{ base: "xs", md: "sm" }}>CVV</FormLabel>
              <Input 
                placeholder="123" 
                maxLength={3} 
                type="password"
                {...inputProps}
              />
            </FormControl>
          </Flex>

          <FormControl>
            <FormLabel fontSize={{ base: "xs", md: "sm" }}>{t('checkout.nameOnCard')}</FormLabel>
            <Input 
              placeholder={t('checkout.cardholderNamePlaceholder')}
              {...inputProps}
            />
          </FormControl>

          <Checkbox colorScheme="brand" mt={2} fontSize={{ base: "sm", md: "md" }}>
            {t('checkout.saveThisCardForFuturePayments')}
          </Checkbox>
        </Stack>
      )

    case 'paypal':
      return (
        <VStack spacing={4} align="stretch" maxW={{ base: "100%", md: "90%" }}>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize={{ base: "sm", md: "md" }}>
              {t('checkout.paypalRedirectMessage')}
            </Text>
          </Alert>
          <Button colorScheme="brand" leftIcon={<Text>PayPal</Text>} width="full">
            {t('checkout.continueWithPayPal')}
          </Button>
        </VStack>
      )

    case 'apple-pay':
    case 'google-pay':
      const isApplePay = paymentMethod === 'apple-pay';
      const methodName = isApplePay ? 'Apple Pay' : 'Google Pay';
      
      return (
        <VStack spacing={4} align="stretch" maxW={{ base: "100%", md: "90%" }}>
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize={{ base: "sm", md: "md" }}>
              {t('checkout.completePaymentWith', { method: methodName })}
            </Text>
          </Alert>
          <Button 
            colorScheme={isApplePay ? 'blackAlpha' : 'brand'} 
            width="full"
            size={{ base: "md", md: "lg" }}
          >
            {t('checkout.payWith', { method: methodName })}
          </Button>
        </VStack>
      )

    default:
      return null
  }
}

const CheckoutPlan = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL CALLS
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
  const { t } = useTranslation();
  
  // Responsive breakpoint hooks
  const gridColumns = useBreakpointValue({ 
    base: 1, 
    sm: 1, 
    md: 2, 
    lg: 3,
    xl: 3 
  })
  const { currentLanguage } = useI18nContext()
  
  // Fetch user profile and addresses
  const { createSubscription } = useUserSubscriptions();
  const { data: profile } = useUserProfile();
  const { 
    addresses: userAddresses, 
    isLoading: isLoadingAddresses 
  } = useUserAddresses();

  // Modal controls
  const {
    isOpen: isConfirmationOpen,
    onOpen: onOpenConfirmation,
    onClose: onCloseConfirmation,
  } = useDisclosure()
  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()

  // Local state
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    deliveryAddress: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Memoized default address
  const defaultAddress = useMemo(() => 
    userAddresses?.find(addr => addr.is_default) || userAddresses?.[0],
    [userAddresses]
  );

  // Memoized initial billing info
  const initialBillingInfo = useMemo(() => ({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    deliveryAddress: defaultAddress?.display_name || user?.defaultAddress || '',
  }), [user, defaultAddress]);

  // Memoized date calculations
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
      // Calculate end date as delivery date of last meal
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

    return { 
      today, 
      startDate, 
      endDate: endDateObj, 
      formattedEndDate 
    };
  }, [subscriptionData?.start_date, subscriptionData?.end_date, subscriptionData?.total_meals]);

  // Memoized selected meal objects
  const selectedMealObjects = useMemo(() => {
    return subscriptionData?.meals
      ?.map(id => signatureSalads?.find(meal => meal.id === id))
      .filter(Boolean) || [];
  }, [subscriptionData?.meals, signatureSalads]);

  // Memoized form input props
  const inputProps = useMemo(() => ({
    variant: "ghost",
    bg: colorMode === 'dark' ? 'gray.800' : 'brand.200',
    focusBorderColor: "brand.500",
    maxW: { base: '100%', md: '85%' },
    size: { base: 'sm', md: 'md' }
  }), [colorMode]);

  // Event handlers with useCallback for optimization
  const handleBillingInfoChange = useCallback((field, value) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenConfirmation = useCallback(() => {
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

    const { fullName, email, deliveryAddress } = billingInfo;
    if (!fullName || !email || !deliveryAddress) {
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
  }, [paymentMethod, billingInfo, toast, t, onOpenConfirmation]);

  const handleAddSignatureSalad = useCallback((mealId) => {
    addMeal(mealId);
  }, [addMeal]);

  const handleRemoveMeal = useCallback((mealId) => {
    removeMeal(mealId);
  }, [removeMeal]);

  const handleConfirmSubscription = useCallback(async () => {
    setIsSubmitting(true);
    onCloseConfirmation();

    try {
      if (!user?.id) throw new Error('User not authenticated');

      // Update subscription data with final details
      updateSubscriptionData({
        delivery_address_id: subscriptionData?.delivery_address_id,
        preferred_delivery_time: subscriptionData?.preferred_delivery_time,
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
  }, [user?.id, paymentMethod, subscriptionData, updateSubscriptionData, getSubscriptionPayload, createSubscription, toast, t, navigate, onCloseConfirmation]);

  const handleSelectLocation = useCallback((addressData) => {
    setBillingInfo(prev => ({ 
      ...prev, 
      deliveryAddress: addressData.display_name 
    }));
    updateSubscriptionData({
      delivery_address_id: addressData.id
    });
  }, [updateSubscriptionData]);
  
  const handleAddressInputChange = useCallback((e) => {
    handleBillingInfoChange('deliveryAddress', e.target.value);
  }, [handleBillingInfoChange]);

  // Initialize billing info with user data - optimized effect
  useEffect(() => {
    if (profile && userAddresses) {
      const defaultAddr = userAddresses.find(addr => addr.is_default) || userAddresses[0];
      
      setBillingInfo({
        fullName: profile.display_name || '',
        email: user?.email || '',
        phoneNumber: profile.phone_number || '',
        deliveryAddress: defaultAddr ? 
          (defaultAddr.display_name || `${defaultAddr.address_line1}, ${defaultAddr.city}`) : '',
      });
    }
  }, [profile, userAddresses, user?.email]);

  // Early return after all hooks have been called
  if (!subscriptionData) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading subscription data...</Text>
      </Box>
    );
  }

  return (
    <Box
      p={{ base: 2, sm: 3, md: 4, lg: 6 }}
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
      minHeight="100vh"
    >
      <SimpleGrid
        columns={gridColumns} 
        spacing={{ base: 3, md: 4 }}
        gap={{ base: 4, md: 6 }}
      >
        {/* Billing Information */}
        <Section title={t('checkout.billingInformation')} bgColor="teal" icon={saladIcon}>
          <Stack spacing={{ base: 3, md: 4 }}>
            <FormControl isRequired>
              <FormLabel fontSize={{ base: 'xs', sm: 'sm' }}>{t('checkout.fullName')}</FormLabel>
              <Input
                placeholder={t('checkout.enterYourFullName')}
                value={billingInfo.fullName}
                onChange={(e) => handleBillingInfoChange('fullName', e.target.value)}
                {...inputProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={{ base: 'xs', sm: 'sm' }}>{t('checkout.emailAddress')}</FormLabel>
              <Input
                type="email"
                placeholder={t('checkout.yourEmailAddress')}
                value={billingInfo.email}
                onChange={(e) => handleBillingInfoChange('email', e.target.value)}
                {...inputProps}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize={{ base: 'xs', sm: 'sm' }}>{t('checkout.phoneNumber')}</FormLabel>
              <Input
                placeholder={t('checkout.yourPhoneNumber')}
                value={billingInfo.phoneNumber}
                onChange={(e) => handleBillingInfoChange('phoneNumber', e.target.value)}
                {...inputProps}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={{ base: 'xs', sm: 'sm' }}>{t('checkout.deliveryAddress')}</FormLabel>
              <Flex 
                alignItems="center" 
                flexDirection={{ base: 'column', sm: 'row' }}
                gap={2}
                width="100%"
              >
                <Input
                  placeholder={t('checkout.enterDeliveryAddress')}
                  variant="outlined"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                  flex="1"
                  size={{ base: 'sm', md: 'md' }}
                  value={billingInfo.deliveryAddress}
                  onChange={handleAddressInputChange}
                />
                <Button 
                  onClick={onOpenMap}
                  size={{ base: 'sm', md: 'md' }}
                  minW={{ base: 'auto', sm: '60px' }}
                  p={{ base: 2, md: 3 }}
                >
                  <Image src={locationPin} alt="Location Pin" boxSize={{ base: "20px", md: "30px" }} />
                </Button>
              </Flex>
              
              <Suspense fallback={<div>Loading...</div>}>
                      <MapModal
                      isOpen={isMapOpen}
                      onClose={onCloseMap}
                      onSelectLocation={handleSelectLocation}
                    />
              </Suspense>
            </FormControl>

            <Checkbox 
              colorScheme="brand" 
              mt={2}
              fontSize={{ base: "sm", md: "md" }}
            >
              {t('checkout.sendMePlanUpdatesAndNotifications')}
            </Checkbox>
          </Stack>
        </Section>

        {/* Payment Details */}
        <Section title={t('checkout.paymentDetails')} bgColor="secondary" icon={paymentIcon}>
          <FormControl mb={4}>
            <FormLabel fontSize={{ base: 'xs', sm: 'sm' }}>{t('checkout.paymentMethod')}</FormLabel>
            <Select
              placeholder={t('checkout.selectPaymentMethod')}
              focusBorderColor="secondary.500"
              bg={colorMode === 'dark' ? 'gray.800' : 'secondary.100'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              size={{ base: 'sm', md: 'md' }}
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
        <Section title={t('checkout.subscriptionSummary')} bgColor="brand" icon={orderIcon}>
          <SubscriptionSummary />
          <Button
            colorScheme="brand"
            size={{ base: 'sm', md: 'md' }}
            width="full"
            onClick={handleOpenConfirmation}
            isLoading={isSubmitting}
            loadingText={t('checkout.processing')}
            isDisabled={!userAddresses || !isSubscriptionValid}
            mt={4}
          >
            {t('checkout.completeSubscription')}
          </Button>
        </Section>
      </SimpleGrid>

      {/* ConfirmPlanModal */}
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
    </Box>
  )
}

export default CheckoutPlan