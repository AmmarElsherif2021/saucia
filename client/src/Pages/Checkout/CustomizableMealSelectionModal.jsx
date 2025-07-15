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
  Icon,
  Tooltip,
} from '@chakra-ui/react'
import { useUserAllergies } from '../../hooks/userHooks' 
import { useAuthContext } from '../../Contexts/AuthContext'
import { WarningIcon } from '@chakra-ui/icons'


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
  
  // Use allergy hook instead of AuthContext
  const { allergies } = useUserAllergies()
  const userAllergies = allergies?.map(allergy => allergy?.name?.toLowerCase())

  useEffect(() => {
    // Group items by section
    if (saladItems && saladItems.length > 0) {
      const grouped = {}
      const freeCounts = {}

      saladItems.forEach((item) => {
        if (!grouped[item.section]) {
          grouped[item.section] = []
          freeCounts[item.section] = {
            value: 1,
            key_arabic: item.section_arabic || item.section,
          }
        }
        grouped[item.section].push(item)
      })

      setGroupedItems(grouped)
      setSectionFreeCounts(freeCounts)
    }
  }, [saladItems])

  // Function to check if an item contains user's allergens
  const isItemRestricted = (item) => {
    if (!item?.allergens || userAllergies.length === 0) {
      return false
    }

    return item.allergens.some((allergen) => {
      const allergenNameEn = allergen.en?.toLowerCase() || ''
      const allergenNameAr = allergen.ar?.toLowerCase() || ''

      return userAllergies.some(userAllergy => 
        userAllergy.includes(allergenNameEn) || 
        userAllergy.includes(allergenNameAr)
      )
    })
  }

  const handleSelectItem = (item) => {
    if (isItemRestricted(item)) return

    setSelectedItems((prev) => {
      // Find existing item in same section
      const existingItemId = Object.keys(prev).find(id => {
        const selectedItem = saladItems.find(i => i.id === id)
        return selectedItem?.section === item.section
      })

      // Create new selection object
      const newItems = { ...prev }
      if (existingItemId) delete newItems[existingItemId]
      return { ...newItems, [item.id]: 1 }
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
    const isRestricted = isItemRestricted(item)

    return (
      <Flex direction="column" flex="1">
        <Flex align="center" gap={2}>
          <Text
            fontWeight="medium"
            color={isRestricted ? 'gray.400' : 'inherit'}
            textDecoration={isRestricted ? 'line-through' : 'none'}
          >
            {isArabic ? item.name_arabic : item.name}
          </Text>
          {isRestricted && (
            <Tooltip
              label={t('checkout.allergenNotice')}
              placement="top"
            >
              <Icon as={WarningIcon} color="red.500" boxSize={4} />
            </Tooltip>
          )}
        </Flex>
        {isRestricted && item.allergens && (
          <Text fontSize="xs" color="red.500" mt={1}>
            {t('contains')}:{' '}
            {item.allergens
              .map(allergen => isArabic ? allergen.ar : allergen.en)
              .join(', ')}
          </Text>
        )}
      </Flex>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent sx={{ padding: '2vw', width: '90%', minWidth: '75vw', maxHeight: '90vh' }}>
        <ModalHeader sx={{ paddingTop: '6vh' }}>
          <Flex justify="space-between" align="center" w="100%" direction={'column'}>
            <Heading fontSize="1.2em" fontWeight="bold">
              {t('checkout.customizeYourSalad')}
            </Heading>
            <Text fontWeight="bold" color="green.600" fontSize="0.4em" mx={1}>
              {t('checkout.customizePolicy')}
            </Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} fontSize="sm" color="gray.600">
            {t('checkout.customizeSaladInstructions')}
          </Text>

          <SimpleGrid p={10} m={0} columns={[1, 2]} spacing={3} bg={'accent.300'} borderRadius={'md'} sx={{ maxHeight: '40vh', overflowY: 'scroll' }}>
            {Object.entries(groupedItems).map(([section, items]) => (
              <Box key={section} mb={6}>
                {renderSectionHeader(section)}

                {items.map((item) => {
                  const isRestricted = isItemRestricted(item)
                  const isSelected = (selectedItems[item.id] || 0) > 0

                  return (
                    <Flex
                      key={item.id}
                      p={1}
                      m={1}
                      height={'fit-content'}
                      minHeight={12}
                      borderWidth={0}
                      borderRadius="md"
                      align="center"
                      justify="space-between"
                      bg={isSelected ? 'brand.300' : isRestricted ? 'gray.50' : 'white'}
                      color={'brand.800'}
                      opacity={isRestricted ? 0.6 : 1}
                      onClick={() => handleSelectItem(item)}
                      cursor={isRestricted ? 'not-allowed' : 'pointer'}
                      _hover={isRestricted ? {} : { bg: isSelected ? 'brand.400' : 'gray.50' }}
                      borderColor={isRestricted ? 'red.200' : 'gray.200'}
                    >
                      {renderItemContent(item)}

                      {isSelected && !isRestricted && (
                        <Flex align="center" gap={2} onClick={(e) => e.stopPropagation()}>
                          <Text minW="30px" textAlign="center">
                            {selectedItems[item.id]}
                          </Text>
                        </Flex>
                      )}
                    </Flex>
                  )
                })}
              </Box>
            ))}
          </SimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Tag mr={4} colorScheme="green">
            {t('menuPage.selectedCount', { count: totalSelectedItems })}
          </Tag>

          <Button sx={{ marginX: 2 }} colorScheme="brand" onClick={() => onConfirm(selectedItems)}>
            {t('checkout.confirmSelection')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CustomizableMealSelectionModal
