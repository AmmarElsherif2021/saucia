import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useAdminSubscription,
  useUpcomingDeliveries,
  useSubscriptionAnalytics,
  useSubscriptionList,
  useSubscriptionOrders 
} from '../../Hooks/useAdminSubscription';
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
  InputGroup,
  InputLeftElement,
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
  useColorModeValue,
  Container,
  SimpleGrid,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  AspectRatio,
  Image,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Wrap,
  WrapItem,
  Center,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  Portal,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Switch,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Link,
  Square,
  Circle,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
  Icon as ChakraIcon,
} from '@chakra-ui/react';
import { PlusSquareIcon, InfoIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  FiClock,
  FiUser,
  FiMapPin,
  FiInfo,
  FiPlus,
  FiSearch,
  FiPhone,
  FiActivity,
  FiCalendar,
  FiCreditCard,
  FiPause,
  FiPlay,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit,
  FiMoreVertical,
  FiFilter,
  FiRefreshCw,
  FiBarChart2,
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiSmile,
  FiSave,
  FiX,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
  FiSettings,
  FiLogOut,
  FiMail,
  FiMessageSquare,
  FiStar,
  FiAward,
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiBox,
  FiShoppingCart,
  FiLayers,
  FiDatabase,
  FiServer,
  FiCpu,
  FiGlobe,
  FiAnchor,
  FiArchive,
  FiAirplay,
  FiAlertTriangle,
  FiBookmark,
  FiBriefcase,
  FiCamera,
  FiCoffee,
  FiCompass,
  FiDownload,
  FiEye,
  FiFlag,
  FiGitBranch,
  FiGift,
  FiGrid,
  FiHeadphones,
  FiKey,
  FiLifeBuoy,
  FiLock,
  FiMic,
  FiMoon,
  FiPaperclip,
  FiPieChart,
  FiPrinter,
  FiRadio,
  FiRepeat,
  FiScissors,
  FiShuffle,
  FiSidebar,
  FiSliders,
  FiTag,
  FiTarget,
  FiThermometer,
  FiThumbsUp,
  FiTrash,
  FiTrash2,
  FiVideo,
  FiWifi,
  FiWind,
  FiZap,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi';

// ===== CONSTANTS AND CONFIGURATIONS =====
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const STATUS_CONFIGS = {
  order: {
    pending: { color: 'orange', bg: 'orange.50', label: 'pending', icon: FiClock },
    active: { color: 'teal', bg: 'teal.50', label: 'active', icon: FiPackage },
    confirmed: { color: 'teal', bg: 'teal.50', label: 'confirmed', icon: FiPackage },
    preparing: { color: 'orange', bg: 'orange.50', label: 'preparing', icon: FiPackage },
    out_for_delivery: { color: 'purple', bg: 'purple.50', label: 'out_for_delivery', icon: FiTruck },
    delivered: { color: 'green', bg: 'green.50', label: 'delivered', icon: FiCheckCircle },
    cancelled: { color: 'red', bg: 'red.50', label: 'cancelled', icon: FiAlertCircle },
    failed: { color: 'red', bg: 'red.50', label: 'failed', icon: FiAlertCircle },
  },
  delivery: {
    pending: { color: 'blue', bg: 'blue.50', label: 'pending', icon: FiClock },
    confirmed: { color: 'orange', bg: 'orange.50', label: 'confirmed', icon: FiPackage },
    preparing: { color: 'orange', bg: 'orange.50', label: 'preparing', icon: FiPackage },
    delivered: { color: 'green', bg: 'green.50', label: 'delivered', icon: FiCheckCircle },
    cancelled: { color: 'red', bg: 'red.50', label: 'cancelled', icon: FiAlertCircle },
    failed: { color: 'red', bg: 'red.50', label: 'failed', icon: FiAlertCircle },
  },
  subscription: {
    active: { color: 'green', label: 'active', icon: FiCheckCircle },
    pending: { color: 'yellow', label: 'pending', icon: FiClock },
    cancelled: { color: 'red', label: 'cancelled', icon: FiAlertCircle },
    paused: { color: 'orange', label: 'paused', icon: FiPause },
    completed: { color: 'purple', label: 'completed', icon: FiCheckCircle },
  }
};

// ===== UTILITY FUNCTIONS =====
const transformOrderData = (orderData) => {
  if (!orderData) return [];
  
  // Debugging: Log the raw order data
  console.log('Raw order data:', orderData);
  
  return orderData.map(order => {
    const subscriptionData = order.user_subscriptions || {};
    const userProfile = subscriptionData.user_profiles || {};
    const userAddress = subscriptionData.user_addresses || {};
    
    // Debugging: Log order items for this order
    console.log(`Order #${order.order_number} items:`, order.order_items);
    
    const baseData = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: order.total_amount,
      scheduled_delivery_date: order.scheduled_delivery_date,
      actual_delivery_date: order.actual_delivery_date,
      delivery_instructions: order.delivery_instructions,
      subscription_meal_index: order.subscription_meal_index,
      created_at: order.created_at,
      order_items: order.order_items || [], // Add order items
      subscription: {
        id: subscriptionData.id,
        user_id: subscriptionData.user_id,
        status: subscriptionData.status,
      },
      user_profile: {
        id: userProfile.id,
        display_name: userProfile.display_name || 'Unknown',
        email: userProfile.email || '',
        phone_number: userProfile.phone_number || 'N/A',
      },
      delivery_address: userAddress ? 
        `${userAddress.address_line1 || ''}${userAddress.address_line2 ? ', ' + userAddress.address_line2 : ''}, ${userAddress.city || ''}`.trim() : 
        'Address not available',
      delivery_date: order.scheduled_delivery_date ? 
        new Date(order.scheduled_delivery_date).toISOString().split('T')[0] : 
        'N/A',
      delivery_time: order.scheduled_delivery_date ? 
        new Date(order.scheduled_delivery_date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }) : 'N/A',
    };

    // Add type-specific data
    return {
      ...baseData,
      subscription: {
        ...baseData.subscription,
        consumed_meals: subscriptionData.consumed_meals || 0,
        total_meals: subscriptionData.total_meals || 0,
        start_date: subscriptionData.start_date,
        end_date: subscriptionData.end_date,
        remaining_meals: (subscriptionData.total_meals || 0) - (subscriptionData.consumed_meals || 0),
        meals: subscriptionData.meals || [],
      }
    };
  });
};
// ===== REUSABLE COMPONENTS =====
// ===== REUSABLE MODAL COMPONENTS =====
const BaseModal = ({ isOpen, onClose, title, icon, children, size = "xl" }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : size}>
      <ModalOverlay />
      <ModalContent borderRadius={isMobile ? 0 : "md"} m={isMobile ? 0 : 4}>
        <ModalHeader bg="blue.50" py={4}>
          <Flex align="center">
            <Icon as={icon} mr={2} />
            <Text>{title}</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton size="lg" />
        <ModalBody pb={6} pt={4}>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Modal to show order items
const OrderItemsModal = ({ isOpen, onClose, order, t }) => {
  // Debugging: Log order items when modal opens
  useEffect(() => {
    if (isOpen && order) {
      console.log('Order items:', order.order_items);
      console.log('Order has items:', order.order_items?.length > 0);
    }
  }, [isOpen, order]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t('admin.orderItems')} - Order #${order?.order_number}`}
      icon={FiPackage}
    >
      <VStack spacing={4} align="stretch">
        <Text fontWeight="semibold">
          {t('admin.customer')}: {order?.user_profile?.display_name}
        </Text>
        
        <Box>
          <Text fontWeight="semibold" mb={2}>{t('admin.items')}:</Text>
          {order?.order_items?.length > 0 ? (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>{t('admin.item')}</Th>
                  <Th>{t('admin.quantity')}</Th>
                  <Th>{t('admin.price')}</Th>
                  <Th>{t('admin.total')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {order.order_items.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{item.name}</Text>
                        {item.name_arabic && (
                          <Text fontSize="sm" color="gray.600">
                            {item.name_arabic}
                          </Text>
                        )}
                        {item.category && (
                          <Badge colorScheme="blue" fontSize="xs">
                            {item.category}
                          </Badge>
                        )}
                      </VStack>
                    </Td>
                    <Td>{item.quantity}</Td>
                    <Td>${item.unit_price}</Td>
                    <Td>${item.total_price}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text color="gray.500">{t('admin.noItems')}</Text>
          )}
        </Box>
        
        <Box>
          <Text fontWeight="semibold">{t('admin.orderTotal')}:</Text>
          <Text fontSize="xl" fontWeight="bold">
            ${order?.total_amount}
          </Text>
        </Box>
      </VStack>
    </BaseModal>
  );
};
//status badge component
const StatusBadge = ({ status, type = 'order', t }) => {
  const config = STATUS_CONFIGS[type][status] || STATUS_CONFIGS[type].pending;
  const StatusIcon = config.icon;
  
  return (
    <Badge 
      colorScheme={config.color} 
      px={2} 
      py={1} 
      borderRadius="full"
      fontSize="xs"
    >
      <HStack spacing={1}>
        <StatusIcon size={12} />
        <Text>{t(`admin.${config.label}`)}</Text>
      </HStack>
    </Badge>
  );
};

const StatusMenu = ({ currentStatus, onStatusChange, type = 'order', t }) => {
  const config = STATUS_CONFIGS[type];
  
  return (
    <Menu>
      <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />} variant="outline">
        {t('admin.status')}
      </MenuButton>
      <MenuList>
        {Object.keys(config).map((status) => (
          <MenuItem
            key={status}
            onClick={() => onStatusChange(status)}
            fontSize="sm"
          >
            {t(`admin.${config[status].label}`)}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

const DataTableRow = ({ data, onEdit, onStatusChange, type = 'order', isMobile, t, onViewItems }) => {
  const config = STATUS_CONFIGS[type];
  const statusConfig = config[data.status] || config.pending;
  
  // Common elements for both mobile and desktop views
  const renderCommonElements = () => (
    <>
      <Flex justify="space-between" align="start">
        <VStack align="start" spacing={1}>
          <Text fontWeight="semibold" fontSize="md">
            {data.user_profile?.display_name}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {type === 'subscription' ? 'Subscription' : `Order #${data.order_number}`}
          </Text>
        </VStack>
        <StatusBadge status={data.status} type={type} t={t} />
      </Flex>
      
      <Divider />
      
      <SimpleGrid columns={2} spacing={2}>
        {type !== 'subscription' && (
          <>
            <Box>
              <Text fontSize="xs" color="gray.500">{t('admin.date')}</Text>
              <Text fontSize="sm">{data.delivery_date}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">{t('admin.time')}</Text>
              <Text fontSize="sm">{data.delivery_time}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500">{t('admin.paymentStatus')}</Text>
              <Text fontSize="sm">{data.payment_status}</Text>
            </Box>
          </>
        )}
        <Box>
          <Text fontSize="xs" color="gray.500">
            {type === 'subscription' ? t('admin.meals') : t('admin.amount')}
          </Text>
          <Text fontSize="sm">
            {type === 'subscription' 
              ? `${data.consumed_meals}/${data.total_meals}`
              : `$${data.total_amount}`
            }
          </Text>
        </Box>
      </SimpleGrid>
      
      {type !== 'subscription' && (
        <Box>
          <Text fontSize="xs" color="gray.500">{t('admin.address')}</Text>
          <Text fontSize="sm" noOfLines={2}>{data.delivery_address}</Text>
        </Box>
      )}
      
      {type === 'subscription' && (
        <Progress 
          value={(data.consumed_meals / data.total_meals) * 100} 
          size="sm" 
          colorScheme="blue" 
          borderRadius="full"
        />
      )}
    </>
  );

  // Action buttons for both mobile and desktop
  const renderActionButtons = () => (
    <HStack spacing={2} justify="flex-end">
      {(type === 'order' || type === 'delivery') && (
        <IconButton
          icon={<FiPackage />}
          size="sm"
          onClick={() => onViewItems(data)}
          aria-label="View order items"
          variant="outline"
        />
      )}
      <IconButton
        icon={<FiEdit />}
        size="sm"
        onClick={() => onEdit(data)}
        aria-label={`Edit ${type}`}
        variant="outline"
      />
      <StatusMenu 
        currentStatus={data.status} 
        onStatusChange={(status) => onStatusChange(data.id, status)}
        type={type}
        t={t}
      />
    </HStack>
  );

  if (isMobile) {
    return (
      <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} boxShadow="sm">
        <VStack align="stretch" spacing={3}>
          {renderCommonElements()}
          {renderActionButtons()}
        </VStack>
      </Box>
    );
  }
  
  // Desktop view
  return (
    <Tr _hover={{ bg: 'gray.50' }}>
      <Td>
        <HStack spacing={3}>
          <Avatar size="sm" name={data.user_profile?.display_name} />
          <Box>
            <Text fontWeight="medium">{data.user_profile?.display_name}</Text>
            <Text fontSize="sm" color="gray.600">{data.user_profile?.phone_number}</Text>
          </Box>
        </HStack>
      </Td>
      
      {type !== 'subscription' && (
        <Td>
          <Text fontWeight="medium">#{data.order_number}</Text>
        </Td>
      )}
      
      {type !== 'subscription' && (
        <Td maxW="200px">
          <Text noOfLines={2} fontSize="sm">
            {data.delivery_address}
          </Text>
        </Td>
      )}
      
      {type !== 'subscription' && (
        <Td>
          <Text>{data.delivery_date}</Text>
          <Text fontSize="sm" color="gray.600">{data.delivery_time}</Text>
        </Td>
      )}
      
      <Td>
        <StatusBadge status={data.status} type={type} t={t} />
      </Td>
      
      {type === 'subscription' ? (
        <>
          <Td>{data.start_date}</Td>
          <Td>{data.end_date || 'N/A'}</Td>
          <Td>
            <HStack spacing={2}>
              <Text fontSize="sm">
                {data.consumed_meals}/{data.total_meals}
              </Text>
              <Progress 
                value={(data.consumed_meals / data.total_meals) * 100} 
                size="sm" 
                width="80px" 
                colorScheme="blue" 
                borderRadius="full"
              />
            </HStack>
          </Td>
        </>
      ) : (
        <>
          <Td>
            <Text fontSize="sm">{data.payment_status}</Text>
          </Td>
          <Td>
            <Text fontWeight="semibold">${data.total_amount}</Text>
          </Td>
        </>
      )}
      
      <Td>
        {renderActionButtons()}
      </Td>
    </Tr>
  );
};


const EditModal = ({ isOpen, onClose, data, onSave, type, t }) => {
  const toast = useToast();
  const { updateSubscription, updateDeliveryStatus } = useAdminSubscription();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      if (type === 'subscription') {
        setFormData({
          consumed_meals: data.consumed_meals || 0,
          total_meals: data.total_meals || 0,
          status: data.status || 'active',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
        });
      } else {
        setFormData({
          delivery_date: data.delivery_date,
          delivery_time: data.delivery_time || '12:00',
          delivery_instructions: data.delivery_instructions || '',
          status: data.status,
        });
      }
    }
  }, [data, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (type === 'subscription') {
        await updateSubscription(data.id, formData);
      } else {
        // Format the scheduled_delivery_date for delivery/order
        const scheduled_delivery_date = new Date(`${formData.delivery_date}T${formData.delivery_time}:00`);
        await updateDeliveryStatus(data.id, {
          scheduled_delivery_date: scheduled_delivery_date.toISOString(),
          delivery_instructions: formData.delivery_instructions,
          status: formData.status,
        });
      }
      
      toast({
        title: t('admin.success'),
        description: type === 'subscription' ? t('admin.subscriptionUpdated') : t('admin.deliveryUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: t('admin.error'),
        description: error.message || t('admin.updateFailed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${type === 'subscription' ? t('admin.editSubscription') : t('admin.editDelivery')} - ${data?.user_profile?.display_name}`}
      icon={FiEdit}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          {type === 'subscription' ? (
            <>
              <FormControl>
                <FormLabel fontWeight="semibold">{t('admin.status')}</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  size="md"
                  focusBorderColor="blue.500"
                >
                  {Object.keys(STATUS_CONFIGS.subscription).map(status => (
                    <option key={status} value={status}>
                      {t(`admin.${status}`)}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="semibold">{t('admin.totalMeals')}</FormLabel>
                  <NumberInput
                    value={formData.total_meals}
                    onChange={(value) => handleChange('total_meals', parseInt(value) || 0)}
                    min={0}
                  >
                    <NumberInputField focusBorderColor="blue.500" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="semibold">{t('admin.consumedMeals')}</FormLabel>
                  <NumberInput
                    value={formData.consumed_meals}
                    onChange={(value) => handleChange('consumed_meals', parseInt(value) || 0)}
                    min={0}
                    max={formData.total_meals}
                  >
                    <NumberInputField focusBorderColor="blue.500" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="semibold">{t('admin.startDate')}</FormLabel>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="semibold">{t('admin.endDate')}</FormLabel>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    focusBorderColor="blue.500"
                  />
                </FormControl>
              </SimpleGrid>
            </>
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontWeight="semibold">{t('admin.deliveryDate')}</FormLabel>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => handleChange('delivery_date', e.target.value)}
                    focusBorderColor="blue.500"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontWeight="semibold">{t('admin.deliveryTime')}</FormLabel>
                  <Select
                    value={formData.delivery_time}
                    onChange={(e) => handleChange('delivery_time', e.target.value)}
                    focusBorderColor="blue.500"
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel fontWeight="semibold">{t('admin.status')}</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  focusBorderColor="blue.500"
                >
                  {Object.keys(STATUS_CONFIGS.delivery).map(status => (
                    <option key={status} value={status}>
                      {t(`admin.${STATUS_CONFIGS.delivery[status].label}`)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="semibold">{t('admin.deliveryInstructions')}</FormLabel>
                <Textarea
                  value={formData.delivery_instructions}
                  onChange={(e) => handleChange('delivery_instructions', e.target.value)}
                  placeholder={t('admin.addInstructions')}
                  rows={3}
                  focusBorderColor="blue.500"
                />
              </FormControl>
            </>
          )}
          
          <HStack spacing={3} justify="flex-end" pt={4}>
            <Button
              leftIcon={<FiX />}
              onClick={onClose}
              variant="outline"
              size="md"
            >
              {t('admin.cancel')}
            </Button>
            <Button
              leftIcon={<FiSave />}
              colorScheme="blue"
              type="submit"
              isLoading={loading}
              loadingText={t('admin.saving')}
              size="md"
            >
              {t('admin.saveChanges')}
            </Button>
          </HStack>
        </VStack>
      </form>
    </BaseModal>
  );
};
// ===== MAIN DASHBOARD COMPONENT =====
const AdminSubscriptionDashboard = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('order');
   const [selectedOrderForItems, setSelectedOrderForItems] = useState(null);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const { 
    data: deliveryData, 
    isLoading: deliveriesLoading, 
    error: deliveriesError,
    refetch: refetchDeliveries 
  } = useUpcomingDeliveries(selectedDate);
  
  const { 
    data: subscriptionData, 
    isLoading: subscriptionsLoading, 
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useSubscriptionList();
  
  const { 
    data: analyticsData, 
    isLoading: analyticsLoading, 
    error: analyticsError 
  } = useSubscriptionAnalytics();
  
  const { 
    data: subscriptionOrderData, 
    isLoading: subscriptionOrdersLoading, 
    error: subscriptionOrdersError,
    refetch: refetchSubscriptionOrders 
  } = useSubscriptionOrders();

  const { updateDeliveryStatus, updateSubscriptionStatus, updateOrderStatus } = useAdminSubscription();
  
  const transformedDeliveries = useMemo(() => transformOrderData(deliveryData, 'delivery'), [deliveryData]);
  const transformedSubscriptionOrders = useMemo(() => transformOrderData(subscriptionOrderData), [subscriptionOrderData]);
  
  const filteredData = useMemo(() => {
    const dataToFilter = modalType === 'subscription' ? subscriptionData : 
                        modalType === 'order' ? transformedSubscriptionOrders : 
                        transformedDeliveries;
    
    if (!dataToFilter) return [];
    
    return dataToFilter.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.user_profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.order_number && item.order_number.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [transformedDeliveries, subscriptionData, transformedSubscriptionOrders, searchQuery, statusFilter, modalType]);
  
  //handlers
  const handleViewOrderItems = (order) => {
    setSelectedOrderForItems(order);
    setIsItemsModalOpen(true);
  };

  const handleStatusChange = async (itemId, newStatus, type) => {
    try {
      if (type === 'subscription') {
        await updateSubscriptionStatus(itemId, newStatus);
        refetchSubscriptions();
        toast({
          title: t('admin.success'),
          description: t('admin.subscriptionStatusUpdated'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await updateOrderStatus(itemId, newStatus);
        if (type === 'delivery') refetchDeliveries();
        else refetchSubscriptionOrders();
        toast({
          title: t('admin.success'),
          description: t('admin.orderStatusUpdated'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: t('admin.error'),
        description: error.message || t('admin.updateFailed'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleEditItem = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };
  
  const handleSaveItem = () => {
    if (modalType === 'subscription') refetchSubscriptions();
    else if (modalType === 'delivery') refetchDeliveries();
    else refetchSubscriptionOrders();
    setIsModalOpen(false);
  };

  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  if (deliveriesError || subscriptionsError || analyticsError) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">{t('admin.errorLoading')}</Text>
          <Text>{deliveriesError?.message || subscriptionsError?.message || analyticsError?.message}</Text>
        </Box>
      </Alert>
    );
  }
  
  return (
    <Box bg={bgColor} minH="100vh">
      <Box p={{ base: 4, md: 6 }} maxW="100%">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              {t('admin.dashboard')}
            </Heading>
            <Breadcrumb separator={<ChevronRightIcon color="gray.500" />} fontSize="sm">
              <BreadcrumbItem>
                <BreadcrumbLink href="#">{t('admin.home')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <BreadcrumbLink href="#">{t('admin.subscriptionManagement')}</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>
          </Box>
          
          {/* Analytics Cards */}
          {!analyticsLoading && analyticsData && (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
              <Card bg={cardBg} borderRadius="lg" boxShadow="sm">
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">{t('admin.totalSubscriptions')}</StatLabel>
                    <StatNumber fontSize="2xl">{analyticsData.total_subscriptions}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      {analyticsData.month_growth}% {t('admin.fromLastMonth')}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderRadius="lg" boxShadow="sm">
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">{t('admin.activeSubscriptions')}</StatLabel>
                    <StatNumber fontSize="2xl">{analyticsData.active_subscriptions}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      {analyticsData.active_growth}% {t('admin.fromLastMonth')}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderRadius="lg" boxShadow="sm">
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">{t('admin.todayDeliveries')}</StatLabel>
                    <StatNumber fontSize="2xl">{analyticsData.today_deliveries}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      {analyticsData.delivery_completion_rate}% {t('admin.completed')}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderRadius="lg" boxShadow="sm">
                <CardBody>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">{t('admin.revenue')}</StatLabel>
                    <StatNumber fontSize="2xl">${analyticsData.monthly_revenue}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      {analyticsData.revenue_growth}% {t('admin.fromLastMonth')}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}
          
          {/* Filters and Controls */}
          <Card bg={cardBg} borderRadius="lg" boxShadow="sm">
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <InputGroup maxW={{ base: '100%', md: '300px' }}>
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder={t('admin.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    maxW={{ base: '100%', md: '200px' }}
                  >
                    <option value="all">{t('admin.allStatuses')}</option>
                    {Object.keys(STATUS_CONFIGS.delivery).map(status => (
                      <option key={status} value={status}>
                        {t(`admin.${STATUS_CONFIGS.delivery[status].label}`)}
                      </option>
                    ))}
                  </Select>
                  
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    maxW={{ base: '100%', md: '200px' }}
                  />
                  
                  <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={() => {
                      refetchDeliveries();
                      refetchSubscriptions();
                      refetchSubscriptionOrders();
                    }}
                    variant="outline"
                    ml={{ md: 'auto' }}
                  >
                    {t('admin.refresh')}
                  </Button>
                </Flex>
                
                <Flex gap={2} overflowX="auto" py={2}>
                  {Object.keys(STATUS_CONFIGS.delivery).map(status => (
                    <Button
                      key={status}
                      size="sm"
                      variant={statusFilter === status ? "solid" : "outline"}
                      colorScheme={STATUS_CONFIGS.delivery[status].color}
                      onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                      leftIcon={STATUS_CONFIGS.delivery[status].icon}
                    >
                      {t(`admin.${STATUS_CONFIGS.delivery[status].label}`)} ({filteredData.filter(d => d.status === status).length})
                    </Button>
                  ))}
                </Flex>
              </VStack>
            </CardBody>
          </Card>
          
          {/* Main Content Tabs */}
          <Tabs variant="enclosed" colorScheme="blue" isLazy onChange={(index) => {
            const types = ['order', 'delivery', 'subscription', 'analytics'];
            setModalType(types[index]);
          }}>
            <TabList>
              <Tab>
                <HStack spacing={2}>
                  <FiShoppingBag />
                  <Text>{t('admin.subscriptionOrders')}</Text>
                  <Badge colorScheme="blue" borderRadius="full" fontSize="xs">
                    {transformedSubscriptionOrders.length}
                  </Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiTruck />
                  <Text>{t('admin.deliveries')}</Text>
                  <Badge colorScheme="blue" borderRadius="full" fontSize="xs">
                    {transformedDeliveries.length}
                  </Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiUsers />
                  <Text>{t('admin.subscriptions')}</Text>
                  <Badge colorScheme="blue" borderRadius="full" fontSize="xs">
                    {subscriptionData?.length || 0}
                  </Badge>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <FiBarChart2 />
                  <Text>{t('admin.analytics')}</Text>
                </HStack>
              </Tab>
            </TabList>
            
            <TabPanels>
              {/* Subscription Orders Tab */}
              <TabPanel px={0}>
                {subscriptionOrdersLoading ? (
                  <VStack spacing={4} align="stretch">
                    {[1, 2, 3].map(i => (
                      <Card key={i} bg={cardBg} borderRadius="lg" boxShadow="sm">
                        <CardBody>
                          <Skeleton height="20px" mb={4} />
                          <SkeletonText noOfLines={3} spacing={3} />
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : filteredData.length === 0 ? (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <Icon as={FiShoppingBag} boxSize={12} color="gray.400" />
                      <Text color="gray.500">{t('admin.noSubscriptionOrders')}</Text>
                    </VStack>
                  </Center>
                ) : isMobile ? (
                  <VStack spacing={4} align="stretch">
                    {filteredData.map(item => (
                      <DataTableRow
                        key={item.id}
                        data={item}
                        onEdit={(item) => handleEditItem(item, 'order')}
                        onStatusChange={(id, status) => handleStatusChange(id, status, 'order')}
                        type="order"
                        isMobile={isMobile}
                        t={t}
                        onViewItems={handleViewOrderItems}

                      />
                    ))}
                  </VStack>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead>
                        <Tr>
                          <Th>{t('admin.customer')}</Th>
                          <Th>{t('admin.order')}</Th>
                          <Th>{t('admin.address')}</Th>
                          <Th>{t('admin.dateTime')}</Th>
                          <Th>{t('admin.status')}</Th>
                          <Th>{t('admin.paymentStatus')}</Th>
                          <Th>{t('admin.amount')}</Th>
                          <Th>{t('admin.actions')}</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredData.map(item => (
                          <DataTableRow
                            key={item.id}
                            data={item}
                            onEdit={(item) => handleEditItem(item, 'order')}
                            onStatusChange={(id, status) => handleStatusChange(id, status, 'order')}
                            type="order"
                            isMobile={isMobile}
                            t={t}
                            onViewItems={handleViewOrderItems}
                          />
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>
              
              {/* Deliveries Tab */}
              <TabPanel px={0}>
                {deliveriesLoading ? (
                  <VStack spacing={4} align="stretch">
                    {[1, 2, 3].map(i => (
                      <Card key={i} bg={cardBg} borderRadius="lg" boxShadow="sm">
                        <CardBody>
                          <Skeleton height="20px" mb={4} />
                          <SkeletonText noOfLines={3} spacing={3} />
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : filteredData.length === 0 ? (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <Icon as={FiPackage} boxSize={12} color="gray.400" />
                      <Text color="gray.500">{t('admin.noDeliveries')}</Text>
                    </VStack>
                  </Center>
                ) : isMobile ? (
                  <VStack spacing={4} align="stretch">
                    {filteredData.map(item => (
                      <DataTableRow
                        key={item.id}
                        data={item}
                        onEdit={(item) => handleEditItem(item, 'delivery')}
                        onStatusChange={(id, status) => handleStatusChange(id, status, 'delivery')}
                        type="delivery"
                        isMobile={isMobile}
                        t={t}
                      />
                    ))}
                  </VStack>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead>
                        <Tr>
                          <Th>{t('admin.customer')}</Th>
                          <Th>{t('admin.order')}</Th>
                          <Th>{t('admin.address')}</Th>
                          <Th>{t('admin.dateTime')}</Th>
                          <Th>{t('admin.status')}</Th>
                          <Th>{t('admin.amount')}</Th>
                          <Th>{t('admin.actions')}</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredData.map(item => (
                          <DataTableRow
                            key={item.id}
                            data={item}
                            onEdit={(item) => handleEditItem(item, 'delivery')}
                            onStatusChange={(id, status) => handleStatusChange(id, status, 'delivery')}
                            type="delivery"
                            isMobile={isMobile}
                            t={t}
                            onViewItems={handleViewOrderItems}

                          />
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>
              
              {/* Subscriptions Tab */}
              <TabPanel px={0}>
                {subscriptionsLoading ? (
                  <VStack spacing={4} align="stretch">
                    {[1, 2, 3].map(i => (
                      <Card key={i} bg={cardBg} borderRadius="lg" boxShadow="sm">
                        <CardBody>
                          <Skeleton height="20px" mb={4} />
                          <SkeletonText noOfLines={3} spacing={3} />
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                ) : filteredData.length === 0 ? (
                  <Center py={10}>
                    <VStack spacing={4}>
                      <Icon as={FiUsers} boxSize={12} color="gray.400" />
                      <Text color="gray.500">{t('admin.noSubscriptions')}</Text>
                    </VStack>
                  </Center>
                ) : isMobile ? (
                  <VStack spacing={4} align="stretch">
                    {filteredData.map(item => (
                      <DataTableRow
                        key={item.id}
                        data={item}
                        onEdit={(item) => handleEditItem(item, 'subscription')}
                        onStatusChange={(id, status) => handleStatusChange(id, status, 'subscription')}
                        type="subscription"
                        isMobile={isMobile}
                        t={t}
                        onViewItems={handleViewOrderItems}

                      />
                    ))}
                  </VStack>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead>
                        <Tr>
                          <Th>{t('admin.customer')}</Th>
                          <Th>{t('admin.plan')}</Th>
                          <Th>{t('admin.status')}</Th>
                          <Th>{t('admin.startDate')}</Th>
                          <Th>{t('admin.endDate')}</Th>
                          <Th>{t('admin.meals')}</Th>
                          <Th>{t('admin.actions')}</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredData.map(item => (
                          <DataTableRow
                            key={item.id}
                            data={item}
                            onEdit={(item) => handleEditItem(item, 'subscription')}
                            onStatusChange={(id, status) => handleStatusChange(id, status, 'subscription')}
                            type="subscription"
                            isMobile={isMobile}
                            t={t}
                            onViewItems={handleViewOrderItems}

                          />
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </TabPanel>
              
              {/* Analytics Tab */}
              <TabPanel>
                <Text color="gray.500" textAlign="center" py={10}>
                  {t('admin.analyticsComingSoon')}
                </Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
      
      {/* Modal */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedItem}
        onSave={handleSaveItem}
        type={modalType}
        t={t}
      />
      <OrderItemsModal
        isOpen={isItemsModalOpen}
        onClose={() => setIsItemsModalOpen(false)}
        order={selectedOrderForItems}
        t={t}
      />
    </Box>
  );
};

export default AdminSubscriptionDashboard;