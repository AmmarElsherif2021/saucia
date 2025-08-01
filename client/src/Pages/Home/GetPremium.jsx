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
          {t('premium.joinOurPlans')} {/* Translate "Join Our Premium Plans" */}
        </Heading>
        <Text fontSize="md" textAlign="center">
          {t('premium.elevateExperience')} {/* Translate "Elevate your salad experience..." */}
          <strong>{t('brandNames.sauciaSalad')}</strong> {/* Translate "SauciaSalad" */}
          {t('premium.benefitsDescription')} {/* Translate "Enjoy exclusive benefits..." */}
        </Text>
        <VStack spacing={4}>
          <Button colorScheme="brand" size="md" variant="solid">
            {t('premium.joinWeeklyPlan')} {/* Translate "Join Weekly Plan" */}
          </Button>
          <Button colorScheme="brand" size="md" variant="outline">
            {t('premium.joinMonthlyPlan')} {/* Translate "Join Monthly Plan" */}
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
}
/*
bbb
axios          package.json:22:6
dotenv         package.json:23:6
firebase       package.json:24:6
jwt-decode     package.json:28:6
react-leaflet  package.json:35:6
*/
