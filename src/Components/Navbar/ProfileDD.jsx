import { Box, Button, Menu, MenuButton, MenuList, Text, Image, VStack, HStack } from "@chakra-ui/react";
import { PieChart } from "react-minimal-pie-chart";
import profileIcon from "../../assets/profile-b.svg";
import { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";

export const ProfileDD = ({
    disabled = false,

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
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Menu
       

        isOpen={isOpen} onClose={onClose} placement="bottom" >
            <MenuButton
                as={Button}
                variant="underlined"
                onClick={onOpen}
                isDisabled={disabled}
                
            >
                <Image src={profileIcon} alt="Profile" boxSize="30px" />
            </MenuButton>
            <MenuList p={4} minW="300px">
                <VStack align="center" spacing={4}>
                    <VStack spacing={4}>
                        <Image src={profileIcon} alt="Profile" boxSize="100px" borderRadius="full" />
                        <VStack align="center" spacing={0}>
                            <Text fontWeight="bold">{user.name}</Text>
                            <Text fontSize="sm" color="gray.500">{user.planTitle}</Text>
                        </VStack>
                    </VStack>
                    <VStack align="center" spacing={0}>
                        <Text fontSize="sm" fontWeight="bold">Next Meal</Text>
                        <Text fontSize="sm">{user.nextMeal.time} at {user.nextMeal.location}</Text>
                    </VStack>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold">Time Remaining</Text>
                        <PieChart
                            data={[{ value: user.timeRemaining, color: "#DDD" }, { value: 100 - user.timeRemaining, color: "#3CD3AA" }]}
                            lineWidth={20}
                            rounded
                            totalValue={100}
                            style={{ height: "100px" }}
                        />
                        <Text fontSize="xs" textAlign="center">{user.timeRemaining}% Remaining</Text>
                    </Box>
                </VStack>
            </MenuList>
        </Menu>
    );
};