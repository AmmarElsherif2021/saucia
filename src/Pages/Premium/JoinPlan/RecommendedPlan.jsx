import { useState } from "react";
import {
Box,
Button,
Text,
Flex,
FormLabel,
Input,
Radio,
RadioGroup,
Stack,
Textarea,
VStack,
TagLabel,
Heading,
Tag,
HStack,
} from "@chakra-ui/react";
import HorizontalScrollCarousel from "../../../Components/HorizontalCarousel";
import getPlans from "../plansData";
import { Card } from "../../../Components/ComponentsTrial";
import saladImage from "../../../assets/premium/dailySalad.png"
import { PlanTinyCard } from "../../../Components/Cards";
//recommended plan
const RecommendedPlan = ({setApplicationPhase}) => {
const plansData = getPlans();
const [recommendedPlan, setRecommendedPlan] = useState(plansData[2]);
const handleGetRecommended = () => {
   return 
};
const handleChoosePlan=()=>{
    setRecommendedPlan(recommendedPlan)
}


return (
    <HStack spacing={4} mt={4}>
        <Flex w={"30vw"} direction={"column"} alignItems="left" justifyContent="center" mb={4}>
            <Heading>Based on your answers, we recommend this plan for you</Heading>
            <PlanTinyCard recommendedPlan={recommendedPlan} handleChoosePlan={handleChoosePlan} selected />
        </Flex>
        <Flex direction={"column"} alignItems="left" justifyContent="center" mb={4}>
            <Text>You can choose another plan too:</Text>
            <Box
                display="grid"
                w={"60vw"}
                h={"80vh"}
                gridTemplateColumns="repeat(auto-fit, minmax(17vw, 3fr))"
                gridTemplateRows="repeate(auto-fit, minmax(17vw, 3fr))"
                gap={4}
                mt={4}
                scrollBehavior={"auto"}
            >
                {plansData.map((plan, index) => (
                    <PlanTinyCard
                        key={index}
                        recommendedPlan={plan}
                        handleChoosePlan={() => setRecommendedPlan(plan)}
                        selected={plan === recommendedPlan}
                    />
                ))}
            </Box>
        </Flex>
    </HStack>
);
};

export default RecommendedPlan;