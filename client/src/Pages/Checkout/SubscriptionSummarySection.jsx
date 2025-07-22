import DeliveryTimeSelector from './DeliveryTimeSelector';
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
  Button,
  useColorMode
} from '@chakra-ui/react';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { useTranslation } from 'react-i18next';
import { useI18nContext } from '../../Contexts/I18nContext';

// Enhanced Term Button Component with responsive sizing
const TermButton = ({ term, pricing, isSelected, isDisabled, onClick, t }) => {
  return (
    <Button
      onClick={() => onClick(term)}
      isDisabled={isDisabled}
      variant={isSelected ? "solid" : "outline"}
      colorScheme={isSelected ? "brand" : "gray"}
      size={{ base: 'md', md: 'lg', lg:'md' }}
      minW={{ base: '100%', sm: '110px', md: '120px' }}
      h="auto"
      py={{ base: 8, md: 6}}
      px={{ base: 1, md: 2 }}
      flexDirection="column"
      gap={1}
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
      <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">
        {term === 'short' ? (t('premium.shortTerm') || 'Short Term') : (t('premium.mediumTerm') || 'Medium Term')}
      </Text>
      <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" color={isSelected ? "white" : "teal.600"}>
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
  const {colorMode}=useColorMode();
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
        p={{ base: 4, md: 6 }} 
        borderWidth="1px" 
        borderRadius="lg" 
        bg="warning.50"
        textAlign="center"
      >
        <Text color="gray.600" fontSize={{ base: 'md', md: 'lg' }}>
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
      p={{ base: 1, md: 2, lg: 3 }} 
      borderWidth="2px"
      borderColor={'warning.500'}
      bg={colorMode=='dark' ? 'gray.700':'warning.50'} 
      borderRadius="lg" 
    >  
      <VStack spacing={{ base: 4, md: 5, lg: 6 }} align="stretch">
        {/* Plan Header */}
        <Box>
          <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }} color="teal.600">
            {isArabic ? chosenPlan.title_arabic : chosenPlan.title}
          </Text>
          {chosenPlan.description && (
            <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" mt={2}>
              {isArabic ? chosenPlan.description_arabic : chosenPlan.description}
            </Text>
          )}
        </Box>

        {/* Nutritional Information */}
        <Box>
          <Text fontWeight="semibold" mb={2} fontSize={{ base: 'sm', md: 'md' }}>
            {t('premium.nutritionalInformation') || 'Nutritional Information'}
          </Text>
          <Flex gap={2} flexWrap="wrap">
            <Badge 
              colorScheme="green" 
              variant="solid" 
              fontSize={{ base: 'xs', sm: 'sm' }} 
              px={2} 
              py={1}
            >
              {chosenPlan.kcal} {t('premium.kcal') || 'kcal'}
            </Badge>
            <Badge 
              colorScheme="warning" 
              variant="solid" 
              fontSize={{ base: 'xs', sm: 'sm' }} 
              px={2} 
              py={1}
            >
              {chosenPlan.protein}g {t('premium.protein') || 'protein'}
            </Badge>
            <Badge 
              colorScheme="orange" 
              variant="solid" 
              fontSize={{ base: 'xs', sm: 'sm' }} 
              px={2} 
              py={1}
            >
              {chosenPlan.carb}g {t('premium.carbs') || 'carbs'}
            </Badge>
            {chosenPlan.fat && (
              <Badge 
                colorScheme="purple" 
                variant="solid" 
                fontSize={{ base: 'xs', sm: 'sm' }} 
                px={2} 
                py={1}
              >
                {chosenPlan.fat}g {t('premium.fat') || 'fat'}
              </Badge>
            )}
          </Flex>
        </Box>
        
        {/* Subscription Term Selection */}
        <Box>
          <Text fontWeight="semibold" mb={3} fontSize={{ base: 'sm', md: 'md' }}>
            {t('premium.subscriptionTerm') || 'Subscription Term'}
          </Text>
          <Flex 
            direction={{ base: 'column', sm: 'row' }} 
            gap={{ base: 2, sm: 3, md: 4 }}
            justify={{ sm: 'center' }}
          >
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
          </Flex>
        </Box>

        {/* Only show details if term is selected */}
        {selectedTermPricing && (
          <>
            {/* Subscription Details */}
            <Box>
              <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                
                <Flex justify="space-between" align="center">
                  <DeliveryTimeSelector />
                </Flex>
                
                {subscriptionData.consumed_meals > 0 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{t('premium.consumedMeals') || 'Consumed meals'}:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color="orange.600">
                      {subscriptionData.consumed_meals} {t('premium.meals') || 'meals'}
                    </Text>
                  </Flex>
                )}
                
                {remainingMeals > 0 && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{t('premium.remainingMeals') || 'Remaining meals'}:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color="green.600">
                      {remainingMeals} {t('premium.meals') || 'meals'}
                    </Text>
                  </Flex>
                )}
                
                {subscriptionData.start_date && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{t('premium.startDate') || 'Start date'}:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                      {formatDate(subscriptionData.start_date)}
                    </Text>
                  </Flex>
                )}
                
                {subscriptionData.end_date && (
                  <Flex justify="space-between" align="center">
                    <Text fontSize={{ base: 'sm', md: 'md' }}>{t('premium.endDate') || 'End date'}:</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium">
                      {formatDate(subscriptionData.end_date)}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>
            
            <Divider />
            
            {/* Total Price Highlight */}
            <Box 
              bg="brand.300" 
              p={{ base: 3, md: 4, lg: 5 }} 
              borderRadius="lg" 
              border="2px solid" 
              borderColor="brand.400"
            >
              <Flex 
                justify="space-between" 
                direction={{ base: 'column', sm: 'row' }}
                gap={2}
              >
                <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}>
                  {t('menuPage.totalPrice') || 'Total Price'}: {''}
                  {formatCurrency(selectedTermPricing.totalPrice)}
                </Text>
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }} 
                  color="teal.600"
                >
                  
                </Text>
              </Flex>
            </Box>
          </>
        )}

        {/* Status and Additional Info */}
        {subscriptionData.status && (     
            <Badge 
              colorScheme={getStatusColorScheme(subscriptionData.status)}
              variant="solid"
              fontSize={{ base: 'xs', sm: 'sm' }}
              alignSelf="flex-start"
            >
              {t(`admin.status.${subscriptionData.status}`) || subscriptionData.status}
            </Badge>
        )}

        {/* Pause Information */}
        {subscriptionData.is_paused && (
          <Alert status="warning" borderRadius="md" fontSize={{ base: 'xs', sm: 'sm' }}>
            <AlertIcon boxSize={{ base: '14px', sm: '16px' }} />
            <Box>
              <Text fontSize={{ base: 'xs', sm: 'sm' }} fontWeight="medium">
                {t('premium.subscriptionPaused') || 'Subscription is paused'}
              </Text>
              {subscriptionData.resume_date && (
                <Text fontSize={{ base: '2xs', sm: 'xs' }} mt={1}>
                  {t('premium.resumeDate') || 'Resume date'}: {formatDate(subscriptionData.resume_date)}
                </Text>
              )}
            </Box>
          </Alert>
        )}

        {/* Validation Alert */}
        {!subscriptionData.selected_term && (
          <Alert status="info" borderRadius="md" fontSize={{ base: 'xs', sm: 'sm' }}>
            <AlertIcon boxSize={{ base: '14px', sm: '16px' }} />
            <Text>
              {t('premium.selectTermToSeeDetails') || 'Select a subscription term to see details'}
            </Text>
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default SubscriptionSummary;