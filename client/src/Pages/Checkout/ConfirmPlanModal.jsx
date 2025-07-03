// ConfirmPlanModal.jsx
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
} from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useEffect, useState } from 'react'
import { useAuthContext } from '../../Contexts/AuthContext'

const ConfirmPlanModal = ({
  isOpen,
  onClose,
  handleSelectMeals,
  handleAddSignatureSalad,
  handleRemoveMeal,
  handleConfirmSubscription,
  userPlan,
  customizedSalad,
  selectedMeals,
  signatureSalads,
  startDate,
  formattedEndDate,
  isSubmitting,
  t,
  MealPlanCard,
  today,
  calculateDeliveryDate,
}) => {
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  const toast = useToast()
  const [endDateObj, setEndDateObj] = useState(null)
  const { user } = useAuthContext();

  // Convert formattedEndDate to Date object when component mounts or formattedEndDate changes
  useEffect(() => {
    console.log(` from confirmation modal of plan ${JSON.stringify(userPlan)}`)
    if (formattedEndDate) {
      setEndDateObj(new Date(formattedEndDate))
    }
  }, [formattedEndDate])

  // Function to check if a meal contains user's allergens
  const isMealRestricted = (item) => {
    if (!user?.healthProfile?.allergies || !item?.allergens) {
      return false
    }

    const userAllergies = user?.healthProfile?.allergies?.map(
      (allergy) => typeof allergy === 'string' && allergy.toLowerCase(),
    )

    return item.allergens.some((allergen) => {
      const allergenNameEn = allergen.en?.toLowerCase() || ''
      const allergenNameAr = allergen.ar?.toLowerCase() || ''

      // Check if any user allergy matches the allergen name (English or Arabic)
      return userAllergies.some(
        (userAllergy) =>
          allergenNameEn.includes(userAllergy) ||
          (typeof userAllergy === 'string' && userAllergy.includes(allergenNameEn)) ||
          allergenNameAr.includes(userAllergy) ||
          (typeof userAllergy === 'string' && userAllergy.includes(allergenNameAr)),
      )
    })
  }

  // Enhanced MealPlanCard wrapper component to handle allergen display
  const AllergenAwareMealPlanCard = ({
    meal,
    index,
    onChoose,
    onRemove,
    isArabic,
    t,
    showDeliveryDate = false,
    deliveryDate = null,
  }) => {
    const isRestricted = isMealRestricted(meal)

    return (
      <Box position="relative">
        {/* Overlay for restricted meals */}
        {isRestricted && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.1)"
            borderRadius="md"
            zIndex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Tooltip
              label={
                t('checkout.allergenNotice') || 'This meal contains allergens you are sensitive to'
              }
              placement="top"
            >
              <Flex bg="red.500" color="white" p={2} borderRadius="full" align="center" gap={1}>
                <Icon as={WarningIcon} boxSize={4} />
                <Text fontSize="xs" fontWeight="bold">
                  {t('checkout.allergenNotice') || 'Allergen Alert'}
                </Text>
              </Flex>
            </Tooltip>
          </Box>
        )}

        {/* Original MealPlanCard with modified props */}
        <Box
          opacity={isRestricted ? 0.6 : 1}
          filter={isRestricted ? 'grayscale(50%)' : 'none'}
          pointerEvents={isRestricted ? 'none' : 'auto'}
        >
          <MealPlanCard
            key={index}
            meal={meal}
            index={index}
            onChoose={isRestricted ? undefined : onChoose}
            onRemove={onRemove}
            isArabic={isArabic}
            t={t}
          />
        </Box>

        {/* Show allergen details for restricted meals */}
        {isRestricted && meal.allergens && (
          <Box mt={2} p={2} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
            <Text fontSize="xs" color="red.600" fontWeight="bold">
              {t('checkout.contains') || 'Contains'}:
            </Text>
            <Text fontSize="xs" color="red.500">
              {meal.allergens
                .filter((allergen) => {
                  const userAllergies =
                    user?.healthProfile?.allergies?.map(
                      (a) => typeof a === 'string' && a.toLowerCase(),
                    ) || []
                  const allergenNameEn = allergen.en?.toLowerCase() || ''
                  const allergenNameAr = allergen.ar?.toLowerCase() || ''
                  return userAllergies.some(
                    (userAllergy) =>
                      allergenNameEn.includes(userAllergy) ||
                      (typeof userAllergy === 'string' && userAllergy.includes(allergenNameEn)) ||
                      allergenNameAr.includes(userAllergy) ||
                      (typeof userAllergy === 'string' && userAllergy.includes(allergenNameAr)),
                  )
                })
                .map((allergen) => (isArabic ? allergen.ar : allergen.en))
                .join(', ')}
            </Text>
          </Box>
        )}

        {/* Delivery date display */}
        {showDeliveryDate && deliveryDate && (
          <Text fontSize="xs" textAlign="center" mt={1} color="gray.500">
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

  // handleMealSelection function with enhanced allergen checking:
  const handleMealSelection = (meal) => {
    // Check if meal contains user's allergens
    if (isMealRestricted(meal)) {
      toast({
        title: t('checkout.allergenNotice') || 'Allergen Warning',
        description:
          t('checkout.allergenMealWarning') ||
          'This meal contains allergens you are sensitive to and cannot be selected.',
        status: 'error',
        duration: 5000,
        isClosable: false,
      })
      return
    }

    // Check if user has remaining meals in their plan
    if (user.subscription.mealsCount && selectedMeals.length >= user.subscription.mealsCount) {
      toast({
        title: t('checkout.planLimitReachedTitle'),
        description: t('', {
          mealsCount: userPlan.mealsCount,
        }),
        status: 'error',
        duration: 5000,
        //isClosable: false,
      })
      return
    }

    // Check if the calculated delivery date is before the plan end date
    const nextDeliveryIndex = selectedMeals.length
    const deliveryDate = calculateDeliveryDate(today, nextDeliveryIndex)

    // if (endDateObj && deliveryDate > endDateObj) {
    //   toast({
    //     title: t('checkout.planExpiredTitle'),
    //     description: t('checkout.planExpiredDescription', { endDate: formattedEndDate }),
    //     status: 'error',
    //     duration: 5000,
    //     isClosable: false,
    //   })
    //   return
    // }

    // Show success toast when meal is selected
    toast({
      title: t('checkout.mealAddedTitle'),
      description: t('', {
        mealName: isArabic ? meal.name_arabic : meal.name,
        deliveryDate: deliveryDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        remainingMeals: userPlan.mealsCount - selectedMeals.length - 1,
      }),
      status: 'success',
      duration: 3000,
      //isClosable: false,
    })

    // Proceed with adding the meal
    handleAddSignatureSalad(meal)
  }

  // Count restricted meals for display
  const getRestrictedMealsCount = (meals) => {
    return meals?.filter((meal) => isMealRestricted(meal)).length || 0
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent sx={{ minWidth: '50vw', maxWidth: '90vw', margin: '5vw', padding: '1vw' }}>
        <ModalHeader>{t('checkout.confirmSubscription')}</ModalHeader>
        <ModalBody
          sx={{ maxHeight: '60vh', minWidth: '50vw', overflowY: 'auto', overflowX: 'hidden' }}
        >
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="xl" mb={2}>
                {t('checkout.planDetails')}
              </Heading>
              <Flex justify="space-between" mb={1}>
                <Text>{t('checkout.plan')}</Text>
                <Text fontWeight="bold">{userPlan?.title || t('checkout.premiumPlan')}</Text>
              </Flex>
              <Flex justify="space-between" mb={1}>
                <Text>{t('checkout.startDate')}</Text>
                <Text fontWeight="bold">{startDate}</Text>
              </Flex>
              <Flex justify="space-between" mb={1}>
                <Text>{t('checkout.endDate')}</Text>
                <Text fontWeight="bold">{formattedEndDate}</Text>
              </Flex>
              {userPlan?.mealsCount && (
                <Flex justify="space-between">
                  <Text>{t('checkout.remainingMeals')}</Text>
                  <Text fontWeight="bold">
                    {userPlan.mealsCount - selectedMeals.length} / {userPlan.mealsCount}
                  </Text>
                </Flex>
              )}
            </Box>

            <Divider />

            {/* Show allergen alert if there are restricted meals */}
            {(getRestrictedMealsCount(signatureSalads) > 0 ||
              (customizedSalad && isMealRestricted(customizedSalad))) && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">{t('checkout.allergenNotice') || 'Allergen Notice'}</Text>
                  <Text fontSize="sm">
                    {t('checkout.allergenNoticeDescription') ||
                      'Some meals are not available due to your allergen preferences. These meals are grayed out and cannot be selected.'}
                  </Text>
                </Box>
              </Alert>
            )}

            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">{t('checkout.yourMealPlan')}</Heading>
                <Box
                  size="xl"
                  w="100px"
                  h="100px"
                  px={4}
                  colorScheme="brand"
                  as={Button}
                  variant="outline"
                  onClick={handleSelectMeals}
                  fontSize={'xs'}
                >
                  {t('checkout.selectedMeal')}
                </Box>
              </Flex>

              {customizedSalad && signatureSalads.length > 0 ? (
                <Box>
                  <Text mb={2}>{t('checkout.selectedMeals')}:</Text>
                  <SimpleGrid p={10} columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={5}>
                    {[...signatureSalads, customizedSalad].map((meal, index) => (
                      <AllergenAwareMealPlanCard
                        key={index}
                        meal={meal}
                        index={index}
                        onChoose={handleMealSelection}
                        isArabic={isArabic}
                        t={t}
                      />
                    ))}
                  </SimpleGrid>
                </Box>
              ) : signatureSalads?.length > 0 ? (
                <Box>
                  <Text mb={2}>{t('checkout.defaultSignatureSalads')}:</Text>
                  <SimpleGrid p={5} columns={{ base: 1, md: 2, lg: 3, xl: 3 }} spacing={1}>
                    {signatureSalads?.map((meal, index) => (
                      <Box key={index}>
                        <AllergenAwareMealPlanCard
                          index={meal.id}
                          onChoose={handleMealSelection}
                          meal={meal}
                          isArabic={isArabic}
                          t={t}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              ) : (
                <>
                  <Heading>Sorry!</Heading>
                  <Text>There are no salads to choose, we are working on it</Text>
                </>
              )}
            </Box>

            <Box>
              <SimpleGrid p={10} columns={{ base: 1, md: 2, lg: 3, xl: 3 }} spacing={3}>
                {selectedMeals.length > 0 &&
                  selectedMeals.map((meal, index) => {
                    const deliveryDate = calculateDeliveryDate(today, index)
                    return (
                      <Flex key={index} direction="column">
                        <AllergenAwareMealPlanCard
                          meal={meal}
                          index={index}
                          onRemove={handleRemoveMeal}
                          isArabic={isArabic}
                          t={t}
                          showDeliveryDate={true}
                          deliveryDate={deliveryDate}
                        />
                      </Flex>
                    )
                  })}
              </SimpleGrid>
            </Box>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              {t('checkout.subscriptionRenewal')}
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mx={5} onClick={onClose}>
            {t('checkout.back')}
          </Button>
          <Button
            mx={5}
            colorScheme="brand"
            disabled={selectedMeals.length < user?.subscription?.mealsCount}
            onClick={handleConfirmSubscription}
            isLoading={isSubmitting}
          >
            {t('checkout.confirmAndPay')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmPlanModal
