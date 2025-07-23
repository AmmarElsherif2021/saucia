import { useUserMenuFiltering } from '../../Hooks/setUserMenuFiltering';
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  Heading,
  Text,
  Flex,
  Divider,
  Alert,
  AlertIcon,
  Button,
  SimpleGrid,
  Box,
  useToast,
  Icon,
  Tooltip,
  Badge,
  Select,
  Skeleton,
  HStack,
  CloseButton
} from '@chakra-ui/react';
import { WarningIcon, CheckIcon } from '@chakra-ui/icons';
import { useI18nContext } from '../../Contexts/I18nContext';
import { useAuthContext } from '../../Contexts/AuthContext';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { supabase } from '../../../supabaseClient';
import { usePlans } from '../../Hooks/usePlans';
const ConfirmPlanModal = ({
  isOpen,
  onClose,
  isSubmitting,
  t,
  MealPlanCard,
  today,
  calculateDeliveryDate,
}) => {
  const { currentLanguage } = useI18nContext();
  const { user } = useAuthContext();
  const {
    subscriptionData,
    addMeal,
    removeMeal,
    chosenPlan: userPlan,
    updateSubscriptionData
    
  } = useChosenPlanContext();
  
  // Use the filtering hook
  const { 
    isMealSafe, 
    getMealAllergens,
    userAllergies, 
    isLoadingAllergies,
    unsafeMeals 
  } = useUserMenuFiltering();
  
  //plan hook
    const { 
    additiveItems, 
    fetchAdditiveItems, 
    loading: plansLoading 
  } = usePlans();
  const toast = useToast();
  const isArabic = currentLanguage === 'ar';
  const selectedMeals = subscriptionData.meals || [];

  // State for plan meals and additives
  const [planMeals, setPlanMeals] = useState([]);
  // Fetch plan meals and additives when modal opens
  useEffect(() => {
    if (isOpen && userPlan?.id) {
      const fetchPlanData = async () => {
        try {
          // Fetch meals for this plan
          const { data: mealsData } = await supabase
            .from('plan_meals')
            .select('meal_id, meals(*)')
            .eq('plan_id', userPlan.id);
          
          if (mealsData) { 
            setPlanMeals(mealsData.map(item => item.meals));
          }
          
          // Fetch additive items using the hook
          if (userPlan?.additives && userPlan?.additives?.length) {
            await fetchAdditiveItems(userPlan.additives);
          }
        } catch (error) {
          console.error('Failed to load plan data:', error);
          toast({
            title: t('checkout.loadError') || 'Data Error',
            description: t('checkout.planDataFailed') || 'Failed to load plan information',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      };
      
      fetchPlanData();
    }
  }, [isOpen, userPlan?.id, fetchAdditiveItems]);

  // Update the loading condition to include plans loading
  const isLoadingAdditives = plansLoading;


  // Format dates
  const formattedStartDate = useMemo(() => {
    return subscriptionData?.start_date 
      ? new Date(subscriptionData.start_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
  }, [subscriptionData?.start_date, currentLanguage]);

  const formattedEndDate = useMemo(() => {
    return subscriptionData?.end_date 
      ? new Date(subscriptionData.end_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
  }, [subscriptionData?.end_date, currentLanguage]);

  // Separate meals into safe and unsafe categories
  const { safeMeals, unsafeMealsFiltered } = useMemo(() => {
    if (!planMeals?.length) {
      return { safeMeals: [], unsafeMealsFiltered: [] };
    }

    const safe = [];
    const unsafe = [];

    planMeals.forEach(meal => {
      if (isMealSafe(meal)) {
        safe.push(meal);
      } else {
        unsafe.push(meal);
      }
    });

    return { safeMeals: safe, unsafeMealsFiltered: unsafe };
  }, [planMeals, isMealSafe]);

  // Enhanced MealPlanCard with additive selector
  const AllergenAwareMealPlanCard = ({
    meal,
    index,
    onChoose,
    onRemove,
    showDeliveryDate = false,
    deliveryDate = null,
    showAllergenBadge = false,
    isSelected = false,
    selectedAdditives = [],
    onAddAdditive = () => {},
    onRemoveAdditive = () => {},
  }) => {
    const isUnsafe = !isMealSafe(meal);
    const mealAllergens = getMealAllergens(meal);

    return (
      <Box 
        position="relative" 
        borderWidth="1px"
        borderRadius="md"
        p={3}
        bg={isSelected ? "brand.50" : "white"}
      >
        {/* Safety Badge */}
        {showAllergenBadge && (
          <Badge
            position="absolute"
            top={2}
            left={2}
            zIndex={2}
            colorScheme={isUnsafe ? "red" : "green"}
            variant="solid"
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
          >
            <Flex align="center" gap={1}>
              <Icon as={isUnsafe ? WarningIcon : CheckIcon} boxSize={3} />
              {isUnsafe ? (t('checkout.unsafe') || 'Unsafe') : (t('checkout.safe') || 'Safe')}
            </Flex>
          </Badge>
        )}

        {/* Allergen Warning Overlay */}
        {isUnsafe && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(255, 0, 0, 0.1)"
            borderRadius="md"
            zIndex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Tooltip
              label={t('checkout.allergenNotice') || 'This meal contains allergens you are sensitive to'}
              placement="top"
              hasArrow
            >
              <Flex 
                bg="red.500" 
                color="white" 
                p={2} 
                borderRadius="full" 
                align="center" 
                gap={1}
                cursor="help"
              >
                <Icon as={WarningIcon} boxSize={4} />
                <Text fontSize="xs" fontWeight="bold">
                  {t('checkout.allergenAlert') || 'Allergen Alert'}
                </Text>
              </Flex>
            </Tooltip>
          </Box>
        )}

        {/* Meal Card */}
        <Box
          opacity={isUnsafe ? 0.6 : 1}
          filter={isUnsafe ? 'grayscale(50%)' : 'none'}
          pointerEvents={isUnsafe ? 'none' : 'auto'}
          transition="all 0.2s"
          border={isUnsafe ? "2px solid" : "none"}
          borderColor={isUnsafe ? "red.300" : "transparent"}
          borderRadius="md"
        >
          <MealPlanCard
            key={index}
            meal={meal}
            index={index}
            onChoose={isUnsafe ? undefined : onChoose}
            onRemove={onRemove}
            isArabic={isArabic}
            t={t}
          />
        </Box>

        {/* Allergen Details */}
        {isUnsafe && mealAllergens.length > 0 && (
          <Box 
            mt={2} 
            p={3} 
            bg="red.50" 
            borderRadius="md" 
            border="1px solid" 
            borderColor="red.200"
          >
            <Text fontSize="sm" color="red.700" fontWeight="bold" mb={1}>
              {t('checkout.containsAllergens') || 'Contains allergens'}:
            </Text>
            <Flex wrap="wrap" gap={1}>
              {mealAllergens.map((allergen, idx) => (
                <Badge 
                  key={idx}
                  colorScheme="red" 
                  variant="outline"
                  fontSize="xs"
                >
                  {isArabic ? allergen.ar : allergen.en}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}

        {/* Delivery Date */}
        {showDeliveryDate && deliveryDate && (
          <Text fontSize="xs" textAlign="center" mt={2} color="gray.500">
            {deliveryDate.toLocaleDateString(currentLanguage, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}

        {/* Additive Selector */}
        {isSelected && additiveItems?.length > 0 && (
          <Box mt={3}>
            <Text fontSize="sm" fontWeight="bold" mb={2}>
              {t('checkout.addAdditives') || 'Add extras:'}
            </Text>
            
            {isLoadingAdditives ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <Select 
                placeholder={t('checkout.selectAdditives') || "Select additives..."}
                size="sm"
                value=""
                onChange={(e) => {
                  const itemId = parseInt(e.target.value);
                  if (itemId) onAddAdditive(itemId);
                }}
              >
                {additiveItems.map(item => (
                  <option 
                    key={item.id} 
                    value={item.id}
                    disabled={selectedAdditives.includes(item.id)}
                  >
                    {isArabic ? item.name_arabic : item.name}
                    {item.price > 0 && ` (+${item.price.toFixed(2)})`}
                  </option>
                ))}
              </Select>
            )}
            
            {selectedAdditives.length > 0 && (
              <Flex wrap="wrap" gap={2} mt={3}>
                {selectedAdditives.map(itemId => {
                  const item = additiveItems.find(a => a.id === itemId);
                  if (!item) return null;
                  
                  return (
                    <Badge 
                      key={itemId}
                      colorScheme="blue"
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                    >
                      {isArabic ? item.name_arabic : item.name}
                      {item.price > 0 && ` (${item.price.toFixed(2)})`}
                      <CloseButton 
                        size="sm" 
                        ml={2} 
                        onClick={() => onRemoveAdditive(itemId)} 
                      />
                    </Badge>
                  );
                })}
              </Flex>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Meal selection threshold
  const maxSelectable = subscriptionData?.total_meals || 0;

  // Handle meal selection with validation
  const handleMealSelection = (meal) => {
    // Check allergen restrictions
    if (!isMealSafe(meal)) {
      toast({
        title: t('checkout.allergenNotice') || 'Allergen Warning',
        description: t('checkout.allergenMealWarning') || 
          'This meal contains allergens you are sensitive to and cannot be selected.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Check meal count limit 
    if (selectedMeals.length >= maxSelectable) {
      toast({
        title: t('checkout.planLimitReachedTitle') || 'Plan Limit Reached',
        description: t('checkout.planLimitReachedDescription') || 
          `You can select up to ${maxSelectable} meals for your plan period.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Calculate delivery date
    const deliveryDate = calculateDeliveryDate(today, selectedMeals.length);
    const remainingAfterAdd = maxSelectable - selectedMeals.length - 1;

    // Show success message
    toast({
      title: t('checkout.mealAddedTitle') || 'Meal Added',
      description: 
        `${isArabic ? meal.name_arabic : meal.name} - ${deliveryDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}. ${isArabic ? 'الوجبات المتبقية' : 'Meals remaining'} ${remainingAfterAdd}.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Add meal to selection
    addMeal(meal.id);
  };

  // Handle additive selection
  const handleAddAdditive = useCallback((mealIndex, itemId) => {
    const currentAdditives = [...(subscriptionData.additives || [])];
    
    // Initialize additives array if needed
    if (!currentAdditives[mealIndex]) currentAdditives[mealIndex] = [];
    
    // Add additive if not already present
    if (!currentAdditives[mealIndex].includes(itemId)) {
      currentAdditives[mealIndex] = [...currentAdditives[mealIndex], itemId];
      updateSubscriptionData('additives', currentAdditives);
    }
  }, [subscriptionData.additives, updateSubscriptionData]);

  // Handle additive removal
  const handleRemoveAdditive = useCallback((mealIndex, itemId) => {
    const currentAdditives = [...(subscriptionData.additives || [])];
    
    if (currentAdditives[mealIndex]) {
      currentAdditives[mealIndex] = currentAdditives[mealIndex].filter(id => id !== itemId);
      updateSubscriptionData('additives', currentAdditives);
    }
  }, [subscriptionData.additives, updateSubscriptionData]);

  // Handle subscription confirmation
  const handleConfirmSubscription = async () => {
    try {
      // Create subscription with selected meals and additives
      const subscription = {
        ...subscriptionData,
        meals: selectedMeals,
        additives: subscriptionData.additives || []
      };

      // This would call your API via context or hook
      // await subscribeToPlan(userPlan.id, subscription);
      
      toast({
        title: t('checkout.subscriptionSuccess') || 'Subscription Created!',
        description: t('checkout.subscriptionCreated') || 
          'Your meal plan subscription has been successfully created.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: t('checkout.subscriptionError') || 'Subscription Failed',
        description: error.message || t('checkout.subscriptionFailed') || 
          'Failed to create your subscription. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Plan details section
  const PlanDetailsSection = () => (
    <Box>
      <Heading size="lg" mb={4}>
        {t('checkout.planDetails') || 'Plan Details'}
      </Heading>
      
      <VStack spacing={3} align="stretch">
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.plan') || 'Plan'}</Text>
          <Text fontWeight="bold">{userPlan?.title || t('checkout.premiumPlan')}</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.startDate') || 'Start Date'}</Text>
          <Text fontWeight="bold">{formattedStartDate}</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.endDate') || 'End Date'}</Text>
          <Text fontWeight="bold">{formattedEndDate}</Text>
        </Flex>
        
        {maxSelectable > 0 && (
          <Flex justify="space-between">
            <Text color="gray.600">{t('checkout.remainingMeals') || 'Remaining Meals'}</Text>
            <Text fontWeight="bold" color="brand.500">
              {maxSelectable - selectedMeals.length} / {maxSelectable}
            </Text>
          </Flex>
        )}

        {/* Allergen Summary */}
        {userAllergies.length > 0 && (
          <Box mt={4} p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={2}>
              {t('checkout.yourAllergies') || 'Your Allergies'}:
            </Text>
            <Flex wrap="wrap" gap={2}>
              {userAllergies.map((allergy, idx) => (
                <Badge key={idx} colorScheme="blue" variant="outline">
                  {allergy}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}
      </VStack>
    </Box>
  );

  // Safe meals section
  const SafeMealsSection = () => (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg" color="green.600">
          {t('checkout.safeMeals') || 'Safe Meals'} ({safeMeals.length})
        </Heading>
      </Flex>

      {safeMeals.length > 0 ? (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 3 }} spacing={4}>
          {safeMeals.map((meal, index) => (
            <AllergenAwareMealPlanCard
              key={`safe-${meal.id || index}`}
              meal={meal}
              index={index}
              onRemove={false}
              onChoose={handleMealSelection}
              showAllergenBadge={true}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">{t('checkout.noSafeMeals') || 'No Safe Meals Available'}</Text>
            <Text fontSize="sm">
              {t('checkout.noSafeMealsDescription') || 'All available meals contain allergens you are sensitive to. Please contact support.'}
            </Text>
          </Box>
        </Alert>
      )}
    </Box>
  );

  // Unsafe meals section
  const UnsafeMealsSection = () => (
    unsafeMealsFiltered.length > 0 && (
      <Box mt={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="lg" color="red.500">
            {t('checkout.restrictedMeals') || 'Restricted Meals'} ({unsafeMealsFiltered.length})
          </Heading>
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 3, lg: 3 }} spacing={2}>
          {unsafeMealsFiltered.map((meal, index) => (
            <AllergenAwareMealPlanCard
              key={`unsafe-${meal.id || index}`}
              meal={meal}
              index={index}
              showAllergenBadge={true}
              onRemove={false}
            />
          ))}
        </SimpleGrid>
      </Box>
    )
  );

  // Available meals section
  const AvailableMealsSection = () => (
    <Box mt={1} mb={1} h={'60vh'} bg={'gray.50'} overflowY="auto" overflowX="hidden" p={4} borderRadius="md">
      <SafeMealsSection />
      <UnsafeMealsSection />
    </Box>
  );

  // Selected meals section
  const SelectedMealsSection = () => (
    selectedMeals.length > 0 && (
      <Box mt={6}>
        <Heading size="lg" mb={4}>
          {t('checkout.selectedMeals') || 'Selected Meals'}
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {selectedMeals.map((mealId, index) => {
            const meal = planMeals.find(m => m.id === mealId);
            if (!meal) return null;

            const deliveryDate = calculateDeliveryDate(today, index);
            const additives = subscriptionData.additives?.[index] || [];
            
            return (
              <AllergenAwareMealPlanCard
                key={`selected-${mealId}-${index}`}
                meal={meal}
                index={index}
                showDeliveryDate={true}
                deliveryDate={deliveryDate}
                showAllergenBadge={true}
                isSelected={true}
                selectedAdditives={additives}
                onAddAdditive={(itemId) => handleAddAdditive(index, itemId)}
                onRemoveAdditive={(itemId) => handleRemoveAdditive(index, itemId)}
                onRemove={() => removeMeal(index)}
              />
            );
          })}
        </SimpleGrid>
      </Box>
    )
  );

  // Check if user can proceed with subscription
  const canConfirmSubscription = useMemo(() => {
    return selectedMeals.length === maxSelectable;
  }, [selectedMeals.length, maxSelectable]);

  if (isLoadingAllergies) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody py={8}>
            <Text textAlign="center">{t('checkout.loadingAllergies') || 'Loading allergen information...'}</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" size="full">
      <ModalOverlay />
      <ModalContent maxW="95vw" maxH="95vh" py={1} px={1} mt={2}>
        <ModalHeader borderBottom="1px" borderColor="gray.200">
          <Heading size="md">{t('checkout.confirmSubscription') || 'Confirm Your Subscription'}</Heading>
        </ModalHeader>
        
        <ModalBody py={6}>
          <PlanDetailsSection />
          <VStack spacing={8} align="stretch">
            <Divider />
            
            {/* Allergen Summary Warning */}
            {unsafeMealsFiltered.length > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">
                    {t('checkout.allergenNotice') || 'Allergen Notice'}
                  </Text>
                  <Text fontSize="sm">
                    {t('checkout.allergenNoticeDescription') || 
                      `${unsafeMealsFiltered.length} meal(s) contain your allergens and are shown for reference only. Only safe meals can be selected.`}
                  </Text>
                </Box>
              </Alert>
            )}
            
            {/* Available Meals */}
            <AvailableMealsSection />
            
            {/* Selected Meals */}
            <SelectedMealsSection />
            
            {/* Subscription Info */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                {t('checkout.subscriptionRenewal') || 
                  'Your subscription will automatically renew unless cancelled before the end date.'}
              </Text>
            </Alert>
          </VStack>
        </ModalBody>
        
        <ModalFooter borderTop="1px" borderColor="gray.200" gap={3}>
          <Button variant="outline" onClick={onClose} isDisabled={isSubmitting}>
            {t('checkout.back') || 'Back'}
          </Button>
          
          <Button
            colorScheme="brand"
            onClick={handleConfirmSubscription}
            isLoading={isSubmitting}
            isDisabled={!canConfirmSubscription || isSubmitting}
            loadingText={t('checkout.processing') || 'Processing...'}
          >
            {t('checkout.confirmAndPay') || 'Confirm & Pay'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmPlanModal;