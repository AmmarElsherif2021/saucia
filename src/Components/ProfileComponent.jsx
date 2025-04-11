import {
  Box,
  Flex,
  Text,
  Heading,
  Avatar,
  Badge,
  Stack,
  Divider,
  Button,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Switch,
  useToast,
  Progress,
  background,
} from "@chakra-ui/react";
import { EditIcon, StarIcon } from "@chakra-ui/icons";
import { useState } from "react";
import saladIcon from "../assets/salad.svg";
import billIcon from "../assets/bill.svg";
import locationIcon from "../assets/location.svg";
// Reusable BadgeList component
const BadgeList = ({ items = [], colorScheme = "teriary", emptyMessage }) => (
  <Flex  wrap="wrap" gap={2} w={"auto"} justify="flex-start">
    {items.length > 0 ? (
      items.map((item, index) => (
        <Badge
          key={index}
          colorScheme={colorScheme}
          variant="subtle"
          px={3}
          py={1}
          borderRadius="full"
        >
          {item}
        </Badge>
      ))
    ) : (
      <Text color="gray.500">{emptyMessage}</Text>
    )}
  </Flex>
);

// Base Card component for inheritance
const Card = ({ children, ...props }) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="22px"
      colorScheme={props.colorScheme || "gray"}
      bg={colorMode === "dark" ? `${props.colorScheme || "gray"}.800` : `${props.colorScheme || "gray"}.300`}
      {...props}
    >
      {children}
    </Box>
  );
};

// Specialized BillCard for order history
const BillCard = ({ order }) => {
  return (
    <Card colorScheme="accent" mb={4}>
      <Flex alignItems="flex-start">
        <Box mr={3} mt={1}>
          <img src={billIcon} alt="Bill" width="50px" height="50px" />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">Order ID: {order.id}</Text>
          <Text>Date: {order.date}</Text>
          <Text>Status: {order.status}</Text>
          <Divider my={2} />
          <Flex justify="space-between">
            <Text>Total:</Text>
            <Text fontWeight="bold">${order.total.toFixed(2)}</Text>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};

// Specialized AddressCard component
const AddressCard = ({ address }) => {
  return (
    <Card colorScheme="accent" position="relative">
      {address.isDefault && (
        <Badge 
          colorScheme="brand" 
          variant="solid" 
          borderRadius="full"
          position="absolute"
          top="10px"
          right="10px"
        >
          Default
        </Badge>
      )}
      <Flex alignItems="flex-start">
        <Box mr={3} mt={1}>
          <img src={locationIcon} alt="Location" width="50px" height="50px" />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">{address.name}</Text>
          <Text>{address.street}</Text>
          <Text>
            {address.city}, {address.state} {address.zip}
          </Text>
          <Text>{address.phone}</Text>
        </Box>
      </Flex>
    </Card>
  );
};

// Specialized FavouriteItemCard component
const FavouriteItemCard = ({ item }) => {
  const [isRegistered, setIsRegistered] = useState(false);

  const toggleRegistration = () => {
    setIsRegistered(!isRegistered);
  };

  return (
    <Card colorScheme="secondary" mb={4}>
      <Flex alignItems="flex-start">
        <Box mr={3} mt={1}>
          <img src={saladIcon} alt="Food Item" width="50px" height="50px" />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">{item.name}</Text>
          <Text fontSize="sm" noOfLines={2}>{item.description}</Text>
          <Flex justify="space-between" mt={2}>
            <Text fontWeight="medium">${item.price.toFixed(2)}</Text>
            <Badge bg={"white"} borderRadius={"md"} colorScheme="green">{item.category}</Badge>
          </Flex>
          <Flex align="center" mt={2} justify="space-between">
            <Flex align="center">
              <StarIcon color="yellow.500" mr={1} />
              <Text>{item.rating}</Text>
            </Flex>
            <Button 
              size="sm" 
              colorScheme={isRegistered ? "red" : "brand"}
              onClick={toggleRegistration}
            >
              {isRegistered ? "Unregister" : "Register"}
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
};

// Reusable TabContent component
const TabContent = ({ title, children, isEmpty, emptyMessage = "No data available" }) => (
  <>
    <Heading size="md" mb={4} color="brand.700">
      {title}
    </Heading>
    {isEmpty ? (
      <Text color="gray.500">{emptyMessage}</Text>
    ) : (
      <Box overflowY="auto" maxHeight="400px" borderRadius="30px">
        {children}
      </Box>
    )}
  </>
);

// Reusable NotificationSetting component
const NotificationSetting = ({ name, value, onChange }) => (
  <Flex
    p={4}
    mx="20%"
    borderRadius="20px"
    bg={useColorMode().colorMode === "dark" ? "gray.800" : "gray.100"}
    align="center"
    justify="space-between"
  >
    <Text>{name.replace(/^\w/, (c) => c.toUpperCase())} Notifications</Text>
    <Switch isChecked={value} colorScheme="brand" onChange={onChange} />
  </Flex>
);

// Profile component
export const PROF = ({
  name = "John Doe",
  email = "john@example.com",
  phoneNumber = "+1 (555) 123-4567",
  profilePicture = "",
  orderHistory = [],
  favoriteItems = [],
  savedAddresses = [],
  dietaryPreferences = [],
  allergies = [],
  calorieTracking = { goal: 2000, current: 1500 },
  subscriptionStatus = "Premium",
  rewardPoints = 1250,
  notificationsSettings = {
    email: true,
    sms: false,
    push: true,
  },
  onUpdateProfile,
}) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name,
    email,
    phoneNumber,
    dietaryPreferences,
    allergies,
    calorieGoal: calorieTracking.goal,
    notifications: notificationsSettings,
  });

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    onUpdateProfile(formData);
    toast({
      title: "Profile updated",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    onClose();
  };

  // Daily calorie tracking component
  const CalorieTracker = () => {
    const remaining = calorieTracking.goal - calorieTracking.current;
    
    return (
      <Card sx={{background:"brand.100"}} mb={4}>
        <Heading size="md" mb={4} color="brand.700">
          Daily Calorie Tracking
        </Heading>
        <Flex justify="space-between" mb={2}>
          <Text>Consumed: {calorieTracking.current} cal</Text>
          <Text>Goal: {calorieTracking.goal} cal</Text>
        </Flex>
        <Progress
          value={(calorieTracking.current / calorieTracking.goal) * 100}
          colorScheme={calorieTracking.current > calorieTracking.goal ? "red" : "brand"}
          size="lg"
          borderRadius="full"
          mb={2}
        />
        <Text fontSize="sm" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
          {remaining > 0 ? `${remaining} calories remaining` : "Goal exceeded"}
        </Text>
      </Card>
    );
  };

  const tabsData = [
    {
      title: "Preferences",
      content: (
        <>
          <TabContent
            title="Dietary Preferences"
            isEmpty={dietaryPreferences.length === 0}
            emptyMessage="No dietary preferences set."
          >
            <Card colorScheme="brand">
              <BadgeList items={dietaryPreferences} colorScheme="success" />
            </Card>
          </TabContent>
          <Divider my={6} />
          <TabContent
            title="Allergies"
            isEmpty={allergies.length === 0}
            emptyMessage="No allergies specified."
          >
            <Card colorScheme="red">
              <BadgeList items={allergies} colorScheme="accent" />
            </Card>
          </TabContent>
        </>
      ),
    },
    {
      title: "Order History",
      content: (
        <TabContent title="Recent Orders" isEmpty={orderHistory.length === 0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {orderHistory.map((order) => (
              <BillCard key={order.id} order={order} />
            ))}
          </SimpleGrid>
        </TabContent>
      ),
    },
    {
      title: "Favorites",
      content: (
        <TabContent title="Favorite Items" isEmpty={favoriteItems.length === 0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {favoriteItems.map((item, index) => (
              <FavouriteItemCard key={index} item={item} />
            ))}
          </SimpleGrid>
        </TabContent>
      ),
    },
    {
      title: "Addresses",
      content: (
        <TabContent title="Saved Addresses" isEmpty={savedAddresses.length === 0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {savedAddresses.map((address, index) => (
              <AddressCard key={index} address={address} />
            ))}
          </SimpleGrid>
        </TabContent>
      ),
    },
    {
      title: "Settings",
      content: (
        <TabContent title="Notification Settings">
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing={3}>
            {Object.entries(notificationsSettings).map(([key, value]) => (
              <NotificationSetting key={key} name={key} value={value} onChange={() => {}} />
            ))}
          </SimpleGrid>
        </TabContent>
      ),
    },
  ];

  return (
    <Box p={4} bg={colorMode === "dark" ? "gray.800" : "white"}>
      <Card sx={{background:"gray.100"}} mb={4}>
        <Flex align="center" mb={4} direction={{ base: "column", md: "row" }}>
          <Avatar 
            size="2xl" 
            name={name} 
            src={profilePicture} 
            bg="brand.500" 
            color="white"
            mb={{ base: 4, md: 0 }}
          />
          <Box ml={{ base: 0, md: 4 }} textAlign={{ base: "center", md: "left" }}>
            <Heading size="lg">{name}</Heading>
            <Text>{email}</Text>
            <Text>{phoneNumber}</Text>
          </Box>
          <IconButton
            aria-label="Edit profile"
            icon={<EditIcon />}
            ml={{ base: 0, md: "auto" }}
            mt={{ base: 4, md: 0 }}
            onClick={onOpen}
            as={Button}
            variant={"ghost"}
            colorScheme="brand"
            size="lg"
          />
        </Flex>
        <Flex 
          justify={{ base: "center", md: "space-between" }}
          direction={{ base: "column", md: "row" }}
          align={{ base: "center", md: "center" }}
          gap={2}
        >
          <Badge colorScheme="accent" borderRadius="md" fontSize="md" px={3} py={1}>{subscriptionStatus}</Badge>
          <Flex align="center">
            <StarIcon color="brand.500" />
            <Text ml={2} fontWeight="medium">{rewardPoints} Reward Points</Text>
          </Flex>
        </Flex>
      </Card>

      <CalorieTracker />

      <Tabs variant="soft-rounded" colorScheme="brand">
        <TabList mb={4} overflowX="auto" flexWrap={{ base: "nowrap", lg: "wrap" }}>
          {tabsData.map((tab, index) => (
            <Tab key={index} minWidth="auto" ml={2} whiteSpace="nowrap">{tab.title}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabsData.map((tab, index) => (
            <TabPanel key={index}>{tab.content}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input name="name" value={formData.name} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input name="email" value={formData.email} onChange={handleInputChange} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Phone Number</FormLabel>
              <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="brand" onClick={handleSubmit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

//Profile Demo
export const ProfileDemo = () => {
  const demoData = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    phoneNumber: "+1 (555) 987-6543",
    profilePicture: "https://via.placeholder.com/150",
    orderHistory: [
      { id: "12345", date: "2023-01-01", status: "Delivered", total: 45.99 },
      { id: "67890", date: "2023-02-15", status: "Pending", total: 89.49 },
    ],
    favoriteItems: [
      { name: "Caesar Salad", description: "Fresh romaine lettuce with Caesar dressing", price: 12.99, category: "Salad", rating: 4.5 },
      { name: "Grilled Chicken", description: "Juicy grilled chicken breast", price: 15.99, category: "Main Course", rating: 4.8 },
    ],
    savedAddresses: [
      { name: "Home", street: "123 Main St", city: "Springfield", state: "IL", zip: "62704", phone: "+1 (555) 123-4567", isDefault: true },
      { name: "Work", street: "456 Elm St", city: "Springfield", state: "IL", zip: "62701", phone: "+1 (555) 987-6543", isDefault: false },
    ],
    dietaryPreferences: ["Vegetarian", "Low Carb"],
    allergies: ["Peanuts", "Shellfish"],
    calorieTracking: { goal: 2000, current: 1800 },
    subscriptionStatus: "Gold",
    rewardPoints: 2000,
    notificationsSettings: {
      email: true,
      sms: true,
      push: false,
    },
    onUpdateProfile: (updatedData) => {
      console.log("Updated Profile Data:", updatedData);
    },
  };

  return <PROF {...demoData} />;
};