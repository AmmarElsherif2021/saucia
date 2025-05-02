import { Box, Heading, Flex, Text, Button } from "@chakra-ui/react";
import { getPlans } from "./plansData";
import { Link } from "react-router-dom";
import dailySalad from "../../assets/premium/dailySalad.png";
import healthyBody from "../../assets/premium/healthyBody.png";

export const GoPremium = () => {
    const plansCards = getPlans();
    const handleDailyMealClick = () => {};

    return (
        <Box>
            <Heading textAlign="center" mb={8}>
                Go Premium
            </Heading>
            <Flex justifyContent="center" mb={4} gap={10} alignItems="center">
                <Flex direction="column" alignItems={"center"}>
                    <Heading as="h3">Daily plan</Heading>
                    <img
                        style={{
                            margin: "1vw",
                            width: "20vw",
                            height: "36vh",
                            borderRadius: "50px",
                        }}
                        src={dailySalad}
                        alt="Daily Salad"
                    />
                    <Text
                        mb={4}
                        width={"30vw"}
                        textAlign="center"
                        fontSize="lg"
                        color="gray.600"
                    >
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Voluptatibus odio rem praesentium suscipit. Possimus nostrum dolores
                        voluptatum illum. Corporis, quod debitis veritatis rem aliquam
                        voluptatem iusto animi eveniet nobis quidem!
                    </Text>
                    <Link to="/premium/join" style={{ textDecoration: "none" }}>
                        <Button colorScheme="brand">Explore plans</Button>
                    </Link>
                </Flex>
                <Flex direction="column" alignItems={"center"}>
                    <Heading as="h3">Healthy body plans</Heading>
                    <img
                        style={{
                            margin: "1vw",
                            width: "20vw",
                            height: "36vh",
                            borderRadius: "50px",
                        }}
                        src={healthyBody}
                        alt="Healthy Body"
                    />
                    <Text
                        mb={4}
                        width={"30vw"}
                        textAlign="center"
                        fontSize="lg"
                        color="gray.600"
                    >
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Voluptatibus odio rem praesentium suscipit. Possimus nostrum dolores
                        voluptatum illum. Corporis, quod debitis veritatis rem aliquam
                        voluptatem iusto animi eveniet nobis quidem!
                    </Text>
                    <Link to="/premium/join" style={{ textDecoration: "none" }}>
                        <Button colorScheme="brand">Explore plans</Button>
                    </Link>
                </Flex>
            </Flex>
        </Box>
    );
};