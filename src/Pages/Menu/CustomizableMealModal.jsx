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

export const CustomizableMealModal = ({
  isOpen,
  onClose,
  meal,
  groupedItems,
  selectedItems,
  handleSelectItem,
  handleQuantityChange,
  calculateTotal,
  totalSelectedItems,
  isArabic,
  t,
  sectionFreeCounts,
  renderSectionHeader,
  renderItemContent,
  onConfirm,
}) => {
  // Helper function to calculate section usage
  const getSectionUsage = (section, items) => {
    const sectionSelectedItems = items.filter((item) => selectedItems[item.id] > 0)
    const totalSelected = sectionSelectedItems.reduce(
      (sum, item) => sum + (selectedItems[item.id] || 0),
      0,
    )
    const freeAllowance = sectionFreeCounts[section]?.value || 0

    return {
      selected: totalSelected,
      free: freeAllowance,
      charged: Math.max(0, totalSelected - freeAllowance),
    }
  }

  // Helper function to get charged amount for a section
  const getSectionChargedAmount = (section, items) => {
    const usage = getSectionUsage(section, items)
    if (usage.charged === 0) return 0

    // Get selected items in this section sorted by price
    const sectionSelectedItems = items
      .filter((item) => selectedItems[item.id] > 0)
      .sort((a, b) => (a.addon_price || 0) - (b.addon_price || 0))

    let chargedAmount = 0
    let remainingFreeItems = usage.free

    for (const item of sectionSelectedItems) {
      const quantity = selectedItems[item.id]
      const itemPrice = item.addon_price || 0

      if (remainingFreeItems >= quantity) {
        remainingFreeItems -= quantity
      } else if (remainingFreeItems > 0) {
        const chargedQuantity = quantity - remainingFreeItems
        chargedAmount += chargedQuantity * itemPrice
        remainingFreeItems = 0
      } else {
        chargedAmount += quantity * itemPrice
      }
    }

    return chargedAmount
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white" borderRadius="md" maxW="90vw" maxH="90vh" overflowY="auto">
        <ModalHeader>
          <Flex justify="space-between" align="center" w="100%">
            <Text fontSize="lg" fontWeight="bold">
              {isArabic ? meal?.name_arabic : meal?.name}
            </Text>
            <Text fontWeight="bold" color="green.600">
              {calculateTotal().toFixed(2)} {t('common.currency')}
            </Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} fontSize="sm" color="gray.600">
            {t('menuPage.selectUpTo')}{' '}
            {Object.entries(sectionFreeCounts).map(([section, data], index, array) => (
              <span key={section}>
                <strong>{isArabic ? data.key_arabic : section}</strong>: {data.value}{' '}
                {t('menuPage.free')}
                {index < array.length - 1 ? ', ' : ''}
              </span>
            ))}
          </Text>

          <SimpleGrid columns={[1, 2]} spacing={4}>
            {Object.entries(groupedItems).map(([section, items]) => {
              const usage = getSectionUsage(section, items)
              const chargedAmount = getSectionChargedAmount(section, items)

              return (
                <Box key={section} mb={6}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Heading size="sm" color="brand.700">
                      {isArabic ? sectionFreeCounts[section]?.key_arabic || section : section}
                    </Heading>
                    <Flex align="center" gap={2}>
                      <Text fontSize="xs" color="gray.500">
                        {sectionFreeCounts[section]?.value || 0} {t('menuPage.free')}
                      </Text>
                      {usage.selected > 0 && (
                        <Badge
                          colorScheme={usage.selected <= usage.free ? 'green' : 'orange'}
                          fontSize="xs"
                        >
                          {usage.selected}/{usage.free + usage.charged}
                        </Badge>
                      )}
                    </Flex>
                  </Flex>

                  {/* Show section charge summary if there are charged items */}
                  {chargedAmount > 0 && (
                    <Box mb={2} p={2} bg="orange.50" borderRadius="md">
                      <Text fontSize="xs" color="orange.700">
                        {t('menuPage.extraCharge', {
                          count: usage.charged,
                          amount: chargedAmount.toFixed(2),
                        }) ||
                          `Extra ${usage.charged} items: +${chargedAmount.toFixed(2)} ${t('common.currency')}`}
                      </Text>
                    </Box>
                  )}

                  {items.map((item) => {
                    const isSelected = (selectedItems[item.id] || 0) > 0
                    const quantity = selectedItems[item.id] || 0

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
                      >
                        <Box flex="1">
                          <Text fontWeight="bold">
                            {isArabic ? item.name_arabic || item.name : item.name}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            +{(item.addon_price || 0).toFixed(2)} {t('common.currency')}/item
                          </Text>
                        </Box>

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
                              colorScheme="error"
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

        <ModalFooter>
          <Flex align="center" gap={4} w="100%">
            <Tag colorScheme="blue">
              {t('menuPage.selectedCount', { count: totalSelectedItems }) ||
                `Selected: ${totalSelectedItems}`}
            </Tag>
            <Tag colorScheme="green">
              {t('menuPage.totalPrice') || 'Total'}: {calculateTotal().toFixed(2)}{' '}
              {t('common.currency')}
            </Tag>
            <Button
              colorScheme="brand"
              onClick={onConfirm}
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
