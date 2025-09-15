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

// Date calculation utility (same as in ChosenPlanContext)
const calculateDeliveryDate = (startDate, mealIndex) => {
  const date = new Date(startDate);
  
  const startDayOfWeek = date.getDay();
  const isStartDateValid = startDayOfWeek !== 5 && startDayOfWeek !== 6;
  
  if (isStartDateValid && mealIndex === 0) {
    return new Date(date);
  }
  
  if (!isStartDateValid) {
    while (date.getDay() === 5 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    if (mealIndex === 0) {
      return new Date(date);
    }
  }
  
  let currentMealIndex = 0;
  
  while (currentMealIndex < mealIndex) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      currentMealIndex++;
    }
  }
  
  return new Date(date);
};

// Enhanced Meal Calendar Component with meal design mapping
const MealDeliveryCalendar = ({ subscriptionData, mealDesigns, saladItems, t }) => {
  const { colorMode } = useColorMode();
  const { currentLanguage } = useI18nContext();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const deliverySchedule = useMemo(() => {
    if (!subscriptionData?.start_date || !subscriptionData?.total_meals) return [];
    
    const schedule = [];
    const startDate = new Date(subscriptionData.start_date);
    const availableMealDesigns = mealDesigns?.filter(meal => meal && Object.keys(meal).length > 0) || [];
    
    for (let i = 0; i < subscriptionData.total_meals; i++) {
      const deliveryDate = calculateDeliveryDate(startDate, i);
      
      // Map meal designs cyclically - repeat the 5 designs across all delivery days
      const mealDesignIndex = i % 5; // Cycle through 0-4 for the 5 meal slots
      const assignedMealDesign = mealDesigns?.[mealDesignIndex] || null;
      const isDesignComplete = assignedMealDesign && Object.keys(assignedMealDesign).length > 0;
      
      schedule.push({
        deliveryIndex: i,
        mealSlot: mealDesignIndex + 1, // Display as 1-5
        deliveryDate: deliveryDate,
        formattedDate: deliveryDate.toLocaleDateString(currentLanguage, {
          weekday: isMobile ? 'short' : 'short',
          month: 'short',
          day: 'numeric'
        }),
        dayName: deliveryDate.toLocaleDateString(currentLanguage, { weekday: isMobile ? 'short' : 'long' }),
        mealDesign: assignedMealDesign,
        isComplete: isDesignComplete,
        isEmpty: !isDesignComplete
      });
    };
    //c.filter
    console.log('Delivery Schedule:', schedule);
    return schedule;
  }, [subscriptionData, mealDesigns, currentLanguage, isMobile]);

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

  if (!deliverySchedule.length) return null;

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
          {t('checkout.deliverySchedule')}
        </Heading>
        <Badge colorScheme="blue" fontSize="xs">
          {deliverySchedule.filter(d => d.isComplete).length} / {deliverySchedule.length} {t('checkout.ready')}
        </Badge>
      </Flex>
      
      <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
        {deliverySchedule.map(({ deliveryIndex, mealSlot, formattedDate, dayName, mealDesign, isComplete, isEmpty }, index) => (
          <Box
            key={deliveryIndex}
            p={2}
            bg={colorMode === 'dark' ? 'gray.600' : 'white'}
            borderRadius="md"
            borderWidth="1px"
            borderColor={isEmpty ? 'orange.200' : 'green.200'}
            position="relative"
            fontSize="sm"
          >
            <Flex align="center" justify="space-between" gap={2}>
              <HStack spacing={2} flex={1}>
                <Badge
                  colorScheme={isEmpty ? 'orange' : 'green'}
                  variant="solid"
                  fontSize="2xs"
                  minW="40px"
                >
                  #{deliveryIndex + 1}
                </Badge>
                
                <VStack align="start" spacing={0} flex={1}>
                  <Text fontSize="xs" fontWeight="medium" color="brand.600" noOfLines={1}>
                    {formattedDate}
                  </Text>
                  <Text fontSize="2xs" color="gray.600" noOfLines={1}>
                    {dayName}
                  </Text>
                </VStack>
              </HStack>
              
              <Box textAlign="right" flex={1}>
                {isComplete && mealSummary[mealSlot - 1] ? (
                  <VStack align="end" spacing={0}>
                    <Text fontSize="2xs" fontWeight="medium" color="green.600">
                      {mealSummary[mealSlot - 1].itemCount} {t('ingredients')}
                    </Text>
                    <Text fontSize="2xs" color="gray.600">
                      {mealSummary[mealSlot - 1].totalKcal} kcal
                    </Text>
                  </VStack>
                ) : (
                  <Text fontSize="2xs" color="orange.500" fontStyle="italic">
                    {t('checkout.mealNotDesigned')}
                  </Text>
                )}
              </Box>
            </Flex>
          </Box>
        ))}
      </VStack>
      
      {/* Enhanced Summary Stats */}
      <Divider my={2} />
      <SimpleGrid columns={3} spacing={2} textAlign="center" fontSize="xs">
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="brand.600">
            {deliverySchedule.length}
          </Text>
          <Text fontSize="2xs" color="gray.600">
            {t('checkout.totalDeliveries')}
          </Text>
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="green.500">
            {deliverySchedule?.filter(d => d.isComplete).length}
          </Text>
          <Text fontSize="2xs" color="gray.600">
            {t('checkout.readyDeliveries')}
          </Text>
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="orange.500">
            {deliverySchedule?.filter(d => d.isEmpty).length}
          </Text>
          <Text fontSize="2xs" color="gray.600">
            {t('checkout.pendingDeliveries')}
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
      const subscription = {
        plan_id: userPlan.id,
        status: 'pending',
        start_date: subscriptionData.start_date,
        end_date: subscriptionData.end_date,
        price_per_meal: userPlan.price_per_meal,
        total_meals: subscriptionData.total_meals,
        consumed_meals: 0,
        delivery_address_id: null,
        preferred_delivery_time: subscriptionData.preferred_delivery_time || '10:00-11:00',
        //delivery_days: subscriptionData.delivery_days,
        auto_renewal: false,
        payment_method_id: null,
        meals: subscriptionData.meals,
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
    return subscriptionData.meals?.every(meal => 
      meal && Object.keys(meal).length > 0
    )
  }, [subscriptionData.meals])

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
          <Text color="gray.600">{t('checkout.totalDeliveries')}</Text>
          <Text fontWeight="bold">{subscriptionData.total_meals}</Text>
        </Flex>
        
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
                                  {t('checkout.mealSlot')} {index + 1}
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

                {/* Right Column - Delivery Calendar */}
                <VStack spacing={3} align="stretch">
                  <MealDeliveryCalendar 
                    subscriptionData={subscriptionData}
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
                    {t('checkout.designAllMealsWarning')}
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