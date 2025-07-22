import { Text, Flex, Box, Button, Collapse, Spinner, Badge } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useAuthContext } from '../../Contexts/AuthContext'
import { CircularPlanAvatar } from './PlanAvatar'
import PlanSettingsModal from './PlanSettingsModal' 

export const CurrentPlanBrief = ({ plan, loading }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false) 
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { user } = useAuthContext()
  const isArabic = currentLanguage === 'ar'

  if (loading) {
    return (
      <Flex justify="center" py={6} borderRadius={'35px'} bg="brand.100" alignItems="center">
        <Spinner size="md" color="brand.500" />
        <Text ml={3}>{t('loadingPlanDetails')}...</Text>
      </Flex>
    )
  }

  if (!plan) {
    return <Text>{t('notSubscribedToAnyPlan')}.</Text>
  }

  return (
    <Box borderRadius={'35px'} bg="brand.100" p={6} mb={6}>
      <Text>
        {t('premium.currentlySubscribedToThe')}{' '}
        <strong>{isArabic ? plan.title_arabic : plan.title}</strong>.
      </Text>

      <Flex mt={4} alignItems="center" flexWrap={{ base: 'wrap', md: 'nowrap' }} gap={4}>
        <CircularPlanAvatar 
          plan={plan}
          size="85px"
        />

        <Box flex="1">
          <Text fontSize="lg" color="gray.600">
            {/* Plan description */}
          </Text>

          <Flex mt={2} gap={2} flexWrap="wrap">
            <Badge colorScheme="green">
              {t('premium.kcal')}: {plan.kcal}
            </Badge>
            <Badge colorScheme="brand">
              {t('premium.carbs')}: {plan.carb}g
            </Badge>
            <Badge colorScheme="red">
              {t('premium.protein')}: {plan.protein}g
            </Badge>
          </Flex>

          {plan.nextMeal && (
            <Box mt={2}>
              <Text fontSize="sm" color="gray.500">
                <strong>{t('premium.upcomingMeal')}:</strong> {plan.nextMeal.name}
              </Text>
              {plan.nextMeal.time && (
                <Text fontSize="sm" color="gray.500">
                  <strong>{t('premium.time')}:</strong> {plan.nextMeal.time}
                </Text>
              )}
              {user?.subscription?.deliveryAddress && (
                <Text fontSize="sm" color="gray.500">
                  <strong>{t('premium.location')}:</strong> {user.subscription.deliveryAddress}
                </Text>
              )}
            </Box>
          )}
        </Box>

        <Button onClick={() => setShowDetails(!showDetails)} colorScheme="brand" size="sm">
          {showDetails ? t('premium.hideDetails') : t('premium.showDetails')}
        </Button>
      </Flex>

      <Collapse in={showDetails} animateOpacity>
        <Box mt={4} p={4} w={'80vw'} bg="secondary.100" borderRadius="md">
          <Text fontWeight="medium" mb={2}>
            {t('premium.planDetails')}
          </Text>

          <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
            <Box flex="1">
              <Text fontSize="sm">
                <strong>{t('premium.fullName')}:</strong>{' '}
                {isArabic ? plan.title_arabic : plan.title}
              </Text>

              <Text fontSize="sm">
                <strong>{t('premium.calories')}:</strong> {plan.kcal} kcal
              </Text>
              <Text fontSize="sm">
                <strong>{t('premium.carbohydrates')}:</strong> {plan.carb}g
              </Text>
              <Text fontSize="sm">
                <strong>{t('premium.protein')}:</strong> {plan.protein}g
              </Text>
            </Box>

            <Box flex="1">
              {user?.subscription && (
                <Text fontSize="sm">
                  {user?.subscription?.mealsCount} {t('premium.days')}
                </Text>
              )}
            </Box>
          </Flex>

          <Button
            mt={4}
            size="sm"
            colorScheme="brand"
            onClick={() => setIsSettingsModalOpen(true)}
          >
            {t('premium.managePlanSettings')}
          </Button>
        </Box>
      </Collapse>

      <PlanSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </Box>
  )
}
