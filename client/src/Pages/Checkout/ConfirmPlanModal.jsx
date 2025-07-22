import { useUserMenuFiltering } from '../../Hooks/setUserMenuFiltering'
import { useEffect, useState, useMemo } from 'react'
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
} from '@chakra-ui/react'
import { WarningIcon, CheckIcon } from '@chakra-ui/icons'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext'

const ConfirmPlanModal = ({
  isOpen,
  onClose,
  handleSelectMeals,
  signatureSalads,
  isSubmitting,
  t,
  MealPlanCard,
  today,
  calculateDeliveryDate,
}) => {
  const { currentLanguage } = useI18nContext()
  const { user } = useAuthContext()
  const {
    subscriptionData,
    addMeal,
    removeMeal,
    chosenPlan: userPlan,
  } = useChosenPlanContext() 
  
  // Use the filtering hook
  const { 
    isMealSafe, 
    getMealAllergens, // Use the corrected function from the hook
    userAllergies, 
    isLoadingAllergies,
    unsafeMeals 
  } = useUserMenuFiltering()
  
  const toast = useToast()
  
  const isArabic = currentLanguage === 'ar'
  const selectedMeals = subscriptionData.meals || [];


  // Format dates from context
  const formattedStartDate = useMemo(() => {
    return subscriptionData?.start_date 
      ? new Date(subscriptionData.start_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : ''
  }, [subscriptionData?.start_date, currentLanguage])

  const formattedEndDate = useMemo(() => {
    return subscriptionData?.end_date 
      ? new Date(subscriptionData.end_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : ''
  }, [subscriptionData?.end_date, currentLanguage])

  // Separate meals into safe and unsafe categories
  const { safeMeals, unsafeMealsFiltered } = useMemo(() => {
    if (!signatureSalads?.length) {
      return { safeMeals: [], unsafeMealsFiltered: [] }
    }

    //console.log('🍽️ Filtering meals for safety...');
    const safe = []
    const unsafe = []

    signatureSalads.forEach(meal => {
      if (isMealSafe(meal)) {
        safe.push(meal)
      } else {
        unsafe.push(meal)
      }
    })

    //console.log(`✅ Safe meals: ${safe.length}, ❌ Unsafe meals: ${unsafe.length}`);
    return { safeMeals: safe, unsafeMealsFiltered: unsafe }
  }, [signatureSalads, isMealSafe])

  // Enhanced MealPlanCard wrapper with allergen awareness
  const AllergenAwareMealPlanCard = ({
    meal,
    index,
    onChoose,
    onRemove,
    showDeliveryDate = false,
    deliveryDate = null,
    showAllergenBadge = false,
  }) => {
    const isUnsafe = !isMealSafe(meal)
    const mealAllergens = getMealAllergens(meal) // Use the hook's function

    //console.log(`🔍 Rendering meal card: "${meal?.name || meal?.name_arabic || 'Unknown'}", Safe: ${!isUnsafe}, Allergens: ${mealAllergens.length}`);

    return (
      <Box position="relative">
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

        {/* Allergen Warning Overlay for unsafe meals */}
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
          border={isUnsafe ? "2px solid" : "1px solid"}
          borderColor={isUnsafe ? "red.300" : "gray.200"}
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

        {/* Allergen Details for unsafe meals */}
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
            {deliveryDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}
      </Box>
    )
  }
  // set threshold
  const maxSelectable = subscriptionData?.total_meals || 0
// Handle meal selection with validation
const handleMealSelection = (meal) => {
  // Check allergen restrictions using the hook
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

  // Calculate delivery date (using the next available slot)
  const deliveryDate = calculateDeliveryDate(today, selectedMeals.length);
  const remainingAfterAdd = maxSelectable - selectedMeals.length - 1;

  // Show success message
  toast({
    title: t('checkout.mealAddedTitle') || 'Meal Added',
    description: 
      `${isArabic ? meal.name_arabic : meal.name}-${deliveryDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })}.${isArabic?'الوجبات المتبقية':'meals remaining'} ${remainingAfterAdd}.`,
    status: 'success',
    duration: 3000,
    isClosable: true,
  });

  // Add meal to selection
  addMeal(meal.id);
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
        
        {userPlan?.total_meals && (
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
  )

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
              key={meal.id || index}
              meal={meal}
              index={meal.id || index}
              onRemove= {false}
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
  )

  // Unsafe meals section (for reference/display only)
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
              index={meal.id || index}
              showAllergenBadge={true}
              onRemove={false}
            />
          ))}
        </SimpleGrid>
      </Box>
    )
  )

  // Available meals section (organized by safety)
  const AvailableMealsSection = () => (
    <Box mt={1} mb={1} h={'60vh'} bg={'secondary.400'} overflowY="auto" overflowX="hidden" p={4}>
      <SafeMealsSection />
      <UnsafeMealsSection />
    </Box>
  )

  // Selected meals section
  const SelectedMealsSection = () => (
    selectedMeals.length > 0 && (
      <Box>
        <Heading size="lg" mb={4}>
          {t('checkout.selectedMeals') || 'Selected Meals'}
        </Heading>
        
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={1}>
          {selectedMeals.map((mealId, index) => {
            const matchingMeals = signatureSalads.filter(m => m.id === mealId)
            const meal = matchingMeals.length > 0 ? matchingMeals[0] : null

            if (!meal) return null

            const deliveryDate = calculateDeliveryDate(today, index)
            return (
              <AllergenAwareMealPlanCard
                key={`${mealId}+${index}`}
                meal={meal}
                index={index}
                showDeliveryDate={true}
                deliveryDate={deliveryDate}
                showAllergenBadge={true}
                onRemove={() => removeMeal(index)}
              />
            )
          })}
        </SimpleGrid>
      </Box>
    )
  )

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
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="90vw" maxH="96vh" py={1} px={1} mt={2}>
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
            
            {/* Available Meals (Safe and Unsafe) */}
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
          <Button variant="outline" onClick={onClose}>
            {t('checkout.back') || 'Back'}
          </Button>
          
          <Button
            colorScheme="brand"
            onClick={onClose}
            isLoading={isSubmitting}
            isDisabled={!canConfirmSubscription}
            loadingText={t('checkout.processing') || 'Processing...'}
          >
            {t('checkout.confirmAndPay') || 'Confirm & Pay'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmPlanModal