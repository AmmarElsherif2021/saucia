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
  IconButton,
  useColorMode,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { CloseIcon, EditIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

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

// Compact Meal Selection Modal
const CompactMealSelectionModal = ({ 
  isOpen, 
  onClose, 
  saladItems, 
  initialSelectedItems,
  onSave,
  mealIndex,
  t,
  isArabic 
}) => {
  const { colorMode } = useColorMode();
  const [selectedItems, setSelectedItems] = useState(initialSelectedItems || {});
  const [groupedItems, setGroupedItems] = useState({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(initialSelectedItems || {});
      setCurrentCategoryIndex(0);
      
      // Group items by category
      const grouped = {};
      if (Array.isArray(saladItems)) {
        saladItems.forEach((item) => {
          if (item && item.category) {
            if (!grouped[item.category]) {
              grouped[item.category] = [];
            }
            grouped[item.category].push(item);
          }
        });
      }
      setGroupedItems(grouped);
    }
  }, [isOpen, saladItems, initialSelectedItems]);

  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const categoryItems = groupedItems[item.category] || [];
      const newSelected = { ...prev };
      
      // Remove other items from same category
      categoryItems.forEach(categoryItem => {
        if (categoryItem.id !== item.id) {
          delete newSelected[categoryItem.id];
        }
      });

      // Toggle selection
      if (prev[item.id]) {
        delete newSelected[item.id];
      } else {
        newSelected[item.id] = 1;
      }

      return newSelected;
    });
  };

  const handleSave = () => {
    onSave(selectedItems, mealIndex);
    onClose();
  };

  const sectionEntries = Object.entries(groupedItems);
  const currentCategory = sectionEntries[currentCategoryIndex];
  const currentCategoryName = currentCategory?.[0];
  const currentItems = currentCategory?.[1] || [];
  const totalCategories = sectionEntries.length;

  const selectedCount = Object.keys(selectedItems).length;
  const selectedInCurrentCategory = currentItems.find(item => selectedItems[item.id]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px">
          <HStack justify="space-between">
            <VStack align="start" spacing={0}>
              <Text fontSize="md" fontWeight="bold">
                {t('designMealTitle', { number: mealIndex + 1 })}
              </Text>
              <Text fontSize="xs" color="gray.600" fontWeight="normal">
                {t('selectOnePerCategory')}
              </Text>
            </VStack>
            <Badge colorScheme={selectedCount > 0 ? 'green' : 'gray'} fontSize="sm">
              {selectedCount} {t('selected')}
            </Badge>
          </HStack>
        </ModalHeader>

        <ModalBody py={4}>
          <VStack spacing={4} align="stretch">
            {/* Category Navigation */}
            <Flex justify="space-between" align="center">
              <IconButton
                icon={<Text>◀</Text>}
                onClick={() => setCurrentCategoryIndex(Math.max(0, currentCategoryIndex - 1))}
                isDisabled={currentCategoryIndex === 0}
                size="sm"
                variant="outline"
              />
              
              <VStack spacing={1} flex={1}>
                <Text fontSize="md" fontWeight="bold" textAlign="center">
                  {isArabic 
                    ? currentItems[0]?.category_arabic || currentCategoryName 
                    : currentCategoryName}
                </Text>
                {selectedInCurrentCategory && (
                  <Badge colorScheme="green" fontSize="xs">
                    ✓ {isArabic 
                      ? selectedInCurrentCategory.name_arabic || selectedInCurrentCategory.name
                      : selectedInCurrentCategory.name}
                  </Badge>
                )}
                <Text fontSize="xs" color="gray.600">
                  {currentCategoryIndex + 1} / {totalCategories}
                </Text>
              </VStack>
              
              <IconButton
                icon={<Text>▶</Text>}
                onClick={() => setCurrentCategoryIndex(Math.min(totalCategories - 1, currentCategoryIndex + 1))}
                isDisabled={currentCategoryIndex === totalCategories - 1}
                size="sm"
                variant="outline"
              />
            </Flex>

            {/* Items Grid */}
            <SimpleGrid columns={3} spacing={3} minH="250px">
              {currentItems.map((item) => {
                const isSelected = !!selectedItems[item.id];
                const displayName = isArabic ? item.name_arabic || item.name : item.name;
                
                return (
                  <Box
                    key={item.id}
                    p={3}
                    borderWidth="2px"
                    borderRadius="lg"
                    bg={isSelected ? 'brand.400' : colorMode === 'dark' ? 'gray.700' : 'white'}
                    borderColor={isSelected ? 'brand.500' : colorMode === 'dark' ? 'gray.600' : 'gray.200'}
                    cursor="pointer"
                    onClick={() => handleSelectItem(item)}
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'md',
                      borderColor: isSelected ? 'brand.600' : 'brand.300'
                    }}
                    transition="all 0.2s"
                    position="relative"
                    textAlign="center"
                    minH="80px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {isSelected && (
                      <CheckCircleIcon
                        position="absolute"
                        top={1}
                        right={1}
                        color="white"
                        boxSize={4}
                      />
                    )}
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={isSelected ? 'white' : colorMode === 'dark' ? 'white' : 'gray.800'}
                      noOfLines={3}
                    >
                      {displayName}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <HStack spacing={2} w="full" justify="space-between">
            <Button variant="ghost" onClick={onClose} size="sm">
              {t('cancel')}
            </Button>
            <HStack>
              {currentCategoryIndex < totalCategories - 1 && (
                <Button
                  onClick={() => setCurrentCategoryIndex(currentCategoryIndex + 1)}
                  size="sm"
                  variant="outline"
                >
                  {t('next')} →
                </Button>
              )}
              <Button
                colorScheme="brand"
                onClick={handleSave}
                isDisabled={selectedCount === 0}
                size="sm"
              >
                {t('saveMeal')}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Confirmation Modal
const SubscriptionConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  subscriptionData,
  t,
  isArabic 
}) => {
  const { colorMode } = useColorMode();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px">
          <HStack spacing={2}>
            <CheckCircleIcon color="green.500" boxSize={6} />
            <Text>{t('confirmSubscription')}</Text>
          </HStack>
        </ModalHeader>

        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="sm">
                  {t('allMealsComplete')}
                </Text>
                <Text fontSize="xs">
                  {t('readyToConfirm')}
                </Text>
              </VStack>
            </Alert>

            <VStack spacing={2} align="stretch" fontSize="sm">
              <Flex justify="space-between">
                <Text color="gray.600">{t('plan')}:</Text>
                <Text fontWeight="bold">
                  {isArabic ? subscriptionData?.plan?.title_arabic : subscriptionData?.plan?.title}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.600">{t('totalMeals')}:</Text>
                <Text fontWeight="bold">{subscriptionData?.total_meals}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.600">{t('mealDesigns')}:</Text>
                <Text fontWeight="bold" color="green.500">5/5 ✓</Text>
              </Flex>
            </VStack>

            <Divider />

            <Text fontSize="sm" color="gray.600" textAlign="center">
              {t('confirmationMessage')}
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <HStack spacing={2} w="full" justify="space-between">
            <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
              {t('cancel')}
            </Button>
            <Button
              colorScheme="green"
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText={t('processing')}
            >
              {t('confirmAndPay')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Enhanced Meal Designs Preview with Click-to-Edit
const MealDesignsPreview = ({ mealDesigns, saladItems, onEditMeal, t, isArabic }) => {
  const { colorMode } = useColorMode();

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

  const getIngredientPreview = (mealData) => {
    if (!mealData?.items?.length) return t('noIngredients');
    
    const ingredientNames = mealData.items.map(item => 
      isArabic ? item.name_arabic || item.name : item.name
    );
    
    let preview = ingredientNames.slice(0, 3).join(', ');
    if (preview.length > 80) {
      preview = preview.substring(0, 80) + '...';
    } else if (ingredientNames.length > 3) {
      preview += ` +${ingredientNames.length - 3}`;
    }
    
    return preview;
  };

  return (
    <MotionBox
      variants={itemVariants}
      p={4}
      bg={colorMode === 'dark' ? 'gray.700' : 'brand.50'}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'brand.200'}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="sm" color="brand.600">
          {t('yourMealDesigns')}
        </Heading>
        <Badge colorScheme={completedMealsCount === 5 ? 'green' : 'orange'} fontSize="xs">
          {completedMealsCount} / 5
        </Badge>
      </Flex>
      
      <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={3} mb={4}>
        {mealDesigns.map((design, index) => {
          const isCompleted = Object.keys(design).length > 0;
          const mealData = mealSummary[index];
          
          return (
            <MotionBox
              key={index}
              variants={itemVariants}
              p={3}
              aspectRatio="1/1"
              bg={colorMode === 'dark' ? 'gray.600' : 'white'}
              borderRadius="lg"
              borderWidth="2px"
              borderColor={isCompleted ? 'green.300' : 'orange.300'}
              cursor="pointer"
              onClick={() => onEditMeal(index)}
              _hover={{ 
                borderColor: isCompleted ? 'green.400' : 'orange.400',
                transform: 'translateY(-2px)',
                shadow: 'lg'
              }}
              transition="all 0.2s"
              position="relative"
              display="flex"
              flexDirection="column"
            >
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme={isCompleted ? 'green' : 'orange'}
                fontSize="xs"
                borderRadius="full"
              >
                #{index + 1}
              </Badge>

              {isCompleted && (
                <EditIcon
                  position="absolute"
                  top={2}
                  left={2}
                  boxSize={3}
                  color="blue.500"
                />
              )}

              <VStack spacing={2} align="center" justify="center" h="full" pt={4}>
                {isCompleted ? (
                  <>
                    <HStack spacing={1} fontSize="xs">
                      <Badge colorScheme="brand" variant="subtle">
                        {mealData?.itemCount || 0}
                      </Badge>
                      <Badge colorScheme="green" variant="subtle">
                        {mealData?.totalKcal || 0} kcal
                      </Badge>
                    </HStack>
                    <Text 
                      fontSize="2xs" 
                      color="gray.600" 
                      textAlign="center"
                      noOfLines={3}
                      px={1}
                    >
                      {getIngredientPreview(mealData)}
                    </Text>
                    <Text fontSize="2xs" color="blue.500" fontStyle="italic">
                      {t('clickToEdit')}
                    </Text>
                  </>
                ) : (
                  <VStack spacing={2}>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="full"
                      border="2px dashed"
                      borderColor="orange.400"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="lg" color="orange.500">+</Text>
                    </Box>
                    <Text fontSize="2xs" color="orange.600" textAlign="center" fontWeight="medium">
                      {t('clickToDesign')}
                    </Text>
                  </VStack>
                )}
              </VStack>
            </MotionBox>
          );
        })}
      </SimpleGrid>
      
      <Divider mb={3} />
      <SimpleGrid columns={2} spacing={3} textAlign="center" fontSize="xs">
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="green.500">
            {completedMealsCount}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {t('completed')}
          </Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="orange.500">
            {5 - completedMealsCount}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {t('remaining')}
          </Text>
        </Box>
      </SimpleGrid>
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
  const navigate = useNavigate();
  const { currentLanguage } = useI18nContext();
  const { user } = useAuthContext();
  const {
    subscriptionData,
    updateSubscriptionData,
    fetchPlanAdditives
  } = useChosenPlanContext();
  const userPlan = subscriptionData.plan;
  const { createSubscription, isCreating } = useUserSubscriptions();
  const isLoading = isSubmitting || isCreating;
  const isArabic = currentLanguage === 'ar';
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const [saladItems, setSaladItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [editingMealIndex, setEditingMealIndex] = useState(null);
  
  const { 
    isOpen: isConfirmationOpen, 
    onOpen: onConfirmationOpen, 
    onClose: onConfirmationClose 
  } = useDisclosure();

  // Fetch salad items
  useEffect(() => {
    const fetchSaladItems = async () => {
      if (isOpen && userPlan?.additives?.length > 0) {
        setIsLoadingItems(true);
        try {
          const items = await fetchPlanAdditives(userPlan.additives);
          setSaladItems(items || []);
        } catch (error) {
          console.error('Error fetching salad items:', error);
          setSaladItems([]);
        } finally {
          setIsLoadingItems(false);
        }
      } else if (isOpen) {
        setSaladItems(subscriptionData.additives || []);
      }
    };

    fetchSaladItems();
  }, [isOpen, userPlan, fetchPlanAdditives, subscriptionData.additives]);

  // Initialize meals array
  useEffect(() => {
    if (isOpen && userPlan) {
      if (!subscriptionData.meals || subscriptionData.meals.length !== 5) {
        updateSubscriptionData({
          meals: Array(5).fill({})
        });
      }
    }
  }, [isOpen, userPlan, subscriptionData.meals, updateSubscriptionData]);

  const formattedStartDate = useMemo(() => {
    return subscriptionData?.start_date 
      ? new Date(subscriptionData.start_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : '';
  }, [subscriptionData?.start_date, currentLanguage]);

  const formattedEndDate = useMemo(() => {
    return subscriptionData?.end_date 
      ? new Date(subscriptionData.end_date).toLocaleDateString(currentLanguage, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : '';
  }, [subscriptionData?.end_date, currentLanguage]);

  const handleSaveMealDesign = (mealDesign, mealIndex) => {
    const newMeals = [...subscriptionData.meals];
    newMeals[mealIndex] = mealDesign;
    
    updateSubscriptionData({ meals: newMeals });
    
    toast({
      title: t('mealSaved'),
      description: t('mealSavedDesc', { number: mealIndex + 1 }),
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleEditMeal = (index) => {
    setEditingMealIndex(index);
  };

  const handleConfirmSubscription = async () => {
    try {
      const subscription = {
        plan_id: userPlan.id,
        status: 'pending',
        start_date: subscriptionData.start_date,
        end_date: subscriptionData.end_date,
        price_per_meal: userPlan.price_per_meal,
        total_meals: subscriptionData.total_meals,
        consumed_meals: 0,
        delivery_address_id: subscriptionData.delivery_address_id,
        preferred_delivery_time: subscriptionData.preferred_delivery_time || '10:00:00',
        auto_renewal: false,
        payment_method_id: subscriptionData.payment_method_id,
        meals: subscriptionData.meals,
      };
      
      await createSubscription(subscription);
      
      toast({
        title: t('subscriptionSuccess'),
        description: t('subscriptionCreated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onConfirmationClose();
      onClose();
      
      // Navigate to premium page
      navigate('/premium');
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: t('subscriptionError'),
        description: error.message || t('subscriptionFailed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const canConfirmSubscription = useMemo(() => {
    const mealsComplete = subscriptionData.meals?.every(meal => 
      meal && Object.keys(meal).length > 0
    );
    
    const hasRequiredData = !!(
      subscriptionData.plan_id &&
      subscriptionData.start_date &&
      subscriptionData.end_date &&
      subscriptionData.total_meals &&
      subscriptionData.price_per_meal
    );
    
    return mealsComplete && hasRequiredData;
  }, [subscriptionData]);

  const completedMealsCount = useMemo(() => {
    return subscriptionData.meals?.filter(meal => 
      meal && Object.keys(meal).length > 0
    ).length || 0;
  }, [subscriptionData.meals]);

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="3xl"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxW="900px" minH="600px">
          <ModalHeader borderBottomWidth="1px" pb={3}>
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="md">{t('designYourPlan')}</Heading>
                <Text fontSize="sm" color="gray.600">
                  {t('designPlanSubtitle')}
                </Text>
              </VStack>
              <IconButton
                icon={<CloseIcon />}
                onClick={onClose}
                size="sm"
                variant="ghost"
              />
            </Flex>
          </ModalHeader>
          
          <ModalBody py={6}>
            <MotionVStack
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              spacing={6}
              align="stretch"
            >
              {/* Plan Details */}
              <MotionBox variants={itemVariants}>
                <Heading size="sm" mb={3}>
                  {t('planDetails')}
                </Heading>
                
                <SimpleGrid columns={2} spacing={3} fontSize="sm">
                  <Flex justify="space-between">
                    <Text color="gray.600">{t('plan')}:</Text>
                    <Text fontWeight="bold" noOfLines={1}>
                      {isArabic ? userPlan?.title_arabic : userPlan?.title}
                    </Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text color="gray.600">{t('totalMeals')}:</Text>
                    <Text fontWeight="bold">{subscriptionData.total_meals}</Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text color="gray.600">{t('startDate')}:</Text>
                    <Text fontWeight="bold">{formattedStartDate}</Text>
                  </Flex>
                  
                  <Flex justify="space-between">
                    <Text color="gray.600">{t('endDate')}:</Text>
                    <Text fontWeight="bold">{formattedEndDate}</Text>
                  </Flex>
                </SimpleGrid>
              </MotionBox>

              <Divider />

              {/* Alert */}
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text fontSize="sm">
                  {t('deliveryInfo')}
                </Text>
              </Alert>

              {/* Meal Designs Preview */}
              {isLoadingItems ? (
                <Text>{t('loading')}...</Text>
              ) : (
                <MealDesignsPreview
                  mealDesigns={subscriptionData.meals}
                  saladItems={saladItems}
                  onEditMeal={handleEditMeal}
                  t={t}
                  isArabic={isArabic}
                />
              )}
            </MotionVStack>
          </ModalBody>
          
          <ModalFooter borderTopWidth="1px">
            <Flex justify="space-between" w="full" align="center">
              <Button variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              
              <HStack spacing={2}>
                {!canConfirmSubscription && (
                  <Text color="orange.500" fontSize="sm">
                    {completedMealsCount < 5 
                      ? t('designAllMealsWarning')
                      : t('completeRequiredFields')
                    }
                  </Text>
                )}
                <Button
                  colorScheme="brand"
                  onClick={onConfirmationOpen}
                  isDisabled={!canConfirmSubscription}
                >
                  {t('continue')}
                </Button>
              </HStack>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Compact Meal Selection Modal */}
      <CompactMealSelectionModal
        isOpen={editingMealIndex !== null}
        onClose={() => setEditingMealIndex(null)}
        saladItems={saladItems}
        initialSelectedItems={subscriptionData.meals?.[editingMealIndex] || {}}
        onSave={handleSaveMealDesign}
        mealIndex={editingMealIndex}
        t={t}
        isArabic={isArabic}
      />

      {/* Confirmation Modal */}
      <SubscriptionConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={onConfirmationClose}
        onConfirm={handleConfirmSubscription}
        isLoading={isLoading}
        subscriptionData={subscriptionData}
        t={t}
        isArabic={isArabic}
      />
    </>
  );
};

export default ConfirmPlanModal;