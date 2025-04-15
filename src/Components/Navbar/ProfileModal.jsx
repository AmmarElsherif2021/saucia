
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Image, 
  Button,
  useDisclosure
} from "@chakra-ui/react";
import { PieChart } from "react-minimal-pie-chart";
import profileIcon from "../../assets/profile-b.svg";
import { MOD } from "../ComponentsTrial.jsx";
export const ProfileModal = ({
  isOpen,
  onClose,
  user = {
    name: "John Doe",
    planTitle: "Premium Plan",
    nextMeal: {
      time: "12:30 PM",
      location: "Cafeteria",
    },
    timeRemaining: 75,
  },
}) => {

  return (
    <Box>
      <Button 
        variant="underlined" 
        onClick={onClose}
      >
        <Image src={profileIcon} alt="Profile" boxSize="30px" />
      </Button>
      
      <MOD
        visible={isOpen}
        title="Profile"
        onClose={onClose}
        content={
          <VStack align="start" spacing={4} p={2}>
            <HStack spacing={4}>
              <Image src={profileIcon} alt="Profile" boxSize="90px" borderRadius="full" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">{user.name}</Text>
                <Text fontSize="sm" color="gray.500">{user.planTitle}</Text>
              </VStack>
            </HStack>
            <Box>
              <Text fontSize="sm" fontWeight="bold">Next Meal</Text>
              <Text fontSize="sm">{user.nextMeal.time} at {user.nextMeal.location}</Text>
            </Box>
            <Box w="100%">
              <Text fontSize="sm" fontWeight="bold">Time Remaining</Text>
              <PieChart
                data={[{ value: user.timeRemaining, color: "#EEEEEE" }, { value: 100 - user.timeRemaining, color: "#3CD3AA" }]}
                lineWidth={20}
                rounded
                totalValue={100}
                style={{ height: "100px" }}
              />
              <Text fontSize="xs" textAlign="center">{user.timeRemaining}% Remaining</Text>
            </Box>
          </VStack>
        }
        actions={
          <Button colorScheme="brand" onClick={onClose}>
            Close
          </Button>
        }
      />
    </Box>
  );
};