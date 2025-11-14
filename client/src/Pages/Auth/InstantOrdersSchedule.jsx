import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Select,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Stack,
  IconButton,
  useToast,
  SimpleGrid,
  Input,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea
} from '@chakra-ui/react';
import {
  CalendarIcon,
  TimeIcon,
  HamburgerIcon,
  PhoneIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowForwardIcon,
  SearchIcon,
  EditIcon
} from '@chakra-ui/icons';
import { MdPerson, MdLocationOn, MdAttachMoney, MdLocalShipping, MdRefresh } from 'react-icons/md';

// ===== SUPABASE API INTEGRATION =====
const instantOrdersAPI = {
  async getInstantOrders(options = {}) {
    //console.log('📡 [API] Fetching instant orders with options:', options);
    
    try {
      // In production, this would use Supabase
      // const { data, error } = await supabase
      //   .from('orders')
      //   .select(`
      //     *,
      //     user_profiles(id, display_name, email, phone_number),
      //     user_addresses(id, address_line1, address_line2, city, state, delivery_instructions),
      //     order_meals(id, meal_id, name, name_arabic, quantity, unit_price, total_price, calories, protein_g, carbs_g, fat_g, customization_notes),
      //     order_items(id, item_id, name, name_arabic, category, quantity, unit_price, total_price)
      //   `)
      //   .is('subscription_id', null)
      //   .order('scheduled_delivery_date', { ascending: true });

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let orders = getMockOrders();
      
      // Apply filters
      if (options.status && options.status !== 'all') {
        orders = orders.filter(order => order.status === options.status);
      }
      
      if (options.paymentStatus && options.paymentStatus !== 'all') {
        orders = orders.filter(order => order.payment_status === options.paymentStatus);
      }
      
      if (options.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        orders = orders.filter(order => 
          order.order_number.toString().includes(query) ||
          order.user_profiles?.display_name?.toLowerCase().includes(query) ||
          order.contact_phone?.includes(query)
        );
      }
      
      if (options.startDate && options.endDate) {
        orders = orders.filter(order => {
          if (!order.scheduled_delivery_date) return false;
          const deliveryDate = new Date(order.scheduled_delivery_date);
          return deliveryDate >= new Date(options.startDate) && 
                 deliveryDate <= new Date(options.endDate);
        });
      }
      
      //console.log('✅ [API] Orders fetched:', orders.length);
      return orders;
    } catch (error) {
      console.error('❌ [API] Error fetching orders:', error);
      throw error;
    }
  },

  async updateOrderStatus(orderId, newStatus, notes = '') {
    //console.log(`🔄 [API] Updating order ${orderId} to:`, newStatus);
    
    try {
      // In production:
      // const { data, error } = await supabase
      //   .from('orders')
      //   .update({ 
      //     status: newStatus, 
      //     special_instructions: notes,
      //     updated_at: new Date().toISOString() 
      //   })
      //   .eq('id', orderId)
      //   .select()
      //   .single();

      await new Promise(resolve => setTimeout(resolve, 300));
      
      const orders = getMockOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        if (notes) {
          orders[orderIndex].special_instructions = notes;
        }
        updateMockOrders(orders);
        return orders[orderIndex];
      }
      
      throw new Error('Order not found');
    } catch (error) {
      console.error('❌ [API] Error updating order:', error);
      throw error;
    }
  },

  async updateOrderDeliveryDate(orderId, newDate) {
    //console.log(`📅 [API] Updating delivery date for order ${orderId}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const orders = getMockOrders();
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex].scheduled_delivery_date = newDate;
        updateMockOrders(orders);
        return orders[orderIndex];
      }
      
      throw new Error('Order not found');
    } catch (error) {
      console.error('❌ [API] Error updating delivery date:', error);
      throw error;
    }
  },

  async getOrderStats() {
    //console.log('📊 [API] Fetching order statistics');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const orders = getMockOrders();
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders
          .filter(o => o.payment_status === 'paid')
          .reduce((sum, o) => sum + parseFloat(o.total_amount), 0),
        pendingRevenue: orders
          .filter(o => o.payment_status === 'pending')
          .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
      };
      
      //console.log('✅ [API] Stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [API] Error fetching stats:', error);
      throw error;
    }
  }
};

// ===== MOCK DATA MANAGEMENT =====
let MOCK_ORDERS_CACHE = null;

function getMockOrders() {
  if (MOCK_ORDERS_CACHE) return [...MOCK_ORDERS_CACHE];
  
  MOCK_ORDERS_CACHE = [
    {
      id: 'order-1',
      order_number: 10001,
      user_id: 'user-1',
      subscription_id: null,
      status: 'pending',
      payment_status: 'paid',
      payment_method: 'credit_card',
      subtotal: 90.00,
      tax_amount: 13.50,
      delivery_fee: 15.00,
      discount_amount: 0,
      total_amount: 118.50,
      scheduled_delivery_date: new Date(Date.now() + 86400000).toISOString(),
      contact_phone: '+966501234567',
      delivery_instructions: 'Please call upon arrival',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      user_profiles: {
        id: 'user-1',
        display_name: 'Ahmed Al-Mansour',
        email: 'ahmed@example.com',
        phone_number: '+966501234567'
      },
      user_addresses: {
        id: 'addr-1',
        address_line1: '123 King Fahd Road',
        address_line2: 'Apt 4B',
        city: 'Riyadh',
        state: 'Riyadh Region',
        delivery_instructions: 'Gate code: 1234'
      },
      order_meals: [
        {
          id: 'om-1',
          meal_id: 1,
          name: 'Grilled Chicken Bowl',
          name_arabic: 'وعاء الدجاج المشوي',
          quantity: 2,
          unit_price: 45.00,
          total_price: 90.00,
          calories: 450,
          protein_g: 35,
          carbs_g: 40,
          fat_g: 12
        }
      ],
      order_items: []
    },
    {
      id: 'order-2',
      order_number: 10002,
      user_id: 'user-2',
      subscription_id: null,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'cash',
      subtotal: 130.00,
      tax_amount: 19.50,
      delivery_fee: 15.00,
      discount_amount: 10.00,
      total_amount: 154.50,
      scheduled_delivery_date: new Date(Date.now() + 172800000).toISOString(),
      contact_phone: '+966559876543',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      user_profiles: {
        id: 'user-2',
        display_name: 'Sara Abdullah',
        email: 'sara@example.com',
        phone_number: '+966559876543'
      },
      user_addresses: {
        id: 'addr-2',
        address_line1: '456 Olaya Street',
        city: 'Riyadh',
        state: 'Riyadh Region'
      },
      order_meals: [
        {
          id: 'om-2',
          meal_id: 2,
          name: 'Salmon Quinoa Bowl',
          quantity: 1,
          unit_price: 65.00,
          total_price: 65.00,
          calories: 520,
          protein_g: 40,
          carbs_g: 45,
          fat_g: 18
        }
      ],
      order_items: [
        {
          id: 'oi-1',
          item_id: 1,
          name: 'Extra Protein',
          category: 'Protein',
          quantity: 1,
          unit_price: 25.00,
          total_price: 25.00
        },
        {
          id: 'oi-2',
          item_id: 2,
          name: 'Avocado',
          category: 'Vegetables',
          quantity: 2,
          unit_price: 20.00,
          total_price: 40.00
        }
      ]
    },
    {
      id: 'order-3',
      order_number: 10003,
      user_id: 'user-3',
      subscription_id: null,
      status: 'preparing',
      payment_status: 'paid',
      payment_method: 'credit_card',
      subtotal: 180.00,
      tax_amount: 27.00,
      delivery_fee: 15.00,
      discount_amount: 0,
      total_amount: 222.00,
      scheduled_delivery_date: new Date().toISOString(),
      contact_phone: '+966551112222',
      delivery_instructions: 'Leave at door',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      user_profiles: {
        id: 'user-3',
        display_name: 'Mohammed Hassan',
        email: 'mohammed@example.com',
        phone_number: '+966551112222'
      },
      user_addresses: {
        id: 'addr-3',
        address_line1: '789 King Abdullah Road',
        city: 'Jeddah',
        state: 'Makkah Region'
      },
      order_meals: [
        {
          id: 'om-3',
          meal_id: 3,
          name: 'Beef Stir Fry',
          quantity: 3,
          unit_price: 60.00,
          total_price: 180.00,
          calories: 580,
          protein_g: 45,
          carbs_g: 50,
          fat_g: 20
        }
      ],
      order_items: []
    }
  ];
  
  return [...MOCK_ORDERS_CACHE];
}

function updateMockOrders(orders) {
  MOCK_ORDERS_CACHE = orders;
}

// ===== CUSTOM HOOKS =====
const useInstantOrders = (options = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchOrders = useCallback(async () => {
    //console.log('🎣 [Hook] Fetching orders with options:', options);
    setLoading(true);
    setError(null);
    
    try {
      const data = await instantOrdersAPI.getInstantOrders(options);
      setOrders(data);
      setLastFetch(new Date());
      //console.log('✅ [Hook] Orders updated:', data.length);
    } catch (err) {
      console.error('❌ [Hook] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders, lastFetch };
};

const useOrderStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await instantOrdersAPI.getOrderStats();
      setStats(data);
    } catch (err) {
      console.error('❌ [Hook] Stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};

// ===== COMPONENTS =====
const StatusBadge = ({ status }) => {
  const config = {
    pending: { color: 'yellow', label: 'Pending', icon: '⏳' },
    confirmed: { color: 'blue', label: 'Confirmed', icon: '✓' },
    preparing: { color: 'purple', label: 'Preparing', icon: '👨‍🍳' },
    out_for_delivery: { color: 'orange', label: 'Out for Delivery', icon: '🚚' },
    delivered: { color: 'green', label: 'Delivered', icon: '✅' },
    cancelled: { color: 'red', label: 'Cancelled', icon: '❌' }
  };

  const { color, label, icon } = config[status] || config.pending;

  return (
    <Badge colorScheme={color} px={3} py={1} borderRadius="full" fontSize="sm">
      {icon} {label}
    </Badge>
  );
};

const PaymentBadge = ({ status }) => {
  const config = {
    pending: { color: 'orange', label: 'Payment Pending' },
    paid: { color: 'green', label: 'Paid' },
    failed: { color: 'red', label: 'Payment Failed' },
    refunded: { color: 'gray', label: 'Refunded' }
  };

  const { color, label } = config[status] || config.pending;

  return (
    <Badge colorScheme={color} variant="subtle" px={2} py={1} fontSize="xs">
      {label}
    </Badge>
  );
};

const OrderCard = ({ order, onStatusUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [statusNotes, setStatusNotes] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'cancelled') {
      setPendingStatus(newStatus);
      onOpen();
      return;
    }

    await executeStatusChange(newStatus, '');
  };

  const executeStatusChange = async (newStatus, notes) => {
    //console.log(`🔄 [OrderCard] Changing order ${order.order_number} to:`, newStatus);
    setUpdating(true);
    
    try {
      await instantOrdersAPI.updateOrderStatus(order.id, newStatus, notes);
      toast({
        title: 'Status Updated',
        description: `Order #${order.order_number} is now ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onStatusUpdate();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
      onClose();
      setStatusNotes('');
      setPendingStatus('');
    }
  };

  const deliveryDate = new Date(order.scheduled_delivery_date);
  const isToday = deliveryDate.toDateString() === new Date().toDateString();
  const isPast = deliveryDate < new Date() && !isToday;

  const getNextActions = () => {
    const actions = [];
    
    switch (order.status) {
      case 'pending':
        actions.push({ label: 'Confirm Order', status: 'confirmed', color: 'blue' });
        break;
      case 'confirmed':
        actions.push({ label: 'Start Preparing', status: 'preparing', color: 'purple' });
        break;
      case 'preparing':
        actions.push({ label: 'Out for Delivery', status: 'out_for_delivery', color: 'orange' });
        break;
      case 'out_for_delivery':
        actions.push({ label: 'Mark Delivered', status: 'delivered', color: 'green' });
        break;
    }
    
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      actions.push({ label: 'Cancel Order', status: 'cancelled', color: 'red', variant: 'outline' });
    }
    
    return actions;
  };

  return (
    <>
      <Card 
        borderWidth="1px" 
        boxShadow="md" 
        _hover={{ boxShadow: 'lg', borderColor: 'blue.300' }} 
        transition="all 0.2s"
        bg="white"
      >
        <CardBody>
          {/* Header */}
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Box flex={1}>
              <Flex align="center" gap={3} mb={2} flexWrap="wrap">
                <Heading size="md" color="gray.900">
                  #{order.order_number}
                </Heading>
                <StatusBadge status={order.status} />
                <PaymentBadge status={order.payment_status} />
                {isToday && (
                  <Badge colorScheme="orange" px={2} py={1} fontSize="xs">
                    🔥 TODAY
                  </Badge>
                )}
                {isPast && order.status !== 'delivered' && (
                  <Badge colorScheme="red" px={2} py={1} fontSize="xs">
                    ⚠️ OVERDUE
                  </Badge>
                )}
              </Flex>
              
              <Stack spacing={1} fontSize="sm" color="gray.600">
                <Flex align="center" gap={2}>
                  <MdPerson size="16px" />
                  <Text fontWeight="medium">{order.user_profiles?.display_name}</Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <PhoneIcon w={3} h={3} />
                  <Text>{order.contact_phone}</Text>
                </Flex>
              </Stack>
            </Box>

            <IconButton
              aria-label={expanded ? "Collapse" : "Expand"}
              icon={expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
            />
          </Flex>

          {/* Summary */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3} fontSize="sm">
            <Flex align="center" gap={2} color="gray.700">
              <TimeIcon color="blue.500" w={4} h={4} />
              <Box>
                <Text fontWeight="medium">Scheduled Delivery</Text>
                <Text fontSize="xs">{deliveryDate.toLocaleString()}</Text>
              </Box>
            </Flex>
            <Flex align="center" gap={2} color="gray.700">
              <MdAttachMoney color="green" size="18px" />
              <Box>
                <Text fontWeight="semibold" color="green.600">
                  {order.total_amount.toFixed(2)} SAR
                </Text>
                <Text fontSize="xs">via {order.payment_method}</Text>
              </Box>
            </Flex>
            <Flex align="center" gap={2} color="gray.700">
              <HamburgerIcon color="purple.500" w={4} h={4} />
              <Text>
                {order.order_meals?.length || 0} meal(s), {order.order_items?.length || 0} item(s)
              </Text>
            </Flex>
            <Flex align="center" gap={2} color="gray.700">
              <MdLocationOn color="red" size="18px" />
              <Text>{order.user_addresses?.city}</Text>
            </Flex>
          </SimpleGrid>

          {/* Expanded Details */}
          {expanded && (
            <Box borderTopWidth="1px" pt={4} mt={3}>
              {/* Address */}
              <Box mb={4}>
                <Heading size="sm" mb={2}>Delivery Address</Heading>
                <Text fontSize="sm" color="gray.700">
                  {order.user_addresses?.address_line1}
                  {order.user_addresses?.address_line2 && `, ${order.user_addresses.address_line2}`}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {order.user_addresses?.city}, {order.user_addresses?.state}
                </Text>
                {order.delivery_instructions && (
                  <Text fontSize="sm" color="blue.600" mt={2} fontStyle="italic">
                    📝 {order.delivery_instructions}
                  </Text>
                )}
              </Box>

              {/* Order Breakdown */}
              <Box mb={4}>
                <Heading size="sm" mb={2}>Order Details</Heading>
                <Stack spacing={2}>
                  {order.order_meals?.map(meal => (
                    <Box key={meal.id} bg="gray.50" p={3} borderRadius="md">
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          <Text fontWeight="medium">{meal.name}</Text>
                          {meal.name_arabic && (
                            <Text fontSize="xs" color="gray.600">{meal.name_arabic}</Text>
                          )}
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Qty: {meal.quantity} | {meal.calories}cal | {meal.protein_g}g protein
                          </Text>
                        </Box>
                        <Text fontWeight="semibold" color="gray.700">
                          {meal.total_price.toFixed(2)} SAR
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                  
                  {order.order_items?.map(item => (
                    <Box key={item.id} bg="blue.50" p={3} borderRadius="md">
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="medium" fontSize="sm">{item.name}</Text>
                          <Text fontSize="xs" color="gray.600">
                            {item.category} × {item.quantity}
                          </Text>
                        </Box>
                        <Text fontWeight="semibold" fontSize="sm">
                          {item.total_price.toFixed(2)} SAR
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </Stack>

                {/* Price Breakdown */}
                <Box mt={3} pt={3} borderTopWidth="1px">
                  <Stack spacing={1} fontSize="sm">
                    <Flex justify="space-between">
                      <Text>Subtotal:</Text>
                      <Text>{order.subtotal.toFixed(2)} SAR</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Tax (15%):</Text>
                      <Text>{order.tax_amount.toFixed(2)} SAR</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Delivery Fee:</Text>
                      <Text>{order.delivery_fee.toFixed(2)} SAR</Text>
                    </Flex>
                    {order.discount_amount > 0 && (
                      <Flex justify="space-between" color="green.600">
                        <Text>Discount:</Text>
                        <Text>-{order.discount_amount.toFixed(2)} SAR</Text>
                      </Flex>
                    )}
                    <Flex justify="space-between" fontWeight="bold" fontSize="md" pt={2} borderTopWidth="1px">
                      <Text>Total:</Text>
                      <Text color="green.600">{order.total_amount.toFixed(2)} SAR</Text>
                    </Flex>
                  </Stack>
                </Box>
              </Box>

              {/* Actions */}
              <Flex gap={2} flexWrap="wrap">
                {getNextActions().map(action => (
                  <Button
                    key={action.status}
                    onClick={() => handleStatusChange(action.status)}
                    isLoading={updating}
                    colorScheme={action.color}
                    variant={action.variant || 'solid'}
                    size="sm"
                    leftIcon={action.status === 'cancelled' ? <CloseIcon /> : <CheckIcon />}
                  >
                    {action.label}
                  </Button>
                ))}
              </Flex>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cancel Order #{order.order_number}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Cancellation Reason</FormLabel>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={4}
              />
            </FormControl>
            <Flex gap={2} mt={4}>
              <Button
                colorScheme="red"
                onClick={() => executeStatusChange(pendingStatus, statusNotes)}
                isLoading={updating}
                flex={1}
              >
                Confirm Cancellation
              </Button>
              <Button onClick={onClose} variant="ghost">
                Go Back
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// ===== MAIN COMPONENT =====
const InstantOrdersMonitoring = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(dateFilter) {
      case 'today':
        return {
          startDate: today.toISOString(),
          endDate: new Date(today.getTime() + 86400000).toISOString()
        };
      case 'tomorrow':
        const tomorrow = new Date(today.getTime() + 86400000);
        return {
          startDate: tomorrow.toISOString(),
          endDate: new Date(tomorrow.getTime() + 86400000).toISOString()
        };
      case 'week':
        return {
          startDate: today.toISOString(),
          endDate: new Date(today.getTime() + 7 * 86400000).toISOString()
        };
      default:
        return {};
    }
  }, [dateFilter]);

  const { orders, loading, error, refetch, lastFetch } = useInstantOrders({
    status: statusFilter,
    paymentStatus: paymentFilter,
    searchQuery,
    ...dateRange
  });

  const { stats, refetch: refetchStats } = useOrderStats();

  const handleRefresh = () => {
    refetch();
    refetchStats();
    toast({
      title: 'Refreshed',
      description: 'Orders updated successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error Loading Orders</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <Box maxW="7xl" mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading as="h1" size="2xl" color="gray.900" mb={2}>
              Instant Orders Monitor
            </Heading>
            <Text color="gray.600">
              Real-time monitoring for non-subscription orders
            </Text>
            {lastFetch && (
              <Text fontSize="xs" color="gray.500" mt={1}>
                Last updated: {lastFetch.toLocaleTimeString()}
              </Text>
            )}
          </Box>
          <Button
            leftIcon={<MdRefresh />}
            onClick={handleRefresh}
            colorScheme="blue"
            isLoading={loading}
          >
            Refresh
          </Button>
        </Flex>

        {/* Statistics Dashboard */}
        {stats && (
          <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4} mb={6}>
            <Card bg="white" shadow="md" borderTop="4px" borderColor="gray.400">
              <CardBody>
                <Text color="gray.600" fontSize="xs" fontWeight="medium" mb={1}>
                  TOTAL ORDERS
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="gray.900">
                  {stats.total}
                </Text>
              </CardBody>
            </Card>
            
            <Card bg="white" shadow="md" borderTop="4px" borderColor="yellow.400">
              <CardBody>
                <Text color="gray.600" fontSize="xs" fontWeight="medium" mb={1}>
                  PENDING
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="yellow.600">
                  {stats.pending}
                </Text>
              </CardBody>
            </Card>
            
            <Card bg="white" shadow="md" borderTop="4px" borderColor="blue.400">
              <CardBody>
                <Text color="gray.600" fontSize="xs" fontWeight="medium" mb={1}>
                  CONFIRMED
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  {stats.confirmed}
                </Text>
              </CardBody>
            </Card>
            
            <Card bg="white" shadow="md" borderTop="4px" borderColor="purple.400">
              <CardBody>
                <Text color="gray.600" fontSize="xs" fontWeight="medium" mb={1}>
                  PREPARING
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                  {stats.preparing}
                </Text>
              </CardBody>
            </Card>
            
            <Card bg="white" shadow="md" borderTop="4px" borderColor="orange.400">
              <CardBody>
                <Text color="gray.600" fontSize="xs" fontWeight="medium" mb={1}>
                  OUT FOR DELIVERY
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                  {stats.out_for_delivery}
                </Text>
              </CardBody>
            </Card>
            
            <Card bg="white" shadow="md" borderTop="4px" borderColor="green.400">
              <CardBody>
                <Text color="gray.600" fontSize="xs" fontWeight="medium" mb={1}>
                  DELIVERED
                </Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.600">
                  {stats.delivered}
                </Text>
              </CardBody>
            </Card>
            
            <Card bg="white" shadow="md" borderTop="4px" borderColor="green.500">
              <CardBody>
                <Text color="gray.600" fontSize="xs" fontWeight="medium" mb={1}>
                  REVENUE
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {stats.totalRevenue.toFixed(0)}
                </Text>
                <Text fontSize="xs" color="gray.500">SAR</Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Filters */}
        <Card bg="white" shadow="md" mb={6}>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Search Orders
                </FormLabel>
                <Flex>
                  <Input
                    placeholder="Order #, name, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="md"
                  />
                  {searchQuery && (
                    <IconButton
                      icon={<CloseIcon />}
                      onClick={() => setSearchQuery('')}
                      ml={2}
                      variant="ghost"
                      aria-label="Clear search"
                    />
                  )}
                </Flex>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Order Status
                </FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✓ Confirmed</option>
                  <option value="preparing">👨‍🍳 Preparing</option>
                  <option value="out_for_delivery">🚚 Out for Delivery</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Payment Status
                </FormLabel>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                  Delivery Date
                </FormLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">Next 7 Days</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Orders List */}
        {loading ? (
          <Flex direction="column" align="center" justify="center" py={20}>
            <Spinner size="xl" color="blue.600" thickness="4px" />
            <Text mt={4} color="gray.600" fontWeight="medium">
              Loading orders...
            </Text>
          </Flex>
        ) : orders.length === 0 ? (
          <Card bg="white" shadow="md">
            <CardBody textAlign="center" py={16}>
              <Box display="inline-block" p={4} bg="gray.100" borderRadius="full" mb={4}>
                <MdLocalShipping size="64px" color="#A0AEC0" />
              </Box>
              <Heading as="h3" size="lg" color="gray.900" mb={2}>
                No Orders Found
              </Heading>
              <Text color="gray.600" mb={4}>
                {searchQuery 
                  ? `No orders match your search: "${searchQuery}"`
                  : 'No instant orders match your current filters'}
              </Text>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={() => {
                  setStatusFilter('all');
                  setPaymentFilter('all');
                  setDateFilter('all');
                  setSearchQuery('');
                }}
              >
                Clear All Filters
              </Button>
            </CardBody>
          </Card>
        ) : (
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading as="h2" size="lg" color="gray.900">
                {orders.length} Order{orders.length !== 1 ? 's' : ''} Found
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Showing instant orders only (no subscriptions)
              </Text>
            </Flex>
            
            <Stack spacing={4}>
              {orders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusUpdate={() => {
                    refetch();
                    refetchStats();
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Footer Info */}
        <Box mt={8} p={4} bg="blue.50" borderRadius="md">
          <Flex align="center" gap={2}>
            <Box w={2} h={2} bg="blue.500" borderRadius="full" />
            <Text fontSize="sm" color="gray.700">
              <strong>Note:</strong> This dashboard shows instant orders only (orders without subscription_id). 
              For subscription orders, please use the Subscription Management dashboard.
            </Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default InstantOrdersMonitoring