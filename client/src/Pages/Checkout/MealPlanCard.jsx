import { Box, Button, IconButton, Image, Text, Badge, Flex, Tooltip } from '@chakra-ui/react'
import { SmallCloseIcon, StarIcon } from '@chakra-ui/icons'
import unknownDefaultImage from '../../assets//menu/unknownMeal.JPG'
export const MealPlanCard = ({ meal, index, onRemove, onChoose, isArabic, t }) => {
  return (
    <Box
      as={onRemove ? 'div' : Button}
      variant="solid"
      onClick={onChoose ? () => onChoose(meal) : undefined}
      position="relative"
      w="100%"
      h="180px"
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      bg={'brand.600'}
      _hover={{
        transform: onChoose ? 'scale(1.02)' : undefined,
      }}
    >
      {/* Background Image */}
      <Image
        src={meal.image || unknownDefaultImage}
        alt={isArabic ? meal.name_arabic : meal.name}
        w="100%"
        h="100%"
        objectFit="cover"
        fallbackSrc={unknownDefaultImage}
        filter="brightness(0.9)"
      />

      {/* Gradient Overlay */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="60%"
        bgGradient="linear(to-t, blackAlpha.800, transparent)"
      />

      {/* Remove button */}
      {onRemove && (
        <IconButton
          aria-label="Remove meal"
          icon={<SmallCloseIcon />}
          size="sm"
          colorScheme="red"
          variant="solid"
          position="absolute"
          top={2}
          right={2}
          onClick={(e) => {
            e.stopPropagation()
            onRemove() 
          }}
          zIndex="2"
        />
      )}

      {/* Content Overlay */}
      <Box position="absolute" bottom={0} left={0} right={0} p={3} zIndex="1">
        {/* Meal Name */}
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="white"
          noOfLines={2}
          mb={1}
          bg={'gray.900'}
          px={0}
          mx={0}
        >
          {isArabic ? meal.name_arabic : meal.name}
        </Text>

        {/* Nutrition Info */}
        <Flex gap={2} mb={2}>
          <Badge colorScheme="orange" variant="solid" fontSize="xs">
            {meal.kcal} kcal
          </Badge>
          <Badge colorScheme="brand" variant="solid" fontSize="xs">
            {meal.protein}g protein
          </Badge>
        </Flex>

        {/* Ingredients with Tooltip */}
        <Tooltip
          label={isArabic ? meal.ingredients_arabic || meal.ingredients : meal.ingredients}
          placement="top"
          w={"85%"}
          bg={"secondary.500"}
        >
          <Text
            fontSize="lg"
            color="whiteAlpha.800"
            noOfLines={2}
            textShadow="0 1px 2px rgba(0,0,0,0.5)"
            align={"center"}
          >
            ...
          </Text>
        </Tooltip>

        {/* Rating */}
        {meal.rate > 0 && (
          <Flex
            position="absolute"
            top={-5}
            left={3}
            align="center"
            bg="blackAlpha.600"
            px={2}
            py={1}
            borderRadius="full"
          >
            <StarIcon color="yellow.400" boxSize={3} mr={1} />
            <Text fontSize="sm" color="white" fontWeight="bold">
              {meal.rate.toFixed(1)}
            </Text>
          </Flex>
        )}

        {/* Custom Tag */}
        {meal.isCustom && (
          <Badge
            position="absolute"
            top={-8}
            left={3}
            colorScheme="brand"
            variant="solid"
            fontSize="xs"
          >
            {t('checkout.customized')}
          </Badge>
        )}
      </Box>
    </Box>
  )
}

export default MealPlanCard
