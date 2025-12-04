import { Box, Text, Flex, Badge, VStack, HStack } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

const MealSlotCard = ({ 
  index, 
  mealDesign, 
  onEdit, 
  saladItems, 
  isArabic,
  t
}) => {
  const renderItemsPreview = () => {
    if (!mealDesign || Object.keys(mealDesign).length === 0) {
      return (
        <Text fontStyle="italic" color="gray.500">
          {t('noItemsSelected')}
        </Text>
      );
    }

    const itemsToShow = Object.entries(mealDesign).slice(0, 2);
    const remainingCount = Object.keys(mealDesign).length - 2;

    return (
      <VStack align="start" spacing={1}>
        {itemsToShow.map(([itemId, quantity]) => {
          const item = saladItems.find(i => i.id == itemId);
          const displayName = isArabic && item?.name_arabic 
            ? item.name_arabic 
            : item?.name || `Item ${itemId}`;
            
          return (
            <Text key={itemId} fontSize="sm" noOfLines={1}>
              {displayName} × {quantity}
            </Text>
          );
        })}
        {remainingCount > 0 && (
          <Text fontSize="sm" color="brand.500">
            + {remainingCount} {t('moreItems')}
          </Text>
        )}
      </VStack>
    );
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={3}
      cursor="pointer"
      onClick={onEdit}
      bg="white"
      _hover={{ bg: 'gray.50' }}
      transition="background 0.2s"
      position="relative"
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="bold" color="brand.700">
          {t('mealSlot', { number: index + 1 })}
        </Text>
        <Badge colorScheme="brand" variant="outline" fontSize="xs">
          {Object.keys(mealDesign).length} {t('items')}
        </Badge>
      </Flex>
      
      {renderItemsPreview()}
    </Box>
  );
};

export default MealSlotCard;