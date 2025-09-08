import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';
import { useItems } from '../../Hooks/useItems';
import {
  Box,
  Grid,
  GridItem,
  Text,
  VStack,
  HStack,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Input,
  Textarea,
  Button,
  IconButton,
  Flex,
  Avatar,
  Tag,
  TagLabel,
  Select,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiClock, FiUser, FiMapPin, FiInfo, FiPlus, FiSearch, FiPhone, FiActivity, FiCalendar, FiCreditCard, FiPause, FiPlay } from 'react-icons/fi';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const STATUS_CONFIG = {
  scheduled: { color: 'gray', bg: 'gray.50', label: 'scheduled' },
  preparing: { color: 'yellow', bg: 'yellow.50', label: 'preparing' },
  ready: { color: 'green', bg: 'green.50', label: 'ready' },
  delivered: { color: 'blue', bg: 'blue.50', label: 'delivered' },
  cancelled: { color: 'red', bg: 'red.50', label: 'cancelled' },
};

const SUBSCRIPTION_STATUS_CONFIG = {
  active: { color: 'green', label: 'active' },
  pending: { color: 'yellow', label: 'pending' },
  cancelled: { color: 'red', label: 'cancelled' },
  expired: { color: 'gray', label: 'expired' },
  paused: { color: 'orange', label: 'paused' },
};

// Helper function to process meal items from subscription data
const processMealItems = (mealData, allItems) => {
  if (!mealData || !Array.isArray(mealData) || !allItems) return [];
  
  return mealData.map((meal, mealIndex) => {
    const mealItems = [];
    
    // Process each item in the meal object
    Object.entries(meal).forEach(([itemId, quantity]) => {
      const numericItemId = parseInt(itemId);
      const item = allItems.find(item => item.id === numericItemId);
      
      if (item && quantity > 0) {
        mealItems.push({
          id: numericItemId,
          name: item.name,
          name_arabic: item.name_arabic,
          category: item.category,
          quantity: quantity,
          price: item.price,
          calories: item.calories,
          protein_g: item.protein_g,
          carbs_g: item.carbs_g,
          fat_g: item.fat_g,
        });
      }
    });
    
    return {
      id: `meal-${mealIndex}`,
      name: `Meal ${mealIndex + 1}`,
      items: mealItems,
      special_instructions: '',
      total_calories: mealItems.reduce((sum, item) => sum + (item.calories * item.quantity), 0),
      total_protein: mealItems.reduce((sum, item) => sum + (item.protein_g * item.quantity), 0),
      total_carbs: mealItems.reduce((sum, item) => sum + (item.carbs_g * item.quantity), 0),
      total_fat: mealItems.reduce((sum, item) => sum + (item.fat_g * item.quantity), 0),
    };
  });
};

// REFORMED: Generate deliveries with ONE MEAL per delivery based on delivery_days and meals array
const generateDeliveriesFromSubscriptions = (subscriptions, deliveryRecords = [], allItems) => {
  if (!subscriptions || !Array.isArray(subscriptions) || !allItems) return [];
  
  const deliveries = [];
  
  subscriptions.forEach(subscription => {
    // Get delivery records for this subscription
    const subscriptionDeliveryRecords = deliveryRecords.filter(
      record => record.subscription_id === subscription.id
    );

    // Process meals for this subscription
    const processedMeals = processMealItems(subscription.meals, allItems);
    
    // If we have delivery records from the view, use them (these should be one meal per record)
    if (subscriptionDeliveryRecords.length > 0) {
      subscriptionDeliveryRecords.forEach(deliveryRecord => {
        const deliveryDate = deliveryRecord.delivery_date.split('T')[0];
        const deliveryTime = subscription.preferred_delivery_time 
          ? subscription.preferred_delivery_time.substring(0, 5) 
          : '12:00';
        
        // Find the corresponding meal from the processed meals
        // This assumes deliveryRecord.next_delivery_meal contains the meal data
        const mealForDelivery = deliveryRecord.next_delivery_meal 
          ? [processMealFromData(deliveryRecord.next_delivery_meal, allItems)]
          : [processedMeals[0]]; // fallback to first meal if no specific meal data
        
        deliveries.push({
          id: deliveryRecord.next_delivery_id || deliveryRecord.id,
          delivery_record_id: deliveryRecord.id,
          user_profile: {
            id: subscription.user_profiles.id,
            display_name: subscription.user_profiles.display_name,
            email: subscription.user_profiles.email,
            phone_number: subscription.user_profiles.phone_number || 'N/A',
            avatar_url: subscription.user_profiles.avatar_url || '',
            notes: subscription.user_profiles.notes || 'No special notes',
          },
          subscription: {
            ...subscription,
            status: subscription.is_paused ? 'paused' : subscription.status,
          },
          delivery_date: deliveryDate,
          delivery_time: deliveryTime,
          delivery_address: subscription.delivery_address || `Delivery Address`,
          meals: mealForDelivery, // ONE MEAL per delivery
          status: deliveryRecord.next_delivery_status || 'scheduled',
          admin_notes: '',
          meals_count: 1, // Always 1 meal per delivery
        });
      });
    } else if (subscription.delivery_days && Array.isArray(subscription.delivery_days) && processedMeals.length > 0) {
      // Reformed fallback logic: Create one delivery per day with ONE meal
      // Distribute meals across delivery days
      subscription.delivery_days.forEach((deliveryDay, dayIndex) => {
        const deliveryDate = new Date(deliveryDay).toISOString().split('T')[0];
        const deliveryTime = subscription.preferred_delivery_time 
          ? subscription.preferred_delivery_time.substring(0, 5) 
          : '12:00';
        
        // Calculate which meal this delivery should contain
        // Option 1: Cycle through meals (if you have 5 meals and 20 days, each meal appears 4 times)
        const mealIndex = dayIndex % processedMeals.length;
        const mealForThisDelivery = processedMeals[mealIndex];
        
        // Determine delivery status based on date
        const today = new Date().toISOString().split('T')[0];
        const deliveryDateObj = new Date(deliveryDate);
        const todayObj = new Date(today);
        
        let status = 'scheduled';
        if (deliveryDateObj < todayObj) {
          status = 'delivered';
        } else if (deliveryDateObj.getTime() === todayObj.getTime()) {
          status = 'preparing';
        }
        
        deliveries.push({
          id: `${subscription.id}-delivery-${dayIndex}`,
          delivery_record_id: null, // No delivery record exists
          user_profile: {
            id: subscription.user_profiles.id,
            display_name: subscription.user_profiles.display_name,
            email: subscription.user_profiles.email,
            phone_number: subscription.user_profiles.phone_number || 'N/A',
            avatar_url: subscription.user_profiles.avatar_url || '',
            notes: subscription.user_profiles.notes || 'No special notes',
          },
          subscription: {
            ...subscription,
            status: subscription.is_paused ? 'paused' : subscription.status,
          },
          delivery_date: deliveryDate,
          delivery_time: deliveryTime,
          delivery_address: subscription.delivery_address || `Delivery Address`,
          meals: [mealForThisDelivery], // ONE MEAL per delivery
          status: status,
          admin_notes: '',
          meals_count: 1, // Always 1 meal per delivery
        });
      });
    }
  });
  
  return deliveries.sort((a, b) => a.delivery_date.localeCompare(b.delivery_date));
};

// Helper function to process a single meal from delivery record data
const processMealFromData = (mealData, allItems) => {
  if (!mealData || !allItems) return null;
  
  const mealItems = [];
  
  // Process the meal data (assuming it's in the same format as subscription.meals)
  Object.entries(mealData).forEach(([itemId, quantity]) => {
    const numericItemId = parseInt(itemId);
    const item = allItems.find(item => item.id === numericItemId);
    
    if (item && quantity > 0) {
      mealItems.push({
        id: numericItemId,
        name: item.name,
        name_arabic: item.name_arabic,
        category: item.category,
        quantity: quantity,
        price: item.price,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
      });
    }
  });
  
  return {
    id: `meal-single`,
    name: `Daily Meal`,
    items: mealItems,
    special_instructions: '',
    total_calories: mealItems.reduce((sum, item) => sum + (item.calories * item.quantity), 0),
    total_protein: mealItems.reduce((sum, item) => sum + (item.protein_g * item.quantity), 0),
    total_carbs: mealItems.reduce((sum, item) => sum + (item.carbs_g * item.quantity), 0),
    total_fat: mealItems.reduce((sum, item) => sum + (item.fat_g * item.quantity), 0),
  };
};
// Reusable components
const DeliveryBubble = ({ delivery, onClick }) => {
  const { t } = useTranslation();
  const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.scheduled;
  const subscriptionStatusConfig = SUBSCRIPTION_STATUS_CONFIG[delivery.subscription.status] || SUBSCRIPTION_STATUS_CONFIG.active;
  
  return (
    <Box
      bg={statusConfig.bg}
      p={3}
      borderRadius="lg"
      border="2px"
      borderColor={`${statusConfig.color}.200`}
      cursor="pointer"
      _hover={{ 
        shadow: "lg", 
        transform: "translateY(-1px)",
        borderColor: `${statusConfig.color}.300`
      }}
      onClick={() => onClick(delivery)}
      minW="180px"
      maxW="220px"
      transition="all 0.2s"
    >
      <VStack spacing={2} align="start">
        <HStack justify="space-between" w="full">
          <Badge colorScheme={statusConfig.color} size="sm">
            {t(`admin.${statusConfig.label}`)}
          </Badge>
          <Badge colorScheme={subscriptionStatusConfig.color} size="sm">
            {t(`admin.${subscriptionStatusConfig.label}`)}
          </Badge>
        </HStack>
        
        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
          {delivery.user_profile.display_name}
        </Text>
        
        <HStack spacing={1}>
          <FiPhone size="12" />
          <Text fontSize="xs" color="gray.700">
            {delivery.user_profile.phone_number}
          </Text>
        </HStack>

        <HStack spacing={1}>
          <FiCalendar size="12" />
          <Text fontSize="xs" color="gray.700">
            {delivery.delivery_date}
          </Text>
        </HStack>

        <HStack spacing={1}>
          <FiCreditCard size="12" />
          <Text fontSize="xs" color="gray.700">
            {t('admin.meals')}: {delivery.subscription.consumed_meals}/{delivery.subscription.total_meals}
          </Text>
        </HStack>

        <Text fontSize="xs" color="blue.600" fontWeight="medium">
          {delivery.meals_count} {t('admin.meal')} {t('admin.with')} {delivery.meals.reduce((sum, meal) => sum + meal.items.length, 0)} {t('admin.items')}
        </Text>

        {delivery.delivery_record_id && (
          <Text fontSize="xs" color="purple.600" fontWeight="medium">
            {t('admin.recordId')}: {delivery.delivery_record_id.substring(0, 8)}...
          </Text>
        )}
      </VStack>
    </Box>
  );
};

const KitchenQueueItem = ({ delivery, onClick }) => {
  const { t } = useTranslation();
  const statusConfig = STATUS_CONFIG[delivery.status] || STATUS_CONFIG.scheduled;
  const subscriptionStatusConfig = SUBSCRIPTION_STATUS_CONFIG[delivery.subscription.status] || SUBSCRIPTION_STATUS_CONFIG.active;
  
  return (
    <Box
      p={4}
      border="2px"
      borderColor={`${statusConfig.color}.200`}
      borderRadius="lg"
      cursor="pointer"
      onClick={() => onClick(delivery)}
      bg="white"
      _hover={{ shadow: "md", borderColor: `${statusConfig.color}.300` }}
      transition="all 0.2s"
    >
      <HStack justify="space-between" mb={2}>
        <HStack>
          <FiActivity size="14" />
          <Text fontWeight="bold" fontSize="sm">
            {delivery.delivery_record_id ? `${t('admin.record')} #${delivery.delivery_record_id.substring(0, 8)}...` : `${t('admin.legacy')} #${delivery.id.substring(0, 8)}...`}
          </Text>
        </HStack>
        <VStack spacing={0} align="end">
          <Badge colorScheme={statusConfig.color} size="sm">
            {t(`admin.${statusConfig.label}`)}
          </Badge>
          <Badge colorScheme={subscriptionStatusConfig.color} size="sm">
            {t(`admin.${subscriptionStatusConfig.label}`)}
          </Badge>
          <Text fontSize="xs" color="gray.600">
            {delivery.delivery_time}
          </Text>
        </VStack>
      </HStack>
      
      <VStack align="stretch" spacing={2}>
        {delivery.meals.map((meal, index) => (
          <Box key={meal.id} bg="gray.50" p={2} borderRadius="md">
            <HStack justify="space-between">
              <Text fontWeight="medium" fontSize="sm">
                {meal.name} ({meal.items.length} {t('admin.items')})
              </Text>
              <Tag size="sm" colorScheme="blue">
                <TagLabel>{meal.total_calories} {t('admin.cal')}</TagLabel>
              </Tag>
            </HStack>
            <Text fontSize="xs" color="gray.600" mt={1}>
              {meal.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}
            </Text>
          </Box>
        ))}
        
        <Text fontSize="xs" color="gray.600">
          {t('admin.for')}: {delivery.user_profile.display_name}
        </Text>
        
        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.600">
            {t('admin.date')}: {delivery.delivery_date}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {t('admin.progress')}: {delivery.subscription.consumed_meals}/{delivery.subscription.total_meals}
          </Text>
        </HStack>
        
        <HStack justify="space-between">
          <Text fontSize="xs" color="purple.600">
            {t('admin.mealsInDelivery')}: {delivery.meals_count}
          </Text>
          {delivery.delivery_record_id && (
            <Badge colorScheme="purple" size="sm">{t('admin.tracked')}</Badge>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

const MealDeliveryDashboard = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryRecords, setDeliveryRecords] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [newAdminNote, setNewAdminNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // API Hooks
  const { useGetAllSubscriptions } = useAdminFunctions();
  const { items, fetchItems, loading: itemsLoading } = useItems();
  
  // Fetch data
  const { data: subscriptions, isLoading: isLoadingSubscriptions, error: subscriptionsError } = useGetAllSubscriptions();

  // NEW: Mock function to fetch delivery records (replace with actual API call)
  const fetchDeliveryRecords = async () => {
    // This should be replaced with actual API call to fetch next_delivery_records
    // For now, returning empty array as placeholder
    return [];
  };

  // Load items and delivery records on component mount
  useEffect(() => {
    fetchItems();
    fetchDeliveryRecords().then(setDeliveryRecords);
  }, [fetchItems]);

  // Process subscriptions when data changes
  useEffect(() => {
    if (subscriptions && items && items.length > 0) {
      const processedDeliveries = generateDeliveriesFromSubscriptions(subscriptions, deliveryRecords, items);
      setDeliveries(processedDeliveries);
      console.log("Processed deliveries with delivery records:", processedDeliveries);
    }
  }, [subscriptions, items, deliveryRecords]);

  // Loading and error states
  if (isLoadingSubscriptions || itemsLoading) {
    return (
      <Box p={6} bg="gray.50" minH="100vh">
        <VStack spacing={4} align="center" justify="center" minH="50vh">
          <Spinner size="xl" color="blue.500" />
          <Text>{t('admin.loadingDashboard')}</Text>
        </VStack>
      </Box>
    );
  }

  if (subscriptionsError) {
    return (
      <Box p={6} bg="gray.50" minH="100vh">
        <Alert status="error">
          <AlertIcon />
          {t('admin.errorLoadingSubscriptions')}: {subscriptionsError.message}
        </Alert>
      </Box>
    );
  }

  // Get date range for display
  const getDateRange = () => {
    const dates = deliveries.map(d => d.delivery_date);
    const minDate = dates.length ? dates.reduce((a, b) => a < b ? a : b) : selectedDate;
    const maxDate = dates.length ? dates.reduce((a, b) => a > b ? a : b) : selectedDate;
    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getDateRange();

  // Filter deliveries for the selected date
  const deliveriesForSelectedDate = deliveries.filter(
    delivery => delivery.delivery_date === selectedDate
  );

  // Utility functions
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const filterDeliveries = (deliveries, query) => {
    if (!query) return deliveries;
    
    return deliveries.filter(delivery => 
      delivery.user_profile.display_name.toLowerCase().includes(query.toLowerCase()) ||
      delivery.user_profile.phone_number.includes(query) ||
      delivery.user_profile.email.toLowerCase().includes(query.toLowerCase()) ||
      delivery.meals.some(meal => 
        meal.items.some(item => item.name.toLowerCase().includes(query.toLowerCase()))
      ) ||
      delivery.subscription.status.toLowerCase().includes(query.toLowerCase())
    );
  };

  const groupDeliveriesByTime = (deliveries) => {
    return TIME_SLOTS.map(time => ({
      time,
      deliveries: deliveries.filter(d => d.delivery_time === time)
    }));
  };

  // Event handlers
  const handleDeliveryClick = (delivery) => {
    setSelectedDelivery(delivery);
    setNewAdminNote('');
    onOpen();
  };

  const addAdminNote = () => {
    if (!newAdminNote.trim() || !selectedDelivery) return;

    const timestamp = new Date().toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const noteToAdd = `${timestamp}: ${newAdminNote}`;
    
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.id === selectedDelivery.id) {
        return {
          ...delivery,
          admin_notes: delivery.admin_notes 
            ? `${delivery.admin_notes}\n${noteToAdd}` 
            : noteToAdd
        };
      }
      return delivery;
    });
    
    setDeliveries(updatedDeliveries);
    setSelectedDelivery(updatedDeliveries.find(d => d.id === selectedDelivery.id));
    setNewAdminNote('');
  };

  // NEW: Update delivery record status
  const updateDeliveryStatus = (deliveryId, newStatus) => {
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.id === deliveryId) {
        return {
          ...delivery,
          status: newStatus
        };
      }
      return delivery;
    });
    
    setDeliveries(updatedDeliveries);
    if (selectedDelivery && selectedDelivery.id === deliveryId) {
      setSelectedDelivery(updatedDeliveries.find(d => d.id === deliveryId));
    }
    
    // Here you would also call API to update the delivery record status
    // updateDeliveryRecordStatus(deliveryId, newStatus);
  };

  const updateSubscriptionStatus = (deliveryId, newStatus) => {
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.id === deliveryId) {
        return {
          ...delivery,
          subscription: {
            ...delivery.subscription,
            status: newStatus,
            is_paused: newStatus === 'paused',
            paused_at: newStatus === 'paused' ? new Date().toISOString() : delivery.subscription.paused_at,
            resume_date: newStatus === 'paused' ? null : delivery.subscription.resume_date
          }
        };
      }
      return delivery;
    });
    
    setDeliveries(updatedDeliveries);
    if (selectedDelivery && selectedDelivery.id === deliveryId) {
      setSelectedDelivery(updatedDeliveries.find(d => d.id === deliveryId));
    }
  };

  // Data processing
  const filteredDeliveries = filterDeliveries(deliveriesForSelectedDate, searchQuery);
  const deliveriesByTime = groupDeliveriesByTime(filteredDeliveries);
  const currentTime = getCurrentTime();
  const kitchenQueue = filteredDeliveries
    .filter(d => ['scheduled', 'preparing', 'ready'].includes(d.status))
    .sort((a, b) => a.delivery_time.localeCompare(b.delivery_time));

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="xl" color="gray.800">
            {t('admin.kitchenDeliveryDashboard')}
          </Heading>
          <HStack>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              maxW="200px"
              bg="white"
            />
            <HStack>
              <Input
                placeholder={t('admin.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="350px"
                bg="white"
              />
              <IconButton 
                aria-label={t('admin.search')} 
                icon={<FiSearch />} 
                colorScheme="blue"
                variant="ghost"
              />
            </HStack>
          </HStack>
        </Flex>

        {/* Summary Stats */}
        <HStack spacing={4}>
          <Badge colorScheme="blue" p={2}>
            {t('admin.totalSubscriptions')}: {subscriptions?.length || 0}
          </Badge>
          <Badge colorScheme="green" p={2}>
            {t('admin.totalDeliveries')}: {deliveries.length}
          </Badge>
          <Badge colorScheme="orange" p={2}>
            {t('admin.todaysDeliveries')}: {deliveriesForSelectedDate.length}
          </Badge>
          <Badge colorScheme="red" p={2}>
            {t('admin.kitchenQueue')}: {kitchenQueue.length}
          </Badge>
          <Badge colorScheme="purple" p={2}>
            {t('admin.trackedRecords')}: {deliveries.filter(d => d.delivery_record_id).length}
          </Badge>
        </HStack>

        {/* Date Navigation */}
        <HStack justify="center" spacing={4}>
          <Button 
            size="sm" 
            onClick={() => {
              const prevDate = new Date(selectedDate);
              prevDate.setDate(prevDate.getDate() - 1);
              setSelectedDate(prevDate.toISOString().split('T')[0]);
            }}
            isDisabled={selectedDate <= minDate}
          >
            {t('admin.previousDay')}
          </Button>
          <Text fontWeight="bold" color="gray.700">
            {t('admin.showing')}: {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <Button 
            size="sm" 
            onClick={() => {
              const nextDate = new Date(selectedDate);
              nextDate.setDate(nextDate.getDate() + 1);
              setSelectedDate(nextDate.toISOString().split('T')[0]);
            }}
            isDisabled={selectedDate >= maxDate}
          >
            {t('admin.nextDay')}
          </Button>
        </HStack>

        <Grid templateColumns="1fr 400px" gap={6}>
          {/* Main Schedule Grid */}
          <Card>
            <CardHeader>
              <Heading size="lg">{t('admin.deliveryScheduleFor')} {selectedDate}</Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {filteredDeliveries.length} {t('admin.deliveriesScheduled')}
              </Text>
            </CardHeader>
            <CardBody p={0}>
              <Box maxH="75vh" overflowY="auto">
                {/* Header */}
                <Grid templateColumns="120px 1fr" bg="gray.100" borderBottom="2px" borderColor="gray.200">
                  <GridItem p={4} borderRight="1px" borderColor="gray.300">
                    <Text fontWeight="bold" color="gray.700">{t('admin.timeSlot')}</Text>
                  </GridItem>
                  <GridItem p={4}>
                    <Text fontWeight="bold" color="gray.700">{t('admin.deliveries')}</Text>
                  </GridItem>
                </Grid>

                {/* Time Slot Rows */}
                {deliveriesByTime.map(({ time, deliveries }) => {
                  const isCurrentTime = currentTime >= time && currentTime < TIME_SLOTS[TIME_SLOTS.indexOf(time) + 1];
                  
                  return (
                    <Grid 
                      key={time}
                      templateColumns="120px 1fr" 
                      minH="100px"
                      borderBottom="1px"
                      borderColor="gray.200"
                      bg={isCurrentTime ? "blue.50" : "white"}
                    >
                      <GridItem 
                        p={4} 
                        borderRight="1px" 
                        borderColor="gray.200"
                        display="flex"
                        alignItems="center"
                      >
                        <VStack spacing={1} align="start">
                          <Text fontWeight="bold" fontSize="lg">{time}</Text>
                          {isCurrentTime && (
                            <Badge colorScheme="blue" size="sm">{t('admin.current')}</Badge>
                          )}
                        </VStack>
                      </GridItem>
                      
                      <GridItem p={4}>
                        <Flex gap={3} flexWrap="wrap" align="start">
                          {deliveries.map(delivery => (
                            <DeliveryBubble
                              key={delivery.id}
                              delivery={delivery}
                              onClick={handleDeliveryClick}
                            />
                          ))}
                          {deliveries.length === 0 && (
                            <Text color="gray.400" fontSize="sm" fontStyle="italic">
                              {t('admin.noDeliveriesScheduled')}
                            </Text>
                          )}
                        </Flex>
                      </GridItem>
                    </Grid>
                  );
                })}
              </Box>
            </CardBody>
          </Card>

          {/* Kitchen Queue Sidebar */}
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <HStack>
                  <FiActivity />
                  <Heading size="md">{t('admin.kitchenQueueFor')} {selectedDate}</Heading>
                  <Badge colorScheme="orange">{kitchenQueue.length}</Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3} maxH="60vh" overflowY="auto">
                  {kitchenQueue.map(delivery => (
                    <KitchenQueueItem
                      key={delivery.id}
                      delivery={delivery}
                      onClick={handleDeliveryClick}
                    />
                  ))}
                  {kitchenQueue.length === 0 && (
                    <Text color="gray.500" textAlign="center" py={8}>
                      {t('admin.allCaughtUp')}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Notes */}
            <Card>
              <CardHeader>
                <Heading size="md">{t('admin.quickAdminNote')}</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3}>
                  <Textarea
                    placeholder={t('admin.addGeneralNote')}
                    value={newAdminNote}
                    onChange={(e) => setNewAdminNote(e.target.value)}
                    resize="vertical"
                  />
                  <Button 
                    leftIcon={<FiPlus />} 
                    onClick={addAdminNote} 
                    isDisabled={!newAdminNote.trim() || !selectedDelivery}
                    colorScheme="blue"
                    size="sm"
                    w="full"
                  >
                    {t('admin.addNoteToOrder')}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>

      {/* Delivery Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent>
          <ModalHeader bg="blue.50" borderTopRadius="md">
            <HStack>
              <Text>
                {selectedDelivery?.delivery_record_id 
                  ? `${t('admin.deliveryRecord')} #${selectedDelivery.delivery_record_id.substring(0, 8)}...`
                  : `${t('admin.legacyOrder')} #${selectedDelivery?.id.substring(0, 8)}...`
                }
              </Text>
              {selectedDelivery && (
                <Badge colorScheme={STATUS_CONFIG[selectedDelivery.status]?.color || 'gray'}>
                  {t(`admin.${STATUS_CONFIG[selectedDelivery.status]?.label || selectedDelivery.status}`)}
                </Badge>
              )}
              {selectedDelivery && (
                <Badge colorScheme={SUBSCRIPTION_STATUS_CONFIG[selectedDelivery.subscription.status]?.color || 'gray'}>
                  {t(`admin.${SUBSCRIPTION_STATUS_CONFIG[selectedDelivery.subscription.status]?.label || selectedDelivery.subscription.status}`)}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedDelivery && (
              <VStack spacing={5} align="stretch">
                {/* Customer Info */}
                <Box p={4} bg="gray.50" borderRadius="md">
                  <VStack spacing={4}>
                    <Avatar 
                      src={selectedDelivery.user_profile.avatar_url} 
                      name={selectedDelivery.user_profile.display_name}
                      size="md"
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {selectedDelivery.user_profile.display_name}
                      </Text>
                      <HStack>
                        <FiPhone size="14" />
                        <Text fontSize="sm" color="gray.600">
                          {selectedDelivery.user_profile.phone_number}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {selectedDelivery.user_profile.email}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>

                {/* NEW: Delivery Record Info */}
                {selectedDelivery.delivery_record_id && (
                  <Box p={4} bg="purple.50" borderRadius="md">
                    <Heading size="sm" mb={3}>{t('admin.deliveryRecordDetails')}</Heading>
                    <Grid templateColumns="1fr 1fr" gap={3}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm"><strong>{t('admin.recordId')}:</strong> {selectedDelivery.delivery_record_id.substring(0, 8)}...</Text>
                        <Text fontSize="sm"><strong>{t('admin.status')}:</strong> {t(`admin.${selectedDelivery.status}`)}</Text>
                        <Text fontSize="sm"><strong>{t('admin.mealsCount')}:</strong> {selectedDelivery.meals_count}</Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm"><strong>{t('admin.deliveryDate')}:</strong> {selectedDelivery.delivery_date}</Text>
                        <Text fontSize="sm"><strong>{t('admin.deliveryTime')}:</strong> {selectedDelivery.delivery_time}</Text>
                        <Text fontSize="sm"><strong>{t('admin.tracking')}:</strong> {t('admin.fullRecordTracking')}</Text>
                      </VStack>
                    </Grid>
                  </Box>
                )}

                {/* Subscription Info */}
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Heading size="sm" mb={3}>{t('admin.subscriptionDetails')}</Heading>
                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm"><strong>{t('admin.plan')}:</strong> {selectedDelivery.subscription.plans?.title || 'N/A'}</Text>
                      <Text fontSize="sm"><strong>{t('admin.status')}:</strong> {t(`admin.${selectedDelivery.subscription.status}`)}</Text>
                      <Text fontSize="sm"><strong>{t('admin.start')}:</strong> {selectedDelivery.subscription.start_date}</Text>
                      <Text fontSize="sm"><strong>{t('admin.end')}:</strong> {selectedDelivery.subscription.end_date || 'N/A'}</Text>
                      <Text fontSize="sm"><strong>{t('admin.pricePerMeal')}:</strong> ${selectedDelivery.subscription.price_per_meal}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm"><strong>{t('admin.meals')}:</strong> {selectedDelivery.subscription.consumed_meals}/{selectedDelivery.subscription.total_meals}</Text>
                      <Text fontSize="sm"><strong>{t('admin.autoRenewal')}:</strong> {selectedDelivery.subscription.auto_renewal ? t('admin.yes') : t('admin.no')}</Text>
                      <Text fontSize="sm"><strong>{t('admin.deliveryDays')}:</strong> {selectedDelivery.subscription.delivery_days?.length || 0} {t('admin.scheduled')}</Text>
                      <Text fontSize="sm"><strong>{t('admin.remainingMeals')}:</strong> {selectedDelivery.subscription.total_meals - selectedDelivery.subscription.consumed_meals}</Text>
                    </VStack>
                  </Grid>
                  
                  {selectedDelivery.subscription.is_paused && (
                    <Box mt={3} p={2} bg="orange.100" borderRadius="md">
                      <Text fontSize="sm" fontWeight="bold">{t('admin.subscriptionPaused')}</Text>
                      <Text fontSize="sm">{t('admin.reason')}: {selectedDelivery.subscription.pause_reason || t('admin.noReasonProvided')}</Text>
                      <Text fontSize="sm">{t('admin.resumeDate')}: {selectedDelivery.subscription.resume_date?.split('T')[0] || t('admin.notSpecified')}</Text>
                    </Box>
                  )}
                </Box>

                {/* Delivery Info */}
                <HStack spacing={6}>
                  <HStack>
                    <FiClock />
                    <Text fontWeight="medium">{t('admin.delivery')}: {selectedDelivery.delivery_time}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {t('admin.date')}: {selectedDelivery.delivery_date}
                  </Text>
                  <HStack>
                    <FiMapPin />
                    <Text fontSize="sm" color="gray.600">
                      {selectedDelivery.delivery_address}
                    </Text>
                  </HStack>
                </HStack>

                <Divider />

                {/* Meals */}
                <Box>
                  <Text fontWeight="bold" mb={3}>{t('admin.mealDetails')} ({selectedDelivery.meals_count} {t('admin.mealsInThisDelivery')})</Text>
                  <VStack align="stretch" spacing={3}>
                    {selectedDelivery.meals.map(meal => (
                      <Box key={meal.id} p={4} border="2px" borderColor="gray.200" borderRadius="md">
                        <HStack justify="space-between" mb={3}>
                          <Text fontWeight="bold">{meal.name}</Text>
                          <Tag colorScheme="blue" size="sm">
                            {meal.total_calories} {t('admin.cal')}
                          </Tag>
                        </HStack>
                        
                        <VStack align="stretch" spacing={2}>
                          {meal.items.map(item => (
                            <HStack key={item.id} justify="space-between">
                              <Text fontSize="sm">
                                {item.name} ({item.quantity}x)
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {item.calories * item.quantity} {t('admin.cal')}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                        
                        <HStack justify="space-between" mt={3} pt={3} borderTop="1px" borderColor="gray.200">
                          <Text fontSize="sm" fontWeight="medium">{t('admin.totalMacros')}:</Text>
                          <Text fontSize="sm" color="gray.600">
                            {t('admin.protein')}: {meal.total_protein}g | {t('admin.carbs')}: {meal.total_carbs}g | {t('admin.fat')}: {meal.total_fat}g
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Admin Notes */}
                <Box>
                  <Text fontWeight="bold" mb={2}>{t('admin.adminNotes')}</Text>
                  <Textarea
                    value={newAdminNote}
                    onChange={(e) => setNewAdminNote(e.target.value)}
                    placeholder={t('admin.addNewNote')}
                    resize="vertical"
                    mb={2}
                  />
                  <Button 
                    leftIcon={<FiPlus />} 
                    onClick={addAdminNote} 
                    isDisabled={!newAdminNote.trim()}
                    colorScheme="blue"
                    size="sm"
                    mb={3}
                  >
                    {t('admin.addNote')}
                  </Button>
                  {selectedDelivery.admin_notes && (
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <Text whiteSpace="pre-wrap" fontSize="sm">
                        {selectedDelivery.admin_notes}
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <HStack spacing={3} justify="center" pt={4}>
                  <Select
                    value={selectedDelivery.status}
                    onChange={(e) => updateDeliveryStatus(selectedDelivery.id, e.target.value)}
                    maxW="200px"
                  >
                    <option value="scheduled">{t('admin.scheduled')}</option>
                    <option value="preparing">{t('admin.preparing')}</option>
                    <option value="ready">{t('admin.ready')}</option>
                    <option value="delivered">{t('admin.delivered')}</option>
                    <option value="cancelled">{t('admin.cancelled')}</option>
                  </Select>
                  
                  <Select
                    value={selectedDelivery.subscription.status}
                    onChange={(e) => updateSubscriptionStatus(selectedDelivery.id, e.target.value)}
                    maxW="200px"
                  >
                    <option value="active">{t('admin.active')}</option>
                    <option value="pending">{t('admin.pending')}</option>
                    <option value="cancelled">{t('admin.cancelled')}</option>
                    <option value="expired">{t('admin.expired')}</option>
                    <option value="paused">{t('admin.paused')}</option>
                  </Select>
                  
                  {selectedDelivery.subscription.is_paused ? (
                    <Button 
                      leftIcon={<FiPlay />} 
                      colorScheme="green" 
                      size="sm"
                      onClick={() => updateSubscriptionStatus(selectedDelivery.id, 'active')}
                    >
                      {t('admin.resume')}
                    </Button>
                  ) : (
                    <Button 
                      leftIcon={<FiPause />} 
                      colorScheme="orange" 
                      size="sm"
                      onClick={() => updateSubscriptionStatus(selectedDelivery.id, 'paused')}
                    >
                      {t('admin.pause')}
                    </Button>
                  )}
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MealDeliveryDashboard;