import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Tag,
  Button,
  Flex,
  Box,
  Badge,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  Collapse,
  Icon,
} from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { WarningIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import saladIcon from '../../assets/menu/salad.svg'
/**
 * CustomizableMealModal - Masonry Style with Expandable Sections
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
  unsafeItemIds = [],
  userAllergies = [],
  isItemSafe = () => true, 
}) => {
  const [selectedItems, setSelectedItems] = useState({})
  const [showAllergenWarning, setShowAllergenWarning] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})

  // Reset state when modal opens/closes or meal changes
  useEffect(() => {
    if (isOpen) {
      setSelectedItems({})
      setShowAllergenWarning(false)
      setExpandedSections({})
    }
  }, [isOpen, meal])

  // Check if user has selected any unsafe items
  const hasSelectedUnsafeItems = useMemo(() => {
    return Object.keys(selectedItems).some(itemId => 
      selectedItems[itemId] > 0 && unsafeItemIds.includes(parseInt(itemId))
    )
  }, [selectedItems, unsafeItemIds])

  // Show warning when unsafe items are selected
  useEffect(() => {
    if (hasSelectedUnsafeItems && !showAllergenWarning) {
      setShowAllergenWarning(true)
    }
  }, [hasSelectedUnsafeItems, showAllergenWarning])

  /**
   * Toggle section expansion
   */
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

/**
 * Calculate total price based on selected items - using useMemo for performance
 */
const totalPrice = useMemo(() => {
  let price = meal.base_price || meal.price || 0
  
  // Group selected items by section for charging calculation
  const sectionItems = {}
  
  Object.entries(selectedItems).forEach(([itemId, quantity]) => {
    if (quantity <= 0) return
    
    // Find the item in groupedItems and its section
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
      // Store both item and total quantity for this section
      sectionItems[itemSection].push({ 
        item, 
        quantity,
        price: item.price || 0
      })
    }
  })

  // Calculate extra charges for each section based on free allowances
  Object.entries(sectionItems).forEach(([section, itemsInSection]) => {
    const freeAllowance = sectionFreeCounts[section]?.value || 0
    
    // Calculate total quantity selected in this section
    const totalQuantityInSection = itemsInSection.reduce(
      (sum, { quantity }) => sum + quantity, 0
    )
    
    // Only charge if total quantity exceeds free allowance
    if (totalQuantityInSection > freeAllowance) {
      const chargedQuantity = totalQuantityInSection - freeAllowance
      
      // Sort items by price (most expensive first) to charge expensive items first
      let sortedItems = [...itemsInSection].sort(
        (a, b) => b.price - a.price
      )
      
      let remainingChargedQuantity = chargedQuantity
      
      // Charge the most expensive items first until we account for all charged quantity
      sortedItems.map(({ item, quantity, price: itemPrice }) => {
        if (remainingChargedQuantity <= 0) return null

        const chargeableFromThisItem = Math.min(quantity, remainingChargedQuantity)
        price += chargeableFromThisItem * itemPrice
        remainingChargedQuantity -= chargeableFromThisItem
        return null
      })
    }
  })
  
  return price
}, [selectedItems, meal, groupedItems, sectionFreeCounts])

  /**
   * Change quantity for a specific item
   */
  const handleQuantityChange = (itemId, delta, e) => {
    if (e) e.stopPropagation()
    
    setSelectedItems((prev) => {
      const currentQty = prev[itemId] || 0
      const newQty = Math.max(0, currentQty + delta)
      
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      
      return { ...prev, [itemId]: newQty }
    })
  }

  /**
   * Select or deselect an item
   */
  const handleSelectItem = (item) => {
    const isSafe = isItemSafe(item)
    console.log(JSON.stringify(`JSON of Item ${JSON.stringify(item)}`))
    // If selecting an unsafe item for the first time, show warning
    if (!isSafe && !selectedItems[item.id]) {
      setShowAllergenWarning(true)
    }
    
    setSelectedItems((prev) => {
      const currentQty = prev[item.id] || 0
      if (currentQty > 0) {
        const { [item.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [item.id]: 1 }
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
   * Get section display name
   */
  const getSectionDisplayName = (section) => {
    const sectionConfig = sectionFreeCounts[section]
    if (isArabic && sectionConfig?.key_arabic) {
      return sectionConfig.key_arabic
    }
    return section
  }

  /**
   * Get allergens text for display 
   */
  const getAllergenText = (item) => {
    if (!item.allergens || !userAllergies.length) return '';
    
    const itemAllergens = (item.allergens || []).map(a => 
      isArabic ? (a.name_arabic || a.name) : a.name
    );
    
    const matching = itemAllergens.filter(allergenName => 
      userAllergies.some(userAllergy => 
        allergenName.toLowerCase().includes(userAllergy.toLowerCase())
      )
    );
    
    return matching.length 
      ? `${t('menuPage.contains')} ${matching.join(', ')}`
      : '';
  };

  /**
   * Get display info for an item
   */
  const getItemDisplayInfo = (item) => {
    const itemName = isArabic ? (item.name_arabic || item.name) : item.name
    const itemDescription = isArabic ? (item.description_arabic || item.description) : item.description
    const itemPrice = item.price || 0
    const itemCalories = item.calories || 0
    const isSafe = isItemSafe(item);
    const allergenText = getAllergenText(item);
    
    return {
      name: itemName,
      description: itemDescription,
      price: itemPrice,
      calories: itemCalories,
      isAvailable: item.is_available !== false,
      isSafe,     
      allergenText,        
      hasAllergens: !isSafe 
    }
  };

  // Meal display name
  const mealName = isArabic ? (meal?.name_arabic || meal?.name) : meal?.name

  // Total selected items
  const totalSelectedItems = Object.values(selectedItems).reduce((acc, curr) => acc + curr, 0)

  // Confirm handler
  const handleConfirm = () => {
    onConfirm(selectedItems, totalPrice);
    onClose();
  }

  // Section colors (cycling through theme colors)
  const sectionColors = ['brand', 'secondary', 'teal', 'warning', 'highlight', 'teal']
  const getSectionColor = (index) => sectionColors[index % sectionColors.length]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="white" pt={6} px={3} borderRadius="md" maxW="90vw" maxH="90vh" overflow="hidden">
        <ModalHeader position="relative" top={0} bg="white" zIndex={10} w="full">
          <Flex justify="start" align="center" w="100%">
              <Box textAlign="start" mx={8}>
                <Text fontSize="xl" fontWeight="bold" color="brand.600">
              {mealName}
            </Text>
            <Text fontWeight="bold" color="brand.600">
              {totalPrice.toFixed(2)} {t('common.currency')}
            </Text>
            </Box>
             <ModalCloseButton />
          </Flex>
         
        </ModalHeader>
        
        <ModalBody p={1} overflowY="auto">
          {/* Allergen Warning Alert */}
          {showAllergenWarning && hasSelectedUnsafeItems && (
            <Alert status="warning" mb={4} borderRadius="md" mx={2}>
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">
                  {t('menuPage.allergenWarningTitle') || 'Allergen Warning!'}
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  {t('menuPage.allergenWarningMessage') || 
                    'You have selected items that contain allergens you are sensitive to. Please review your selection carefully.'}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Masonry Grid of Sections */}
          <Box
            sx={{
              columnCount: [1, 2, 2],
              columnGap: '16px',
              px: 2
            }}
          >
            {Object.entries(groupedItems).map(([section, items], index) => {
              const usage = getSectionUsage[section]
              const isExpanded = expandedSections[section]
              const sectionColor = getSectionColor(index)
              const availableItems = items.filter(item => item.is_available !== false)
              
              return (
                <Box
                  key={section}
                  mb={4}
                  sx={{
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {/* Section Card */}
                  <Box
                    bg={`${sectionColor}.200`}
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="none"
                    transition="all 0.3s"
                    border="2px solid"
                    borderColor={isExpanded ? `${sectionColor}.200` : 'transparent'}
                  >
                    {/* Section Header - Clickable */}
                    <Flex
                      p={4}
                      cursor="pointer"
                      onClick={() => toggleSection(section)}
                      justify="space-between"
                      align="center"
                      bg={isExpanded ? `${sectionColor}.200` : 'transparent'}
                      color="brand.600"
                      _hover={{ opacity: 0.9 }}
                    >
                      <Box flex="1">
                        <Heading size="sm" mb={1}>
                          {getSectionDisplayName(section)}
                        </Heading>
                        <Text fontSize="xs" opacity={0.9}>
                          {sectionFreeCounts[section]?.value || 0} {t('menuPage.free')}
                        </Text>
                        {usage && usage.selected > 0 && (
                          <Badge
                            colorScheme={usage.selected <= usage.free ? 'green' : 'red'}
                            fontSize="xs"
                            mt={1}
                          >
                            {usage.selected}/{usage.free}
                            {usage.exceeding > 0 && ` (+${usage.exceeding})`}
                          </Badge>
                        )}
                      </Box>
                      <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} boxSize={6} />
                    </Flex>

                    {/* Expanded Section Content */}
                    <Collapse in={isExpanded} animateOpacity>
                      <Box
                        p={3}
                        bg="transparent"
                        display="grid"
                        gridTemplateColumns={['1fr', '1fr','1fr', '1fr 1fr', '1fr 1fr 1fr']}
                        gap={2}
                      >
                        {availableItems.map((item) => {
                          const displayInfo = getItemDisplayInfo(item)
                          const isDisabled = !displayInfo.isAvailable
                          const isSelected = (selectedItems[item.id] || 0) > 0
                          const isUnsafe = !displayInfo.isSafe
                          
                          return (
                            <Flex
                              key={item.id}
                              p={2}
                              mb={1}
                              borderWidth={isSelected ? '3px' : '1px'}
                              borderRadius="md"
                              borderColor={isUnsafe ? 'red.300' : `${sectionColor}.500`}
                              align="center"
                              gap={3}
                              bg={isSelected ? (isUnsafe ? 'tertiary.200' : `${sectionColor}.100`) : (isUnsafe ? 'red.25' : 'gray.50')}
                              onClick={isDisabled ? undefined : () => handleSelectItem(item)}
                              cursor={isDisabled ? 'not-allowed' : 'pointer'}
                              opacity={isDisabled ? 0.7 : 1}
                              position="relative"
                              _hover={!isDisabled ? { 
                                bg: isSelected ? (isUnsafe ? 'red.100' : `${sectionColor}.200`) : `${sectionColor}.200`,
                                transform: 'translateY(-2px)',
                                boxShadow: 'none'
                              } : {}}
                              transition="all 0.2s"
                            >
                              {/* Item Image */}
                              <Box
                                flexShrink={0}
                                width="60px"
                                height="60px"
                                borderRadius="md"
                                borderColor={`${sectionColor}.300`}
                                borderWidth={2}
                                overflow="hidden"
                                bg={`${sectionColor}.100`}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                {item.image_url ? (
                                  <Image
                                    src={item.image_url}
                                    alt={displayInfo.name}
                                    width="100%"
                                    height="100%"
                                    objectFit="cover"
                                  />
                                ) : (
                                  <Image
                                    src={saladIcon}
                                    alt="Default"
                                    width="50%"
                                    height="50%"
                                    objectFit="contain"
                                    opacity={0.5}
                                  />
                                )}
                              </Box>

                              {/* Allergen Badge */}
                              {isUnsafe && (
                                <Badge 
                                  colorScheme="red" 
                                  position="absolute"
                                  top={1}
                                  right={1}
                                  fontSize="2xs"
                                  display="flex"
                                  alignItems="center"
                                >
                                  <WarningIcon mr={1} boxSize={2} />
                                  {t('foodDetails.allergens') || 'ALLERGEN'}
                                </Badge>
                              )}

                              {/* Item Details */}
                              <Box flex="1" px={isSelected ? 1 : 0}>
                                <Text 
                                  fontWeight="bold"
                                  fontSize="sm"
                                  color={isUnsafe ? 'red.700' : 'gray.800'}
                                  noOfLines={1}
                                >
                                  {displayInfo.name}
                                </Text>
                                
                                {displayInfo.allergenText && (
                                  <Text fontSize="2xs" color="red.600" fontStyle="italic" fontWeight="semibold" noOfLines={1}>
                                    {displayInfo.allergenText}
                                  </Text>
                                )}
                                
                                <Text fontSize="xs" color="gray.600">
                                  {displayInfo.price > 0 
                                    ? `+${displayInfo.price.toFixed(2)} ${t('common.currency')}` 
                                    : t('menuPage.free')}
                                </Text>
                                
                                {displayInfo.calories > 0 && (
                                  <Text fontSize="2xs" color="gray.500">
                                    {displayInfo.calories} {t("premium.kcal")}
                                  </Text>
                                )}
                              </Box>

                              {/* Quantity Controls */}
                              {isSelected && !isDisabled && (
                                <Flex
                                  position="relative"
                                  direction="column"
                                  align="center"
                                  gap={1}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    size="xs"
                                    onClick={(e) => handleQuantityChange(item.id, 1, e)}
                                    colorScheme={isUnsafe ? "error" : "secondary"}
                                    variant="outline"
                                    minW="24px"
                                    h="24px"
                                    p={0}
                                  >
                                    +
                                  </Button>
                                  <Text fontSize="xs" fontWeight="bold" color={isUnsafe ? "red.500" : "secondary.600"}>
                                    {selectedItems[item.id]}
                                  </Text>
                                  <Button
                                    size="xs"
                                    onClick={(e) => handleQuantityChange(item.id, -1, e)}
                                    colorScheme="error"
                                    variant="outline"
                                    minW="24px"
                                    h="24px"
                                    p={0}
                                  >
                                    -
                                  </Button>
                                </Flex>
                              )}
                            </Flex>
                          )
                        })}
                      </Box>
                    </Collapse>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </ModalBody>

        {/* Footer */}
        <ModalFooter>
          <Flex align="center" gap={4} w="100%">
            <Tag colorScheme="blue">
              {t('menuPage.selectedCount', { count: totalSelectedItems }) ||
                `Selected: ${totalSelectedItems}`}
            </Tag>
            <Tag colorScheme="green">
              {t('menuPage.totalPrice') || 'Total'}: {totalPrice.toFixed(2)} {t('common.currency')}
            </Tag>
            {hasSelectedUnsafeItems && (
              <Tag colorScheme="red" size="sm">
                <WarningIcon mr={1} />
                {t('menuPage.hasAllergens') || 'Contains Allergens'}
              </Tag>
            )}
          </Flex>
          <Button
            colorScheme="brand"
            onClick={handleConfirm}
            isDisabled={totalSelectedItems === 0}
            mx={1}
          >
            {t('menuPage.addToCart') || 'Add to Cart'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}