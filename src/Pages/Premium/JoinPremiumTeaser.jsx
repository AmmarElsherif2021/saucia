import { Box, Heading, Flex, Text, Button, VStack } from '@chakra-ui/react'
import { ItemsCarousel } from '../../Components/ItemsCarousel'
import { PlanCard } from '../../Components/Cards'
import dailyMealPlanImage from '../../assets/premium/dailymealplan.png'
import saladsPlanImage from '../../assets/premium/proteinsaladplan.png'
import nonProteinSaladsPlanImage from '../../assets/premium/nonproteinsaladplan.png'
import gainWeightPlanImage from '../../assets/premium/gainWeight.png'
import keepWeightPlanImage from '../../assets/premium/keepWeight.png'
import loseWeightPlanImage from '../../assets/premium/loseWeight.png'
import { useTranslation } from 'react-i18next'
import { useElements } from '../../Contexts/ElementsContext'

export const JoinPremiumTeaser = ({ explorePlans, newMember }) => {
  // Get plans directly from ElementsContext
  const { plans, elementsLoading } = useElements()
  const { t } = useTranslation()
  const getPlanImage = (title) => {
    if (title?.includes('Gain Weight')) return gainWeightPlanImage
    if (title?.includes('Keep Weight')) return keepWeightPlanImage
    if (title?.includes('Lose Weight')) return loseWeightPlanImage
    if (title?.includes('Non')) return nonProteinSaladsPlanImage
    return saladsPlanImage
  }

  const processedPlans =
    plans?.map((plan) => ({
      ...plan,
      image: getPlanImage(plan.title), // This now provides actual image imports
    })) || []

  // Render a single PlanCard if no carousel is needed
  const renderSinglePlan = () => {
    if (processedPlans.length > 0) {
      return <PlanCard plan={processedPlans[0]} />
    }
    return <Text>{t('premium.noPlansAvailable')}</Text>
  }

  // Loading state
  if (elementsLoading) {
    return (
      <Box bg="white" p={6} borderRadius="md">
        <Text>{t('premium.loadingPremiumPlans')}</Text>
      </Box>
    )
  }

  // Error state - no plans found
  if (!plans || plans.length === 0) {
    return (
      <Box bg="white" p={6} borderRadius="md">
        <Heading as="h2" size="xl" mb={4}>
          {newMember ? t('premium.join') : t('premium.change')} {t('premium.premiumPlans')}
        </Heading>
        <Text color="red.500">{t('premium.noPremiumPlansFound')}</Text>
      </Box>
    )
  }

  return (
    <VStack p={6} borderRadius="40px" bg={'brand.500'}>
      <Heading as="h2" size="xl" mb={4}>
        {newMember ? t('premium.join') : t('premium.change')} {t('premium.premiumPlans')}
      </Heading>
      <Flex
        justifyContent="center"
        mb={4}
        gap={4}
        alignItems="center"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Box>
          <Text
            mb={4}
            width={{ base: '100%', md: '40vw' }}
            textAlign="center"
            fontSize="2xl"
            color="gray.600"
          >
            {t('premium.unlockExclusiveFeatures')}
          </Text>
        </Box>
        <Box mb={4} w={{ base: '100%', md: '40vw' }} h="auto" mx="auto" position="relative">
          {processedPlans.length > 1 ? (
            <ItemsCarousel
              items={processedPlans}
              CardComponent={({ item }) => <PlanCard plan={item} />}
              visibleCount={1}
              auto={true}
              visibleButtons={true}
              carouselBg="whiteAlpha.50"
            />
          ) : (
            renderSinglePlan()
          )}
        </Box>
      </Flex>
    </VStack>
  )
}
