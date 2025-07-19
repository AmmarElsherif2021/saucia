import { useMemo } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Divider, 
  VStack, 
  HStack, 
  Badge,
  Flex,
  Alert,
  AlertIcon,
  Button
} from '@chakra-ui/react';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { useTranslation } from 'react-i18next';
import { useI18nContext } from '../../Contexts/I18nContext';

// Term Selection Button Component
const TermButton = ({ term, pricing, isSelected, isDisabled, onClick, t }) => {
  return (
    <Button
      onClick={() => onClick(term)}
      isDisabled={isDisabled}
      variant={isSelected ? "solid" : "outline"}
      colorScheme={isSelected ? "teal" : "gray"}
      size="lg"
      minW="160px"
      h="auto"
      py={4}
      px={6}
      flexDirection="column"
      gap={2}
      _hover={{
        transform: isDisabled ? 'none' : 'translateY(-2px)',
        boxShadow: isDisabled ? 'none' : 'lg'
      }}
      _active={{
        transform: isDisabled ? 'none' : 'translateY(0)'
      }}
      transition="all 0.2s"
      opacity={isDisabled ? 0.5 : 1}
    >
      <Text fontSize="md" fontWeight="bold">
        {term === 'short' ? (t('premium.shortTerm') || 'Short Term') : (t('premium.mediumTerm') || 'Medium Term')}
      </Text>
      <Text fontSize="sm" color={isSelected ? "white" : "gray.600"}>
        {pricing.meals} {t('premium.meals') || 'meals'}
      </Text>
      <Text fontSize="sm" fontWeight="medium" color={isSelected ? "white" : "teal.600"}>
        {`${pricing.totalPrice.toFixed(2)} ${t('common.currency') || 'SAR'}`}
      </Text>
    </Button>
  );
};

const SubscriptionSummary = ({ onDataChange }) => {
  const { 
    subscriptionData, 
    setSubscriptionTerm,
    chosenPlan
  } = useChosenPlanContext();

  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';

  // Calculate pricing options based on chosen plan
  const pricingOptions = useMemo(() => {
    if (!chosenPlan) return { short: null, medium: null };

    const basePricePerMeal = chosenPlan.price_per_meal || 0;
    
    return {
      short: {
        meals: chosenPlan.short_term_meals || 0,
        pricePerMeal: chosenPlan.short_term_price || basePricePerMeal,
        totalPrice: (chosenPlan.short_term_price || basePricePerMeal) * (chosenPlan.short_term_meals || 0),
        available: (chosenPlan.short_term_meals || 0) > 0
      },
      medium: {
        meals: chosenPlan.medium_term_meals || 0,
        pricePerMeal: chosenPlan.medium_term_price || basePricePerMeal,
        totalPrice: (chosenPlan.medium_term_price || basePricePerMeal) * (chosenPlan.medium_term_meals || 0),
        available: (chosenPlan.medium_term_meals || 0) > 0
      }
    };
  }, [chosenPlan]);

  // Get current selected term pricing for display
  const selectedTermPricing = useMemo(() => {
    if (!subscriptionData.selected_term || !pricingOptions[subscriptionData.selected_term]) {
      return null;
    }
    return pricingOptions[subscriptionData.selected_term];
  }, [subscriptionData.selected_term, pricingOptions]);

  // Calculate remaining meals
  const remainingMeals = useMemo(() => {
    return Math.max(0, (subscriptionData.total_meals || 0) - (subscriptionData.consumed_meals || 0));
  }, [subscriptionData.total_meals, subscriptionData.consumed_meals]);

  // Early return if no plan selected
  if (!chosenPlan) {
    return (
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg="gray.50"
        textAlign="center"
      >
        <Text color="gray.600" fontSize="lg">
          {t('premium.selectPlanToSeeDetails') || 'Select a plan to see details'}
        </Text>
      </Box>
    );
  }

  // Helper functions
  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} ${t('common.currency') || 'SAR'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      isArabic ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  };

  const getStatusColorScheme = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'paused': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Direct context update on term change
  const handleTermChange = (term) => {
    setSubscriptionTerm(term);
    
    // Notify parent component if callback provided
    if (onDataChange) {
      // Get the updated pricing for the selected term
      const updatedPricing = pricingOptions[term];
      if (updatedPricing) {
        const startDate = subscriptionData.start_date || new Date().toISOString().split('T')[0];
        const durationDays = term === 'short' 
          ? (chosenPlan.duration_days || 30)
          : (chosenPlan.duration_days || 30) * 2;
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + durationDays);

        onDataChange({
          ...subscriptionData,
          selected_term: term,
          total_meals: updatedPricing.meals,
          price_per_meal: updatedPricing.pricePerMeal,
          start_date: startDate,
          end_date: endDate.toISOString().split('T')[0]
        });
      }
    }
  };

  return (
    <Box 
      p={6} 
      borderWidth="1px" 
      borderRadius="lg" 
      bg="white" 
      boxShadow="md"
    >  
      <VStack spacing={6} align="stretch">
        {/* Plan Header */}
        <Box>
          <Heading size="lg" mb={2} color="brand.600">
            {t('premium.subscriptionSummary') || 'Subscription Summary'}
          </Heading>
          <Text fontWeight="bold" fontSize="xl" color="teal.600">
            {isArabic ? chosenPlan.title_arabic : chosenPlan.title}
          </Text>
          {chosenPlan.description && (
            <Text fontSize="md" color="gray.600" mt={2}>
              {isArabic ? chosenPlan.description_arabic : chosenPlan.description}
            </Text>
          )}
        </Box>

        {/* Nutritional Information */}
        <Box>
          <Text fontWeight="semibold" mb={3} fontSize="md">
            {t('premium.nutritionalInformation') || 'Nutritional Information'}
          </Text>
          <Flex gap={3} flexWrap="wrap">
            <Badge colorScheme="green" variant="solid" fontSize="sm" px={3} py={1}>
              {chosenPlan.kcal} {t('premium.kcal') || 'kcal'}
            </Badge>
            <Badge colorScheme="blue" variant="solid" fontSize="sm" px={3} py={1}>
              {chosenPlan.protein}g {t('premium.protein') || 'protein'}
            </Badge>
            <Badge colorScheme="orange" variant="solid" fontSize="sm" px={3} py={1}>
              {chosenPlan.carb}g {t('premium.carbs') || 'carbs'}
            </Badge>
            {chosenPlan.fat && (
              <Badge colorScheme="purple" variant="solid" fontSize="sm" px={3} py={1}>
                {chosenPlan.fat}g {t('premium.fat') || 'fat'}
              </Badge>
            )}
          </Flex>
        </Box>
        
        {/* Subscription Term Selection */}
        <Box>
          <Text fontWeight="semibold" mb={4} fontSize="md">
            {t('premium.subscriptionTerm') || 'Subscription Term'}
          </Text>
          <HStack spacing={4} justify="center">
            <TermButton
              term="short"
              pricing={pricingOptions.short}
              isSelected={subscriptionData.selected_term === 'short'}
              isDisabled={!pricingOptions.short.available}
              onClick={handleTermChange}
              t={t}
            />
            <TermButton
              term="medium"
              pricing={pricingOptions.medium}
              isSelected={subscriptionData.selected_term === 'medium'}
              isDisabled={!pricingOptions.medium.available}
              onClick={handleTermChange}
              t={t}
            />
          </HStack>
        </Box>

        {/* Only show details if term is selected */}
        {selectedTermPricing && (
          <>
            {/* Subscription Details */}
            <Box>
              <Text fontWeight="semibold" mb={3} fontSize="md">
                {t('premium.subscriptionDetails') || 'Subscription Details'}
              </Text>
              <VStack spacing={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="md">{t('premium.pricePerMeal') || 'Price per meal'}:</Text>
                  <Text fontSize="md" fontWeight="bold" color="teal.600">
                    {formatCurrency(selectedTermPricing.pricePerMeal)}
                  </Text>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fontSize="md">{t('premium.totalMeals') || 'Total meals'}:</Text>
                  <Text fontSize="md" fontWeight="bold">
                    {selectedTermPricing.meals} {t('premium.meals') || 'meals'}
                  </Text>
                </Flex>

                <Flex justify="space-between" align="center">
                  <Text fontSize="md">{t('premium.totalPrice') || 'Total price'}:</Text>
                  <Text fontWeight="bold" fontSize="2xl" color="teal.600">
                    {formatCurrency(selectedTermPricing.totalPrice)}
                  </Text>
                </Flex>
                
                {subscriptionData.consumed_meals > 0 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="md">{t('premium.consumedMeals') || 'Consumed meals'}:</Text>
                    <Text fontSize="md" fontWeight="medium" color="orange.600">
                      {subscriptionData.consumed_meals} {t('premium.meals') || 'meals'}
                    </Text>
                  </Flex>
                )}
                
                {remainingMeals > 0 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="md">{t('premium.remainingMeals') || 'Remaining meals'}:</Text>
                    <Text fontSize="md" fontWeight="bold" color="green.600">
                      {remainingMeals} {t('premium.meals') || 'meals'}
                    </Text>
                  </Flex>
                )}
                
                {subscriptionData.start_date && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="md">{t('premium.startDate') || 'Start date'}:</Text>
                    <Text fontSize="md" fontWeight="medium">
                      {formatDate(subscriptionData.start_date)}
                    </Text>
                  </Flex>
                )}
                
                {subscriptionData.end_date && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize="md">{t('premium.endDate') || 'End date'}:</Text>
                    <Text fontSize="md" fontWeight="medium">
                      {formatDate(subscriptionData.end_date)}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Total Price Highlight */}
            <Box bg="teal.50" p={5} borderRadius="lg" border="2px solid" borderColor="teal.200">
              <HStack justify="space-between" w="full">
                <Text fontWeight="bold" fontSize="xl">
                  {t('premium.totalPrice') || 'Total Price'}:
                </Text>
                <Text fontWeight="bold" fontSize="2xl" color="teal.600">
                  {formatCurrency(selectedTermPricing.totalPrice)}
                </Text>
              </HStack>
            </Box>
          </>
        )}

        {/* Status and Additional Info */}
        {subscriptionData.status && (
          <HStack justify="space-between" align="center">
            <Text fontSize="md" color="gray.600">
              {t('premium.status') || 'Status'}:
            </Text>
            <Badge 
              colorScheme={getStatusColorScheme(subscriptionData.status)}
              variant="solid"
              fontSize="sm"
            >
              {t(`premium.status.${subscriptionData.status}`) || subscriptionData.status}
            </Badge>
          </HStack>
        )}

        {/* Pause Information */}
        {subscriptionData.is_paused && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontSize="sm" fontWeight="medium">
                {t('premium.subscriptionPaused') || 'Subscription is paused'}
              </Text>
              {subscriptionData.resume_date && (
                <Text fontSize="xs" mt={1}>
                  {t('premium.resumeDate') || 'Resume date'}: {formatDate(subscriptionData.resume_date)}
                </Text>
              )}
            </Box>
          </Alert>
        )}

        {/* Validation Alert */}
        {!subscriptionData.selected_term && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              {t('premium.selectTermToSeeDetails') || 'Select a subscription term to see details'}
            </Text>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default SubscriptionSummary;