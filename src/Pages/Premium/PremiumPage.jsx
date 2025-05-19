import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  Fade, 
  Flex,
  Image,
  Badge,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Center,
  Divider,
  useToast,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { useI18nContext } from '../../Contexts/I18nContext';
import { useElements } from '../../Contexts/ElementsContext';
import { useUser } from '../../Contexts/UserContext';
import { CurrentPlanBrief } from './CurrentPlanBrief';
import { Link } from 'react-router-dom';
// Import plan images - you can maintain this mapping or handle it differently
import gainWeightPlanImage from "../../assets/premium/gainWeight.png";
import keepWeightPlanImage from "../../assets/premium/keepWeight.png";
import loseWeightPlanImage from "../../assets/premium/loseWeight.png";
import dailyMealPlanImage from "../../assets/premium/dailyMeal.png";
import saladsPlanImage from "../../assets/premium/saladMeal.png";
import { JoinPremiumTeaser } from './JoinPremiumTeaser';

// Map plan titles to images
const planImages = {
  'Protein Salad Plan': saladsPlanImage,
  'Non-Protein Salad Plan': saladsPlanImage,
  'Daily Plan': dailyMealPlanImage,
  'Gain Weight': gainWeightPlanImage,
  'Keep Weight': keepWeightPlanImage,
  'Lose Weight': loseWeightPlanImage,
};

const PlanCard = ({ plan, isUserPlan, onSelect }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = isUserPlan ? 'green.400' : 'gray.200';
  
  // Add the image to the plan object for easier access
  const planWithImage = {
    ...plan,
    image: planImages[plan.title] || dailyMealPlanImage
  };
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      overflow="hidden" 
      bg={cardBg}
      boxShadow={isUserPlan ? "0 0 0 2px #48BB78" : "base"}
      p={4}
      position="relative"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md"
      }}
    >
      {isUserPlan && (
        <Badge 
          colorScheme="green" 
          position="absolute" 
          top={2} 
          right={2}
        >
          Current Plan
        </Badge>
      )}
      
      <Image 
        src={planWithImage.image} 
        alt={plan.title} 
        borderRadius="md"
        height="150px"
        width="100%"
        objectFit="cover"
        mb={4}
      />
      
      <Heading as="h3" size="md" mb={2}>
        {plan.title}
      </Heading>
      
      {plan.title_arabic && (
        <Text mb={2} color="gray.600">
          {plan.title_arabic}
        </Text>
      )}
      
      <Text mb={2}>
        <Badge colorScheme="purple">
          {plan.periods?.length || 0} Periods
        </Badge>
      </Text>
      
      <Flex justify="space-between" mt={3}>
        <Box>
          <Text fontSize="sm">Kcal: {plan.kcal}</Text>
          <Text fontSize="sm">Carbs: {plan.carb}g</Text>
          <Text fontSize="sm">Protein: {plan.protein}g</Text>
        </Box>
        
        <Button 
          size="sm" 
          colorScheme={isUserPlan ? "green" : "blue"}
          onClick={() => onSelect(planWithImage)}
        >
          {isUserPlan ? 'View Details' : 'Select'}
        </Button>
      </Flex>
    </Box>
  );
};

const PlanDetails = ({ plan }) => {
  const { t } = useI18nContext();
  
  return (
    <Box>
      <Heading as="h3" size="sm" mb={2}>
        {plan.title}
      </Heading>
      
      {plan.title_arabic && (
        <Text mb={4}>
          {plan.title_arabic}
        </Text>
      )}
      
      <Heading as="h4" size="xs" mb={2}>
        Nutritional Information
      </Heading>
      
      <Flex mb={4} gap={4} flexWrap="wrap">
        <Badge colorScheme="green">Kcal: {plan.kcal}</Badge>
        <Badge colorScheme="blue">Carbs: {plan.carb}g</Badge>
        <Badge colorScheme="red">Protein: {plan.protein}g</Badge>
      </Flex>
      
      <Heading as="h4" size="xs" mb={2}>
        Subscription Periods
      </Heading>
      
      {plan.periods && plan.periods.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
          {plan.periods.map((period, index) => (
            <Box key={index} p={2} bg="gray.50" borderRadius="md">
              <Text>{period} days subscription</Text>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text>No subscription periods available for this plan.</Text>
      )}
    </Box>
  );
};

export const PremiumPage = () => {
  const { plans, elementsLoading } = useElements();
  const { user, userPlan, planLoading, updateUserSubscription } = useUser();
  const [explorePlans, setExplorePlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const { t } = useI18nContext();
  const toast = useToast();
  //scrolling down
  const plansSectionRef = useRef(null);
  const detailsSectionRef = useRef(null);
  const plansContainerRef = useRef(null);

  // Set the selected plan to match the user's plan when loaded
  useEffect(() => {
    if (userPlan && !selectedPlan) {
      setSelectedPlan(userPlan);
    }
  }, [userPlan, selectedPlan]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // Scroll to details section after a small delay
    setTimeout(() => {
      detailsSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 50);
  };

  const toggleExplorePlans = () => {
    const newState = !explorePlans;
    setExplorePlans(newState);
    
    if (newState) {
      setTimeout(() => {
        // Scroll to the bottom of the plans container
        plansContainerRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 50);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!selectedPlan) return;
    
    try {
      setSubscribing(true);
      await updateUserSubscription(selectedPlan.id);
       
      toast({
        title: "Plan updated",
        description: `You are now subscribed to the ${selectedPlan.title} plan`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      setExplorePlans(false);
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error.message || "Failed to update your plan subscription",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubscribing(false);
    }
  };

  if (elementsLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading premium plans...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.500">
          Premium Plans
        </Heading>
        
        {!user && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            Sign in to subscribe to our premium meal plans
          </Alert>
        )}
        
        {/* Current Plan Section */}
        <Box as={VStack} bg="white" p={6} borderRadius="md" shadow="md" alignItems={"center"}>
          <Heading as="h2" size="md" mb={4}>
            Your Current Plan
          </Heading>
          <JoinPremiumTeaser/>
          <CurrentPlanBrief plan={userPlan} loading={planLoading} />
          
          {userPlan && (
            <Button 
              mt={4} 
              colorScheme="blue" 
              size="sm"
              onClick={toggleExplorePlans}
            >
              {explorePlans ? "Hide Available Plans" : "Explore Other Plans"}
            </Button>
          )}
          
          {!userPlan && !planLoading && (
            <Button 
              mt={4} 
              colorScheme="brand" 
              onClick={toggleExplorePlans}
            >
              Browse Available Plans
            </Button>
          )}
        </Box>
        
         {/* Available Plans Section */}
       
        {explorePlans && (
          <Fade in={explorePlans}>
            <Box 
              bg="white" 
              p={6} 
              borderRadius="md" 
              shadow="md"
              ref={plansContainerRef}
            >
              <Heading as="h2" size="md" mb={6}>
                Available Premium Plans
              </Heading>
              
              {plans && plans.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {plans.map((plan) => (
                    <PlanCard 
                      key={plan.id} 
                      plan={{
                        ...plan,
                        image: planImages[plan.title] || dailyMealPlanImage
                      }}
                      isUserPlan={userPlan && userPlan.id === plan.id}
                      onSelect={handlePlanSelect}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Center p={8}>
                  <Text>No plans available at the moment.</Text>
                </Center>
              )}
            </Box>
          </Fade>
        )}
        
       {/* Selected Plan Details Section */}
       {selectedPlan && explorePlans && (
          <Box 
            bg="white" 
            p={6} 
            borderRadius="md" 
            shadow="md"
            ref={detailsSectionRef}
          >
            <Heading as="h2" size="md" mb={4}>
              Plan Details
            </Heading>
            
            <PlanDetails plan={selectedPlan} />
            
            <Divider my={4} />
  
            <Link to="/premium/join" state={{ planId: selectedPlan.id }} style={{ textDecoration: 'none' }}>
              <Button 
                mt={4}
                colorScheme="brand" 
                size="lg" 
                width="full"
                isLoading={subscribing}
                loadingText="Updating subscription..."
                isDisabled={!user || (userPlan && userPlan.id === selectedPlan.id)}
              >
                {userPlan && userPlan.id === selectedPlan.id 
                  ? "Current Plan" 
                  : "Subscribe to Plan"}
              </Button>
            </Link>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
export default PremiumPage;