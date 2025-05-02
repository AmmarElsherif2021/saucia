import { Box, Button, Menu, MenuButton, MenuList, Text, Image, VStack, HStack } from "@chakra-ui/react";
import { PieChart } from "react-minimal-pie-chart";
import profileIcon from "../../assets/profile-b.svg";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react";
import { useUser } from "../../Contexts/UserContext";

export const ProfileDD = ({ disabled = false }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const { user, loading,logout } = useUser();

    const handleProfileClick = () => {
        if (user) {
            navigate("/account");
            onClose();
        }
    };
   const handleLogout =()=>{
    if(user){
        logout();
        navigate("/");
        onClose();
    }
   }
    return (
        <Menu isOpen={isOpen} onClose={onClose} placement="bottom">
            <MenuButton
                as={Button}
                variant="underlined"
                onClick={onOpen}
                isDisabled={disabled}
            >
                <Image src={profileIcon} alt="Profile" boxSize="30px" />
            </MenuButton>
            
            <MenuList p={4} minW="300px">
                {user ? (
                    <VStack align="center" spacing={4}>
                        <VStack spacing={4}>
                            <Image 
                                src={user.photoURL || profileIcon} 
                                alt="Profile" 
                                boxSize="100px" 
                                borderRadius="full"
                                onClick={handleProfileClick}
                                cursor="pointer"
                            />
                            <VStack align="center" spacing={0}>
                                <Text fontWeight="bold">{user.displayName || "Anonymous User"}</Text>
                                <Text fontSize="sm" color="gray.500">
                                    {user.planTitle || "Free Plan"}
                                </Text>
                            </VStack>
                        </VStack>
                        
                        <VStack align="center" spacing={0}>
                            <Text fontSize="sm" fontWeight="bold">Next Meal</Text>
                            <Text fontSize="sm">
                                {user.nextMeal?.time || "N/A"} at {user.nextMeal?.location || "N/A"}
                            </Text>
                        </VStack>
                        
                        <Box>
                            <Text fontSize="sm" fontWeight="bold">Time Remaining</Text>
                            <PieChart
                                data={[{ 
                                    value: user.timeRemaining || 0, 
                                    color: "#DDD" 
                                }, { 
                                    value: 100 - (user.timeRemaining || 0), 
                                    color: "#3CD3AA" 
                                }]}
                                lineWidth={20}
                                rounded
                                totalValue={100}
                                style={{ height: "100px" }}
                            />
                            <Text fontSize="xs" textAlign="center">
                                {user.timeRemaining || 0}% Remaining
                            </Text>
                            <Button 
                            colorScheme="brand" 
                            w="full"
                            onClick={handleLogout}
                        >
                            Sign Out
                        </Button>
                        </Box>
                    </VStack>
                ) : (
                    <VStack spacing={4} p={4}>
                        <Text fontSize="lg" fontWeight="bold">Guest User</Text>
                        <Text textAlign="center">
                            Sign in to access your profile and premium features
                        </Text>
                        <Button 
                            colorScheme="brand" 
                            w="full"
                            onClick={() => {
                                navigate("/auth");
                                onClose();
                            }}
                        >
                            Sign In
                        </Button>
                    </VStack>
                )}
            </MenuList>
        </Menu>
    );
};