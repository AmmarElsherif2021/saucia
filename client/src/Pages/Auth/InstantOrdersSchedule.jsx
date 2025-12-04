import React, { useState, useMemo } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import {
  TimeIcon,
  HamburgerIcon,
  PhoneIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';
import { MdPerson, MdLocationOn, MdAttachMoney, MdLocalShipping, MdRefresh } from 'react-icons/md';
import {
  useInstantOrders,
  useInstantOrderStats,
  useUpdateOrderStatus,
  useRefreshOrders,
} from '../../Hooks/useAdminOrders';

// ===== STATUS & PAYMENT BADGE COMPONENTS =====
const StatusBadge = ({ status }) => {
  const config = {
    pending: { color: 'yellow', label: 'Pending', icon: '⏳' },
    confirmed: { color: 'blue', label: 'Confirmed', icon: '✓' },
    preparing: { color: 'purple', label: 'Preparing', icon: '👨‍🍳' },
    out_for_delivery: { color: 'orange', label: 'Out for Delivery', icon: '🚚' },
    delivered: { color: 'green', label: 'Delivered', icon: '✅' },
    cancelled: { color: 'red', label: 'Cancelled', icon: '❌' },
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
    refunded: { color: 'gray', label: 'Refunded' },
  };

  const { color, label } = config[status] || config.pending;

  return (
    <Badge colorScheme={color} variant="subtle" px={2} py={1} fontSize="xs">
      {label}
    </Badge>
  );
};

// ===== ORDER CARD COMPONENT =====
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'cancelled') {
      setPendingStatus(newStatus);
      onOpen();
      return;
    }

    executeStatusChange(newStatus, '');
  };

  const executeStatusChange = async (newStatus, notes) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        newStatus,
        notes,
      });

      toast({
        title: 'Status Updated',
        description: `Order #${order.order_number} is now ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setStatusNotes('');
      setPendingStatus('');
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
              aria-label={expanded ? 'Collapse' : 'Expand'}
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
              <Text>{order.addresses?.city}</Text>
            </Flex>
          </SimpleGrid>

          {/* Expanded Details */}
          {expanded && (
            <Box borderTopWidth="1px" pt={4} mt={3}>
              {/* Address */}
              <Box mb={4}>
                <Heading size="sm" mb={2}>
                  Delivery Address
                </Heading>
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
                <Heading size="sm" mb={2}>
                  Order Details
                </Heading>
                <Stack spacing={2}>
                  {order.order_meals?.map((meal) => (
                    <Box key={meal.id} bg="gray.50" p={3} borderRadius="md">
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          <Text fontWeight="medium">{meal.name}</Text>
                          {meal.name_arabic && (
                            <Text fontSize="xs" color="gray.600">
                              {meal.name_arabic}
                            </Text>
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

                  {order.order_items?.map((item) => (
                    <Box key={item.id} bg="blue.50" p={3} borderRadius="md">
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontWeight="medium" fontSize="sm">
                            {item.name}
                          </Text>
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
                {getNextActions().map((action) => (
                  <Button
                    key={action.status}
                    onClick={() => handleStatusChange(action.status)}
                    isLoading={updateStatusMutation.isLoading}
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
                isLoading={updateStatusMutation.isLoading}
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
const InstantOrdersSchedule = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case 'today':
        return {
          startDate: today.toISOString(),
          endDate: new Date(today.getTime() + 86400000).toISOString(),
        };
      case 'tomorrow':
        const tomorrow = new Date(today.getTime() + 86400000);
        return {
          startDate: tomorrow.toISOString(),
          endDate: new Date(tomorrow.getTime() + 86400000).toISOString(),
        };
      case 'week':
        return {
          startDate: today.toISOString(),
          endDate: new Date(today.getTime() + 7 * 86400000).toISOString(),
        };
      default:
        return {};
    }
  }, [dateFilter]);

  // Build query options
  const queryOptions = useMemo(
    () => ({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      paymentStatus: paymentFilter !== 'all' ? paymentFilter : undefined,
      searchQuery: searchQuery || undefined,
      ...dateRange,
    }),
    [statusFilter, paymentFilter, searchQuery, dateRange]
  );

  // Fetch orders with real-time updates
  const { data: orders = [], isLoading, error, dataUpdatedAt } = useInstantOrders(queryOptions);

  // Fetch statistics with real-time updates
  const { data: stats } = useInstantOrderStats();

  // Manual refresh function
  const refreshOrders = useRefreshOrders();

  const handleRefresh = async () => {
    await refreshOrders();
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
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </Box>
    );
  }

  const lastUpdateTime = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never';

  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <Box maxW="7xl" mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading as="h1" size="2xl" color="gray.900" mb={2}>
              Instant Orders Monitor
            </Heading>
            <Text color="gray.600">Real-time monitoring for non-subscription orders</Text>
            <Flex align="center" gap={2} mt={1}>
              <Box w={2} h={2} bg="green.500" borderRadius="full" />
              <Text fontSize="xs" color="gray.500">
                Live updates • Last refresh: {lastUpdateTime}
              </Text>
            </Flex>
          </Box>
          <Button leftIcon={<MdRefresh />} onClick={handleRefresh} colorScheme="blue" isLoading={isLoading}>
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
                <Text fontSize="xs" color="gray.500">
                  SAR
                </Text>
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
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
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
                <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
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
        {isLoading ? (
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
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </Stack>
          </Box>
        )}

        {/* Footer Info */}
        <Box mt={8} p={4} bg="blue.50" borderRadius="md">
          <Flex align="center" gap={2}>
            <Box w={2} h={2} bg="blue.500" borderRadius="full" />
            <Text fontSize="sm" color="gray.700">
              <strong>Note:</strong> This dashboard shows instant orders only (orders without subscription_id). For
              subscription orders, please use the Subscription Management dashboard. Updates happen automatically via
              real-time subscriptions.
            </Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default InstantOrdersSchedule;