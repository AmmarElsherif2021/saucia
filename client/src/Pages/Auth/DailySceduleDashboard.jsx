import { useState, useEffect } from 'react';
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
  CardBody,
  CardHeader,
  Heading,
  Input,
  Textarea,
  Button,
  IconButton,
  useColorModeValue,
  Flex,
  Avatar,
  Tag,
  TagLabel,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { FiClock, FiUser, FiMapPin, FiInfo, FiPlus, FiSearch } from 'react-icons/fi';

// Sample data structure (replace with your actual data from API)
const sampleDeliveries = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Ahmed Mohammed',
    userAvatar: 'https://bit.ly/dan-abramov',
    deliveryTime: '12:00',
    meals: [
      {
        id: 'meal1',
        name: 'Grilled Chicken',
        items: ['Chicken Breast', 'Rice', 'Vegetables'],
        specialInstructions: 'No spices please'
      }
    ],
    address: '123 Main St, Riyadh',
    status: 'pending',
    phone: '+966 50 123 4567',
    customerNotes: 'Please ring the bell twice', // Changed from notes to customerNotes
    adminNotes: '' // Added for admin notes
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sara Ali',
    userAvatar: 'https://bit.ly/sage-adebayo',
    deliveryTime: '12:30',
    meals: [
      {
        id: 'meal2',
        name: 'Vegetarian Platter',
        items: ['Falafel', 'Hummus', 'Salad', 'Pita Bread'],
        specialInstructions: 'Extra hummus on the side'
      }
    ],
    address: '456 Oak Ave, Riyadh',
    status: 'preparing',
    phone: '+966 55 987 6543',
    customerNotes: 'Leave at front door if no answer', // Changed from notes to customerNotes
    adminNotes: 'Customer called to confirm address' // Added for admin notes
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Mohammed Hassan',
    userAvatar: 'https://bit.ly/prosper-baba',
    deliveryTime: '12:00', // Same time as first delivery
    meals: [
      {
        id: 'meal3',
        name: 'Beef Shawarma',
        items: ['Beef', 'Garlic Sauce', 'Pickles', 'Fries'],
        specialInstructions: 'No pickles'
      },
      {
        id: 'meal4',
        name: 'Fattoush Salad',
        items: ['Lettuce', 'Tomato', 'Cucumber', 'Pita Chips'],
        specialInstructions: 'Dressing on the side'
      }
    ],
    address: '789 Palm St, Riyadh',
    status: 'ready',
    phone: '+966 54 555 1234',
    customerNotes: 'Gate code: 1234', // Changed from notes to customerNotes
    adminNotes: 'VIP customer - handle with care' // Added for admin notes
  }
];

const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

const MealDeliveryDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [deliveries, setDeliveries] = useState(sampleDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [newAdminNote, setNewAdminNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter deliveries based on search query
  const filteredDeliveries = deliveries.filter(delivery => 
    delivery.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.meals.some(meal => meal.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group deliveries by time slot
  const deliveriesByTime = timeSlots.map(time => ({
    time,
    deliveries: filteredDeliveries.filter(d => d.deliveryTime === time)
  }));

  const handleDeliveryClick = (delivery) => {
    setSelectedDelivery(delivery);
    setNewAdminNote('');
    onOpen();
  };

  const addAdminNote = () => {
    if (newAdminNote.trim() && selectedDelivery) {
      const updatedDeliveries = deliveries.map(delivery => {
        if (delivery.id === selectedDelivery.id) {
          return {
            ...delivery,
            adminNotes: delivery.adminNotes ? `${delivery.adminNotes}\n${new Date().toLocaleString()}: ${newAdminNote}` 
                                          : `${new Date().toLocaleString()}: ${newAdminNote}`
          };
        }
        return delivery;
      });
      setDeliveries(updatedDeliveries);
      setSelectedDelivery(updatedDeliveries.find(d => d.id === selectedDelivery.id));
      setNewAdminNote('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'gray';
      case 'preparing': return 'yellow';
      case 'ready': return 'green';
      case 'delivered': return 'blue';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  // Get current time for highlighting
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const currentTime = getCurrentTime();

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <Heading size="lg" mb={5}>Meal Delivery Schedule</Heading>
        
        {/* Date selector and search */}
        <HStack>
          <Input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            maxW="200px"
          />
          <HStack flex={1}>
            <Input
              placeholder="Search customers, addresses, or meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              maxW="400px"
            />
            <IconButton aria-label="Search" icon={<FiSearch />} />
          </HStack>
        </HStack>

        <Grid templateColumns="3fr 1fr" gap={6}>
          {/* Main Schedule */}
          <GridItem>
            <Box
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              overflow="hidden"
            >
              {/* Time slots header */}
              <Grid templateColumns="100px 1fr" gap={0}>
                <GridItem bg="gray.50" p={2} borderRight="1px" borderColor="gray.200">
                  <Text fontWeight="bold">Time</Text>
                </GridItem>
                <GridItem 
                  bg="gray.50" 
                  p={2} 
                  borderRight="1px" 
                  borderColor="gray.200"
                  textAlign="center"
                >
                  <Text fontWeight="bold">Deliveries</Text>
                </GridItem>
              </Grid>

              {/* Delivery rows */}
              {deliveriesByTime.map(({ time, deliveries }) => (
                <Grid 
                  key={time}
                  templateColumns="100px 1fr" 
                  gap={0}
                  minH="80px"
                  borderBottom="1px"
                  borderColor="gray.100"
                >
                  <GridItem 
                    p={2} 
                    borderRight="1px" 
                    borderColor="gray.200"
                    position="relative"
                  >
                    <Text>{time}</Text>
                    {currentTime >= time && currentTime < timeSlots[timeSlots.indexOf(time) + 1] && (
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="blue.100"
                        opacity={0.3}
                        zIndex={1}
                      />
                    )}
                  </GridItem>
                  
                  <GridItem 
                    p={2} 
                    borderRight="1px" 
                    borderColor="gray.200"
                  >
                    <HStack spacing={3} align="start" flexWrap="wrap">
                      {deliveries.map(delivery => (
                        <Box
                          key={delivery.id}
                          bg="white"
                          p={3}
                          borderRadius="md"
                          border="1px"
                          borderColor="gray.200"
                          cursor="pointer"
                          _hover={{ shadow: "md" }}
                          onClick={() => handleDeliveryClick(delivery)}
                          minW="200px"
                          flex="1"
                          maxW="300px"
                        >
                          <HStack justify="space-between">
                            <Badge colorScheme={getStatusColor(delivery.status)}>
                              {delivery.status}
                            </Badge>
                            <Text fontSize="sm">{delivery.meals.length} meal(s)</Text>
                          </HStack>
                          <Text fontWeight="medium" mt={1}>{delivery.userName}</Text>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            {delivery.address}
                          </Text>
                        </Box>
                      ))}
                    </HStack>
                  </GridItem>
                </Grid>
              ))}
            </Box>
          </GridItem>

          {/* Sidebar - Queue and Notes */}
          <GridItem>
            <VStack spacing={5} align="stretch">
              {/* Delivery Queue */}
              <Card>
                <CardHeader>
                  <Heading size="md">Delivery Queue</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    {filteredDeliveries
                      .sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime))
                      .map(delivery => (
                        <Box 
                          key={delivery.id} 
                          p={3} 
                          border="1px" 
                          borderColor="gray.200" 
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() => handleDeliveryClick(delivery)}
                        >
                          <HStack justify="space-between">
                            <Badge colorScheme={getStatusColor(delivery.status)}>
                              {delivery.status}
                            </Badge>
                            <Text fontSize="sm">{delivery.deliveryTime}</Text>
                          </HStack>
                          <Text fontWeight="medium" mt={1}>{delivery.userName}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {delivery.meals.length} meal(s) • {delivery.address}
                          </Text>
                        </Box>
                      ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <Heading size="md">Admin Notes</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Textarea
                      placeholder="Add an admin note..."
                      value={newAdminNote}
                      onChange={(e) => setNewAdminNote(e.target.value)}
                    />
                    <Button leftIcon={<FiPlus />} onClick={addAdminNote} isDisabled={!newAdminNote.trim()}>
                      Add Note
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      {/* Delivery Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delivery Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedDelivery && (
              <VStack spacing={4} align="stretch">
                {/* Customer Info */}
                <HStack spacing={3}>
                  <Avatar src={selectedDelivery.userAvatar} name={selectedDelivery.userName} />
                  <Box>
                    <Text fontWeight="bold">{selectedDelivery.userName}</Text>
                    <Text fontSize="sm" color="gray.600">{selectedDelivery.phone}</Text>
                  </Box>
                  <Badge ml="auto" colorScheme={getStatusColor(selectedDelivery.status)}>
                    {selectedDelivery.status}
                  </Badge>
                </HStack>

                <Divider />

                {/* Delivery Info */}
                <Box>
                  <HStack>
                    <FiClock />
                    <Text>Delivery Time: {selectedDelivery.deliveryTime}</Text>
                  </HStack>
                  <HStack mt={2}>
                    <FiMapPin />
                    <Text>{selectedDelivery.address}</Text>
                  </HStack>
                </Box>

                <Divider />

                {/* Meals */}
                <Box>
                  <Text fontWeight="bold" mb={2}>Meals</Text>
                  <VStack align="stretch" spacing={3}>
                    {selectedDelivery.meals.map(meal => (
                      <Box key={meal.id} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                        <Text fontWeight="medium">{meal.name}</Text>
                        <VStack align="stretch" mt={2} spacing={1}>
                          {meal.items.map((item, index) => (
                            <Text key={index} fontSize="sm">• {item}</Text>
                          ))}
                        </VStack>
                        {meal.specialInstructions && (
                          <Box mt={2}>
                            <Text fontSize="sm" fontWeight="medium">Special Instructions:</Text>
                            <Text fontSize="sm">{meal.specialInstructions}</Text>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Customer Notes */}
                <Box>
                  <HStack>
                    <FiInfo />
                    <Text fontWeight="bold">Customer Notes</Text>
                  </HStack>
                  <Text mt={2} whiteSpace="pre-wrap">{selectedDelivery.customerNotes || 'No customer notes'}</Text>
                </Box>

                <Divider />

                {/* Admin Notes */}
                <Box>
                  <HStack>
                    <FiInfo />
                    <Text fontWeight="bold">Admin Notes</Text>
                  </HStack>
                  <Text mt={2} whiteSpace="pre-wrap">{selectedDelivery.adminNotes || 'No admin notes'}</Text>
                  
                  <VStack align="stretch" spacing={3} mt={4}>
                    <Textarea
                      placeholder="Add an admin note..."
                      value={newAdminNote}
                      onChange={(e) => setNewAdminNote(e.target.value)}
                    />
                    <Button leftIcon={<FiPlus />} onClick={addAdminNote} isDisabled={!newAdminNote.trim()}>
                      Add Note
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MealDeliveryDashboard;