import { useState } from 'react'
import mealImage from '../../assets/menu/defaultMeal.jpg'
import {
  Box,
  Text,
  useDisclosure,
  Image,
  Heading,
  Flex,
  useColorMode,
} from '@chakra-ui/react'
import { CustomizableMealModal } from './CustomizableMealModal'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'

/**
 * Free item counts for each salad section (English and Arabic keys)
 */
const SALAD_SECTION_FREE_COUNTS = {
  protein: { value: 0, key_arabic: 'بروتين' },
  Nuts: { value: 1, key_arabic: 'مكسرات' },
  Dressings: { value: 2, key_arabic: 'الصلصات' },
  Fruits: { value: 1, key_arabic: 'الفواكه' },
  Cheese: { value: 0, key_arabic: 'جبن' },
  Greens: { value: 2, key_arabic: 'الخضار الورقية' },
  toppings: { value: 3, key_arabic: 'الإضافات' },
  Vegetables: { value: 4, key_arabic: 'خضروات' },
}

/**
 * Free item count for fruit salad section
 */
const FRUIT_SECTION_FREE_COUNT = {
  'salad-fruits': { value: 5, key_arabic: 'سلطة فواكه' },
}

/**
 * CustomizableMealCard component
 * Displays a meal card that opens a modal for customization and adding to cart.
 *
 * @param {Object} props
 * @param {Object} props.meal - Meal data object
 * @param {Array} props.selectableItems - List of selectable add-on items
 * @param {Function} props.onhandleAddToCart - Callback when adding to cart
 */
export const CustomizableMealCard = ({
  meal,
  selectableItems,
  onhandleAddToCart,
}) => {
  // Determine which section free counts to use based on meal type
  const SECTION_FREE_COUNTS =
    meal.name === 'Make your own fruit salad'
      ? FRUIT_SECTION_FREE_COUNT
      : SALAD_SECTION_FREE_COUNTS

  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Language and translation hooks
  const { currentLanguage } = useI18nContext()
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isArabic = currentLanguage === 'ar'

  /**
   * Group selectable items by their category
   */
  const groupedItems = selectableItems.reduce((acc, item) => {
    const section = item.category || 'Uncategorized'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(item)
    return acc
  }, {})

  /**
   * Handle confirmation from the modal
   * Converts selected items to addOns array and triggers add to cart
   */
  const handleConfirm = (selectedItems, totalPrice) => {
    // Convert selectedItems object to an array of add-on IDs
    const addOnsArray = Object.entries(selectedItems).flatMap(([id, qty]) =>
      Array(qty).fill(id),
    )

    onhandleAddToCart({
      id: meal.id,
      name: meal.name,
      image: meal.image_url || meal.image || '',
      addOns: addOnsArray,
      price: totalPrice,
      qty: 1,
    })

    onClose()
  }

  // Get display values for price, name, and description (with localization)
  const displayPrice = meal.price || meal.base_price || 0
  const mealName = isArabic ? meal.name_arabic || meal.name : meal.name
  const mealDescription = isArabic
    ? meal.description_arabic || meal.description
    : meal.description

  return (
    <>
      {/* Customizable Meal Card */}
      <Box
        maxW="300px"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={colorMode === 'dark' ? 'gray.800' : 'secondary.300'}
        transition="transform 0.3s"
        _hover={{ transform: 'translateY(-5px)' }}
        onClick={onOpen}
        cursor="pointer"
      >
        <Image
          src={
            meal.image_url ||
            meal.thumbnail_url ||
            meal.image ||
            mealImage
          }
          alt={mealName}
          height="200px"
          width="100%"
          objectFit="cover"
        />
        <Box p="4">
          <Flex justify="space-between" align="baseline" mb="2">
            <Heading size="md" color="brand.700" textAlign="left" isTruncated>
              {mealName}
            </Heading>
            <Text fontWeight="bold" fontSize="md" color="gray.800">
              {displayPrice.toFixed(2)} {t('common.currency')}
            </Text>
          </Flex>
          <Text fontSize="sm" color="gray.600" mb="3" noOfLines={2}>
            {mealDescription}
          </Text>
          <Box mt={2}>
            <Text fontWeight="bold" mb={1}>
              {t('menuPage.chooseItems')}
            </Text>
            <Text fontSize="sm" color="gray.500" mb={1}>
              {t('menuPage.freeItems', {
                count: Object.values(SECTION_FREE_COUNTS).reduce(
                  (acc, count) => acc + count.value,
                  0,
                ),
              })}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Modal for customizing meal */}
      <CustomizableMealModal
        isOpen={isOpen}
        onClose={onClose}
        meal={meal}
        groupedItems={groupedItems}
        isArabic={isArabic}
        t={t}
        sectionFreeCounts={SECTION_FREE_COUNTS}
        onConfirm={handleConfirm}
      />
    </>
  )
}

export default CustomizableMealCard