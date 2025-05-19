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
  sectionRules,
  isArabic,
  t,
  sectionFreeCounts,
  renderSectionHeader,
  renderItemContent,
  onConfirm,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
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
            {Object.entries(sectionFreeCounts).map(([section, data]) => (
              <span key={section}>
                <strong>{isArabic ? data.key_arabic : section}</strong>: {data.value}{' '}
                {t('menuPage.free')},{' '}
              </span>
            ))}
          </Text>

          <SimpleGrid columns={[1, 2]} spacing={4}>
            {Object.entries(groupedItems).map(([section, items]) => (
              <Box key={section} mb={6}>
                {renderSectionHeader(section, sectionFreeCounts)}

                {items.map((item) => (
                  <Flex
                    key={item.id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    bg={(selectedItems[item.id] || 0) > 0 ? 'blue.50' : 'white'}
                    onClick={() => handleSelectItem(item)}
                    cursor="pointer"
                  >
                    {renderItemContent(item, selectedItems)}

                    {(selectedItems[item.id] || 0) > 0 && (
                      <Flex align="center" gap={2} onClick={(e) => e.stopPropagation()}>
                        <Button size="sm" onClick={(e) => handleQuantityChange(item.id, -1, e)}>
                          -
                        </Button>
                        <Text minW="30px" textAlign="center">
                          {selectedItems[item.id]}
                        </Text>
                        <Button size="sm" onClick={(e) => handleQuantityChange(item.id, 1, e)}>
                          +
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                ))}
              </Box>
            ))}
          </SimpleGrid>

          <ModalFooter>
            <Tag mr={4}>{t('menuPage.selectedCount', { count: totalSelectedItems })}</Tag>
            <Tag colorScheme="green" mr={4}>
              {t('menuPage.totalPrice')}: {calculateTotal().toFixed(2)} {t('common.currency')}
            </Tag>
            <Button colorScheme="blue" onClick={onConfirm}>
              {t('menuPage.addToCart')}
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
