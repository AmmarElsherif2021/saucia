import { Box,Heading,Flex,Text,Button } from "@chakra-ui/react"
import { ItemsCarousel } from "../../Components/ItemsCarousel"
import { getPlans } from "./plansData"
import { PlanCard } from "../../Components/Cards";
import { useColorMode } from '@chakra-ui/react';
import { getCurrentLanguage } from '../../i18n';
import { useTranslation } from "react-i18next";
export const JoinPremiumTeaser=({explorePlans,newMember})=>{
    const plansCards= getPlans()
    return(
        <Box bg="white" p={6} borderRadius="md">
                            <Heading as="h2" size="xl" mb={4}>
                                {newMember?"Join":"Change"} Premium Plans
                            </Heading>
                            <Flex justifyContent="center" mb={4} gap={4} alignItems="center">
                                <Box>
                                    <Text mb={4} width={"40vw"} textAlign="left" fontSize="2xl" color="gray.600">
                                        Unlock exclusive features by subscribing to one of our premium plans!
                                        You can discover and join any of the daily meal plans based on your preferences.
                                        Enjoy exclusive benefits and features tailored for you!
                                    </Text>
                                    <Button colorScheme="teal" onClick={explorePlans}>
                                        Explore plans
                                    </Button>
                                </Box>
                                <Box mb={4} w={"40vw"} h={"auto"} mx="auto" position="relative">
                                    <ItemsCarousel items={plansCards} CardComponent={PlanCard} visibleCount={1} auto={true} visibleButtons={false} />
                                </Box>
                            </Flex>
                        </Box>
    )
}