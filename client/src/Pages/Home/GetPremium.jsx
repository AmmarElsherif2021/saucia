import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import premiumBg from '../../assets/PremiumBG.JPG'
import { useTranslation } from 'react-i18next'

export const GetPremium = () => {
  const { t } = useTranslation()

  return (
    <Box
      as="section"
      bg="gray.50"
      py={10}
      px={5}
      mb={10}
      bgImage={`url(${premiumBg})`}
      bgSize="cover"
      bgPosition="center"
      borderRadius={'2xl'}
      w={'95%'}
    >
      <VStack spacing={6} align="center" maxW="lg" mx="auto">
        <Heading as="h2" size="lg" textAlign="center">
          {t('joinOurPlans')} {/* Translate "Join Our Premium Plans" */}
        </Heading>
        <Text fontSize="md" textAlign="center">
          {t('elevateExperience')} {/* Translate "Elevate your salad experience..." */}
          <strong>{t('sauciaSalad')}</strong> {/* Translate "SauciaSalad" */}
          {t('benefitsDescription')} {/* Translate "Enjoy exclusive benefits..." */}
        </Text>
        <VStack spacing={4}>
          <Button colorScheme="brand" size="md" variant="solid">
            {t('joinWeeklyPlan')} {/* Translate "Join Weekly Plan" */}
          </Button>
          <Button colorScheme="brand" size="md" variant="outline">
            {t('joinMonthlyPlan')} {/* Translate "Join Monthly Plan" */}
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
}
