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
  useColorMode,
  Card,
  CardBody,
  Progress,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useBreakpointValue,
  useColorModeValue,

} from '@chakra-ui/react';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { useTranslation } from 'react-i18next';
import { useI18nContext } from '../../Contexts/I18nContext';
import { motion } from 'framer-motion';
import { StarIcon } from '@chakra-ui/icons';

// Motion components
const MotionCard = motion(Card);
const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

// Clean Term Button Component with outlined design
const TermButton = ({ term, pricing, isSelected, isDisabled, onClick, t }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Card
      as={Button}
      onClick={() => onClick(term)}
      isDisabled={isDisabled}
      variant="unstyled"
      position="relative"
      overflow="hidden"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      minW={{ base: '100%', sm: '140px', md: '160px' }}
      h="auto"
      p={0}
      bg={isSelected 
        ? (colorMode === 'dark' ? 'brand.600' : 'brand.500')
        : (colorMode === 'dark' ? 'gray.700' : 'white')
      }
      borderWidth="2px"
      borderColor={isSelected 
        ? 'brand.500'
        : (colorMode === 'dark' ? 'gray.600' : 'gray.300')
      }
      color={isSelected 
        ? 'white' 
        : (colorMode === 'dark' ? 'gray.100' : 'gray.800')
      }
      boxShadow="none"
      _hover={!isDisabled ? {
        borderColor: 'brand.400',
        transform: 'translateY(-1px)'
      } : {}}
      _active={!isDisabled ? {
        transform: 'translateY(0)'
      } : {}}
      transition="all 0.2s ease"
      opacity={isDisabled ? 0.4 : 1}
    >
      <CardBody p={{ base: 3, md: 4 }} textAlign="center">
        <VStack spacing={2}>
          <Text 
            fontSize={{ base: 'sm', md: 'md' }} 
            fontWeight="600"
          >
            {term === 'short' ? (t('premium.shortTerm') || 'Short Term') : (t('premium.mediumTerm') || 'Medium Term')}
          </Text>
          
          <Box>
            <Text 
              fontSize={{ base: 'lg', md: 'xl' }} 
              fontWeight="700" 
              color={isSelected ? 'white' : 'brand.600'}
              lineHeight="1"
            >
              {`${pricing.totalPrice.toFixed(2)}`}
            </Text>
            <Text 
              fontSize={{ base: '2xs', md: 'xs' }} 
              fontWeight="500"
              opacity={isSelected ? 0.9 : 0.7}
              mt={1}
            >
              {t('common.currency') || 'SAR'}
            </Text>
          </Box>
          
          <Badge
            colorScheme={isSelected ? 'whiteAlpha' : 'brand'}
            variant={isSelected ? 'solid' : 'outline'}
            fontSize={{ base: '2xs', md: 'xs' }}
            px={2}
            py={1}
            borderRadius="full"
          >
            {pricing.meals} {t('premium.meals') || 'meals'}
          </Badge>
        </VStack>
      </CardBody>
    </Card>
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
  const { colorMode } = useColorMode();
  const isArabic = currentLanguage === 'ar';

  // Theme values
  const bgGradient = useColorModeValue(
    'linear(135deg, white 0%, gray.50 50%, white 100%)',
    'linear(135deg, gray.800 0%, gray.900 50%, gray.800 100%)'
  );
  const accentColor = useColorModeValue('brand.500', 'brand.300');

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

  // Calculate remaining meals and progress
  const { remainingMeals, progressPercentage } = useMemo(() => {
    const remaining = Math.max(0, (subscriptionData.total_meals || 0) - (subscriptionData.consumed_meals || 0));
    const total = subscriptionData.total_meals || 0;
    const consumed = subscriptionData.consumed_meals || 0;
    const percentage = total > 0 ? (consumed / total) * 100 : 0;
    
    return {
      remainingMeals: remaining,
      progressPercentage: percentage
    };
  }, [subscriptionData.total_meals, subscriptionData.consumed_meals]);

  // Early return if no plan selected
  if (!chosenPlan) {
    return (
      <MotionCard
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        bg={bgGradient}
        borderWidth="2px"
        borderColor={colorMode === 'dark' ? 'gray.600' : 'brand.200'}
        boxShadow="xs"
        position="relative"
        overflow="hidden"
      >
        {/* Background decoration */}
        <Box
          position="absolute"
          top="-30px"
          right="-30px"
          w="100px"
          h="100px"
          borderRadius="full"
          bg={colorMode === 'dark' ? 'brand.800' : 'brand.100'}
          opacity={0.3}
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="-20px"
          left="-20px"
          w="80px"
          h="80px"
          borderRadius="full"
          bg={colorMode === 'dark' ? 'brand.900' : 'brand.50'}
          opacity={0.2}
          zIndex={0}
        />

        <CardBody p={6} textAlign="center" position="relative" zIndex={1}>
          <MotionVStack variants={itemVariants} spacing={4}>
            <Box
              w="50px"
              h="50px"
              borderRadius="full"
              bg={colorMode === 'dark' ? 'gray.600' : 'gray.100'}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={StarIcon} w={5} h={5} color={accentColor} />
            </Box>
            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} fontSize="md" fontWeight="500">
              {t('premium.selectPlanToSeeDetails') || 'Select a plan to see details'}
            </Text>
          </MotionVStack>
        </CardBody>
      </MotionCard>
    );
  }

  // Helper functions
  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} ${t('common.currency') || 'SAR'}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    <MotionCard
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      bg={bgGradient}
      borderWidth="2px"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      boxShadow="xl"
      position="relative"
      overflow="hidden"
    >
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-40px"
        right="-40px"
        w="120px"
        h="120px"
        borderRadius="full"
        bg={colorMode === 'dark' ? 'brand.800' : 'brand.100'}
        opacity={0.2}
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        w="100px"
        h="100px"
        borderRadius="full"
        bg={colorMode === 'dark' ? 'brand.900' : 'brand.50'}
        opacity={0.1}
        zIndex={0}
      />

      <CardBody p={{ base: 4, md: 5, lg: 6 }} position="relative" zIndex={1}>
        <MotionVStack variants={containerVariants} spacing={6} align="stretch">
          {/* Plan Header */}
          <MotionBox variants={itemVariants} textAlign="center">
            <Heading 
              size={{ base: 'md', md: 'lg' }} 
              color={colorMode === 'dark' ? 'white' : 'brand.800'}
              fontWeight="600"
              mb={2}
            >
              {isArabic ? chosenPlan.title_arabic : chosenPlan.title}
            </Heading>
            {chosenPlan.description && (
              <Text 
                fontSize={{ base: 'sm', md: 'md' }} 
                color={colorMode === 'dark' ? 'gray.300' : 'brand.600'}
                maxW="md"
                mx="auto"
                lineHeight="1.5"
              >
                {isArabic ? chosenPlan.description_arabic : chosenPlan.description}
              </Text>
            )}
          </MotionBox>

          {/* Nutritional Information */}
          <MotionBox variants={itemVariants}>
            <Text 
              fontWeight="600" 
              mb={3} 
              fontSize={{ base: 'sm', md: 'md' }}
              color={colorMode === 'dark' ? 'white' : 'gray.800'}
            >
              {t('premium.nutritionalInformation') || 'Nutritional Information'}
            </Text>
            <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
              <Stat
                p={3}
                borderRadius="md"
                bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
              >
                <StatNumber fontSize="lg" color="green.500" fontWeight="700">
                  {chosenPlan.kcal}
                </StatNumber>
                <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                  {t('premium.kcal') || 'kcal'}
                </StatLabel>
              </Stat>
              
              <Stat
                p={3}
                borderRadius="md"
                bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
              >
                <StatNumber fontSize="lg" color="brand.500" fontWeight="700">
                  {chosenPlan.protein}g
                </StatNumber>
                <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                  {t('premium.protein') || 'protein'}
                </StatLabel>
              </Stat>
              
              <Stat
                p={3}
                borderRadius="md"
                bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
              >
                <StatNumber fontSize="lg" color="orange.500" fontWeight="700">
                  {chosenPlan.carb}g
                </StatNumber>
                <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                  {t('premium.carbs') || 'carbs'}
                </StatLabel>
              </Stat>
              
              {chosenPlan.fat && (
                <Stat
                  p={3}
                  borderRadius="md"
                  bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                  borderWidth="1px"
                  borderColor={colorMode === 'dark' ? 'gray.500' : 'brand.200'}
                >
                  <StatNumber fontSize="lg" color="purple.500" fontWeight="700">
                    {chosenPlan.fat}g
                  </StatNumber>
                  <StatLabel fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                    {t('premium.fat') || 'fat'}
                  </StatLabel>
                </Stat>
              )}
            </SimpleGrid>
          </MotionBox>
          
          {/* Subscription Term Selection */}
          <MotionBox variants={itemVariants}>
            <Text 
              fontWeight="600" 
              mb={4} 
              fontSize={{ base: 'sm', md: 'md' }}
              color={colorMode === 'dark' ? 'white' : 'gray.800'}
              textAlign="center"
            >
              {t('premium.subscriptionTerm') || 'Choose Your Plan'}
            </Text>
            <SimpleGrid 
              columns={{ base: 1, sm: 2 }} 
              spacing={3}
              maxW="md"
              mx="auto"
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
            </SimpleGrid>
          </MotionBox>

          {/* Only show details if term is selected */}
          {selectedTermPricing && (
            <>
              <Divider />
              
              {/* Progress and Meal Stats */}
              {subscriptionData.total_meals > 0 && (
                <MotionBox variants={itemVariants}>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontWeight="500" color={colorMode === 'dark' ? 'white' : 'gray.800'} fontSize="sm">
                      {t('premium.mealProgress') || 'Meal Progress'}
                    </Text>
                    <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                      {subscriptionData.consumed_meals || 0} / {subscriptionData.total_meals}
                    </Text>
                  </Flex>
                  <Progress 
                    value={progressPercentage} 
                    colorScheme="brand" 
                    size="md" 
                    borderRadius="full"
                    bg={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                  />
                  <Flex justify="space-between" align="center" mt={2}>
                    <Text fontSize="xs" color="green.500" fontWeight="500">
                      {remainingMeals} {t('premium.mealsRemaining') || 'meals remaining'}
                    </Text>
                    <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                      {progressPercentage.toFixed(0)}% {t('checkout.completedDeliveries') || 'completed'}
                    </Text>
                  </Flex>
                </MotionBox>
              )}

              {/* Subscription Details */}
              <MotionBox variants={itemVariants}>
                <Text 
                  fontWeight="600" 
                  mb={3} 
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={colorMode === 'dark' ? 'white' : 'gray.800'}
                >
                  {t('profile.subscriptionDetails') || 'Subscription Details'}
                </Text>
                
                <VStack spacing={3} align="stretch">
                  <DeliveryTimeSelector />
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {subscriptionData.start_date && (
                      <Box
                        p={3}
                        borderRadius="md"
                        bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
                        borderWidth="1px"
                        borderColor={colorMode === 'dark' ? 'gray.500' : 'teal.200'}
                        boxShadow="sm"
                      >
                        <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} mb={1}>
                          {t('premium.startDate') || 'Start Date'}
                        </Text>
                        <Text fontWeight="500" color={colorMode === 'dark' ? 'white' : 'gray.800'} fontSize="sm">
                          {formatDate(subscriptionData.start_date)}
                        </Text>
                      </Box>
                    )}
                    
                    {subscriptionData.end_date && (
                      <Box
                        p={3}
                        borderRadius="md"
                        bg={colorMode === 'dark' ? 'gray.600' : 'gray.50'}
                        borderWidth="1px"
                        borderColor={colorMode === 'dark' ? 'gray.500' : 'teal.200'}
                        boxShadow="sm"
                      >
                        <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} mb={1}>
                          {t('premium.endDate') || 'End Date'}
                        </Text>
                        <Text fontWeight="500" color={colorMode === 'dark' ? 'white' : 'gray.800'} fontSize="sm">
                          {formatDate(subscriptionData.end_date)}
                        </Text>
                      </Box>
                    )}
                  </SimpleGrid>
                </VStack>
              </MotionBox>
              
              <Divider />
              
              {/* Total Price Highlight */}
              <MotionCard
                variants={itemVariants}
                bg={colorMode === 'dark' ? 'brand.600' : 'brand.500'}
                color="white"
                position="relative"
                overflow="hidden"
                boxShadow="xl"
                border="none"
              >
                <CardBody p={4}>
                  <Flex 
                    justify="space-between" 
                    align="center"
                    direction={{ base: 'column', sm: 'row' }}
                    gap={3}
                  >
                    <VStack align={{ base: 'center', sm: 'flex-start' }} spacing={1}>
                      <Text fontSize="sm" fontWeight="500" opacity={0.9}>
                        {t('menuPage.totalPrice') || 'Total Price'}
                      </Text>
                      <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" lineHeight="1">
                        {formatCurrency(selectedTermPricing.totalPrice)}
                      </Text>
                    </VStack>
                    
                    <VStack align={{ base: 'center', sm: 'flex-end' }} spacing={1}>
                      <Badge
                        colorScheme="whiteAlpha"
                        variant="solid"
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {selectedTermPricing.meals} {t('premium.meals') || 'meals'}
                      </Badge>
                      <Text fontSize="xs" opacity={0.8}>
                        {formatCurrency(selectedTermPricing.pricePerMeal)} {t('premium.pricePerMeal') || 'per meal'}
                      </Text>
                    </VStack>
                  </Flex>
                </CardBody>
              </MotionCard>
            </>
          )}

          {/* Status and Additional Info */}
          {subscriptionData.status && (
            <MotionBox variants={itemVariants}>
              <Flex justify="center">
                <Badge 
                  colorScheme={getStatusColorScheme(subscriptionData.status)}
                  variant="solid"
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                >
                  {t(`admin.status.${subscriptionData.status}`) || subscriptionData.status}
                </Badge>
              </Flex>
            </MotionBox>
          )}

          {/* Pause Information */}
          {subscriptionData.is_paused && (
            <MotionBox variants={itemVariants}>
              <Alert 
                status="warning" 
                borderRadius="md" 
                bg={colorMode === 'dark' ? 'orange.800' : 'orange.50'}
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'orange.600' : 'orange.200'}
                variant="subtle"
              >
                <AlertIcon color="orange.500" />
                <Box>
                  <Text fontSize="sm" fontWeight="500" color={colorMode === 'dark' ? 'orange.200' : 'orange.800'}>
                    {t('premium.subscriptionPaused') || 'Subscription is paused'}
                  </Text>
                  {subscriptionData.resume_date && (
                    <Text fontSize="xs" mt={1} color={colorMode === 'dark' ? 'orange.300' : 'orange.600'}>
                      {t('premium.resumeDate') || 'Resume date'}: {formatDate(subscriptionData.resume_date)}
                    </Text>
                  )}
                </Box>
              </Alert>
            </MotionBox>
          )}

          {/* Validation Alert */}
          {!subscriptionData.selected_term && (
            <MotionBox variants={itemVariants}>
              <Alert 
                status="info" 
                borderRadius="md"
                bg={colorMode === 'dark' ? 'blue.800' : 'blue.50'}
                borderWidth="1px"
                borderColor={colorMode === 'dark' ? 'blue.600' : 'blue.200'}
                variant="subtle"
              >
                <AlertIcon color="blue.500" />
                <Text fontSize="sm" color={colorMode === 'dark' ? 'blue.200' : 'blue.800'}>
                  {t('premium.selectTermToSeeDetails') || 'Select a subscription term to see details'}
                </Text>
              </Alert>
            </MotionBox>
          )}
        </MotionVStack>
      </CardBody>
    </MotionCard>
  );
};

export default SubscriptionSummary;