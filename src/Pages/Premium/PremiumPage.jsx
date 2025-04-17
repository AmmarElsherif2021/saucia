import { Box, Heading, Text, Button, VStack, Collapse } from '@chakra-ui/react';
import { useState } from 'react';
import { useColorMode } from '@chakra-ui/react';
import { getCurrentLanguage } from '../../i18n';
const PlanCard = ({ name, description, image }) => {
  const { colorMode } = useColorMode();
  const isArabic = getCurrentLanguage() === 'ar'; 
  return (
    <Box
      bgImage={`url(${image})`}
      bgSize="cover"
      bgPosition="center"
      height="100vh"
      w={"100vw"}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      color="white"
      textAlign="center"
      px={0}
      mx={0}
    >
      <Heading as="h1" opacity={"0.9"} bg="brand.600" color="brand.50" mb={1} p={4} sx={{ fontSize: "3em" }} className={isArabic ? "readex-pro" : "montserrat"}>
        <AnimatedText text={name} />
      </Heading>
      <Text fontSize="1.5em" bg="black" color="brand.500" sx={{ paddingY: 0 }} className={isArabic ? "lalezar" : "outfit"}>
        <AnimatedText text={description} delay={2} />
      </Text>
    </Box>
  );
};

export const PremiumPage = () => {
    const userPlan = "Gold Plan"; // Example: Replace with actual user plan logic
    const [showPlan, setShowPlan] = useState(false);
    const handlePlanToggle = () => setShowPlan(!showPlan);
    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl" textAlign="center" color="teal.500">
                    Premium Page
                </Heading>
                <Box bg="white" p={6} borderRadius="md">
                    <Heading as="h2" size="md" mb={4}>
                        Join Premium Plans
                    </Heading>
                    <Text mb={4}>
                        Unlock exclusive features by subscribing to one of our premium plans!
                    </Text>
                    <Button colorScheme="teal" size="md">
                        View Plans
                    </Button>
                </Box>
                <Box bg="white" p={6} borderRadius="md" shadow="md">
                    <Heading as="h2" size="md" mb={4}>
                        Your Current Plan
                    </Heading>
                    {userPlan ? (
                        <Text>
                            You are currently subscribed to the <strong>{userPlan}</strong>.
                        </Text>
                    ) : (
                        <Text>You are not subscribed to any premium plan.</Text>
                    )}
                    <Button mt={4} onClick={handlePlanToggle} colorScheme="teal">
                        {showPlan ? "Hide Plan Details" : "Show Plan Details"}
                    </Button>
                    <Collapse in={showPlan} animateOpacity>
                        <Box mt={4} p={4} bg="gray.100" borderRadius="md">
                            <Text>
                                Here are the details of your <strong>{userPlan}</strong>. Enjoy exclusive benefits and features tailored for you!
                            </Text>
                        </Box>
                    </Collapse>
                </Box>
            </VStack>
        </Box>
    );
};