import { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useI18nContext } from '../../Contexts/I18nContext';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../Contexts/UserContext';
import { updateUserProfile } from '../../API/users';
import { useElements } from '../../Contexts/ElementsContext';
import { MealCard } from './MealCard';
import ConfirmPlanModal from './ConfirmPlanModal';
import CustomizableMealSelectionModal from './CustomizableMealSelectionModal';

// Import icons
import paymentIcon from '../../assets/payment.svg';
import orderIcon from '../../assets/order.svg';
import saladIcon from '../../assets/menu/salad.svg';

// Reusable Section Component with responsive improvements
const Section = ({ title, children, bgColor, titleColor, icon }) => {
  const { colorMode } = useColorMode();
  const padding = useBreakpointValue({ base: 4, md: 6 });
  
  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.700' : `${bgColor}.300`}
      borderRadius="45px"
      borderWidth="7px"
      p={padding}
      position="relative"
      overflow="hidden"
      boxShadow="sm"
      height="100%"
      maxHeight="95vh"
      minHeight="85vh"
      my={20}
    >
      <Box position="relative" zIndex="1" >
        <Flex align="center" mb={5}>
          {icon && <Box as="img" src={icon} alt={`${title} icon`} boxSize="48px" mr={2} />}
          <Heading size="md" color={titleColor || 'gray.800'}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  );
};

// Reusable PlanSummary Component
const PlanSummary = ({ plan, period, setPeriod, t }) => {
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';
  
  if (!plan) return <Text>{t('noPlanSelected')}</Text>;

  return (
    <Box>
      <Flex alignItems="center" mb={4}>
        <Image src={plan.image} alt={plan.title} boxSize="60px" borderRadius="md" mr={4} />
        <Box>
          <Heading as="h3" size="sm">
            {isArabic ? plan.title_arabic : plan.title}
          </Heading>
        </Box>
      </Flex>

      <Divider mb={4} />

      <Stack spacing={2}>
        <Flex justify="space-between" align="center">
          <Text fontSize="sm">{t('nutritionalInformation')}:</Text>
          <Flex wrap="wrap" gap={1}>
            <Badge colorScheme="green">{t('kcal')}: {plan.kcal}</Badge>
            <Badge colorScheme="brand">{t('carbs')}: {plan.carb}g</Badge>
            <Badge colorScheme="red">{t('protein')}: {plan.protein}g</Badge>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center">
          <Text fontSize="sm">{t('subscriptionPeriod')}:</Text>
          <Select
            size="sm"
            width="140px"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            focusBorderColor="brand.500"
          >
            {plan.periods?.map((periodOption, index) => (
              <option key={index} value={periodOption}>
                {periodOption} {t('days')}
              </option>
            ))}
          </Select>
        </Flex>
      </Stack>
    </Box>
  );
};

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
              variant="outline"
              maxLength={19}
            />
          </FormControl>

          <Flex gap={4} direction={{ base: 'column', sm: 'row' }}>
            <FormControl>
              <FormLabel fontSize="sm">{t('checkout.expiryDate')}</FormLabel>
              <Input
                placeholder={t('checkout.expiryDatePlaceholder')}
                variant="outline"
                maxLength={5}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">CVV</FormLabel>
              <Input placeholder="123" variant="outline" maxLength={3} type="password" />
            </FormControl>
          </Flex>

          <FormControl>
            <FormLabel fontSize="sm">{t('checkout.nameOnCard')}</FormLabel>
            <Input placeholder={t('checkout.cardholderNamePlaceholder')} variant="outline" />
          </FormControl>

          <Checkbox colorScheme="brand" mt={2}>
            {t('checkout.saveThisCardForFuturePayments')}
          </Checkbox>
        </Stack>
      );
    
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
      );
    
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
          <Button
            colorScheme={paymentMethod === 'apple-pay' ? 'blackAlpha' : 'brand'}
            width="full"
          >
            {t('checkout.payWith', {
              method: paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay',
            })}
          </Button>
        </VStack>
      );
    
    default:
      return null;
  }
};

// Date calculation utilities
const calculateDeliveryDate = (startDate, mealIndex) => {
  let date = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded <= mealIndex) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 5 && date.getDay() !== 6) {
      daysAdded++;
    }
  }

  return date;
};

const calculateEndDate = (startDate, daysToAdd) => {
  let result = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < daysToAdd) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 5 && result.getDay() !== 6) {
      daysAdded++;
    }
  }

  return result;
};

const CheckoutPlan = () => {
  // Hooks and context
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { user, userPlan, setUser } = useUser();
  const { saladItems, signatureSalads } = useElements();
  const toast = useToast();
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [period, setPeriod] = useState(12);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [customizedSalad, setCustomizedSalad] = useState(null);

  // Modal controls
  const {
    isOpen: isConfirmationOpen,
    onOpen: onOpenConfirmation,
    onClose: onCloseConfirmation,
  } = useDisclosure();

  const {
    isOpen: isMealSelectionOpen,
    onOpen: onOpenMealSelection,
    onClose: onCloseMealSelection,
  } = useDisclosure();

  // Constants
  const today = new Date();
  const startDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const endDate = calculateEndDate(today, period);
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subscriptionPrice = 49.99;
  const discount = 10.0;
  const totalPrice = subscriptionPrice - discount;

  // Event handlers
  const handleOpenConfirmation = () => {
    if (!paymentMethod) {
      toast({
        title: t('checkout.paymentMethodRequired'),
        description: t('checkout.pleaseSelectPaymentMethod'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUser(prev => ({
      ...prev,
      subscription: {
        planId: userPlan?.id || 'premium-plan',
        planName: userPlan?.title || 'Premium Plan',
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        paymentMethod,
        price: totalPrice,
        mealsCount: period,
        consumedMeals: 0,
        meals: customizedSalad
          ? [customizedSalad]
          : selectedMeals.length > 0
            ? selectedMeals
            : signatureSalads.slice(0, 10),
      },
    }));
    onOpenConfirmation();
  };

  const handleSelectMeals = () => onOpenMealSelection();

  const handleConfirmCustomizedSalad = (selectedItems) => {
    const selectedItemIds = Object.keys(selectedItems);
    const items = saladItems.filter((item) => selectedItemIds.includes(item.id));

    setCustomizedSalad({
      id: 'custom-salad-' + Date.now(),
      name: t('checkout.customSalad'),
      name_arabic: t('checkout.customSalad', { lng: 'ar' }),
      calories: items.reduce((sum, item) => sum + (item.calories || 0), 0),
      price: items.reduce((sum, item) => sum + (item.price || 0), 0),
      items,
      isCustom: true,
    });
    onCloseMealSelection();
  };

  const handleAddSignatureSalad = (meal) => {
    setSelectedMeals((prev) => [...prev, meal]);
  };

  const handleRemoveMeal = (index) => {
    setSelectedMeals((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmSubscription = async () => {
    setIsSubmitting(true);
    onCloseConfirmation();

    try {
      if (!user?.uid) throw new Error('User not authenticated');

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
          consumedMeals: 0,
          meals: customizedSalad
            ? [customizedSalad]
            : selectedMeals.length > 0
              ? selectedMeals
              : signatureSalads.slice(0, 10),
        },
      };

      await updateUserProfile(user.uid, subscriptionData);
      setUser(prev => ({
        ...prev,
        subscription: subscriptionData.subscription,
      }));

      toast({
        title: t('checkout.subscriptionSuccessful'),
        description: t('checkout.premiumPlanActive'),
        status: 'success',
        duration: 5000,
        isClosable: true,
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
        isClosable: true,
      });
    }
  };

  // Responsive grid columns
  const gridColumns = useBreakpointValue({ base: 1, md: 3 });

  return (
    <Box p={{ base: 4, md: 6 }} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} minHeight="100vh">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.500">
          {t('checkout.completeYourSubscription')}
        </Heading>

        {!userPlan && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            {t('checkout.noPlanSelected')}
          </Alert>
        )}

        <SimpleGrid columns={gridColumns} spacing={6} >
          {/* Billing Information */}
          <Section
            title={t('checkout.billingInformation')}
            bgColor="brand"
            titleColor="gray.800"
            icon={saladIcon}
          >
            <Stack spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">{t('checkout.fullName')}</FormLabel>
                <Input
                  placeholder={t('checkout.enterYourFullName')}
                  variant="outline"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                  maxW={"85%"}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">{t('checkout.emailAddress')}</FormLabel>
                <Input
                  type="email"
                  maxW={"85%"}
                  placeholder={t('checkout.yourEmailAddress')}
                  variant="outline"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">{t('checkout.phoneNumber')}</FormLabel>
                <Input
                  placeholder={t('checkout.yourPhoneNumber')}
                  variant="outline"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                  maxW={"85%"}
                />
              </FormControl>

              <Checkbox colorScheme="brand" mt={2}>
                {t('checkout.sendMePlanUpdatesAndNotifications')}
              </Checkbox>
            </Stack>
          </Section>

          {/* Payment Details */}
          <Section title={t('checkout.paymentDetails')} bgColor="warning" icon={paymentIcon}>
            <FormControl mb={4}>
              <FormLabel fontSize="sm">Payment Method</FormLabel>
              <Select
                placeholder="Select payment method"
                focusBorderColor="warning.500"
                bg={colorMode === 'dark' ? 'gray.800' : 'warning.100'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="credit-card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="apple-pay">Apple Pay</option>
                <option value="google-pay">Google Pay</option>
              </Select>
            </FormControl>

            <PaymentMethodInputs 
              paymentMethod={paymentMethod} 
              t={t} 
              colorMode={colorMode} 
            />
          </Section>

          {/* Subscription Summary */}
          <Section title={t('checkout.subscriptionSummary')} bgColor="accent" icon={orderIcon}>
            <Box mb={4}>
              <PlanSummary plan={userPlan} period={period} setPeriod={setPeriod} t={t} />
            </Box>

            <Divider mb={4} />

            <Flex justify="space-between" mb={2}>
              <Text>{t('checkout.monthlySubscription')}</Text>
              <Text fontWeight="bold">${subscriptionPrice.toFixed(2)}</Text>
            </Flex>

            <Flex justify="space-between" mb={2}>
              <Text>{t('checkout.newSubscriberDiscount')}</Text>
              <Text fontWeight="bold" color="green.500">
                -${discount.toFixed(2)}
              </Text>
            </Flex>

            <Divider my={3} />

            <Flex justify="space-between" mb={4}>
              <Text fontWeight="bold">{t('checkout.totalToday')}</Text>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">
                ${totalPrice.toFixed(2)}
              </Text>
            </Flex>

            <Text fontSize="sm" color="gray.600" mb={4}>
              {t('checkout.subscriptionTerms')}
            </Text>

            <Button
              colorScheme="brand"
              size="lg"
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
  );
};

export default CheckoutPlan;