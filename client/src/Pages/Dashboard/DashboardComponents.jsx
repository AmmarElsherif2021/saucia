import { useState, useMemo, useCallback } from 'react';
import {
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
  FiCheckCircle, 
  FiLock, 
  FiClock, 
  FiCalendar,
  FiAlertTriangle 
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
              placeholder={t('profile.enterDeliveryAddress')}
              variant={'ghost'}
              size={{ base: "md", md: "lg" }}
              flex={1}
            />
            <IconButton
              aria-label={t('checkout.selectFromMap')}
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
                {t('profile.verified')}
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
            {enabled ? t('profile.enabled') : t('profile.disabled')}
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
  
// Order History Table - Mobile-first responsive design
export const OrderHistoryTable = ({ orders }) => {
    const { t } = useTranslation();
    
    if (!orders || orders.length === 0) {
      return (
        <Center w="100%" py={8}>
          <Text textAlign="center" color="gray.500" fontSize={{ base: "sm", md: "md" }}>
            {t('profile.noOrdersFound')}
          </Text>
        </Center>
      )
    }
    
    return (
      <ResponsiveWrapper>
        <Box overflowX="auto" w="100%">
          <TableContainer>
            <Table variant="striped" size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.orderID')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.date')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.items')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }} isNumeric>{t('profile.total')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.status')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders?.map((order) => (
                  <Tr key={order.id}>
                    <Td fontSize={{ base: "xs", md: "sm" }}>
                      <Text isTruncated maxW={{ base: "60px", md: "100px" }}>
                        {order.order_number || order.id.slice(0, 8)}...
                      </Text>
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }}>
                      <Text>
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }}>
                      <VStack align="start" spacing={1}>
                        {/* Show order items */}
                        {order.items?.map((item) => (
                          <Text key={item.id} isTruncated maxW={{ base: "80px", md: "150px" }}>
                            {item.name} x{item.quantity}
                          </Text>
                        ))}
                        {/* Show order meals if they exist */}
                        {order.order_meals?.map((meal) => (
                          <Text key={meal.id} isTruncated maxW={{ base: "80px", md: "150px" }}>
                            {meal.name} x{meal.quantity}
                          </Text>
                        ))}
                        {/* If no items or meals, show a message */}
                        {(!order.order_items || order.order_items.length === 0) && 
                         (!order.order_meals || order.order_meals.length === 0) && (
                          <Text color="gray.500" fontSize="xs">
                            {t('profile.noItems')}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }} isNumeric>
                      <Text fontWeight="bold">
                        ${order.total_amount?.toFixed(2)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          order.status === 'delivered' || order.status === 'completed'
                            ? 'green'
                            : order.status === 'pending' || order.status === 'confirmed'
                              ? 'yellow'
                              : 'red'
                        }
                        size={{ base: "sm", md: "md" }}
                        borderRadius="full"
                      >
                        {order.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </ResponsiveWrapper>
    )
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
  }, [subscriptionOrders,refreshSubscription]);



  // Show toast message
  const showToast = useCallback((title, description, status = 'success') => {
    toast({
      title: t(title),
      description: t(description),
      status,
      duration: 3000,
      isClosable: true,
    });
  }, [toast, t]);

  // Handle order activation
  const handleOrderActivation = useCallback(async (orderId) => {
    if (!canActivateOrders) {
      showToast('premium.error', 'premium.cannotActivateWhileOrderInProgress', 'error');
      return;
    }

    if (!onActivateOrder) {
      console.warn('onActivateOrder handler not provided');
      return;
    }

    setActivatingOrderId(orderId);
    try {
      await onActivateOrder(orderId);
      showToast('premium.success', 'premium.mealActivatedSuccessfully');
    } catch (error) {
      console.error('Error activating order:', error);
      showToast('premium.error', 'premium.failedToActivateMeal', 'error');
    } finally {
      setActivatingOrderId(null);
    }
  }, [canActivateOrders, onActivateOrder,refreshSubscription, showToast]);

  // Render order items
  const renderOrderItems = useCallback((order) => {
    if (!order.order_items || order.order_items.length === 0) {
      return <Text fontSize="sm" color="gray.500">{t('premium.noItems')}</Text>;
    }

    return (
      <VStack align="start" spacing={1}>
        {order.order_items.map((item, index) => (
          <HStack key={index} spacing={2} wrap="wrap">
            <Text fontSize="sm" fontWeight="medium">
              {isArabic ? item.name_arabic || item.name : item.name}
            </Text>
            {item.quantity > 1 && (
              <Badge fontSize="xs" colorScheme="blue">x{item.quantity}</Badge>
            )}
            {item.category && (
              <Badge fontSize="xs" colorScheme="gray" variant="subtle">
                {item.category}
              </Badge>
            )}
            <Text fontSize="xs" color="brand.500" fontWeight="bold">
              ${item.total_price}
            </Text>
          </HStack>
        ))}
      </VStack>
    );
  }, [isArabic, t]);

  // Render individual order card
  const renderOrderCard = useCallback((order, showActivateButton = false) => (
    <Box
      key={order.id}
      p={4}
      borderWidth="2px"
      borderColor={
        order.status === 'pending' && canActivateOrders ? 'brand.200' :
        order.status === 'active' ? 'green.200' : 
        order.status === 'delivered' ? 'gray.200' : 'orange.200'
      }
      borderRadius="md"
      bg={
        order.status === 'delivered' ? 'gray.50' :
        order.status === 'active' ? 'green.50' : 
        order.status === 'pending' && canActivateOrders ? 'brand.50' : 'white'
      }
      opacity={(!canActivateOrders && order.status === 'pending') ? 0.6 : 1}
      transition="all 0.2s"
      _hover={
        order.status === 'pending' && canActivateOrders 
          ? { borderColor: 'brand.400', shadow: 'md' } 
          : {}
      }
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <HStack wrap="wrap" spacing={2}>
              <Text fontWeight="bold" fontSize="sm">
                #{order.order_number}
              </Text>
              <Badge 
                colorScheme={
                  order.status === 'pending' ? 'blue' :
                  order.status === 'active' ? 'green' :
                  order.status === 'delivered' ? 'gray' : 'orange'
                }
                size="sm"
              >
                {t(`admin.order_status.${order.status}`)}
              </Badge>
              {order.status === 'pending' && canActivateOrders && (
                <Badge colorScheme="yellow" size="sm">
                  {t('premium.readyToActivate')}
                </Badge>
              )}
              {order.status === 'pending' && hasOrdersInProgress && (
                <Badge colorScheme="red" size="sm">
                  <HStack spacing={1}>
                    <Icon as={FiLock} boxSize="10px" />
                    <Text>{t('premium.locked')}</Text>
                  </HStack>
                </Badge>
              )}
            </HStack>
          </VStack>

          {showActivateButton && order.status === 'pending' && (
            <Tooltip 
              label={
                canActivateOrders 
                  ? t('premium.activateThisOrder') 
                  : t('premium.cannotActivateWhileOrderInProgress')
              } 
              hasArrow
            >
              <IconButton
                icon={canActivateOrders ? <Icon as={FiCheckCircle} /> : <Icon as={FiLock} />}
                colorScheme={canActivateOrders ? "brand" : "gray"}
                size="sm"
                variant={canActivateOrders ? "solid" : "outline"}
                onClick={() => handleOrderActivation(order.id)}
                isDisabled={!canActivateOrders}
                isLoading={activatingOrderId === order.id}
                aria-label={t('premium.activateOrder')}
              />
            </Tooltip>
          )}
        </HStack>
        
        {renderOrderItems(order)}
        
        <HStack spacing={4} fontSize="xs" color="gray.600" wrap="wrap">
          {order.scheduled_delivery_date && (
            <HStack>
              <Icon as={FiClock} boxSize="12px" />
              <Text>
                {new Date(order.scheduled_delivery_date).toLocaleDateString(
                  isArabic ? 'ar-EG' : 'en-US'
                )}
              </Text>
            </HStack>
          )}
          <HStack>
            <Icon as={FiCalendar} boxSize="12px" />
            <Text>
              {new Date(order.created_at).toLocaleDateString(
                isArabic ? 'ar-EG' : 'en-US'
              )}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  ), [canActivateOrders, hasOrdersInProgress, renderOrderItems, handleOrderActivation, activatingOrderId, refreshSubscription, t, isArabic]);

  if (isLoading) {
    return (
      <Center w="100%" py={8}>
        <VStack spacing={4}>
          <Spinner size={{ base: "md", md: "lg" }} />
          <Text fontSize="sm" color="gray.500">
            {t('premium.loadingSubscription')}
          </Text>
        </VStack>
      </Center>
    );
  }
  
  if (!subscription) {
    return (
      <ResponsiveWrapper>
        <Box 
          w="100%" 
          maxW="lg" 
          bg="secondary.200" 
          borderRadius="lg" 
          overflow="hidden"
        >
          <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg">
            <VStack spacing={4}>
              <Text 
                textAlign="center" 
                fontSize={{ base: "md", md: "lg" }}
                color="gray.600"
              >
                {t('profile.nosubscription')}
              </Text>
              <Button 
                colorScheme="brand"
                size={{ base: "md", md: "lg" }}
                w={{ base: "100%", sm: "auto" }}
                onClick={() => navigate('/subscriptions')}
              >
                {t('profile.browsePlans')}
              </Button>
            </VStack>
          </Box>
        </Box>
      </ResponsiveWrapper>
    );
  }
  
  return (
    <ResponsiveWrapper>
      <VStack spacing={6} align="stretch">
        {/* Subscription Overview */}
        <Box 
          w="100%" 
          maxW="lg" 
          bg="secondary.200" 
          borderRadius="lg" 
          overflow="hidden"
        >
          <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg">
            <VStack spacing={4} align="stretch">
              <Heading 
                size={{ base: "md", md: "lg" }} 
                textAlign="center"
                color="brand.600"
              >
                {subscription.plans?.title || t('profile.subscription')}
              </Heading>
              
              <Center>
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: "xl", md: "2xl" }}
                  color="brand.500"
                >
                  ${subscription.plans?.price_per_meal}/meal
                </Text>
              </Center>
              
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                    {t('profile.status')}:
                  </Text>
                  <Badge 
                    colorScheme={subscription.status === 'active' ? 'green' : 'yellow'} 
                    size={{ base: "sm", md: "md" }}
                    borderRadius="full"
                  >
                    {subscription.status}
                  </Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                    {t('profile.consumedMeals')}:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                    {subscription.consumed_meals} / {subscription.total_meals}
                  </Text>
                </HStack>

                {/* Progress Bar */}
                <Box>
                  <Text fontSize="sm" mb={2}>{t('premium.progress')}:</Text>
                  <Progress
                    value={(subscription.consumed_meals / subscription.total_meals) * 100}
                    colorScheme="brand"
                    size="md"
                    borderRadius="md"
                  />
                </Box>
                
                <HStack justify="space-between">
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                    {t('profile.preferredDeliveryTime')}:
                  </Text>
                  <Text fontSize={{ base: "sm", md: "md" }}>
                    {subscription.preferred_delivery_time?.substring(0, 5) || '12:00'}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </Box>

        {/* Orders Management Section */}
        <Box 
          w="100%" 
          maxW="4xl" 
          bg="white" 
          borderRadius="lg" 
          overflow="hidden"
          p={{ base: 4, md: 6 }}
          borderWidth="1px"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md" color="brand.600">
              {t('premium.upcomingMeals')}
            </Heading>

            {/* Alert for orders in progress */}
            {hasOrdersInProgress && (
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>{t('premium.orderInProgress')}</AlertTitle>
                  <AlertDescription fontSize="sm">
                    {t('premium.cannotActivateWhileOrderInProgress')}
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Pending Orders - Available for Activation  refresh*/}
            {pendingOrders.length > 0 ? (
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color="brand.600">
                  {t('premium.availableToActivate')} ({pendingOrders.length})
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {pendingOrders.map((order) => renderOrderCard(order, true))}
                </SimpleGrid>
              </Box>
            ) : (
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>{t('premium.noPendingOrders')}</AlertTitle>
                </Box>
              </Alert>
            )}

            {/* Active Orders - Currently Being Processed */}
          
             {
              nonPendingNonDeliveredOrders.length> 0 && (
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color="green.600">
                  {t('premium.activeOrders')} ({activeOrders.length})
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {nonPendingNonDeliveredOrders.map((order) => renderOrderCard(order, false))}
                </SimpleGrid>
              </Box>
            )}
             
             
            {/* Recent Delivered Orders */}
            {deliveredOrders.length > 0 && (
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.600">
                  {t('premium.recentDeliveries')} ({Math.min(deliveredOrders.length, 3)})
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {deliveredOrders.slice(0, 3).map((order) => renderOrderCard(order, false))}
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Manage Subscription Button */}
        <Center pt={4}>
          <Button 
            colorScheme="brand" 
            onClick={() => navigate('/premium')}
            size={{ base: "md", md: "lg" }}
            w={{ base: "100%", sm: "auto" }}
            minW="200px"
          >
            {t('profile.manageSubscription')}
          </Button>
        </Center>
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
        {t('profile.welcome')}, {user?.display_name || user?.email}
      </Heading>
      
      <Text 
        fontSize={{ base: "sm", md: "md" }} 
        color="gray.600"
        maxW="md"
      >
        {t('profile.manageYourAccount')}
      </Text>
      
      <Button
        colorScheme="brand"
        onClick={onOpen}
        size={{ base: "md", md: "lg" }}
        w={{ base: "100%", sm: "auto" }}
        minW="200px"
      >
        {t('profile.editProfile')}
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