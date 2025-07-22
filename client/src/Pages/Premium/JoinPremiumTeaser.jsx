import { Box, Heading, Flex, Text, Button, VStack } from '@chakra-ui/react'
import { ItemsCarousel } from '../../Components/ItemsCarousel'
import { PlanCard } from '../../Components/Cards'
import { useTranslation } from 'react-i18next'
import { useElements } from '../../Contexts/ElementsContext'
import { enrichPlansWithImages } from './planImageUtils'

export const JoinPremiumTeaser = ({ explorePlans, newMember }) => {
  const { plans, elementsLoading } = useElements()
  const { t } = useTranslation()

  // Enrich plans with proper image URLs
  const processedPlans = enrichPlansWithImages(plans)

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
