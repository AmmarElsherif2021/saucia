import { Text,Flex,Box,Button,Collapse } from "@chakra-ui/react";
import { useState } from "react";
export const CurrentPlanBrief=({userPlan})=>{
     const [showPlan, setShowPlan] = useState(false);
        const handlePlanToggle = () => setShowPlan(!showPlan);
    return(
        <>
                            <Text>
                                You are currently subscribed to the <strong>{userPlan.name}</strong>.
                            </Text>
                            <Flex mt={4} alignItems="center" gap={4}>
                                <Box w="90px" h="90px" mr={4}>
                                    <img src={userPlan.image} alt="Current Plan" style={{ width: "7rem", height:"7rem", borderRadius: "50%" }} />
                                </Box>
                                <Box>
                                    <Text fontSize="lg" color="gray.600">
                                        This plan is designed to help you achieve your weight loss goals with tailored meal options.
                                    </Text>
                                    <Text fontSize="md" color="gray.500" mt={2}>
                                        <strong>Upcoming Meal:</strong> Grilled Chicken Salad
                                    </Text>
                                    <Text fontSize="md" color="gray.500">
                                        <strong>Time:</strong> 12:30 PM
                                    </Text>
                                    <Text fontSize="md" color="gray.500">
                                        <strong>Location:</strong> Home Delivery
                                    </Text>
                                </Box>
                                <Button mt={4} onClick={handlePlanToggle} colorScheme="teal">
                                {showPlan ? "Hide Plan Details" : "Show Plan Details"}
                            </Button>
                            </Flex>
                           
                            <Collapse style={{marginTop:"20px"}} in={showPlan} animateOpacity>
                                <Box mr={4} p={4} bg="secondary.100" borderRadius="md">
                                    <Text p={2}>
                                        Here are the details of your <strong>{userPlan.name}</strong>. 
                                    </Text>
                                       <Flex p={2} gap={4}>
                                        <Box>
                                            Carbohidrate:{userPlan.carb}<br/>
                                            Protein: {userPlan.protein}<br/>
                                        </Box>
                                        <Button>plan setings</Button>
                                        </Flex>                          
                                </Box>
                            </Collapse>
                       
                        </>
    )
}