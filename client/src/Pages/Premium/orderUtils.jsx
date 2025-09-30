//Shared utils for displaying orders
import { VStack, HStack, Text, Badge } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Constants for consistent status handling
export const ORDER_STATUS_COLORS = {
  'pending': 'blue',
  'confirmed': 'green', 
  'preparing': 'orange',
  'out_for_delivery': 'purple',
  'delivered': 'gray',
  'cancelled': 'red',
  'active': 'green',
  'paused': 'orange'
};

export const DELIVERY_TIME_OPTIONS = ['11', '12', '13', '14', '15', '16', '17', '18']
  .flatMap(hour => ['00', '30'].map(minute => ({ hour, minute, value: `${hour}:${minute}` })));

// Shared order status utility
export const getOrderStatusColor = (status) => {
  return ORDER_STATUS_COLORS[status] || 'gray';
};

// Shared order items renderer
export const useOrderItems = () => {
  const { t } = useTranslation();

  const renderOrderItems = (order, isArabic, showCategory = false) => {
    console.log('🔍 Order data for items:', {
      orderId: order?.id,
      orderMeals: order?.order_meals?.length || 0,
      orderItems: order?.order_items?.length || 0,
      status: order?.status
    });

    const hasMeals = order?.order_meals && order.order_meals.length > 0;
    const hasItems = order?.order_items && order.order_items.length > 0;

    if (!hasMeals && !hasItems) {
      return <Text fontSize="sm" color="orange.500" fontWeight="medium">
        {t('premium.orderBeingPrepared')}
      </Text>;
    }

    return (
      <VStack align="start" spacing={1} mt={2}>
        {/* Display subscription meals */}
        {order.order_meals?.map((meal, index) => (
          <HStack key={`meal-${meal.id || index}`} spacing={2}>
            <Text fontSize="xs" isTruncated maxW={{ base: "120px", md: "200px" }}>
              {isArabic ? meal.name_arabic || meal.name : meal.name} x{meal.quantity || 1}
            </Text>
            {showCategory && meal.meals?.category && (
              <Badge fontSize="xs" colorScheme="blue" variant="subtle">
                {meal.meals.category}
              </Badge>
            )}
          </HStack>
        ))}
        
        {/* Display additional items */}
        {order.order_items?.map((item, index) => (
          <HStack key={`item-${item.id || index}`} spacing={2}>
            <Text fontSize="xs" isTruncated maxW={{ base: "120px", md: "200px" }}>
              {isArabic ? item.name_arabic || item.name : item.name} x{item.quantity || 1}
            </Text>
            {showCategory && item.category && (
              <Badge fontSize="xs" colorScheme="blue" variant="subtle">
                {item.category}
              </Badge>
            )}
          </HStack>
        ))}
      </VStack>
    );
  };

  return { renderOrderItems };
};

// Shared subscription stats calculator
export const useSubscriptionStats = (subscriptionOrders, currentSubscription) => {
  return {
    totalMeals: currentSubscription?.total_meals || 0,
    consumedMeals: currentSubscription?.consumed_meals || 0,
    pendingMeals: subscriptionOrders?.filter(order => 
      ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.status)
    ).length || 0,
    deliveredMeals: subscriptionOrders?.filter(order => 
      order.status === 'delivered'
    ).length || 0,
    remainingMeals: (currentSubscription?.total_meals || 0) - (currentSubscription?.consumed_meals || 0)
  };
};

// Shared date formatter
export const formatDeliveryDate = (dateString, isArabic) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');
};

// Shared time formatter
export const formatDeliveryTime = (timeString, t) => {
  if (!timeString) return t('premium.notSet');
  return timeString.slice(0, 5); // Remove seconds if present
};