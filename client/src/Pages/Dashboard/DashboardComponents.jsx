import { useState, useMemo, useCallback } from 'react';

import { ChevronDownIcon, ChevronUpIcon, TimeIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import {
  
  Collapse,
  useDisclosure,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,

  Card,
  CardBody,
  CardHeader,
  StackDivider,
  useColorModeValue,
  Tag,
  TagLabel,
  TagLeftIcon,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  AspectRatio,
  Wrap,
  WrapItem,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Image,
  Checkbox,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Center,
  Flex,
  Text,
  Badge,
  IconButton,
  Icon,
  VStack,
  HStack,
  SimpleGrid,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Spinner,
  Heading,
  Button,
  useToast
} from '@chakra-ui/react';

import {  
  FiLock, 
  FiClock, 
  FiAlertTriangle,
  FiPackage,
  FiDollarSign,
  FiCheckCircle,
  FiTrendingUp,
  FiCalendar,
  FiChevronRight,
  FiMapPin,
  FiRefreshCw,
  FiBarChart2,
  FiPlayCircle,
  FiPauseCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useI18nContext } from '../../Contexts/I18nContext';

// ADD THESE MISSING IMPORTS:
import locationPin from '../../assets/locationPin.svg';

// Responsive wrapper component for consistent centering
const ResponsiveWrapper = ({ children, ...props }) => (
  <Box
    w="100%"
    maxW="container.xl"
    mx="auto"
    px={{ base: 4, md: 6, lg: 8 }}
    {...props}
  >
    {children}
  </Box>
);

// Centered form container
const CenteredFormContainer = ({ children, maxWidth = "md", ...props }) => (
  <Center w="100%" {...props}>
    <Box w="100%" maxW={maxWidth}>
      {children}
    </Box>
  </Center>
);

//Reusable address component - Enhanced responsiveness
export const AddressInput = ({ label, value, onChange, onMapOpen }) => {
    const { t } = useTranslation();
    return (
      <ResponsiveWrapper>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {label}
          </FormLabel>
          <Stack 
            direction={{ base: "column", sm: "row" }} 
            spacing={2}
            align={{ base: "stretch", sm: "center" }}
          >
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('enterDeliveryAddress')}
              variant={'ghost'}
              size={{ base: "md", md: "lg" }}
              flex={1}
            />
            <IconButton
              aria-label={t('selectFromMap')}
              icon={<Image src={locationPin} boxSize={{ base: "20px", md: "24px" }} />}
              onClick={onMapOpen}
              size={{ base: "md", md: "lg" }}
              flexShrink={0}
            />
          </Stack>
        </FormControl>
      </ResponsiveWrapper>
    )
};
  
// UserInfoItem - Better mobile layout
export const UserInfoItem = ({ label, value, verified = false }) => {
    const { t } = useTranslation();
    return (
      <Box w="100%" mb={2}>
        <Stack 
          direction={{ base: "column", sm: "row" }} 
          spacing={{ base: 1, sm: 3 }}
          align={{ base: "flex-start", sm: "center" }}
        >
          <Text fontWeight="bold" color={'brand.700'} fontSize={{ base: "sm", md: "md" }} minW="fit-content">
            {label}:
          </Text>
          <Flex align="center" gap={2} flex={1}>
            <Text fontSize={{ base: "sm", md: "md" }}>
              {value || 'N/A'}
            </Text>
            {verified && (
              <Badge 
                colorScheme="green" 
                size={{ base: "sm", md: "md" }}
                borderRadius="full"
              >
                {t('verified')}
              </Badge>
            )}
          </Flex>
        </Stack>
      </Box>
    )
};

// Notification Status - Enhanced mobile view
export const NotificationStatus = ({ label, enabled }) => {
    const { t } = useTranslation();
    if (enabled === undefined) return null; 
    
    return (
      <Box w="100%" mb={3}>
        <Stack 
          direction={{ base: "column", sm: "row" }} 
          spacing={{ base: 1, sm: 3 }}
          align={{ base: "flex-start", sm: "center" }}
        >
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} minW="fit-content">
            {label}:
          </Text>
          <Badge 
            colorScheme={enabled ? 'green' : 'red'}
            size={{ base: "sm", md: "md" }}
            borderRadius="full"
          >
            {enabled ? t('enabled') : t('disabled')}
          </Badge>
        </Stack>
      </Box>
    )
};

// Basic Form Control - Fully responsive and centered
export const BasicFormControl = ({ label, name, value, placeholder, type = 'text', handleInputChange }) => {
    const { t } = useTranslation();
    
    // Enhanced validation
    if (!label) return null;
    if (!value && !placeholder) return null;
    if (type === 'number' && value && isNaN(value)) return null; 
    if (type === 'email' && value && !value.includes('@')) return null; 
    if (type === 'tel' && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) return null; 
    if (type === 'password' && value && value.length < 6) return null;
    
    return (
      <CenteredFormContainer maxWidth="lg" mb={4}>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {label}
          </FormLabel>
          <Input
            variant={'ghost'}
            name={name}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            type={type}
            size={{ base: "md", md: "lg" }}
            sx={{
              '::placeholder': {
                color: 'gray.500',
                opacity: 1,
                fontSize: { base: "sm", md: "md" }
              },
            }}
          />
        </FormControl>
      </CenteredFormContainer>
    )
};

// Number Form Control - Better mobile experience
export const NumberFormControl = ({ label, value, min, max, onChange }) => {
    const { t } = useTranslation();
    
    return (
      <CenteredFormContainer maxWidth="md" mb={4}>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {label}
          </FormLabel>
          <NumberInput
            variant={'ghost'}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            size={{ base: "md", md: "lg" }}
            px={4}
            
          >
            <NumberInputField justifyContent={'space-between'} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </CenteredFormContainer>
    )
};

// Select Form Control - Responsive and centered
export const SelectFormControl = ({ label, name, value, onChange, options, placeholder }) => {
    const { t } = useTranslation();
    
    return (
      <CenteredFormContainer maxWidth="lg" mb={4}>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {t(label)}
          </FormLabel>
          <Select 
            name={name} 
            value={value} 
            onChange={onChange} 
            size={{ base: "md", md: "lg" }}
            placeholder={placeholder}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </Select>
        </FormControl>
      </CenteredFormContainer>
    )
};

// Checkbox Grid - Improved responsive layout
export const CheckboxGrid = ({ 
  items, 
  selectedItems, 
  fieldPath, 
  columns = { base: 1, sm: 2, md: 3, lg: 4 }, 
  handleCheckboxArrayChange 
}) => {
  const { t } = useTranslation();
  
  return (
    <ResponsiveWrapper>
      <SimpleGrid columns={columns} spacing={{ base: 3, md: 4 }} w="100%">
        {items?.map((item) => (
          <Box key={item.id} p={2}>
            <Checkbox
              isChecked={selectedItems?.includes(item.id)}
              onChange={(e) => handleCheckboxArrayChange(fieldPath, item.id, e.target.checked)}
              value={item.value}
              size={{ base: "md", md: "lg" }}
              colorScheme="brand"
            >
              <Text fontSize={{ base: "sm", md: "md" }}>
                {t(item.label) || item.label}
              </Text>
            </Checkbox>
          </Box>
        ))}
      </SimpleGrid>
    </ResponsiveWrapper>
  )
};

// Switch Form Control - Better mobile layout
export const SwitchFormControl = ({ label, id, checked, onChange }) => {
    return (
      <CenteredFormContainer maxWidth="md" mb={4}>
        <FormControl 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          w="100%"
          flexDirection={{ base: "column", sm: "row" }}
          gap={{ base: 2, sm: 0 }}
        >
          <FormLabel 
            htmlFor={id} 
            mb="0" 
            fontSize={{ base: "sm", md: "md" }}
            textAlign={{ base: "center", sm: "left" }}
          >
            {label}
          </FormLabel>
          <Switch 
            id={id} 
            isChecked={checked} 
            onChange={onChange} 
            size={{ base: "md", md: "lg" }}
            colorScheme="brand"
          />
        </FormControl>
      </CenteredFormContainer>
    )
};
  
const ExpandableRow = ({ order }) => {
  const { isOpen, onToggle } = useDisclosure();
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color scheme
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'delivered':
      case 'paid':
        return 'green';
      case 'pending':
      case 'processing':
        return 'orange';
      case 'cancelled':
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
      case 'refunded':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Calculate total items
  const totalItems = (order.order_meals?.length || 0) + (order.order_items?.length || 0);

  // Get payment method display
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      'cash': 'Cash',
      'card': 'Credit Card',
      'apple_pay': 'Apple Pay',
      'google_pay': 'Google Pay',
    };
    return methods[method] || method || 'N/A';
  };

  return (
    <>
      {/* Main Row */}
      <Tr 
        onClick={onToggle}
        cursor="pointer"
        _hover={{ bg: 'gray.50' }}
        transition="all 0.2s"
      >
        <Td>
          <Flex align="center">
            <IconButton
              size="xs"
              icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              variant="ghost"
              mr={2}
              aria-label="Expand order"
            />
            <Text fontWeight="medium" fontSize={{ base: "xs", md: "sm" }}>
              #{order.order_number || order.id.slice(-8)}
            </Text>
          </Flex>
        </Td>
        <Td fontSize={{ base: "xs", md: "sm" }}>
          <VStack align="start" spacing={0}>
            <Text>
              {new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {new Date(order.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </VStack>
        </Td>
        <Td fontSize={{ base: "xs", md: "sm" }}>
          <Text color="gray.600">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </Text>
        </Td>
        <Td isNumeric fontSize={{ base: "xs", md: "sm" }}>
          <Text fontWeight="bold">
            ${order.total_amount?.toFixed(2)}
          </Text>
        </Td>
        <Td>
          <Badge
            colorScheme={getStatusColor(order.status)}
            size="sm"
            borderRadius="md"
            px={2}
            py={1}
          >
            {order.status}
          </Badge>
        </Td>
      </Tr>

      {/* Expanded Details Row */}
      <Tr>
        <Td colSpan={5} p={0}>
          <Collapse in={isOpen} animateOpacity>
            <Box
              p={{ base: 3, md: 4 }}
              bg="gray.50"
              borderTopWidth="1px"
              borderColor="gray.200"
            >
              <Grid
                templateColumns={{ base: '1fr', md: '2fr 1fr' }}
                gap={4}
                fontSize="sm"
              >
                {/* Left Column - Order Items */}
                <GridItem>
                  <Text fontWeight="semibold" mb={3} fontSize="md">
                    Order Details
                  </Text>
                  
                  {/* Order Items List */}
                  <VStack align="stretch" spacing={3} mb={4}>
                    {/* Meals */}
                    {order.order_meals?.map((meal, index) => (
                      <HStack key={meal.id} spacing={3} align="start">
                        <Box
                          width="50px"
                          height="50px"
                          borderRadius="md"
                          overflow="hidden"
                          flexShrink={0}
                        >
                          <Image
                            src={meal?.image_url}
                            alt={meal.name}
                            objectFit="cover"
                            w="100%"
                            h="100%"
                          />
                        </Box>
                        <Box flex={1}>
                          <Text fontWeight="medium">{meal.name}</Text>
                          {meal.name_arabic && (
                            <Text fontSize="xs" color="gray.600">
                              {meal.name_arabic}
                            </Text>
                          )}
                          {meal.customization_notes && (
                            <Text fontSize="xs" color="blue.600" mt={1}>
                              Note: {meal.customization_notes}
                            </Text>
                          )}
                        </Box>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="medium">
                            ${meal.total_price?.toFixed(2)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {meal.quantity} × ${meal.unit_price?.toFixed(2)}
                          </Text>
                        </VStack>
                      </HStack>
                    ))}
                    
                    {/* Additional Items */}
                    {order.order_items?.map((item) => (
                      <HStack key={item.id} justify="space-between">
                        <Text>{item.name} × {item.quantity}</Text>
                        <Text fontWeight="medium">
                          ${item.total_price?.toFixed(2)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  {/* Delivery Address */}
                  {order.delivery_address && (
                    <Box mt={4}>
                      <Text fontWeight="semibold" mb={2}>
                        Delivery Address
                      </Text>
                      <Box p={3} bg="white" borderRadius="md" borderWidth="1px">
                        <Text>{order.delivery_address.label}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {order.delivery_address.address_line1}
                          {order.delivery_address.address_line2 && (
                            <>, {order.delivery_address.address_line2}</>
                          )}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {order.delivery_address.city}, {order.delivery_address.state}
                        </Text>
                        {order.delivery_instructions && (
                          <Text fontSize="sm" color="blue.600" mt={1}>
                            Instructions: {order.delivery_instructions}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )}
                </GridItem>

                {/* Right Column - Order Summary */}
                <GridItem>
                  <Text fontWeight="semibold" mb={3} fontSize="md">
                    Order Summary
                  </Text>
                  
                  {/* Payment Status & Method */}
                  <VStack align="stretch" spacing={3} mb={4}>
                    <HStack justify="space-between">
                      <Text color="gray.600">Payment Status:</Text>
                      <Badge
                        colorScheme={getPaymentStatusColor(order.payment_status)}
                        size="sm"
                      >
                        {order.payment_status}
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="gray.600">Payment Method:</Text>
                      <Text fontWeight="medium">
                        {getPaymentMethodDisplay(order.payment_method)}
                      </Text>
                    </HStack>

                    {order.paid_at && (
                      <HStack justify="space-between">
                        <Text color="gray.600">Paid At:</Text>
                        <Text fontSize="xs">
                          {formatDate(order.paid_at)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>

                  {/* Pricing Breakdown */}
                  <Box p={3} bg="white" borderRadius="md" borderWidth="1px">
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text color="gray.600">Subtotal</Text>
                        <Text>${order.subtotal?.toFixed(2)}</Text>
                      </HStack>
                      
                      {order.tax_amount > 0 && (
                        <HStack justify="space-between">
                          <Text color="gray.600">Tax</Text>
                          <Text>${order.tax_amount?.toFixed(2)}</Text>
                        </HStack>
                      )}
                      
                      {order.discount_amount > 0 && (
                        <HStack justify="space-between">
                          <Text color="gray.600">Discount</Text>
                          <Text color="green.500">-${order.discount_amount?.toFixed(2)}</Text>
                        </HStack>
                      )}
                      
                      {order.delivery_fee > 0 && (
                        <HStack justify="space-between">
                          <Text color="gray.600">Delivery</Text>
                          <Text>${order.delivery_fee?.toFixed(2)}</Text>
                        </HStack>
                      )}
                      
                      <Divider />
                      
                      <HStack justify="space-between" fontWeight="bold">
                        <Text>Total</Text>
                        <Text fontSize="lg">${order.total_amount?.toFixed(2)}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  {/* Loyalty Points */}
                  {(order.loyalty_points_used > 0 || order.loyalty_points_earned > 0) && (
                    <Box mt={4}>
                      <Text fontWeight="medium" mb={2}>
                        Loyalty Points
                      </Text>
                      <HStack spacing={4}>
                        {order.loyalty_points_used > 0 && (
                          <Tag colorScheme="blue" size="sm">
                            <TagLabel>Used: {order.loyalty_points_used} pts</TagLabel>
                          </Tag>
                        )}
                        {order.loyalty_points_earned > 0 && (
                          <Tag colorScheme="green" size="sm">
                            <TagLabel>Earned: {order.loyalty_points_earned} pts</TagLabel>
                          </Tag>
                        )}
                      </HStack>
                    </Box>
                  )}
                </GridItem>
              </Grid>
            </Box>
          </Collapse>
        </Td>
      </Tr>
    </>
  );
};

export const OrderHistoryTable = ({ orders }) => {
  // const { t } = useTranslation();
  
  if (!orders || orders.length === 0) {
    return (
      <Center w="100%" py={12}>
        <VStack spacing={4}>
          <Box p={4} bg="gray.100" borderRadius="full">
            <TimeIcon boxSize={6} color="gray.400" />
          </Box>
          <Text textAlign="center" color="gray.500">
            No orders found
            {/* {t('noOrdersFound')} */}
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      bg="white"
      boxShadow="sm"
    >
      <TableContainer>
        <Table variant="simple" size={{ base: "sm", md: "md" }}>
          <Thead bg="gray.50">
            <Tr>
              <Th fontSize={{ base: "xs", md: "sm" }}>Order #</Th>
              <Th fontSize={{ base: "xs", md: "sm" }}>Date & Time</Th>
              <Th fontSize={{ base: "xs", md: "sm" }}>Items</Th>
              <Th fontSize={{ base: "xs", md: "sm" }} isNumeric>Total</Th>
              <Th fontSize={{ base: "xs", md: "sm" }}>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order) => (
              <ExpandableRow key={order.id} order={order} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
  
// Subscription Details - Mobile-optimized layout
export const SubscriptionDetails = ({ 
  subscription, 
  orders = [], 
  isLoading,
  onActivateOrder,
  isActivatingOrder = false,
  refreshSubscription 
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const navigate = useNavigate();
  const toast = useToast();
  const isArabic = currentLanguage === 'ar';

  const [activatingOrderId, setActivatingOrderId] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = useColorModeValue('brand.600', 'brand.300');
  const secondaryColor = useColorModeValue('brand.500', 'brand.400');
  const accentColor = useColorModeValue('green.500', 'green.300');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Filter orders for this subscription
  const subscriptionOrders = useMemo(() => {
    if (!orders || !subscription?.id) return [];
    return orders.filter(order => order.subscription_id === subscription.id);
  }, [orders, subscription?.id]);

  // Categorize orders by status
  const { 
    pendingOrders, 
    activeOrders, 
    deliveredOrders, 
    nonPendingNonDeliveredOrders,
    hasOrdersInProgress,
    canActivateOrders 
  } = useMemo(() => {
    const pending = subscriptionOrders.filter(order => order.status === 'pending');
    const active = subscriptionOrders.filter(order => order.status === 'active');
    const delivered = subscriptionOrders.filter(order => order.status === 'delivered');
    
    // Orders that are not pending and not delivered (in progress)
    const inProgress = subscriptionOrders.filter(order => 
      order.status !== 'pending' && 
      order.status !== 'delivered' && 
      order.status !== 'cancelled'
    );
    
    const hasInProgress = inProgress.length > 0;
    const canActivate = !hasInProgress;

    return {
      pendingOrders: pending,
      activeOrders: active,
      deliveredOrders: delivered,
      nonPendingNonDeliveredOrders: inProgress,
      hasOrdersInProgress: hasInProgress,
      canActivateOrders: canActivate
    };
  }, [subscriptionOrders]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (!subscription?.total_meals || subscription.total_meals === 0) return 0;
    return Math.round((subscription.consumed_meals / subscription.total_meals) * 100);
  }, [subscription]);

  // Show toast message
  const showToast = useCallback((title, description, status = 'success') => {
    toast({
      title: t(title),
      description: t(description),
      status,
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  }, [toast, t]);

  // Handle order activation
  const handleOrderActivation = useCallback(async (orderId) => {
    if (!canActivateOrders) {
      showToast('error', 'premium.cannotActivateWhileOrderInProgress', 'error');
      return;
    }

    if (!onActivateOrder) {
      console.warn('onActivateOrder handler not provided');
      return;
    }

    setActivatingOrderId(orderId);
    try {
      await onActivateOrder(orderId);
      showToast('success', 'premium.mealActivatedSuccessfully');
    } catch (error) {
      console.error('Error activating order:', error);
      showToast('error', 'premium.failedToActivateMeal', 'error');
    } finally {
      setActivatingOrderId(null);
    }
  }, [canActivateOrders, onActivateOrder, showToast]);

  // Render order items
  const renderOrderItems = useCallback((order) => {
    if (!order.order_items || order.order_items.length === 0) {
      return (
        <Text fontSize="sm" color={mutedColor} fontStyle="italic">
          {t('noItems')}
        </Text>
      );
    }

    return (
      <VStack align="start" spacing={2} width="100%">
        {order.order_items.map((item, index) => (
          <HStack 
            key={index} 
            spacing={3} 
            wrap="wrap" 
            p={2}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderRadius="md"
            width="100%"
          >
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium">
                {isArabic ? item.name_arabic || item.name : item.name}
              </Text>
              {item.category && (
                <Tag size="sm" colorScheme="gray" variant="subtle" mt={1}>
                  {item.category}
                </Tag>
              )}
            </Box>
            <HStack spacing={2}>
              {item.quantity > 1 && (
                <Tag size="sm" colorScheme="blue" borderRadius="full">
                  x{item.quantity}
                </Tag>
              )}
              <Text fontSize="sm" color={secondaryColor} fontWeight="bold">
                ${item.total_price}
              </Text>
            </HStack>
          </HStack>
        ))}
      </VStack>
    );
  }, [isArabic, t, mutedColor, secondaryColor]);

  // Render individual order card
  const renderOrderCard = useCallback((order, showActivateButton = false) => {
    const statusColor = {
      'pending': useColorModeValue('blue.500', 'blue.300'),
      'active': useColorModeValue('green.500', 'green.300'),
      'delivered': useColorModeValue('gray.500', 'gray.300'),
      'cancelled': useColorModeValue('red.500', 'red.300'),
    }[order.status] || useColorModeValue('orange.500', 'orange.300');

    return (
      <Card
        key={order.id}
        borderWidth="1px"
        borderColor={
          order.status === 'pending' && canActivateOrders ? 'brand.300' :
          order.status === 'active' ? 'green.300' : 
          order.status === 'delivered' ? 'gray.300' : 'orange.300'
        }
        bg={cardBg}
        shadow="sm"
        transition="all 0.2s"
        _hover={{
          shadow: 'md',
          transform: 'translateY(-2px)'
        }}
        opacity={(!canActivateOrders && order.status === 'pending') ? 0.7 : 1}
      >
        <CardBody>
          <VStack align="stretch" spacing={4}>
            {/* Order Header */}
            <Flex justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <HStack spacing={2}>
                  <Tag colorScheme="brand" variant="subtle" size="sm">
                    #{order.order_number}
                  </Tag>
                  <Tag 
                    colorScheme={
                      order.status === 'pending' ? 'blue' :
                      order.status === 'active' ? 'green' :
                      order.status === 'delivered' ? 'gray' : 'orange'
                    }
                    size="sm"
                    borderRadius="full"
                  >
                    {t(`admin.order_status.${order.status}`)}
                  </Tag>
                  {order.status === 'pending' && canActivateOrders && (
                    <Tag colorScheme="yellow" size="sm" borderRadius="full">
                      <TagLeftIcon as={FiPlayCircle} />
                      <TagLabel>{t('readyToActivate')}</TagLabel>
                    </Tag>
                  )}
                  {order.status === 'pending' && hasOrdersInProgress && (
                    <Tag colorScheme="red" size="sm" borderRadius="full">
                      <TagLeftIcon as={FiPauseCircle} />
                      <TagLabel>{t('locked')}</TagLabel>
                    </Tag>
                  )}
                </HStack>
              </VStack>

              {showActivateButton && order.status === 'pending' && (
                <Tooltip 
                  label={
                    canActivateOrders 
                      ? t('activateThisOrder') 
                      : t('cannotActivateWhileOrderInProgress')
                  } 
                  hasArrow
                >
                  <IconButton
                    icon={
                      canActivateOrders ? 
                      <Icon as={FiPlayCircle} /> : 
                      <Icon as={FiPauseCircle} />
                    }
                    colorScheme={canActivateOrders ? "brand" : "gray"}
                    size="sm"
                    variant={canActivateOrders ? "solid" : "outline"}
                    onClick={() => handleOrderActivation(order.id)}
                    isDisabled={!canActivateOrders}
                    isLoading={activatingOrderId === order.id}
                    aria-label={t('activateOrder')}
                    borderRadius="full"
                  />
                </Tooltip>
              )}
            </Flex>

            {/* Order Items */}
            {renderOrderItems(order)}

            {/* Order Metadata */}
            <VStack align="start" spacing={2} fontSize="xs" color={mutedColor}>
              {order.scheduled_delivery_date && (
                <HStack>
                  <Icon as={FiClock} boxSize={3} />
                  <Text>
                    {t('scheduledFor')}: {new Date(order.scheduled_delivery_date).toLocaleDateString(
                      isArabic ? 'ar-EG' : 'en-US',
                      { weekday: 'short', month: 'short', day: 'numeric' }
                    )}
                  </Text>
                </HStack>
              )}
              <HStack>
                <Icon as={FiCalendar} boxSize={3} />
                <Text>
                  {t('orderedOn')}: {new Date(order.created_at).toLocaleDateString(
                    isArabic ? 'ar-EG' : 'en-US'
                  )}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    );
  }, [canActivateOrders, hasOrdersInProgress, renderOrderItems, handleOrderActivation, activatingOrderId, t, isArabic, cardBg]);

  if (isLoading) {
    return (
      <Center w="100%" py={12}>
        <VStack spacing={6}>
          <Spinner size="xl" color={primaryColor} thickness="4px" />
          <VStack spacing={2}>
            <Text fontSize="lg" color={mutedColor}>
              {t('loadingSubscription')}
            </Text>
            <Text fontSize="sm" color={mutedColor} textAlign="center" maxW="md">
              {t('fetchingYourSubscriptionDetails')}
            </Text>
          </VStack>
        </VStack>
      </Center>
    );
  }
  
  if (!subscription) {
    return (
      <ResponsiveWrapper>
        <Card 
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          shadow="lg"
          maxW="lg"
          mx="auto"
        >
          <CardBody>
            <VStack spacing={6} textAlign="center">
              <Icon as={FiPackage} boxSize={16} color="gray.400" />
              <VStack spacing={3}>
                <Heading size="lg" color={mutedColor}>
                  {t('nosubscription')}
                </Heading>
                <Text color={mutedColor} fontSize="sm">
                  {t('subscription.emptyStateDescription')}
                </Text>
              </VStack>
              <Button 
                colorScheme="brand"
                size="lg"
                rightIcon={<Icon as={FiChevronRight} />}
                onClick={() => navigate('/subscriptions')}
                w="full"
                maxW="sm"
              >
                {t('browsePlans')}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </ResponsiveWrapper>
    );
  }
  
  return (
    <ResponsiveWrapper>
      <VStack spacing={8} align="stretch">
        {/* Subscription Overview Card */}
        <Card 
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          shadow="lg"
          overflow="hidden"
        >
          <CardHeader bg={useColorModeValue('brand.50', 'brand.900')} pb={4}>
            <VStack spacing={2}>
              <HStack spacing={3}>
                <Icon as={FiPackage} boxSize={6} color={primaryColor} />
                <Heading size="lg" color={primaryColor}>
                  {subscription.plans?.title || t('subscription')}
                </Heading>
              </HStack>
              <Text color={mutedColor} fontSize="sm">
                {t('subscription.planDescription')}
              </Text>
            </VStack>
          </CardHeader>
          
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Left Column: Stats */}
              <VStack spacing={6} align="stretch">
                <Stat>
                  <StatLabel fontSize="sm" color={mutedColor}>
                    <HStack spacing={2}>
                      <Icon as={FiDollarSign} />
                      <Text>{t('pricePerMeal')}</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" color={secondaryColor}>
                    ${subscription.plans?.price_per_meal}
                    <Text as="span" fontSize="lg" color={mutedColor}>
                      /meal
                    </Text>
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {t('subscription.savingsPercentage', { percent: '15%' })}
                  </StatHelpText>
                </Stat>

                <Divider />

                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>
                      <HStack spacing={2}>
                        <Icon as={FiCheckCircle} />
                        <Text>{t('status')}</Text>
                      </HStack>
                    </Text>
                    <Tag 
                      colorScheme={subscription.status === 'active' ? 'green' : 'yellow'} 
                      size="lg"
                      borderRadius="full"
                      px={4}
                    >
                      <TagLeftIcon as={subscription.status === 'active' ? FiCheckCircle : FiClock} />
                      <TagLabel fontWeight="bold">
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </TagLabel>
                    </Tag>
                  </VStack>
                  
                  <VStack align="end" spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>
                      <HStack spacing={2}>
                        <Icon as={FiBarChart2} />
                        <Text>{t('progress')}</Text>
                      </HStack>
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color={primaryColor}>
                      {progressPercentage}%
                    </Text>
                  </VStack>
                </HStack>

                {/* Progress Bar */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color={mutedColor}>
                      {t('mealsConsumed')}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" color={primaryColor}>
                      {subscription.consumed_meals} / {subscription.total_meals}
                    </Text>
                  </HStack>
                  <Progress
                    value={progressPercentage}
                    colorScheme="brand"
                    size="lg"
                    borderRadius="full"
                    hasStripe
                    isAnimated={progressPercentage > 0}
                  />
                </Box>
              </VStack>

              {/* Right Column: Details */}
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>
                      <HStack spacing={2}>
                        <Icon as={FiClock} />
                        <Text>{t('deliveryTime')}</Text>
                      </HStack>
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {subscription.preferred_delivery_time?.substring(0, 5) || '12:00'}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>
                      <HStack spacing={2}>
                        <Icon as={FiTrendingUp} />
                        <Text>{t('frequency')}</Text>
                      </HStack>
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {subscription.delivery_frequency || t('weekly')}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>
                      <HStack spacing={2}>
                        <Icon as={FiCalendar} />
                        <Text>{t('startDate')}</Text>
                      </HStack>
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold">
                      {new Date(subscription.start_date).toLocaleDateString()}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={mutedColor}>
                      <HStack spacing={2}>
                        <Icon as={FiMapPin} />
                        <Text>{t('deliveryArea')}</Text>
                      </HStack>
                    </Text>
                    <Text fontSize="lg" fontWeight="semibold" noOfLines={1}>
                      {subscription.delivery_area || t('defaultArea')}
                    </Text>
                  </VStack>
                </SimpleGrid>

                {/* Action Buttons */}
                <Wrap spacing={3} justify="center">
                  <WrapItem>
                    <Button 
                      colorScheme="brand"
                      rightIcon={<Icon as={FiChevronRight} />}
                      onClick={() => navigate('/premium')}
                      size="md"
                    >
                      {t('manageSubscription')}
                    </Button>
                  </WrapItem>
                  <WrapItem>
                    <Button 
                      variant="outline"
                      leftIcon={<Icon as={FiRefreshCw} />}
                      onClick={refreshSubscription}
                      size="md"
                    >
                      {t('refresh')}
                    </Button>
                  </WrapItem>
                </Wrap>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Orders Management Section */}
        <Card 
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          shadow="lg"
        >
          <CardHeader>
            <VStack align="start" spacing={2}>
              <Heading size="lg" color={primaryColor}>
                {t('upcomingMeals')}
              </Heading>
              <Text color={mutedColor} fontSize="sm">
                {t('manageAndActivateYourUpcomingMeals')}
              </Text>
            </VStack>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Alert for orders in progress */}
              {hasOrdersInProgress && (
                <Alert 
                  status="warning" 
                  variant="subtle"
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor="yellow.500"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="md">{t('orderInProgress')}</AlertTitle>
                    <AlertDescription fontSize="sm">
                      {t('cannotActivateWhileOrderInProgress')}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Pending Orders - Available for Activation */}
              {pendingOrders.length > 0 ? (
                <Box>
                  <VStack align="start" spacing={3} mb={4}>
                    <Heading size="md" color="brand.600">
                      {t('availableToActivate')}
                    </Heading>
                    <Tag colorScheme="yellow" size="lg" borderRadius="full" px={4}>
                      {pendingOrders.length} {t('pendingMeals')}
                    </Tag>
                  </VStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {pendingOrders.map((order) => renderOrderCard(order, true))}
                  </SimpleGrid>
                </Box>
              ) : (
                <Alert 
                  status="info" 
                  variant="subtle"
                  borderRadius="md"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>{t('noPendingOrders')}</AlertTitle>
                    <AlertDescription fontSize="sm">
                      {t('allMealsAreCurrentlyActiveOrDelivered')}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Active Orders - Currently Being Processed */}
              {activeOrders.length > 0 && (
                <Box>
                  <VStack align="start" spacing={3} mb={4}>
                    <Heading size="md" color="green.600">
                      {t('activeOrders')}
                    </Heading>
                    <Tag colorScheme="green" size="lg" borderRadius="full" px={4}>
                      {activeOrders.length} {t('inProgress')}
                    </Tag>
                  </VStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {activeOrders.map((order) => renderOrderCard(order, false))}
                  </SimpleGrid>
                </Box>
              )}

              {/* Recent Delivered Orders */}
              {deliveredOrders.length > 0 && (
                <Box>
                  <VStack align="start" spacing={3} mb={4}>
                    <Heading size="md" color={mutedColor}>
                      {t('recentDeliveries')}
                    </Heading>
                    <Tag colorScheme="gray" size="lg" borderRadius="full" px={4}>
                      {Math.min(deliveredOrders.length, 3)} {t('recent')}
                    </Tag>
                  </VStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {deliveredOrders.slice(0, 3).map((order) => renderOrderCard(order, false))}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </ResponsiveWrapper>
  );
};
// Enhanced Card Component for consistent layouts
export const ResponsiveCard = ({ children, ...props }) => (
  <Box
    p={{ base: 4, md: 6 }}
    borderWidth="1px"
    borderRadius="lg"
    shadow="sm"
    bg="white"
    _dark={{ bg: "gray.800" }}
    w="100%"
    {...props}
  >
    {children}
  </Box>
);

// Enhanced Grid Container for consistent spacing
export const ResponsiveGrid = ({ children, columns, spacing = 4, ...props }) => (
  <ResponsiveWrapper>
    <SimpleGrid 
      columns={columns || { base: 1, md: 2, lg: 3 }} 
      spacing={{ base: spacing, md: spacing + 2 }}
      w="100%"
      {...props}
    >
      {children}
    </SimpleGrid>
  </ResponsiveWrapper>
);

// Action Button Group for consistent button layouts
export const ActionButtonGroup = ({ children, ...props }) => (
  <HStack 
    spacing={{ base: 2, md: 3 }}
    justify={{ base: "center", sm: "flex-end" }}
    wrap="wrap"
    {...props}
  >
    {children}
  </HStack>
);

// Enhanced UserDashboard Layout Component
export const ResponsiveDashboardLayout = ({ children }) => {
  return (
    <Box
      minH="100vh"
      bg={{ base: "gray.50", dark: "gray.900" }}
    >
      <ResponsiveWrapper>
        <Box
          py={{ base: 4, md: 6, lg: 8 }}
          w="100%"
        >
          {children}
        </Box>
      </ResponsiveWrapper>
    </Box>
  );
};

// Enhanced Tab Layout for mobile
export const ResponsiveTabLayout = ({ children }) => (
  <Box w="100%">
    <Tabs 
      variant="enclosed" 
      size={{ base: "sm", md: "md" }}
      isLazy
      lazyBehavior="keepMounted"
    >
      {children}
    </Tabs>
  </Box>
);

// Mobile-optimized Tab List
export const MobileTabList = ({ tabs }) => {
  const { t } = useTranslation();
  
  return (
    <TabList 
      overflowX="auto" 
      overflowY="hidden"
      css={{
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}
      borderBottom="2px solid"
      borderColor="gray.200"
      _dark={{ borderColor: "gray.600" }}
    >
      {tabs.map((tab, index) => (
        <Tab 
          key={index}
          fontSize={{ base: "xs", sm: "sm", md: "md" }}
          px={{ base: 2, sm: 3, md: 4 }}
          py={{ base: 2, md: 3 }}
          whiteSpace="nowrap"
          _selected={{
            color: "brand.600",
            borderColor: "brand.600",
            fontWeight: "bold"
          }}
        >
          {t(tab)}
        </Tab>
      ))}
    </TabList>
  );
};

// Enhanced Modal Layout for mobile
export const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "lg",
  ...props 
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    size={{ base: "full", sm: "md", md: size }}
    scrollBehavior="inside"
    {...props}
  >
    <ModalOverlay />
    <ModalContent 
      mx={{ base: 0, sm: 4 }}
      my={{ base: 0, sm: "auto" }}
      borderRadius={{ base: 0, sm: "lg" }}
      maxH={{ base: "100vh", sm: "90vh" }}
    >
      <ModalHeader
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        textAlign="center"
        pb={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        _dark={{ borderColor: "gray.600" }}
      >
        {title}
      </ModalHeader>
      <ModalCloseButton 
        size={{ base: "sm", md: "md" }}
        top={{ base: 3, md: 4 }}
        right={{ base: 3, md: 4 }}
      />
      <ModalBody p={{ base: 4, md: 6 }}>
        {children}
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Profile Header Component with better mobile layout
export const ResponsiveProfileHeader = ({ user, onOpen, t }) => (
  <ResponsiveCard mb={6}>
    <VStack spacing={4} align="center" textAlign="center">
      <Heading 
        size={{ base: "lg", md: "xl" }} 
        color="brand.600"
      >
        {t('welcome')}, {user?.display_name || user?.email}
      </Heading>
      
      <Text 
        fontSize={{ base: "sm", md: "md" }} 
        color="gray.600"
        maxW="md"
      >
        {t('manageYourAccount')}
      </Text>
      
      <Button
        colorScheme="brand"
        onClick={onOpen}
        size={{ base: "md", md: "lg" }}
        w={{ base: "100%", sm: "auto" }}
        minW="200px"
      >
        {t('editProfile')}
      </Button>
    </VStack>
  </ResponsiveCard>
);

// Enhanced Section Component
export const DashboardSection = ({ title, children, action, ...props }) => {
  const { t } = useTranslation();
  
  return (
    <ResponsiveCard {...props}>
      <VStack spacing={4} align="stretch">
        {title && (
          <Flex 
            justify="space-between" 
            align={{ base: "flex-start", sm: "center" }}
            direction={{ base: "column", sm: "row" }}
            gap={{ base: 2, sm: 0 }}
          >
            <Heading 
              size={{ base: "md", md: "lg" }}
              color="brand.700"
              _dark={{ color: "gray.200" }}
            >
              {typeof title === 'string' ? t(title) : title}
            </Heading>
            {action && (
              <Box>
                {action}
              </Box>
            )}
          </Flex>
        )}
        {children}
      </VStack>
    </ResponsiveCard>
  );
};

export default {
  ResponsiveWrapper,
  CenteredFormContainer,
  ResponsiveCard,
  ResponsiveGrid,
  ActionButtonGroup,
  ResponsiveDashboardLayout,
  ResponsiveTabLayout,
  MobileTabList,
  ResponsiveModal,
  ResponsiveProfileHeader,
  DashboardSection
};