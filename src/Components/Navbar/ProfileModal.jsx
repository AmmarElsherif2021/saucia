
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Image, 
  Button,
  useDisclosure,
  Modal
} from "@chakra-ui/react";
import { PieChart } from "react-minimal-pie-chart";
import profileIcon from "../../assets/profile-b.svg";
//import { MOD } from "../ComponentsTrial.jsx";
import { useNavigate } from "react-router";
export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user) {
      navigate("/"); // Temporary
      onClose();
    }
  };

  const handleLogout = () => {
    if (user) {
      logout();
      navigate("/");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("profile.title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {user ? (
              <>
                <VStack spacing={4}>
                  <Image
                    src={user.photoURL || profileIcon}
                    alt="Profile"
                    boxSize="100px"
                    borderRadius="full"
                    onClick={handleProfileClick}
                    cursor="pointer"
                  />
                  <VStack spacing={0}>
                    <Text fontWeight="bold">
                      {user.displayName || "Anonymous User"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {user.planTitle || "Free Plan"}
                    </Text>
                  </VStack>
                </VStack>

                <VStack spacing={0} w="full">
                  <Text fontWeight="bold">Next Meal</Text>
                  <Text>
                    {user.nextMeal?.time || "N/A"} at{" "}
                    {user.nextMeal?.location || "N/A"}
                  </Text>
                </VStack>

                <Box w="full">
                  <Text fontWeight="bold">Time Remaining</Text>
                  <PieChart
                    data={[
                      { value: user.timeRemaining || 0, color: "#DDD" },
                      { 
                        value: 100 - (user.timeRemaining || 0), 
                        color: "#3CD3AA" 
                      }
                    ]}
                    lineWidth={20}
                    rounded
                    totalValue={100}
                    style={{ height: "100px" }}
                  />
                  <Text textAlign="center">
                    {user.timeRemaining || 0}% Remaining
                  </Text>
                </Box>

                <Button 
                  colorScheme="red" 
                  w="full"
                  onClick={handleLogout}
                >
                  {t("profile.signOut")}
                </Button>
              </>
            ) : (
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="bold">
                  {t("profile.guestTitle")}
                </Text>
                <Text textAlign="center">
                  {t("profile.guestMessage")}
                </Text>
                <Button
                  colorScheme="brand"
                  w="full"
                  onClick={() => {
                    navigate("/auth");
                    onClose();
                  }}
                >
                  {t("profile.signIn")}
                </Button>
              </VStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};