import { useState } from 'react'
import mealImage from '../../assets/menu/defaultMeal.JPG'
import { Box, Text, useDisclosure, Image, Heading, Flex } from '@chakra-ui/react'
import { CustomizableMealModal } from './CustomizableMealModal'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'

const SALAD_SECTION_FREE_COUNTS = {
  Protein: { value: 0, key_arabic: 'بروتين' },
  Nuts: { value: 1, key_arabic: 'مكسرات' },
  Dressings: { value: 2, key_arabic: 'الصلصات' },
  Fruits: { value: 1, key_arabic: 'الفواكه' },
  Cheese: { value: 0, key_arabic: 'جبن' },
  Greens: { value: 2, key_arabic: 'الخضار الورقية' },
  Toppings: { value: 3, key_arabic: 'الإضافات' },
  Vegetables: { value: 4, key_arabic: 'خضروات' },
}

const FRUIT_SECTION_FREE_COUNT = {
  'salad-fruits': { value: 5, key_arabic: 'سلطة فواكه' },
}

export const CustomizableMealCard = ({ meal, selectableItems, onhandleAddToCart }) => {
  const SECTION_FREE_COUNTS =
    meal.name === 'Make your own fruit salad' ? FRUIT_SECTION_FREE_COUNT : SALAD_SECTION_FREE_COUNTS
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { currentLanguage } = useI18nContext()
  const { t } = useTranslation()
  const isArabic = currentLanguage === 'ar'
  const [selectedItems, setSelectedItems] = useState({})

  const groupedItems = selectableItems.reduce((acc, item) => {
    const section = item.section || 'Uncategorized'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(item)
    return acc
  }, {})

  // Calculate section-based charges with individual item pricing
  const calculateTotal = () => {
    let totalPrice = meal.price

    // Group selected items by section with their details
    const sectionItems = {}

    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      const item = selectableItems.find((i) => i.id === itemId)
      if (item && quantity > 0) {
        if (!sectionItems[item.section]) {
          sectionItems[item.section] = []
        }
        sectionItems[item.section].push({
          item,
          quantity,
        })
      }
    })

    // Calculate charges for each section
    Object.entries(sectionItems).forEach(([section, items]) => {
      const freeAllowance = SECTION_FREE_COUNTS[section]?.value || 0
      const totalQuantityInSection = items.reduce((sum, { quantity }) => sum + quantity, 0)

      if (totalQuantityInSection > freeAllowance) {
        // Sort items by price (ascending) to charge the cheapest items first as free
        const sortedItems = [...items].sort(
          (a, b) => (a.item.addon_price || 0) - (b.item.addon_price || 0),
        )

        let remainingFreeItems = freeAllowance

        for (const { item, quantity } of sortedItems) {
          const itemPrice = item.addon_price || 0

          if (remainingFreeItems >= quantity) {
            // All items of this type are free
            remainingFreeItems -= quantity
          } else if (remainingFreeItems > 0) {
            // Some items are free, some are charged
            const chargedQuantity = quantity - remainingFreeItems
            totalPrice += chargedQuantity * itemPrice
            remainingFreeItems = 0
          } else {
            // All items are charged
            totalPrice += quantity * itemPrice
          }
        }
      }
    })

    return totalPrice
  }

  // Handle selecting a single item
  const handleSelectItem = (item) => {
    setSelectedItems((prev) => {
      // If item is already selected, deselect it
      if (prev[item.id]) {
        const { [item.id]: _, ...rest } = prev
        return rest
      }
      // Otherwise select it with quantity 1
      return {
        ...prev,
        [item.id]: 1,
      }
    })
  }

  // Handle increasing/decreasing quantity for a specific item only
  const handleQuantityChange = (itemId, delta, e) => {
    if (e) {
      e.stopPropagation()
    }

    setSelectedItems((prev) => {
      const currentQty = prev[itemId] || 0
      const newQty = currentQty + delta

      // Remove item if quantity would be zero or negative
      if (newQty <= 0) {
        const { [itemId]: _, ...rest } = prev
        return rest
      }

      // Update only this specific item's quantity
      return {
        ...prev,
        [itemId]: newQty,
      }
    })
  }

  const totalSelectedItems = Object.values(selectedItems).reduce((acc, curr) => acc + curr, 0)

  const handleConfirm = () => {
    // AddOns array
    const addOnsArray = Object.entries(selectedItems).flatMap(([id, qty]) => Array(qty).fill(id))

    onhandleAddToCart({
      id: meal.id,
      name: meal.name,
      image: meal.image || '',
      addOns: addOnsArray,
      price: calculateTotal(),
      qty: 1,
    })

    onClose()
  }

  // Reset selections when opening the modal
  const handleOpenModal = () => {
    setSelectedItems({})
    onOpen()
  }

  return (
    <>
      {/* Customizable Meal Card */}
      <Box
        maxW="300px"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg="gray.100"
        transition="transform 0.3s"
        _hover={{ transform: 'translateY(-5px)' }}
        onClick={handleOpenModal}
        cursor="pointer"
      >
        <Image
          src={meal.image || mealImage}
          alt={meal.name}
          height="200px"
          width="100%"
          objectFit="cover"
        />
        <Box p="4">
          <Flex justify="space-between" align="baseline" mb="2">
            <Heading size="md" color="brand.700" textAlign="left" isTruncated>
              {isArabic ? meal.name_arabic : meal.name}
            </Heading>
            <Text fontWeight="bold" fontSize="md" color="gray.800">
              {meal.price.toFixed(2)} {t('common.currency')}
            </Text>
          </Flex>
          <Text fontSize="sm" color="gray.600" mb="3" noOfLines={2}>
            {meal.description}
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

      <CustomizableMealModal
        isOpen={isOpen}
        onClose={onClose}
        meal={meal}
        groupedItems={groupedItems}
        selectedItems={selectedItems}
        handleSelectItem={handleSelectItem}
        handleQuantityChange={handleQuantityChange}
        calculateTotal={calculateTotal}
        totalSelectedItems={totalSelectedItems}
        isArabic={isArabic}
        t={t}
        sectionFreeCounts={SECTION_FREE_COUNTS}
        renderSectionHeader={(section, counts) => (
          <Flex justify="space-between" align="center" mb={2}>
            <Heading size="sm" color="brand.700">
              {isArabic ? counts[section]?.key_arabic || section : section}
            </Heading>
            <Text fontSize="xs" color="gray.500">
              {counts[section]?.value || 0} {t('menuPage.free')}
            </Text>
          </Flex>
        )}
        renderItemContent={(item) => (
          <Box>
            <Text fontWeight="bold">{item.name}</Text>
            <Text fontSize="sm" color="gray.600">
              +{item.addon_price} {t('common.currency')}/item
            </Text>
          </Box>
        )}
        onConfirm={handleConfirm}
      />
    </>
  )
}

export default CustomizableMealCard
