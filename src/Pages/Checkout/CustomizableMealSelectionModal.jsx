import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Flex,
  SimpleGrid,
  Text,
  Box,
  Button,
  Tag,
  Heading,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const CustomizableMealSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  saladItems,
  t,
  isArabic,
}) => {
  const [selectedItems, setSelectedItems] = useState({})
  const [groupedItems, setGroupedItems] = useState({})
  const [sectionFreeCounts, setSectionFreeCounts] = useState({})

  useEffect(() => {
    if (saladItems && saladItems.length > 0) {
      // Group items by section
      const grouped = {}
      const freeCounts = {}

      saladItems.forEach((item) => {
        if (!grouped[item.section]) {
          grouped[item.section] = []
          freeCounts[item.section] = {
            value: 1, // Allow only 1 item per section
            key_arabic: item.section_arabic || item.section,
          }
        }
        grouped[item.section].push(item)
      })

      setGroupedItems(grouped)
      setSectionFreeCounts(freeCounts)
    }
  }, [saladItems])

  const handleSelectItem = (item) => {
    setSelectedItems((prev) => {
      // Check if we already have an item from this section
      const sectionItems = Object.keys(prev).filter((id) => {
        const selectedItem = saladItems.find((i) => i.id === id)
        return selectedItem?.section === item.section
      })

      // If we already have an item from this section, replace it
      if (sectionItems.length > 0) {
        const newItems = { ...prev }
        delete newItems[sectionItems[0]] // Remove the previous item from this section
        return {
          ...newItems,
          [item.id]: 1, // Add the new item
        }
      }

      // Otherwise just add the new item
      return {
        ...prev,
        [item.id]: 1,
      }
    })
  }

  const calculateTotal = () => {
    return Object.keys(selectedItems).reduce((total, itemId) => {
      const item = saladItems.find((i) => i.id === itemId)
      return total + (item?.price || 0) * selectedItems[itemId]
    }, 0)
  }

  const totalSelectedItems = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0)

  const renderSectionHeader = (section) => {
    return (
      <Text fontWeight="bold" mb={2}>
        {isArabic ? groupedItems[section]?.[0]?.section_arabic || section : section}
        <Text as="span" fontSize="sm" color="gray.500" ml={2}>
          ({t('menuPage.selectUpTo')} 1)
        </Text>
      </Text>
    )
  }

  const renderItemContent = (item) => {
    return (
      <Flex direction="column" flex="1">
        <Text fontWeight="medium">{isArabic ? item.name_arabic : item.name}</Text>
        <Text fontSize="sm" color="gray.600">
          {item.price} {t('common.currency')}
        </Text>
      </Flex>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent sx={{ padding: '2vw', width: '80%', minWidth: '75vw', maxHeight: '85vh' }}>
        <ModalHeader sx={{ paddingTop: '6vh' }}>
          <Flex justify="space-between" align="center" w="100%">
            <Heading fontSize="xl" fontWeight="bold">
              {t('checkout.customizeYourSalad')}
            </Heading>
            <Text fontWeight="bold" color="green.600" fontSize="0.5em" mx={2}>
              {t('checkout.customizePolicy')}
            </Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
          <Text mb={4} fontSize="sm" color="gray.600">
            {t('checkout.customizeSaladInstructions')}
          </Text>

          <SimpleGrid p={10} m={0} columns={[1, 2]} spacing={3} bg={'warning.50'}>
            {Object.entries(groupedItems).map(([section, items]) => (
              <Box key={section} mb={6}>
                {renderSectionHeader(section)}

                {items.map((item) => (
                  <Flex
                    key={item.id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    bg={(selectedItems[item.id] || 0) > 0 ? 'brand.100' : 'white'}
                    onClick={() => handleSelectItem(item)}
                    cursor="pointer"
                  >
                    {renderItemContent(item)}

                    {(selectedItems[item.id] || 0) > 0 && (
                      <Flex align="center" gap={2} onClick={(e) => e.stopPropagation()}>
                        <Text minW="30px" textAlign="center">
                          {selectedItems[item.id]}
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                ))}
              </Box>
            ))}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Tag mr={4} colorScheme="green">
            {t('menuPage.selectedCount', { count: totalSelectedItems })}
          </Tag>

          <Button sx={{ marginX: 6 }} colorScheme="brand" onClick={() => onConfirm(selectedItems)}>
            {t('checkout.confirmSelection')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CustomizableMealSelectionModal
