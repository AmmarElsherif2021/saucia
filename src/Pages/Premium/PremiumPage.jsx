import { Box, Heading, Text, Button, VStack, Collapse, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useI18nContext } from '../../Contexts/I18nContext';
import { getPlans } from './plansData';
import { JoinPremiumTeaser } from './JoinPremiumTeaser';
import gainWeightPlanImage from "../../assets/premium/gainWeight.png";
import keepWeightPlanImage from "../../assets/premium/keepWeight.png";
import loseWeightPlanImage from "../../assets/premium/loseWeight.png";
import dailyMealPlanImage from "../../assets/premium/dailyMeal.png";
import saladsPlanImage from "../../assets/premium/saladMeal.png"; 
import { GoPremium } from './GoPremium';
import { CurrentPlanBrief } from './CurrentPlanBrief';

const PremiumPage = () => {
     
    //explorePlans
    const plansCards = getPlans()
    const userPlan = plansCards[2]; 
    const [explorePlans,setExplorePlans]=useState(false)
    //current plan
   
    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Heading> Updating the premium section backend..... </Heading>
            <Heading> جاري تحديث نظام الاشتراكات .... </Heading>
        </Box>
    );
};
export default PremiumPage;
/*
<VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl" textAlign="center" color="brand.500">
                    Premium Page
                </Heading>
                {!explorePlans?
                <JoinPremiumTeaser newMember={!Boolean(userPlan)} explorePlans={()=>setExplorePlans((prev)=>!prev)}/>
                    :
                <GoPremium/>
                }
                <Box bg="white" p={6} borderRadius="md">
                    <Heading as="h2" size="md" mb={4}>
                        Your Current Plan
                    </Heading>
                    {userPlan ? (
                        <CurrentPlanBrief  userPlan={userPlan} />
                        
                    ) : (
                        <Text>You are not subscribed to any premium plan.</Text>
                    )}
                </Box>
            </VStack>
*/