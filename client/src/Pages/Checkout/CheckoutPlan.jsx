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
  Icon,
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
      validDays++;
    }
  }
  return date;
}

// Enhanced Section Component with clean outlined design
const Section = ({ title, children, bgColor = 'brand', titleColor, icon, isLoading = false }) => {
  const { colorMode } = useColorMode()
  const theme = useTheme()
  const padding = useBreakpointValue({ base: 4, md: 5 })
  const borderRadius = useBreakpointValue({ base: 'lg', md: 'xl' })

  // Method 1: Use useColorModeValue for proper color resolution (Recommended)
  const cardBg = useColorModeValue(`${bgColor}.200`, 'gray.700')
  const cardBorder = useColorModeValue(`${bgColor}.400`, 'gray.600')
  const iconBg = useColorModeValue(`${bgColor}.100`, 'gray.600')
  const iconBorder = useColorModeValue(`${bgColor}.200`, 'gray.500')
  const headingColor = titleColor || useColorModeValue(`${bgColor}.700`, 'white')

  // Method 2: Alternative using theme object (for more control)
  const getColor = (colorKey, shade) => {
    try {
      return theme.colors[colorKey]?.[shade] || `${colorKey}.${shade}`
    } catch (e) {
      return `${colorKey}.${shade}`
    }
  }

  // Method 3: Manual color resolution function
  const resolveColor = (colorString) => {
    const [colorName, shade] = colorString.split('.')
    return theme.colors[colorName]?.[shade] || colorString
  }
  
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
// Enhanced Payment Method Inputs Component with clean styling
const PaymentMethodInputs = ({ paymentMethod, t, colorMode }) => {
  const inputProps = useMemo(() => ({
    variant: "outline",
    bg: colorMode === 'dark' ? 'gray.700' : 'white',
    borderWidth: "2px",
    borderColor: colorMode === 'dark' ? 'gray.500' : 'brand.300',
    focusBorderColor: "brand.500",
    _hover: {
      borderColor: colorMode === 'dark' ? 'gray.400' : 'brand.400'
    },
    _focus: {
      bg: 'transparent',
      borderColor: 'brand.500',
    }
  }), [colorMode]);

  switch (paymentMethod) {
    case 'credit-card':
      return (
        <Stack spacing={4} maxW={{ base: "100%", md: "90%" }}>
          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }} fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
              {t('checkout.cardNumber')}
            </FormLabel>
            <Input
              placeholder={t('checkout.cardNumberPlaceholder')}
              maxLength={19}
              {...inputProps}
            />
          </FormControl>

          <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }} fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
                {t('checkout.expiryDate')}
              </FormLabel>
              <Input
                placeholder={t('checkout.expiryDatePlaceholder')}
                maxLength={5}
                {...inputProps}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }} fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
                CVV
              </FormLabel>
              <Input 
                placeholder="123" 
                maxLength={3} 
                type="password"
                {...inputProps}
              />
            </FormControl>
          </Flex>

          <FormControl>
            <FormLabel fontSize={{ base: "sm", md: "md" }} fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'brand.700'}>
              {t('checkout.nameOnCard')}
            </FormLabel>
            <Input 
              placeholder={t('checkout.cardholderNamePlaceholder')}
              {...inputProps}
            />
          </FormControl>

          <Box
            p={3}
            borderRadius="md"
            bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
            border="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
          >
            <Checkbox colorScheme="brand" fontSize={{ base: "sm", md: "md" }}>
              {t('checkout.saveThisCardForFuturePayments')}
            </Checkbox>
          </Box>
        </Stack>
      )

    case 'paypal':
      return (
        <VStack spacing={4} align="stretch" maxW={{ base: "100%", md: "90%" }}>
          <Alert 
            status="info" 
            borderRadius="md" 
            bg="blue.50" 
            borderColor="blue.200"
            borderWidth="1px"
            variant="subtle"
          >
            <AlertIcon color="blue.500" />
            <Text fontSize={{ base: "sm", md: "md" }} color="blue.700">
              {t('checkout.paypalRedirectMessage')}
            </Text>
          </Alert>
          <Button 
            colorScheme="blue" 
            leftIcon={<Text fontWeight="bold">PayPal</Text>} 
            width="full"
            size="md"
            borderRadius="md"
            variant="outline"
          >
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
          <Alert 
            status="info" 
            borderRadius="md"
            bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
            borderColor={colorMode === 'dark' ? 'gray.500' : 'gray.200'}
            borderWidth="1px"
            variant="subtle"
          >
            <AlertIcon />
            <Text fontSize={{ base: "sm", md: "md" }}>
              {t('checkout.completePaymentWith', { method: methodName })}
            </Text>
          </Alert>
          <Button 
            colorScheme={isApplePay ? 'blackAlpha' : 'brand'} 
            width="full"
            size="md"
            borderRadius="md"
            variant="outline"
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
    lg: 2,
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

        <SimpleGrid
          columns={gridColumns} 
          spacing={6}
          gap={6}
        >
          {/* Billing Information */}
          <Section title={t('checkout.billingInformation')} bgColor="teal" icon={saladIcon}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'brand.700'}>
                  {t('checkout.fullName')}
                </FormLabel>
                <Input
                  borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.300'}
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
                  borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.300'}
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
                  borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.300'}
                  {...inputProps}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'gray.200' : 'brand.700'}>
                  {t('checkout.deliveryAddress')}
                </FormLabel>
                <Flex 
                  alignItems="stretch" 
                  gap={3}
                  width="100%"
                >
                  <Input
                    placeholder={t('checkout.enterDeliveryAddress')}
                    flex="1"
                    value={billingInfo.deliveryAddress}
                    onChange={handleAddressInputChange}
                    borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.300'}
                    {...inputProps}
                  />
                  <Button 
                    onClick={onOpenMap}
                    size="md"
                    minW="50px"
                    bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
                    border="2px solid"
                    borderColor={colorMode === 'dark' ? 'gray.500' : 'gray.300'}
                    _hover={{
                      bg: colorMode === 'dark' ? 'gray.500' : 'gray.100'
                    }}
                  >
                    <Image src={locationPin} alt="Location Pin" boxSize="20px" />
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

              <Box
                p={3}
                borderRadius="md"
                bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
                border="1px solid"
                borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
              >
                <Checkbox 
                  colorScheme="brand" 
                  fontSize="sm"
                >
                  {t('checkout.sendMePlanUpdatesAndNotifications')}
                </Checkbox>
              </Box>
            </Stack>
          </Section>

          {/* Payment Details */}
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
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  value={paymentMethod}
                  size="md"
                  _hover={{
                    borderColor: colorMode === 'dark' ? 'gray.400' : 'brand.400'
                  }}
                >
                  <option value="credit-card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="apple-pay">Apple Pay</option>
                  <option value="google-pay">Google Pay</option>
                </Select>
              </FormControl>

              <PaymentMethodInputs paymentMethod={paymentMethod} t={t} colorMode={colorMode} />
            </VStack>
          </Section>

          {/* Subscription Summary */}
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
      </Container>
    </Box>
  )
}

export default CheckoutPlan