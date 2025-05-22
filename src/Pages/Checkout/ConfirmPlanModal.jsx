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
  } from '@chakra-ui/react';
  import { useI18nContext} from '../../Contexts/I18nContext';
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
    const {currentLanguage}= useI18nContext();
    const isArabic = currentLanguage=== 'ar';
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent sx={{minWidth:'50vw'}}>
          <ModalHeader>{t('checkout.confirmSubscription')}</ModalHeader>
          <ModalBody sx={{ maxHeight: '60vh',minWidth:'50vw', overflowY: 'auto',overflowX:'hidden' }}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={2}>
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
                <Flex justify="space-between">
                  <Text>{t('checkout.endDate')}</Text>
                  <Text fontWeight="bold">{formattedEndDate}</Text>
                </Flex>
              </Box>
  
              <Divider />
  
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">{t('checkout.yourMealPlan')}</Heading>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleSelectMeals}
                  >
                    {t('checkout.selectMeals')}
                  </Button>
                </Flex>
                
                {customizedSalad && signatureSalads.length > 0 ? (
                  <Box>
                    <Text mb={2}>{t('checkout.selectedMeals')}:</Text>
                    <SimpleGrid p={10} columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={5}>
                      {[...signatureSalads,customizedSalad].map((meal, index) => (
                        <MealCard
                          key={index}
                          meal={meal}
                          index={index}
                          onChoose={handleAddSignatureSalad}
                          isArabic={isArabic}
                          t={t}
                        />
                       
                      ))}
                    </SimpleGrid>
                  </Box>
                ) : signatureSalads?.length> 0 ? (
                  <Box>
                    <Text mb={2}>{t('checkout.defaultSignatureSalads')}:</Text>
                    <SimpleGrid p={5} columns={{ base: 1, md: 2, lg: 3, xl: 3 }} spacing={1}>
                      {signatureSalads?.map((meal, index) => {
                        
                        return (
                          <Box key={index}>
                            <MealCard 
                            index={meal.id} 
                            onChoose={handleAddSignatureSalad} 
                            meal={meal}
                            isArabic={isArabic}
                            t={t}
                            />
                           
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                ):(
                    <>
                    <Heading>Sorry!</Heading>
                    <Text>There are no salads to choose, we are working on it</Text>
                    </>
                )}
              </Box>
              <Box>
              <SimpleGrid p={10} columns={{ base: 1, md: 2, lg: 3, xl: 3 }} spacing={3}>
                {selectedMeals.length && selectedMeals.map((meal, index) => {                    
                const deliveryDate = calculateDeliveryDate(today, index);
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
                  )})}
                </SimpleGrid>
              </Box>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                {t('checkout.subscriptionRenewal')}
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('checkout.back')}
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleConfirmSubscription}
              isLoading={isSubmitting}
            >
              {t('checkout.confirmAndPay')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default ConfirmPlanModal;