import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Checkbox,
  Stack,
  Select,
  useColorMode,
  useToast,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../Contexts/UserContext';
import { updateUserProfile } from '../../API/users'; // Import updateUserProfile API

// Import equivalent icons from assets - adjust paths as needed
import paymentIcon from '../../assets/payment.svg';
import orderIcon from '../../assets/order.svg';
import saladIcon from '../../assets/menu/salad.svg';

// Sample meal data - in a real app, this would come from your API
const sampleMeals = [
  { id: 1, name: 'Protein Power Salad', calories: 450, image: saladIcon },
  { id: 2, name: 'Mediterranean Chicken', calories: 520, image: saladIcon },
  { id: 3, name: 'Vegan Buddha Bowl', calories: 380, image: saladIcon },
  { id: 4, name: 'Beef & Quinoa', calories: 580, image: saladIcon },
  { id: 5, name: 'Tofu Stir Fry', calories: 420, image: saladIcon },
  { id: 6, name: 'Salmon & Greens', calories: 490, image: saladIcon },
  { id: 7, name: 'Turkey Wrap', calories: 390, image: saladIcon },
  { id: 8, name: 'Vegetable Curry', calories: 410, image: saladIcon },
  { id: 9, name: 'Chicken Pasta', calories: 530, image: saladIcon },
  { id: 10, name: 'Falafel Plate', calories: 470, image: saladIcon }
];

// Meal card component for the confirmation modal
const MealCard = ({ meal }) => {
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      p={2} 
      textAlign="center"
      boxShadow="sm"
    >
      <Image 
        src={meal.image} 
        alt={meal.name} 
        boxSize="60px" 
        objectFit="cover" 
        mx="auto"
        mb={2}
      />
      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{meal.name}</Text>
      <Text fontSize="xs" color="gray.500">{meal.calories} kcal</Text>
    </Box>
  );
};
const Section = ({ title, children, bgColor, titleColor, icon }) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.700' : bgColor}
      borderRadius="45px"
      p={6}
      position="relative"
      overflow="hidden"
      boxShadow="sm"
    >
      <Box position="relative" zIndex="1">
        <Flex align="center" mb={4}>
          {icon && <Box as="img" src={icon} alt={`${title} icon`} boxSize="48px" mr={2} />}
          <Heading size="md" color={titleColor || "gray.800"}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  );
};

// Plan summary component to show subscription details
const PlanSummary = ({ plan, period, setPeriod }) => {
  if (!plan) return <Text>No plan selected</Text>;
  
  return (
    <Box>
      <Flex alignItems="center" mb={4}>
        <Image 
          src={plan.image} 
          alt={plan.title} 
          boxSize="60px"
          borderRadius="md"
          mr={4}
        />
        <Box>
          <Heading as="h3" size="sm">{plan.title}</Heading>
          {plan.title_arabic && <Text fontSize="sm" color="gray.600">{plan.title_arabic}</Text>}
        </Box>
      </Flex>
      
      <Divider mb={4} />
      
      <Stack spacing={2}>
        <Flex justify="space-between">
          <Text fontSize="sm">Nutritional Information:</Text>
          <Box>
            <Badge colorScheme="green" mr={1}>Kcal: {plan.kcal}</Badge>
            <Badge colorScheme="blue" mr={1}>Carbs: {plan.carb}g</Badge>
            <Badge colorScheme="red">Protein: {plan.protein}g</Badge>
          </Box>
        </Flex>
        
        <Flex justify="space-between">
          <Text fontSize="sm">Subscription Period:</Text>
          <Select 
            size="sm" 
            width="140px" 
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            focusBorderColor="brand.500"
          >
            {plan.periods && plan.periods.map((periodOption, index) => (
              <option key={index} value={periodOption}>{periodOption} days</option>
            ))}
          </Select>
        </Flex>
      </Stack>
    </Box>
  );
};

//Page
const CheckoutPlan = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { user, userPlan, setUser } = useUser();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [period,setPeriod]=useState(12) //period here
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Helper function to calculate delivery date for each meal
const calculateDeliveryDate = (startDate, mealIndex) => {
  let date = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded <= mealIndex) {
    date.setDate(date.getDate() + 1);
    // Skip Friday (5) and Saturday (6)
    if (date.getDay() !== 5 && date.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return date;
};
  //Calculate period
  const calculateEndDate = (startDate, daysToAdd) => {
    let result = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < daysToAdd) {
      result.setDate(result.getDate() + 1);
      // Skip Friday (5) and Saturday (6)
      if (result.getDay() !== 5 && result.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return result;
  };
 
  //Periods
  const today = new Date();
const startDate = today.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

const endDate = calculateEndDate(today, period);
const formattedEndDate = endDate.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

  // Sample subscription prices - in a real app, this would come from backend
  const subscriptionPrice = 49.99;
  const discount = 10.00;
  const totalPrice = subscriptionPrice - discount;
  useEffect(()=>console.log(`From checkoutPlan ${JSON.stringify(userPlan)}`),[]);
  const handleOpenConfirmation = () => {
    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method to continue",
        status: "warning",
        period: 3000,
        isClosable: true,
      });
      return;
    }
    onOpen();
  };

  const handleConfirmSubscription = async () => {
    setIsSubmitting(true);
    onClose();
    
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      
      // Prepare subscription data to update user profile
      const subscriptionData = {
        subscription: {
          planId: userPlan?.id || 'premium-plan',
          planName: userPlan?.title || 'Premium Plan',
          startDate: today.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active',
          paymentMethod: paymentMethod,
          price: totalPrice,
        }
      };
      
      console.log('Updating user profile with subscription data:', subscriptionData);
      
      // Update the user profile with subscription information
      const updatedUser = await updateUserProfile(user.uid, subscriptionData);
      
      // Only update user state if we got a response
      if (updatedUser) {
        // Update only the subscription portion of the user object
        setUser(prevUser => ({
          ...prevUser,
          subscription: {
            ...prevUser.subscription,
            ...subscriptionData.subscription
          }
        }));
      }
      
      // Show success message
      toast({
        title: "Subscription successful!",
        description: "Your premium plan is now active",
        status: "success",
        period: 5000,
        isClosable: true,
      });
      
      // Navigate to account page
      navigate('/account?subscription=success');
    } catch (error) {
      console.error('Error confirming subscription:', error);
      setIsSubmitting(false);
      
      toast({
        title: "Subscription failed",
        description: error.message || "There was an error processing your subscription",
        status: "error",
        period: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} minHeight="100vh">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.500">
          Complete Your Subscription
        </Heading>
        
        {!userPlan && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            No plan selected. Please select a plan before proceeding to checkout.
          </Alert>
        )}
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {/* Billing Information */}
          <Section
            title="Billing Information"
            bgColor="brand.300"
            titleColor="gray.800"
            icon={saladIcon}
          >
            <Stack spacing={3}>
              <FormControl>
                <FormLabel fontSize="sm">Full Name</FormLabel>
                <Input 
                  placeholder="Enter your full name"
                  variant="outline"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Email Address</FormLabel>
                <Input 
                  type="email"
                  placeholder="Your email address"
                  variant="outline"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Phone Number</FormLabel>
                <Input 
                  placeholder="Your phone number"
                  variant="outline"
                  bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
                  focusBorderColor="brand.500"
                />
              </FormControl>
              
              <Checkbox colorScheme="brand" mt={2}>
                Send me plan updates and notifications
              </Checkbox>
            </Stack>
          </Section>

          {/* Payment Details */}
          <Section
            title="Payment Details"
            bgColor="warning.200"
            icon={paymentIcon}
          >
            <FormControl mb={4}>
              <FormLabel fontSize="sm">Payment Method</FormLabel>
              <Select
                placeholder="Select payment method"
                focusBorderColor="warning.500"
                bg={colorMode === 'dark' ? 'gray.800' : 'warning.100'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="credit-card">Credit Card</option>
                <option value="paypal">PayPal</option>
                <option value="apple-pay">Apple Pay</option>
                <option value="google-pay">Google Pay</option>
              </Select>
            </FormControl>
            
            {paymentMethod === 'credit-card' && (
              <Stack spacing={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Card Number</FormLabel>
                  <Input 
                    placeholder="1234 5678 9012 3456"
                    variant="outline"
                    maxLength={19}
                  />
                </FormControl>
                
                <Flex gap={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Expiry Date</FormLabel>
                    <Input 
                      placeholder="MM/YY"
                      variant="outline"
                      maxLength={5}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">CVV</FormLabel>
                    <Input 
                      placeholder="123"
                      variant="outline"
                      maxLength={3}
                      type="password"
                    />
                  </FormControl>
                </Flex>
                
                <FormControl>
                  <FormLabel fontSize="sm">Name on Card</FormLabel>
                  <Input 
                    placeholder="Cardholder name"
                    variant="outline"
                  />
                </FormControl>
                
                <Checkbox colorScheme="brand" mt={2}>
                  Save this card for future payments
                </Checkbox>
              </Stack>
            )}
            
            {paymentMethod === 'paypal' && (
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  You'll be redirected to PayPal to complete your payment
                </Alert>
                <Button colorScheme="blue" leftIcon={<Text>PayPal</Text>} width="full">
                  Continue with PayPal
                </Button>
              </VStack>
            )}
            
            {(paymentMethod === 'apple-pay' || paymentMethod === 'google-pay') && (
              <VStack spacing={4} align="stretch">
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Complete your payment with {paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay'}
                </Alert>
                <Button colorScheme={paymentMethod === 'apple-pay' ? 'blackAlpha' : 'blue'} width="full">
                  Pay with {paymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay'}
                </Button>
              </VStack>
            )}
          </Section>

          {/* Subscription Summary */}
          <Section
            title="Subscription Summary"
            bgColor="accent.700"
            icon={orderIcon}
          >
            <Box mb={4}>
              <PlanSummary 
                plan={userPlan} 
                period={period}
                setPeriod={setPeriod}
              />
            </Box>
            
            <Divider mb={4} />
            
            <Flex justify="space-between" mb={2}>
              <Text>Monthly Subscription:</Text>
              <Text fontWeight="bold">${subscriptionPrice.toFixed(2)}</Text>
            </Flex>
            
            <Flex justify="space-between" mb={2}>
              <Text>New Subscriber Discount:</Text>
              <Text fontWeight="bold" color="green.500">-${discount.toFixed(2)}</Text>
            </Flex>
            
            <Divider my={3} />
            
            <Flex justify="space-between" mb={4}>
              <Text fontWeight="bold">Total Today:</Text>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">
                ${totalPrice.toFixed(2)}
              </Text>
            </Flex>
            
            <Text fontSize="sm" color="gray.600" mb={4}>
              By subscribing, you agree to our Terms of Service and automatic renewal. You can cancel anytime.
            </Text>
            
            <Button 
              colorScheme="brand" 
              size="lg" 
              width="full"
              onClick={handleOpenConfirmation}
              isLoading={isSubmitting}
              loadingText="Processing..."
              isDisabled={!userPlan}
            >
              Complete Subscription
            </Button>
            
            <Button 
              mt={2}
              variant="ghost" 
              width="full"
              onClick={() => navigate('/premium')}
            >
              Back to Plans
            </Button>
          </Section>
        </SimpleGrid>
      </VStack>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Your Subscription</ModalHeader>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={2}>Plan Details</Heading>
                <Flex justify="space-between" mb={1}>
                  <Text>Plan:</Text>
                  <Text fontWeight="bold">{userPlan?.title || 'Premium Plan'}</Text>
                </Flex>
                <Flex justify="space-between" mb={1}>
                  <Text>Start Date:</Text>
                  <Text fontWeight="bold">{startDate}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text>End Date:</Text>
                  <Text fontWeight="bold">{formattedEndDate}</Text>
                </Flex>
              </Box>

              <Divider />

              <Box>
               <Heading size="md" mb={3}>Your Meal Plan</Heading>
                <SimpleGrid columns={5} spacing={3}>
                  {sampleMeals.map((meal, index) => {
                    // Calculate the delivery date for each meal
                    const deliveryDate = calculateDeliveryDate(today, index);
                    return (
                            <Box key={meal.id}>
                              <MealCard meal={meal} />
                              <Text fontSize="xs" textAlign="center" mt={1} color="gray.500">
                                {deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </Text>
                            </Box>
                          );
                        })}
                </SimpleGrid>
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                Your subscription will automatically renew on {formattedEndDate}. You can cancel anytime.
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Back
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={handleConfirmSubscription}
              isLoading={isSubmitting}
            >
              Confirm & Pay
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CheckoutPlan;