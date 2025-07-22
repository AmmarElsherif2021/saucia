import { memo } from 'react';
import { Box, Heading, Text, SimpleGrid, Button } from '@chakra-ui/react';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { useTranslation } from 'react-i18next';
const DeliveryTimeSelector = () => {
  const {t}= useTranslation();
  const { subscriptionData, setDeliveryTime } = useChosenPlanContext();
  const timeSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
  ];

  const TimeSlotButton = memo(({ slot }) => {
    const isSelected = subscriptionData.preferred_delivery_time === slot;
    return (
      <Button
        aria-pressed={isSelected}
        variant={isSelected ? 'solid' : 'outline'}
        colorScheme={isSelected ? 'brand' : 'secondary'}
        onClick={() => setDeliveryTime(slot)}
        transition="all 0.2s ease"
        boxShadow={isSelected ? 'md' : 'none'}
        _hover={{ transform: 'scale(1.05)' }}
      >
        {slot}
      </Button>
    );
  });

  return (
    <Box mb={2}>
      <Heading size="md" mb={3}>
        {t('premium.selectDeliveryTime')}
      </Heading>
      <Text mb={4}>
        {t('premium.deliveryTimeInstructions')}
      </Text>

      <SimpleGrid columns={{ base: 2, sm: 3, md: 3 }} spacing={1}>
        {timeSlots.map((slot) => (
          <TimeSlotButton slot={slot} key={slot} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default DeliveryTimeSelector;
