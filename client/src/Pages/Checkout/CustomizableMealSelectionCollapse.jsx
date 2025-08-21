import { useState, useEffect } from 'react'
import {
  Collapse,
  Box,
  Flex,
  Grid,
  Text,
  Button,
  Tag,
  Heading,
  Icon,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Divider,
  useBreakpointValue,
  IconButton,
  useColorMode
} from '@chakra-ui/react'
import { useUserAllergies } from '../../Hooks/userHooks'
import { WarningIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'

// Motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 }
  }
};

const CustomizableMealSelectionCollapse = ({
  isOpen,
  onClose,
  onConfirm,
  saladItems = [],
  t,
  isArabic,
  title = 'Customize Your Meal',
  instructionText = 'Select one ingredient from each category',
  saveButtonText = 'Save Meal',
  initialSelectedItems = {},
  maxSelections = 8,
  mealIndex = 0 // Added index to identify which meal this belongs to
}) => {
  const [selectedItems, setSelectedItems] = useState(initialSelectedItems)
  const [groupedItems, setGroupedItems] = useState({})
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const { allergies } = useUserAllergies()
  const userAllergies = allergies?.map(allergy => allergy?.name?.toLowerCase()) || []
  const toast = useToast()
  const { colorMode } = useColorMode()

  // Responsive values
  const itemsPerRow = useBreakpointValue({ base: 2, sm: 3, md: 4 })
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Theme values
  const bgColor = colorMode === 'dark' ? 'brand.800' : 'brand.50'
  const cardBg = colorMode === 'dark' ? 'brand.700' : 'white'
  const borderColor = colorMode === 'dark' ? 'brand.600' : 'brand.200'
  const textColor = colorMode === 'dark' ? 'white' : 'brand.800'
  const mutedTextColor = colorMode === 'dark' ? 'brand.200' : 'brand.600'

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(initialSelectedItems)
      setCurrentCategoryIndex(0)
      
      // Group items by section with safety check
      const grouped = {}
      if (Array.isArray(saladItems)) {
        saladItems.forEach((item) => {
          if (item && item.category) {
            if (!grouped[item.category]) {
              grouped[item.category] = []
            }
            grouped[item.category].push(item)
          }
        })
      }
      setGroupedItems(grouped)
    }
  }, [isOpen, saladItems, initialSelectedItems])

  const isItemRestricted = (item) => {
    if (!item?.allergens || !userAllergies?.length) return false
    return item.allergens.some((allergen) => {
      const allergenName = allergen.en?.toLowerCase() || ''
      return userAllergies.some(userAllergy => 
        userAllergy.includes(allergenName))
    })
  }

  const getSelectedItemForCategory = (category) => {
    const categoryItems = groupedItems[category] || []
    return categoryItems.find(item => selectedItems[item.id])
  }

  const handleSelectItem = (item) => {
    if (isItemRestricted(item)) return

    setSelectedItems(prev => {
      const newItems = { ...prev }
      
      const isCurrentlySelected = !!newItems[item.id]
      
      if (isCurrentlySelected) {
        delete newItems[item.id]
      } else {
        const categoryItems = groupedItems[item.category] || []
        categoryItems.forEach(categoryItem => {
          if (newItems[categoryItem.id]) {
            delete newItems[categoryItem.id]
          }
        })
        newItems[item.id] = 1
      }
      
      return newItems
    })
  }

  const calculateTotalItems = () => {
    return Object.keys(selectedItems).length
  }

  const renderItemCard = (item) => {
    const isRestricted = isItemRestricted(item)
    const isSelected = !!selectedItems[item.id]
    const displayName = isArabic ? item.name_arabic || item.name : item.name
    
    return (
      <MotionBox
        key={item.id}
        p={2}
        borderWidth="2px"
        borderRadius="md"
        bg={isSelected ? 'brand.400' : isRestricted ? 'gray.50' : cardBg}
        borderColor={isSelected ? 'brand.500' : isRestricted ? 'red.300' : borderColor}
        onClick={() => !isRestricted && handleSelectItem(item)}
        cursor={isRestricted ? 'not-allowed' : 'pointer'}
        _hover={!isRestricted ? { 
          bg: isSelected ? 'brand.500' : 'brand.100',
          borderColor: isSelected ? 'brand.600' : 'brand.300',
          shadow: 'md'
        } : {}}
        transition="all 0.2s"
        position="relative"
        minH="80px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        textAlign="center"
        whileHover={{ scale: isRestricted ? 1 : 1.02 }}
        whileTap={{ scale: isRestricted ? 1 : 0.98 }}
      >
        {isSelected && (
          <Badge 
            colorScheme="whiteAlpha" 
            position="absolute" 
            top={1} 
            right={1}
            fontSize="2xs"
            borderRadius="full"
            px={1}
          >
            ✓
          </Badge>
        )}
        
        <VStack spacing={1}>
          <Text
            fontWeight="medium"
            color={isRestricted ? 'gray.400' : isSelected ? 'white' : textColor}
            textDecoration={isRestricted ? 'line-through' : 'none'}
            fontSize="xs"
            noOfLines={2}
            px={1}
          >
            {displayName}
          </Text>
          
          {isRestricted && (
            <Icon as={WarningIcon} color="red.400" boxSize={3} />
          )}
        </VStack>
      </MotionBox>
    )
  }

  const handleSave = () => {
    onConfirm(selectedItems, mealIndex);
  };

  const handleCancel = () => {
    setSelectedItems(initialSelectedItems);
    onClose(mealIndex);
  };

  const sectionEntries = Object.entries(groupedItems)
  const hasItems = sectionEntries.length > 0
  const totalCategories = sectionEntries.length
  
  const currentCategory = sectionEntries[currentCategoryIndex]
  const currentCategoryName = currentCategory?.[0]
  const currentItems = currentCategory?.[1] || []

  const nextCategory = () => {
    if (currentCategoryIndex < totalCategories - 1) {
      setCurrentCategoryIndex(prev => prev + 1)
    }
  }

  const prevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1)
    }
  }

  const selectedInCurrentCategory = getSelectedItemForCategory(currentCategoryName)

  return (
    <Collapse in={isOpen} animateOpacity>
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        bg={bgColor}
        borderColor={borderColor}
        mb={3}
      >
        <Box 
          p={3}
          borderBottom="1px solid"
          borderColor={borderColor}
          bg={cardBg}
        >
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="sm" color={textColor} bg="none">
                {title}
              </Heading>
              <Badge 
                colorScheme={calculateTotalItems() > 0 ? 'green' : 'gray'}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="full"
              >
                {calculateTotalItems()} {t('checkout.itemsSelected')}
              </Badge>
            </HStack>
            <Text fontSize="xs" color={mutedTextColor}>
              {instructionText}
            </Text>
          </VStack>
        </Box>
        
        <Box p={3}>
          {!hasItems ? (
            <Alert status="info" borderRadius="md" py={3} bg={cardBg}>
              <AlertIcon boxSize={4} />
              <VStack spacing={1} align="start">
                <Text fontWeight="medium" fontSize="xs" color={textColor}>
                  {t('checkout.noItemsAvailable')}
                </Text>
                <Text fontSize="2xs" color={mutedTextColor}>
                  {t('checkout.noItemsDescription')}
                </Text>
              </VStack>
            </Alert>
          ) : (
            <MotionVStack variants={containerVariants} spacing={3} align="stretch">
              {/* Category Navigation */}
              <HStack justify="space-between" align="center">
                <IconButton
                  icon={<ChevronLeftIcon />}
                  onClick={prevCategory}
                  isDisabled={currentCategoryIndex === 0}
                  variant="outline"
                  size="xs"
                  colorScheme="brand"
                  aria-label="Previous category"
                />
                
                <VStack spacing={1} flex="1">
                  <HStack align="center" spacing={2}>
                    <Text fontSize="sm" fontWeight="bold" color={textColor} noOfLines={1}>
                      {isArabic 
                        ? currentItems[0]?.category_arabic || currentCategoryName 
                        : currentCategoryName}
                    </Text>
                    {selectedInCurrentCategory && (
                      <Badge colorScheme="green" variant="solid" fontSize="2xs">
                        ✓ {t('checkout.selected')}
                      </Badge>
                    )}
                  </HStack>
                  
                  <Text fontSize="2xs" color={mutedTextColor} noOfLines={1}>
                    {selectedInCurrentCategory ? (
                      <>
                        {t('checkout.selected')}: {isArabic 
                          ? selectedInCurrentCategory.name_arabic || selectedInCurrentCategory.name 
                          : selectedInCurrentCategory.name}
                      </>
                    ) : (
                      <>
                        {t('checkout.selectOne')} ({currentItems.length} {t('checkout.itemsAvailable')})
                      </>
                    )}
                  </Text>
                  
                  <Text fontSize="2xs" color={mutedTextColor}>
                    {currentCategoryIndex + 1} / {totalCategories}
                  </Text>
                </VStack>
                
                <IconButton
                  icon={<ChevronRightIcon />}
                  onClick={nextCategory}
                  isDisabled={currentCategoryIndex === totalCategories - 1}
                  variant="outline"
                  size="xs"
                  colorScheme="brand"
                  aria-label="Next category"
                />
              </HStack>
              
              {/* Items Grid */}
              <Box minH={isMobile ? "200px" : "250px"}>
                <Grid 
                  templateColumns={`repeat(${itemsPerRow}, 1fr)`}
                  gap={2}
                  width="100%"
                >
                  {currentItems.map((item) => renderItemCard(item))}
                </Grid>
              </Box>
            </MotionVStack>
          )}
        </Box>
        
        <Box 
          p={3}
          borderTop="1px solid" 
          borderColor={borderColor}
          bg={cardBg}
        >
          <HStack spacing={2} width="full" justify="flex-end">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              size="sm"
              colorScheme="brand"
            >
              {t('common.cancel')}
            </Button>
            
            <HStack spacing={2}>
              {totalCategories > 1 && currentCategoryIndex < totalCategories - 1 && (
                <Button 
                  onClick={nextCategory}
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                >
                  {t('common.next')} →
                </Button>
              )}
              
              <Button 
                colorScheme="brand" 
                onClick={handleSave}
                isDisabled={calculateTotalItems() === 0}
                size="sm"
                minW="80px"
              >
                {saveButtonText}
              </Button>
            </HStack>
          </HStack>
        </Box>
      </MotionBox>
    </Collapse>
  )
}

export default CustomizableMealSelectionCollapse