import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Text,
  Tag,
  Button,
  Flex,
  Box,
  Badge,
  Heading,
} from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'

/**
 * CustomizableMealModal
 * Modal for selecting and customizing meal items with section-based free allowances and extra charges.
 *
 * Props:
 * - isOpen: boolean - Modal open state
 * - onClose: function - Close handler
 * - meal: object - Meal data (with base_price, name, etc.)
 * - groupedItems: { [section: string]: array } - Items grouped by section/category
 * - isArabic: boolean - Whether to display Arabic text
 * - t: function - Translation function
 * - sectionFreeCounts: { [section: string]: { value: number, key_arabic?: string } }
 * - onConfirm: function(selectedItems, totalPrice) - Confirm handler
 */
export const CustomizableMealModal = ({
  isOpen,
  onClose,
  meal,
  groupedItems,
  isArabic,
  t,
  sectionFreeCounts,
  onConfirm,
}) => {
  // State: selected items only - total price will be calculated
  const [selectedItems, setSelectedItems] = useState({})

  // Reset state when modal opens/closes or meal changes
  useEffect(() => {
    if (isOpen) {
      setSelectedItems({})
    }
  }, [isOpen, meal])

  /**
   * Calculate total price based on selected items - using useMemo for performance
   */
  const totalPrice = useMemo(() => {
    let price = meal.base_price || meal.price || 0
    
    // Group selected items by section for charging calculation
    const sectionItems = {}
    
    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      if (quantity <= 0) return
      
      // Find the item in groupedItems
      let item = null
      let itemSection = null
      
      for (const [section, items] of Object.entries(groupedItems)) {
        item = items.find((i) => i.id == itemId)
        if (item) {
          itemSection = section
          break
        }
      }
      
      if (item && itemSection) {
        if (!sectionItems[itemSection]) {
          sectionItems[itemSection] = []
        }
        sectionItems[itemSection].push({ item, quantity })
      }
    })

    // Calculate extra charges for each section
    Object.entries(sectionItems).forEach(([section, items]) => {
      const freeAllowance = sectionFreeCounts[section]?.value || 0
      const totalQuantityInSection = items.reduce((sum, { quantity }) => sum + quantity, 0)
      
      if (totalQuantityInSection > freeAllowance) {
        // Sort items by price (most expensive first) to charge for expensive items
        const sortedItems = [...items].sort(
          (a, b) => (b.item.price || 0) - (a.item.price || 0)
        )
        
        let remainingFreeItems = freeAllowance
        
        for (const { item, quantity } of sortedItems) {
          const itemPrice = item.price || 0
          
          if (remainingFreeItems >= quantity) {
            // All items in this entry are free
            remainingFreeItems -= quantity
          } else if (remainingFreeItems > 0) {
            // Some items are free, some are charged
            const chargedQuantity = quantity - remainingFreeItems
            price += chargedQuantity * itemPrice
            remainingFreeItems = 0
          } else {
            // All items in this entry are charged
            price += quantity * itemPrice
          }
        }
      }
    })
    
    return price
  }, [selectedItems, meal, groupedItems, sectionFreeCounts])

  /**
   * Select or deselect an item (toggle, default quantity 1)
   */
  const handleSelectItem = (item) => {
    setSelectedItems((prev) => {
      if (prev[item.id]) {
        const { [item.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [item.id]: 1 }
    })
  }

  /**
   * Change quantity for a specific item
   */
  const handleQuantityChange = (itemId, delta, e) => {
    if (e) e.stopPropagation()
    
    setSelectedItems((prev) => {
      const currentQty = prev[itemId] || 0
      const newQty = currentQty + delta
      
      if (newQty <= 0) {
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      
      return { ...prev, [itemId]: newQty }
    })
  }

  /**
   * Get section usage statistics
   */
  const getSectionUsage = useMemo(() => {
    const usageMap = {}
    
    Object.entries(groupedItems).forEach(([section, items]) => {
      const sectionSelectedItems = items.filter((item) => selectedItems[item.id] > 0)
      const totalSelected = sectionSelectedItems.reduce(
        (sum, item) => sum + (selectedItems[item.id] || 0),
        0
      )
      const freeAllowance = sectionFreeCounts[section]?.value || 0
      
      usageMap[section] = {
        selected: totalSelected,
        free: freeAllowance,
        exceeding: Math.max(0, totalSelected - freeAllowance),
        withinLimit: Math.min(totalSelected, freeAllowance)
      }
    })
    
    return usageMap
  }, [selectedItems, groupedItems, sectionFreeCounts])

  /**
   * Get charged amount for a section
   */
  const getSectionChargedAmount = (section, items) => {
    const usage = getSectionUsage[section]
    if (!usage || usage.exceeding === 0) return 0

    const sectionSelectedItems = items
      .filter((item) => selectedItems[item.id] > 0)
      .sort((a, b) => (b.price || 0) - (a.price || 0))

    let chargedAmount = 0
    let itemsToCharge = usage.exceeding

    for (const item of sectionSelectedItems) {
      const quantity = selectedItems[item.id]
      const itemPrice = item.price || 0
      if (itemsToCharge <= 0) break

      const chargedQuantity = Math.min(quantity, itemsToCharge)
      chargedAmount += chargedQuantity * itemPrice
      itemsToCharge -= chargedQuantity
    }

    return chargedAmount
  }

  /**
   * Get display info for an item
   */
  const getItemDisplayInfo = (item) => {
    const itemName = isArabic ? (item.name_arabic || item.name) : item.name
    const itemDescription = isArabic ? (item.description_arabic || item.description) : item.description
    const itemPrice = item.price || 0
    const itemCalories = item.calories || 0
    
    return {
      name: itemName,
      description: itemDescription,
      price: itemPrice,
      calories: itemCalories,
      isAvailable: item.is_available !== false
    }
  }

  /**
   * Get section display name
   */
  const getSectionDisplayName = (section) => {
    const sectionConfig = sectionFreeCounts[section]
    if (isArabic && sectionConfig?.key_arabic) {
      return sectionConfig.key_arabic
    }
    return section
  }

  // Meal display name
  const mealName = isArabic ? (meal?.name_arabic || meal?.name) : meal?.name

  // Total selected items
  const totalSelectedItems = Object.values(selectedItems).reduce((acc, curr) => acc + curr, 0)

  // Confirm handler
  const handleConfirm = () => {
    onConfirm(selectedItems, totalPrice)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white" borderRadius="md" maxW="90vw" maxH="90vh" overflowY="auto">
        <ModalHeader>
          <Flex justify="space-between" align="center" w="100%">
            <Text fontSize="lg" fontWeight="bold">
              {mealName}
            </Text>
            <Text fontWeight="bold" color="green.600">
              {totalPrice.toFixed(2)} {t('common.currency')}
            </Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Section free allowance summary */}
          <Text mb={4} fontSize="sm" color="gray.600">
            {t('menuPage.selectUpTo')}{' '}
            {Object.entries(sectionFreeCounts).map(([section, data], index, array) => (
              <span key={section}>
                <strong>{getSectionDisplayName(section)}</strong>: {data.value}{' '}
                {t('menuPage.free')}
                {index < array.length - 1 ? ', ' : ''}
              </span>
            ))}
          </Text>

          {/* Items grid by section */}
          <SimpleGrid columns={[1, 2]} spacing={4}>
            {Object.entries(groupedItems).map(([section, items]) => {
              const usage = getSectionUsage[section]
              const chargedAmount = getSectionChargedAmount(section, items)
              // Only show available items
              const availableItems = items.filter(item => item.is_available !== false)
              
              return (
                <Box key={section} mb={6}>
                  {/* Section header and usage badge */}
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="sm" color="brand.700">
                      {getSectionDisplayName(section)}
                    </Heading>
                    <Flex align="center" gap={2}>
                      <Text fontSize="xs" color="gray.500">
                        {sectionFreeCounts[section]?.value || 0} {t('menuPage.free')}
                      </Text>
                      {usage && usage.selected > 0 && (
                        <Badge
                          colorScheme={usage.selected <= usage.free ? 'green' : 'orange'}
                          fontSize="xs"
                        >
                          {usage.selected}/{usage.free}
                          {usage.exceeding > 0 && ` (+${usage.exceeding})`}
                        </Badge>
                      )}
                    </Flex>
                  </Flex>

                  {/* Section charge summary */}
                  {usage && usage.exceeding > 0 && chargedAmount > 0 && (
                    <Box mb={2} p={2} bg="orange.50" borderRadius="md">
                      <Text fontSize="xs" color="orange.700">
                        {usage.exceeding} {usage.exceeding === 1 ? 'item' : 'items'} over limit: +{chargedAmount.toFixed(2)} {t('common.currency')}
                      </Text>
                    </Box>
                  )}

                  {/* Section free status */}
                  {usage && usage.withinLimit > 0 && (
                    <Box mb={2} p={2} bg="green.50" borderRadius="md">
                      <Text fontSize="xs" color="green.700">
                        {usage.withinLimit} {usage.withinLimit === 1 ? 'item' : 'items'} free ({usage.free - usage.withinLimit} remaining)
                      </Text>
                    </Box>
                  )}

                  {/* Items in section */}
                  {availableItems.map((item) => {
                    const isSelected = (selectedItems[item.id] || 0) > 0
                    const quantity = selectedItems[item.id] || 0
                    const displayInfo = getItemDisplayInfo(item)
                    
                    return (
                      <Flex
                        key={item.id}
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        align="center"
                        justify="space-between"
                        bg={isSelected ? 'blue.50' : 'white'}
                        onClick={() => handleSelectItem(item)}
                        cursor="pointer"
                        mb={2}
                        opacity={displayInfo.isAvailable ? 1 : 0.6}
                      >
                        <Box flex="1">
                          <Text fontWeight="bold">
                            {displayInfo.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {displayInfo.price > 0 ? `+${displayInfo.price.toFixed(2)} ${t('common.currency')}/item` : 'Free'}
                            {usage && usage.selected >= usage.free && ' (if over limit)'}
                          </Text>
                          {displayInfo.description && (
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              {displayInfo.description}
                            </Text>
                          )}
                          {displayInfo.calories > 0 && (
                            <Text fontSize="xs" color="gray.500">
                              {displayInfo.calories} cal
                            </Text>
                          )}
                        </Box>

                        {/* Quantity controls */}
                        {isSelected && (
                          <Flex
                            direction={['column', 'column', 'row']}
                            align="center"
                            gap={1}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="xs"
                              onClick={(e) => handleQuantityChange(item.id, 1, e)}
                              colorScheme="brand"
                              variant="outline"
                            >
                              +
                            </Button>
                            <Text minW="30px" textAlign="center" fontWeight="bold">
                              {quantity}
                            </Text>
                            <Button
                              size="xs"
                              onClick={(e) => handleQuantityChange(item.id, -1, e)}
                              colorScheme="red"
                              variant="outline"
                            >
                              -
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    )
                  })}
                </Box>
              )
            })}
          </SimpleGrid>
        </ModalBody>

        {/* Footer: selected count, total price, confirm button */}
        <ModalFooter>
          <Flex align="center" gap={4} w="100%">
            <Tag colorScheme="blue">
              {t('menuPage.selectedCount', { count: totalSelectedItems }) ||
                `Selected: ${totalSelectedItems}`}
            </Tag>
            <Tag colorScheme="green">
              {t('menuPage.totalPrice') || 'Total'}: {totalPrice.toFixed(2)} {t('common.currency')}
            </Tag>
            <Button
              colorScheme="brand"
              onClick={handleConfirm}
              ml="auto"
              isDisabled={totalSelectedItems === 0}
            >
              {t('menuPage.addToCart') || 'Add to Cart'}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}