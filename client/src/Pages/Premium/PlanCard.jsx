import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  Badge,
  useColorModeValue,
  HStack,
  VStack,
  Icon,
  useBreakpointValue
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
// Icon components
import FireIcon from '../../assets/premium/kcal.svg'
import CarbIcon from '../../assets/premium/carb.svg'
import ProteinIcon from '../../assets/premium/protein.svg'
import MealIcon from '../../assets/premium/meal.svg'
// MOCK DATA FOR TESTING - Comment out actual imports below
import { useI18nContext } from '../../Contexts/I18nContext'
import { PlanAvatar } from './PlanAvatar';

// MOCK DATA FOR TESTING PURPOSES
// const mockI18nContext = {
//   currentLanguage: 'en'
// };

// Default mock plan data
// const defaultMockPlan = {
//   id: 'plan-1',
//   title: 'Premium Fitness Plan',
//   title_arabic: 'بريميوم فيتنس بلان',
//   description: 'High-protein meals for fitness enthusiasts',
//   description_arabic: 'وجبات غنية بالبروتين لعشاق اللياقة البدنية',
//   kcal: 450,
//   carb: 45,
//   protein: 35,
//   fat: 12,
//   price: 750,
//   duration_days: 30,
//   total_meals: 30,
//   is_active: true,
//   avatar_url: '/images/plans/fitness-plan.jpg',
//   periods: [
//     { id: 'period-1', name: 'Breakfast' },
//     { id: 'period-2', name: 'Lunch' },
//     { id: 'period-3', name: 'Dinner' }
//   ]
// };

// // Default mock function for onSelect
// const mockOnSelect = (plan) => {
//   console.log('Plan selected:', plan);
// };


export const PlanCard = ({ 
  plan ,//= defaultMockPlan, 
  isUserPlan = false, 
  onSelect //= mockOnSelect 
}) => {
  const cardBg = useColorModeValue('white', 'brand.800')
  const borderColor = isUserPlan ? 'brand.400' : 'brand.400'
  const badgeBg = useColorModeValue('brand.50', 'brand.900')
  const badgeColor = useColorModeValue('brand.600', 'brand.200')
  const { t } = useTranslation()
  
  // MOCK DATA FOR TESTING - Comment out actual context usage
  const { currentLanguage } = useI18nContext()
  //const currentLanguage = mockI18nContext.currentLanguage;
  
  const isArabic = currentLanguage === 'ar'
  
  // Responsive values
  const avatarSize = useBreakpointValue({ base: '60px', md: '70px' })
  const titleSize = useBreakpointValue({ base: 'sm', md: 'md' })
  
  return (
    <Box
      borderWidth= {isUserPlan ? '3px' : '2px'}
      borderRadius="xl"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      p={4}
      position="relative"
      transition="all 0.2s ease"
      height="100%"
      display="flex"
      flexDirection="column"
      _hover={{
        transform: 'translateY(-4px)',
        borderColor: isUserPlan ? 'brand.500' : 'brand.200',
      }}
    >
      {isUserPlan && (
        <Badge 
          colorScheme="brand" 
          variant={"outline"}
          position="absolute" 
          top={3} 
          left={isArabic ? '1%' : '70%'}
          fontSize="2xs"
          py={1}
          px={2}
          borderRadius="full"
          bg={badgeBg}
          color={badgeColor}
          zIndex={1}
          fontWeight="semibold"
        >
          {t('premium.currentPlan')}
        </Badge>
      )}

      <Flex direction="column" height="100%">
        {/* Header with Avatar and Title */}
        <Flex align="center" mb={3}>
          <Box flexShrink={0} mr={3}>
            <PlanAvatar 
              plan={plan}
              size={avatarSize}
              borderRadius="lg"
              backgroundColor={useColorModeValue('gray.50', 'gray.700')}
              padding="2px"
            />
          </Box>
          <Heading 
            as="h3" 
            size={titleSize} 
            noOfLines={2} 
            flex={1}
            lineHeight="short"
            fontWeight="semibold"
          >
            {isArabic ? plan.title_arabic : plan.title}
          </Heading>
        </Flex>

        {/* Periods Badge */}
        <HStack mb={3}>
          <Icon as={MealIcon} color="gray.500" boxSize={3} />
          <Badge 
            colorScheme="gray" 
            fontSize="2xs" 
            variant="subtle"
            borderRadius="md"
            px={2}
            py={1}
          >
            {plan.periods?.length || 0} {t('premium.periods')}
          </Badge>
        </HStack>

        {/* Nutrition Info - Compact Grid */}
        <HStack 
          spacing={2} 
          mb={4} 
          justify="space-between"
          flexWrap="wrap"
          rowGap={2}
        >
          <Flex 
            align="center" 
            bg={useColorModeValue('secondary.50', 'secondary.900')}
            borderRadius="md"
            px={2}
            py={1}
            flex="1"
            minW="80px"
          >
            <Icon as={FireIcon} color="secondary.500" boxSize={4} mx={1} />
            <VStack spacing={0} align="flex-start">
              <Text fontSize="xs" fontWeight="bold" color={useColorModeValue('secondary.700', 'secondary.200')}>
                {plan.kcal}
              </Text>
              <Text fontSize="2xs" color={useColorModeValue('secondary.600', 'secondary.300')}>
                {t('premium.kcal')}
              </Text>
            </VStack>
          </Flex>

          <Flex 
            align="center" 
            bg={useColorModeValue('teal.50', 'teal.900')}
            borderRadius="md"
            px={2}
            py={1}
            flex="1"
            minW="80px"
          >
            <Icon as={CarbIcon} color="teal.500" boxSize={4} mx={1} />
            <VStack spacing={0} align="flex-start">
              <Text fontSize="xs" fontWeight="bold" color={useColorModeValue('teal.700', 'teal.200')}>
                {plan.carb}g
              </Text>
              <Text fontSize="2xs" color={useColorModeValue('teal.600', 'teal.300')}>
                {t('premium.carbs')}
              </Text>
            </VStack>
          </Flex>

          <Flex 
            align="center" 
            bg={useColorModeValue('brand.50', 'brand.900')}
            borderRadius="md"
            px={2}
            py={1}
            flex="1"
            minW="80px"
          >
            <Icon as={ProteinIcon} color="brand.500" boxSize={4} mx={1} />
            <VStack spacing={0} align="flex-start">
              <Text fontSize="xs" fontWeight="bold" color={useColorModeValue('brand.700', 'brand.200')}>
                {plan.protein}g
              </Text>
              <Text fontSize="2xs" color={useColorModeValue('brand.600', 'brand.300')}>
                {t('premium.protein')}
              </Text>
            </VStack>
          </Flex>
        </HStack>

        {/* Price and Action Button */}
        <Box mt="auto" pt={3}>
         
          
          <Button
            size="sm"
            colorScheme={isUserPlan ? 'gray' : 'brand'}
            variant={isUserPlan ? 'outline' : 'solid'}
            onClick={() => onSelect(plan)}
            width="full"
            fontSize="sm"
            fontWeight="semibold"
          >
            {isUserPlan ? t('premium.viewDetails') : t('premium.select')}
          </Button>
        </Box>
      </Flex>
    </Box>
  )
}

// Add default props for testing
// PlanCard.defaultProps = {
//   plan: defaultMockPlan,
//   isUserPlan: false,
//   onSelect: mockOnSelect
// }

export default PlanCard