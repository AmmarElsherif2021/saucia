import { Text, Flex, Box, Button, Collapse, Spinner, Badge } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import planIcon from '../../assets/premium/planIcon.svg'
export const CurrentPlanBrief = ({ plan, loading }) => {
  const [showDetails, setShowDetails] = useState(false)
  const { t } = useTranslation()

  if (loading) {
    return (
      <Flex justify="center" py={6}>
        <Spinner size="md" color="brand.500" />
        <Text ml={3}>{t('loadingPlanDetails')}...</Text>
      </Flex>
    )
  }

  if (!plan) {
    return <Text>{t('notSubscribedToAnyPlan')}.</Text>
  }

  // Get plan image from a mapping or use default
  //.replace(/\s+/g, '-')}
  const planImage = plan.image || planIcon

  return (
    <>
      <Text>
        {t('premium.currentlySubscribedToThe')} <strong>{plan.title}</strong> {t('plan')}.
      </Text>

      <Flex mt={4} alignItems="center" flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={4}>
        <Box w="90px" h="90px" mb={{ base: 2, md: 0 }}>
          <img
            src={planImage}
            alt={plan.title}
            style={{ width: '7rem', height: '7rem', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '/assets/premium/dailyMealPlan.png'
            }}
          />
        </Box>

        <Box flex="1">
          <Text fontSize="lg" color="gray.600">
            {plan.description ||
              `${t('premium.thisPlanIsDesignedToHelpYouWithYour')} ${plan.title.toLowerCase()} ${t('goals')}.`}
          </Text>

          <Flex mt={2} gap={2} flexWrap="wrap">
            <Badge colorScheme="green">
              {t('kcal')}: {plan.kcal}
            </Badge>
            <Badge colorScheme="brand">
              {t('carbs')}: {plan.carb}g
            </Badge>
            <Badge colorScheme="red">
              {t('protein')}: {plan.protein}g
            </Badge>
          </Flex>

          {plan.nextMeal && (
            <Box mt={2}>
              <Text fontSize="sm" color="gray.500">
                <strong>{t('upcomingMeal')}:</strong> {plan.nextMeal.name}
              </Text>
              {plan.nextMeal.time && (
                <Text fontSize="sm" color="gray.500">
                  <strong>{t('time')}:</strong> {plan.nextMeal.time}
                </Text>
              )}
              {plan.nextMeal.location && (
                <Text fontSize="sm" color="gray.500">
                  <strong>{t('location')}:</strong> {plan.nextMeal.location}
                </Text>
              )}
            </Box>
          )}
        </Box>

        <Button onClick={() => setShowDetails(!showDetails)} colorScheme="brand" size="sm">
          {showDetails ? t('hideDetails') : t('showDetails')}
        </Button>
      </Flex>

      <Collapse in={showDetails} animateOpacity>
        <Box mt={4} p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="medium" mb={2}>
            {t('planDetails')}
          </Text>

          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box flex="1">
              <Text fontSize="sm">
                <strong>{t('fullName')}:</strong> {plan.title}
              </Text>
              {plan.title_arabic && (
                <Text fontSize="sm">
                  <strong>{t('arabicName')}:</strong> {plan.title_arabic}
                </Text>
              )}
              <Text fontSize="sm">
                <strong>{t('calories')}:</strong> {plan.kcal} kcal
              </Text>
              <Text fontSize="sm">
                <strong>{t('carbohydrates')}:</strong> {plan.carb}g
              </Text>
              <Text fontSize="sm">
                <strong>{t('protein')}:</strong> {plan.protein}g
              </Text>
            </Box>

            {plan.periods && plan.periods.length > 0 && (
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium">
                  {t('availablePeriods')}:
                </Text>
                {plan.periods.map((period, index) => (
                  <Text key={index} fontSize="sm">
                    {period} {t('days')}
                  </Text>
                ))}
              </Box>
            )}
          </Flex>

          <Button mt={4} size="sm" colorScheme="brand">
            {t('premium.managePlanSettings')}
          </Button>
        </Box>
      </Collapse>
    </>
  )
}
