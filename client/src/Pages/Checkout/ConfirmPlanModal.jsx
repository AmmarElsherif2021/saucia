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
  Badge,
  HStack,
  Collapse,
  IconButton,
  useColorMode,
  useBreakpointValue
} from '@chakra-ui/react'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext'
import { supabase } from '../../../supabaseClient'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { useElements } from '../../Contexts/ElementsContext'
import CustomizableMealSelectionCollapse from './CustomizableMealSelectionCollapse'
import MealSlotCard from './MealSlotCard'
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

// Motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};


// Meal Ingredients Detail Modal
const MealIngredientsModal = ({ isOpen, onClose, mealData, mealIndex, t }) => {
  const { colorMode } = useColorMode();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';

  if (!mealData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px">
          <HStack>
            <Badge colorScheme="brand" variant="solid">
              {t('checkout.mealDesign')} {mealIndex + 1}
            </Badge>
            <Text fontSize="md" fontWeight="semibold">
              {t('checkout.ingredientDetails')}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalBody py={4}>
          <VStack spacing={3} align="stretch">
            {/* Summary Stats */}
            <SimpleGrid columns={2} spacing={3} mb={4}>
              <Box textAlign="center" p={2} bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" color="brand.500">
                  {mealData.itemCount}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  {t('ingredients')}
                </Text>
              </Box>
              <Box textAlign="center" p={2} bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" color="green.500">
                  {mealData.totalKcal}
                </Text>
                <Text fontSize="xs" color="gray.600">
                  kcal
                </Text>
              </Box>
            </SimpleGrid>

            {/* Ingredients List */}
            <Divider />
            <Heading size="sm" mb={2}>{t('checkout.ingredients')}</Heading>
            <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
              {mealData.items.map((item, idx) => (
                <Flex key={idx} justify="space-between" align="center" p={2} 
                      bg={colorMode === 'dark' ? 'gray.600' : 'white'} 
                      borderRadius="md" borderWidth="1px">
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {isArabic ? item.name_arabic || item.name : item.name}
                    </Text>
                    {item.kcal && (
                      <Text fontSize="2xs" color="gray.600">
                        {item.kcal} kcal per unit
                      </Text>
                    )}
                  </VStack>
                  <HStack spacing={1}>
                    <Badge variant="outline" colorScheme="blue">
                      x{item.quantity}
                    </Badge>
                    <Text fontSize="xs" color="green.600" fontWeight="medium">
                      {(item.kcal || 0) * item.quantity} kcal
                    </Text>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} size="sm">
            {t('common.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Enhanced Meal Preview Component - Responsive Grid of Square Meal Cards
const MealDesignsPreview = ({ mealDesigns, saladItems, t }) => {
  const { colorMode } = useColorMode();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);
  
  // Calculate meal design summary
  const mealSummary = useMemo(() => {
    if (!saladItems || !mealDesigns) return {};
    
    const summary = {};
    
    mealDesigns.forEach((design, index) => {
      if (design && Object.keys(design).length > 0) {
        const mealItems = [];
        let totalKcal = 0;
        
        Object.entries(design).forEach(([itemId, quantity]) => {
          const item = saladItems.find(s => s.id === parseInt(itemId));
          if (item && quantity > 0) {
            mealItems.push({ ...item, quantity });
            totalKcal += (item.kcal || 0) * quantity;
          }
        });
        
        summary[index] = {
          items: mealItems,
          totalKcal,
          itemCount: mealItems.length
        };
      }
    });
    
    return summary;
  }, [saladItems, mealDesigns]);

  const completedMealsCount = mealDesigns?.filter(meal => 
    meal && Object.keys(meal).length > 0
  ).length || 0;

  // Function to get ingredient preview text (first 2-3 items or first 100 characters)
  const getIngredientPreview = (mealData) => {
    if (!mealData?.items?.length) return t('checkout.noIngredients');
    
    const ingredientNames = mealData.items.map(item => 
      isArabic ? item.name_arabic || item.name : item.name
    );
    
    // Show first 2-3 ingredients or truncate at 100 characters
    let preview = ingredientNames.slice(0, 3).join(', ');
    if (preview.length > 100) {
      preview = preview.substring(0, 100) + '...';
    } else if (ingredientNames.length > 3) {
      preview += ` +${ingredientNames.length - 3} ${t('more')}`;
    }
    
    return preview;
  };

  if (!mealDesigns?.length) return null;

  const selectedMealData = selectedMealIndex !== null ? mealSummary[selectedMealIndex] : null;

  return (
    <MotionBox
      variants={itemVariants}
      p={3}
      bg={colorMode === 'dark' ? 'gray.700' : 'brand.50'}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'brand.200'}
    >
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="sm" color="brand.600">
          {t('checkout.mealDesignsOverview')}
        </Heading>
        <Badge colorScheme={completedMealsCount === 5 ? 'green' : 'orange'} fontSize="xs">
          {completedMealsCount} / 5 {t('checkout.completed')}
        </Badge>
      </Flex>
      
      {/* Responsive Grid of Square Meal Cards */}
      <SimpleGrid columns={{ base: 2, sm: 3, md: 4}} spacing={2} mb={4}>
        {mealDesigns.map((design, index) => {
          const isCompleted = Object.keys(design).length > 0;
          const mealData = mealSummary[index];
          
          return (
            <MotionBox
              key={index}
              variants={itemVariants}
              p={2}
              aspectRatio="1/1"
              minH="100px"
              bg={colorMode === 'dark' ? 'gray.600' : 'white'}
              borderRadius="lg"
              borderWidth="2px"
              borderColor={isCompleted ? 'green.200' : 'orange.200'}
              cursor={isCompleted ? 'pointer' : 'default'}
              onClick={isCompleted ? () => setSelectedMealIndex(index) : undefined}
              _hover={isCompleted ? { 
                borderColor: 'green.300', 
                transform: 'translateY(-2px)',
                shadow: 'md'
              } : {}}
              transition="all 0.2s"
              position="relative"
              display="flex"
              flexDirection="column"
            >
              {/* Meal Number Badge */}
              <Badge
                position="absolute"
                top={1}
                right={1}
                colorScheme={isCompleted ? 'green' : 'orange'}
                variant="solid"
                fontSize="2xs"
                borderRadius="full"
                px={2}
                zIndex={1}
              >
                #{index + 1}
              </Badge>

              <VStack spacing={1} align="center" justify="center" h="full" p={1}>
                {isCompleted ? (
                  <>
                    {/* Stats Row */}
                    <HStack spacing={1} fontSize="2xs" color="gray.600" mt={2}>
                      <Text>
                        <Text as="span" fontWeight="bold" color="brand.500">
                          {mealData?.itemCount || 0}
                        </Text>
                      </Text>
                      <Text>•</Text>
                      <Text>
                        <Text as="span" fontWeight="bold" color="green.500">
                          {mealData?.totalKcal || 0}
                        </Text>
                      </Text>
                    </HStack>

                    {/* Ingredients Preview */}
                    <Text 
                      fontSize="xs" 
                      color="gray.600" 
                      textAlign="center"
                      noOfLines={4}
                      flex={1}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      px={1}
                    >
                      {getIngredientPreview(mealData)}
                    </Text>

                    {/* Click to view hint */}
                    <Text fontSize="2xs" color="blue.500" fontStyle="italic">
                      {t('common.clickToView')}
                    </Text>
                  </>
                ) : (
                  <VStack spacing={1} justify="center" flex={1} w="full">
                    <Box
                      w={6}
                      h={6}
                      borderRadius="full"
                      border="2px dashed"
                      borderColor="orange.300"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="md" color="orange.400">+</Text>
                    </Box>
                    <Text fontSize="2xs" color="orange.500" textAlign="center">
                      {t('checkout.designRequired')}
                    </Text>
                  </VStack>
                )}
              </VStack>
            </MotionBox>
          );
        })}
      </SimpleGrid>
      
      {/* Summary Stats */}
      <Divider mb={3} />
      <SimpleGrid columns={2} spacing={2} textAlign="center" fontSize="xs">
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="green.500">
            {completedMealsCount}
          </Text>
          <Text fontSize="2xs" color="gray.600">
            {t('checkout.completedMeals')}
          </Text>
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="orange.500">
            {5 - completedMealsCount}
          </Text>
          <Text fontSize="2xs" color="gray.600">
            {t('checkout.remainingMeals')}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Ingredients Detail Modal */}
      <MealIngredientsModal
        isOpen={selectedMealIndex !== null}
        onClose={() => setSelectedMealIndex(null)}
        mealData={selectedMealData}
        mealIndex={selectedMealIndex}
        t={t}
      />
    </MotionBox>
  );
};

const ConfirmPlanModal = ({
  isOpen,
  onClose,
  isSubmitting,
  t,
  today,
}) => {
  const { currentLanguage } = useI18nContext()
  const { user } = useAuthContext()
  const {
    subscriptionData,
    updateSubscriptionData,
    fetchPlanAdditives
  } = useChosenPlanContext()
  const userPlan = subscriptionData.plan
  const { createSubscription, isCreating } = useUserSubscriptions()
  const isLoading = isSubmitting || isCreating
  const isArabic = currentLanguage === 'ar'
  const toast = useToast()
  const { colorMode } = useColorMode()
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  const [editingMealIndex, setEditingMealIndex] = useState(null)
  const [saladItems, setSaladItems] = useState([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [openMealIndex, setOpenMealIndex] = useState(null)

  // Fetch salad items when modal opens
  useEffect(() => {
    const fetchSaladItems = async () => {
      if (isOpen && userPlan?.additives?.length > 0) {
        setIsLoadingItems(true)
        try {
          const items = await fetchPlanAdditives(userPlan.additives)
          setSaladItems(items || [])
        } catch (error) {
          console.error('Error fetching salad items:', error)
          setSaladItems([])
        } finally {
          setIsLoadingItems(false)
        }
      } else if (isOpen) {
        setSaladItems(subscriptionData.additives || [])
      }
    }

    fetchSaladItems()
  }, [isOpen, userPlan, fetchPlanAdditives, subscriptionData.additives])

  // Initialize meals array when modal opens 
  useEffect(() => {
    if (isOpen && userPlan) {
      if (!subscriptionData.meals || subscriptionData.meals.length !== 5) {
        updateSubscriptionData({
          meals: Array(5).fill({})
        })
      }
    }
  }, [isOpen, userPlan, subscriptionData.meals, updateSubscriptionData])

  // Format dates
  const formattedStartDate = useMemo(() => {
    return subscriptionData?.start_date 
      ? new Date(subscriptionData.start_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : ''
  }, [subscriptionData?.start_date, currentLanguage])

  const formattedEndDate = useMemo(() => {
    return subscriptionData?.end_date 
      ? new Date(subscriptionData.end_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : ''
  }, [subscriptionData?.end_date, currentLanguage])

  const handleSaveMealDesign = (mealDesign, mealIndex) => {
    if (mealIndex === null || mealIndex === undefined) return
    
    const newMeals = [...subscriptionData.meals]
    newMeals[mealIndex] = mealDesign
    
    updateSubscriptionData({ meals: newMeals })
    setOpenMealIndex(null)
    
    toast({
      title: t('checkout.mealSaved'),
      description: t('checkout.mealSavedDesc', { number: mealIndex + 1 }),
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleMealClose = (mealIndex) => {
    setOpenMealIndex(null)
  }

  const handleConfirmSubscription = async () => {
    try {
      // Format the subscription data according to the database schema
      const subscription = {
        plan_id: userPlan.id,
        status: 'pending',
        start_date: subscriptionData.start_date,
        end_date: subscriptionData.end_date,
        price_per_meal: userPlan.price_per_meal,
        total_meals: subscriptionData.total_meals,
        consumed_meals: 0,
        delivery_address_id: subscriptionData.delivery_address_id, // This should be set before reaching this modal
        preferred_delivery_time: subscriptionData.preferred_delivery_time || '10:00:00', // Format as TIME
        auto_renewal: false,
        payment_method_id: subscriptionData.payment_method_id, // This should be set before reaching this modal
        meals: subscriptionData.meals, // This will be converted to JSONB by the database
        next_delivery_meal: 0, // Start with the first meal design
      }
      
      console.log('Creating subscription with data:', subscription)
      
      await createSubscription(subscription)
      
      toast({
        title: t('checkout.subscriptionSuccess'),
        description: t('checkout.subscriptionCreated'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      
      onClose()
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: t('checkout.subscriptionError'),
        description: error.message || t('checkout.subscriptionFailed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const canConfirmSubscription = useMemo(() => {
    // Check if all 5 meal designs are completed
    const mealsComplete = subscriptionData.meals?.every(meal => 
      meal && Object.keys(meal).length > 0
    )
    
    // Check if required fields are present
    const hasRequiredData = !!(
      subscriptionData.plan_id &&
      subscriptionData.start_date &&
      subscriptionData.end_date &&
      subscriptionData.total_meals &&
      subscriptionData.price_per_meal
    )
    
    return mealsComplete && hasRequiredData
  }, [subscriptionData])

  const completedMealsCount = useMemo(() => {
    return subscriptionData.meals?.filter(meal => 
      meal && Object.keys(meal).length > 0
    ).length || 0
  }, [subscriptionData.meals])

  const PlanDetailsSection = () => (
    <MotionBox variants={itemVariants}>
      <Heading size="md" mb={3}>
        {t('checkout.planDetails')}
      </Heading>
      
      <VStack spacing={2} align="stretch" fontSize="sm">
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.plan')}</Text>
          <Text fontWeight="bold" noOfLines={1} maxW="50%" textAlign="right">
            {isArabic ? userPlan?.title_arabic : userPlan?.title}
          </Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.startDate')}</Text>
          <Text fontWeight="bold">{formattedStartDate}</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.endDate')}</Text>
          <Text fontWeight="bold">{formattedEndDate}</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.totalMeals')}</Text>
          <Text fontWeight="bold">{subscriptionData.total_meals}</Text>
        </Flex>
        
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.deliverySystem')}</Text>
          <Text fontWeight="bold" fontSize="xs" color="blue.600">
            {t('checkout.workingDaysOnly')}
          </Text>
        </Flex>
        
        <Divider />
        
        <Flex justify="space-between">
          <Text color="gray.600">{t('checkout.mealsComplete')}</Text>
          <Text fontWeight="bold" color={completedMealsCount === 5 ? 'green.500' : 'orange.500'}>
            {completedMealsCount} / 5
          </Text>
        </Flex>
      </VStack>
    </MotionBox>
  )

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={isMobile ? "xl" : "lg"} 
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent 
          maxW={isMobile ? "100vw" : "95vw"} 
          minH={isMobile ? "98vh" : "90vh"} 
          borderRadius={isMobile ? 0 : "xl"}
          p={2}
        >
          <ModalHeader 
            borderBottomWidth="1px" 
            p={1}
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            position="sticky"
            top={0}
            zIndex={10}
          >
            <Flex justify="space-between" align="start" gap={2}>
              <VStack align="start" spacing={1} flex={1}>
                <Heading size="md">{t('checkout.designYourPlan')}</Heading>
                <Text fontSize="xs" color="gray.600" noOfLines={2}>
                  {t('checkout.designPlanSubtitle')}
                </Text>
              </VStack>
              <IconButton
                icon={<CloseIcon />}
                onClick={onClose}
                size="sm"
                variant="ghost"
                aria-label="Close"
              />
            </Flex>
          </ModalHeader>
          
          <ModalBody p={1} overflowY="auto">
            <MotionVStack
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              spacing={1}
              align="stretch"
            >
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {/* Left Column - Plan Details and Meal Designs */}
                <VStack spacing={1} align="stretch">
                  <PlanDetailsSection />
                  
                  <Divider />
                  
                  <MotionBox variants={itemVariants}>
                    <Flex justify="space-between" align="center" mb={3}>
                      <Heading size="sm">{t('checkout.yourMealDesigns')}</Heading>
                      <Badge colorScheme={completedMealsCount === 5 ? 'green' : 'orange'} fontSize="xs">
                        {completedMealsCount === 5 
                          ? t('checkout.allMealsComplete') 
                          : t('checkout.mealsRemaining', { count: 5 - completedMealsCount })}
                      </Badge>
                    </Flex>
                    
                    <Text mb={3} fontSize="xs" color="gray.600">
                      {t('checkout.designMealsInstruction')}
                    </Text>
                    
                    {/* Alert about delivery system */}
                    <Alert status="info" size="sm" mb={3} borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="2xs">
                        {t('checkout.deliveryInfo')} {/* "Meals will be delivered on working days only (Sunday-Thursday). The 5 meal designs will cycle throughout your subscription." */}
                      </Text>
                    </Alert>
                    
                    {isLoadingItems ? (
                      <Text fontSize="sm">{t('loading')}...</Text>
                    ) : (
                      <VStack spacing={3} align="stretch">
                        {subscriptionData.meals?.map((mealDesign, index) => (
                          <Box key={index}>
                            <Flex 
                              justify="space-between" 
                              align="center" 
                              p={1} 
                              bg={colorMode === 'dark' ? 'gray.700' : 'brand.100'} 
                              borderRadius="md"
                              borderBottomRadius={openMealIndex === index ? 'none' : 'md'}
                              cursor="pointer"
                              onClick={() => setOpenMealIndex(openMealIndex === index ? null : index)}
                              _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'brand.200' }}
                              mb={0}
                            >
                              <HStack spacing={2}>
                                <Text fontWeight="medium" fontSize="sm">
                                  {t('checkout.mealDesign')} {index + 1}
                                </Text>
                                {Object.keys(mealDesign).length > 0 && (
                                  <Badge colorScheme="green" fontSize="2xs">
                                    {t('checkout.completed')}
                                  </Badge>
                                )}
                              </HStack>
                              <IconButton
                                icon={openMealIndex === index ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                size="xs"
                                variant="ghost"
                                aria-label={openMealIndex === index ? t('common.collapse') : t('common.expand')}
                              />
                            </Flex>
                            
                            <CustomizableMealSelectionCollapse
                              isOpen={openMealIndex === index}
                              onClose={handleMealClose}
                              onConfirm={handleSaveMealDesign}
                              saladItems={saladItems}
                              t={t}
                              isArabic={isArabic}
                              title={t('checkout.designMealTitle', { number: index + 1 })}
                              instructionText={t('checkout.customizeMealInstruction')}
                              saveButtonText={t('checkout.saveMeal')}
                              initialSelectedItems={mealDesign || {}}
                              mealIndex={index}
                            />
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </MotionBox>
                </VStack>

                {/* Right Column - Meal Designs Preview */}
                <VStack spacing={3} align="stretch">
                  <MealDesignsPreview 
                    mealDesigns={subscriptionData.meals}
                    saladItems={saladItems}
                    t={t}
                  />
                </VStack>
              </SimpleGrid>
            </MotionVStack>
          </ModalBody>
          
          <ModalFooter 
            borderTopWidth="1px" 
            p={3}
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            position="sticky"
            bottom={0}
            zIndex={10}
          >
            <Flex justify="space-between" w="full" align="center" gap={2}>
              <Button 
                variant="outline" 
                onClick={onClose} 
                isDisabled={isLoading}
                size="sm"
              >
                {t('checkout.back')}
              </Button>
              
              <HStack spacing={2}>
                {!canConfirmSubscription && (
                  <Text color="orange.500" fontSize="xs" noOfLines={1}>
                    {completedMealsCount < 5 
                      ? t('checkout.designAllMealsWarning')
                      : t('checkout.completeRequiredFields')
                    }
                  </Text>
                )}
                <Button
                  colorScheme="brand"
                  onClick={handleConfirmSubscription}
                  isLoading={isLoading}
                  isDisabled={!canConfirmSubscription || isLoading}
                  size="sm"
                >
                  {t('checkout.confirmAndPay')}
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConfirmPlanModal