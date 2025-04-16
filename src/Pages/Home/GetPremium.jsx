
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import premiumBg from '../../assets/PremiumBG.JPG'; 
export const GetPremium = () => {
    return (
        <Box as="section" bg="gray.50" py={10} px={5} mb={10}
        bgImage={`url(${premiumBg})`}
      bgSize="cover"
      bgPosition="center"
        borderRadius={"2xl"}
      w={"95%"}
        >
            <VStack spacing={6} align="center" maxW="lg" mx="auto">
                <Heading as="h2" size="lg" textAlign="center">
                    Join Our Premium Plans
                </Heading>
                <Text fontSize="md" textAlign="center">
                    Elevate your salad experience with our premium weekly or monthly <strong>SauciaSalad</strong> plans. Enjoy exclusive benefits, fresh ingredients, and delicious recipes delivered to your doorstep.
                </Text>
                <VStack spacing={4}>
                    <Button colorScheme="teal" size="md" variant="solid">
                        Join Weekly Plan
                    </Button>
                    <Button colorScheme="teal" size="md" variant="outline">
                        Join Monthly Plan
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};


