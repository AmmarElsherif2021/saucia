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
} from '@chakra-ui/react'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useEffect, useState } from 'react'
import { useUser } from '../../Contexts/UserContext'
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
  MealCard,
  today,
  calculateDeliveryDate,
}) => {
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  const toast = useToast()
  const [endDateObj, setEndDateObj] = useState(null)
  const { user } = useUser()
  // Convert formattedEndDate to Date object when component mounts or formattedEndDate changes
  useEffect(() => {
    console.log(` from confirmation modal of plan ${JSON.stringify(userPlan)}`)
    if (formattedEndDate) {
      setEndDateObj(new Date(formattedEndDate))
    }
  }, [formattedEndDate])

  // handleMealSelection function:

  const handleMealSelection = (meal) => {
    // Check if user has remaining meals in their plan
    if (user.subscription.mealsCount && selectedMeals.length >= user.subscription.mealsCount) {
      toast({
        title: t('checkout.planLimitReachedTitle'),
        description: t('checkout.planLimitReachedDescription', {
          mealsCount: userPlan.mealsCount,
        }),
        status: 'error',
        duration: 5000,
        isClosable: true,
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
    //     isClosable: true,
    //   })
    //   return
    // }

    // Show success toast when meal is selected
    toast({
      title: t('checkout.mealAddedTitle'),
      description: t('checkout.mealAddedDescription', {
        mealName: meal.name,
        deliveryDate: deliveryDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        remainingMeals: userPlan.mealsCount - selectedMeals.length - 1,
      }),
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    // Proceed with adding the meal
    handleAddSignatureSalad(meal)
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

            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="lg">{t('checkout.yourMealPlan')}</Heading>
                <Box
                  size="xl"
                  w="13vw"
                  h="13vw"
                  colorScheme="brand"
                  as={Button}
                  variant="outline"
                  onClick={handleSelectMeals}
                >
                  {t('checkout.selectedMeal')}
                </Box>
              </Flex>

              {customizedSalad && signatureSalads.length > 0 ? (
                <Box>
                  <Text mb={2}>{t('checkout.selectedMeals')}:</Text>
                  <SimpleGrid p={10} columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={5}>
                    {[...signatureSalads, customizedSalad].map((meal, index) => (
                      <MealCard
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
                    {signatureSalads?.map((meal, index) => {
                      return (
                        <Box key={index}>
                          <MealCard
                            index={meal.id}
                            onChoose={handleMealSelection}
                            meal={meal}
                            isArabic={isArabic}
                            t={t}
                          />
                        </Box>
                      )
                    })}
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
                {selectedMeals.length &&
                  selectedMeals.map((meal, index) => {
                    const deliveryDate = calculateDeliveryDate(today, index)
                    return (
                      <Flex direction="column">
                        <MealCard
                          key={index}
                          meal={meal}
                          index={index}
                          onRemove={handleRemoveMeal}
                          isArabic={isArabic}
                          t={t}
                        />
                        <Text fontSize="xs" textAlign="center" mt={1} color="gray.500">
                          {deliveryDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
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
