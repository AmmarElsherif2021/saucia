import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Flex,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Stack,
  Divider,
  HStack,
} from '@chakra-ui/react';
import {
  CheckIcon,
  WarningIcon,
  TimeIcon,
} from '@chakra-ui/icons';
import { useOrders } from '../../Hooks/useOrders';

export function OrderStatusTracker() {
  const { fetchLastUserOrder, subscribeToOrder } = useOrders();
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the last order on mount
  useEffect(() => {
    const initializeOrder = async () => {
      try {
        setLoading(true);
        const orders = await fetchLastUserOrder();

        if (orders && orders.length > 0) {
          setLastOrder(orders[0]); // Set the most recent order
        }
      } catch (err) {
        console.error('Failed to fetch last order:', err);
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    initializeOrder();
  }, [fetchLastUserOrder]);

  // Subscribe to real-time updates for the last order
  useEffect(() => {
    if (!lastOrder?.id) return;

    const subscription = subscribeToOrder(lastOrder.id, (payload) => {
      console.log('Order update received:', payload);

      // Update the order with the new data
      if (payload.eventType === 'UPDATE' || payload.eventType === '*') {
        setLastOrder(payload.new);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [lastOrder?.id, subscribeToOrder]);

  const getStatusIcon = (status) => {
    const iconProps = { w: 5, h: 5 };
    switch (status) {
      case 'pending':
        return <TimeIcon {...iconProps} color="yellow.500" />;
      case 'confirmed':
        return <CheckIcon {...iconProps} color="blue.500" />;
      case 'preparing':
        return <CheckIcon {...iconProps} color="purple.500" />;
      case 'out_for_delivery':
        return <CheckIcon {...iconProps} color="orange.500" />;
      case 'delivered':
        return <CheckIcon {...iconProps} color="green.500" />;
      case 'cancelled':
        return <WarningIcon {...iconProps} color="red.500" />;
      default:
        return <CheckIcon {...iconProps} color="gray.500" />;
    }
  };

  const getStatusColorScheme = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'confirmed':
        return 'blue';
      case 'preparing':
        return 'purple';
      case 'out_for_delivery':
        return 'orange';
      case 'delivered':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" p={8}>
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
    );
  }

  if (!lastOrder) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <AlertTitle>No orders found</AlertTitle>
      </Alert>
    );
  }

  const statusColorScheme = getStatusColorScheme(lastOrder.status);

  return (
    <Box w="full" maxW="md">
      <Card borderLeftWidth="4px" borderLeftColor={`${statusColorScheme}.500`}>
        <CardBody>
          {/* Header */}
          <Flex justify="space-between" align="start" mb={4}>
            <Stack spacing={1}>
              <Heading size="md">
                Order #{lastOrder.id.slice(0, 8)}
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {new Date(lastOrder.created_at).toLocaleDateString()}
              </Text>
            </Stack>

            <HStack spacing={2}>
              {getStatusIcon(lastOrder.status)}
              <Badge colorScheme={statusColorScheme} textTransform="capitalize">
                {lastOrder.status.replace('_', ' ')}
              </Badge>
            </HStack>
          </Flex>

          {/* Order Details */}
          <Stack spacing={3} mb={4}>
            <Flex justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Total Amount
              </Text>
              <Text fontSize="sm" fontWeight="semibold">
                ${lastOrder.total_amount?.toFixed(2) || 'N/A'}
              </Text>
            </Flex>

            <Flex justify="space-between">
              <Text fontSize="sm" color="gray.600">
                Payment Status
              </Text>
              <Badge colorScheme={lastOrder.payment_status === 'completed' ? 'green' : 'yellow'}>
                {lastOrder.payment_status || 'pending'}
              </Badge>
            </Flex>

            {lastOrder.scheduled_delivery_date && (
              <Flex justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Expected Delivery
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {new Date(lastOrder.scheduled_delivery_date).toLocaleDateString()}
                </Text>
              </Flex>
            )}
          </Stack>

          {/* Live Status Indicator */}
          <Divider my={4} />
          <HStack spacing={2}>
            <Box
              as="span"
              w={2}
              h={2}
              borderRadius="full"
              bg="green.500"
              animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            />
            <Text fontSize="xs" color="gray.500">
              Live tracking enabled
            </Text>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}