import React, { Children,useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react'
import { useUserMenuFiltering } from '../../Hooks/setUserMenuFiltering'
import { useLocation } from 'react-router-dom'
import { CustomizableMealCard } from './CustomizableCard'
import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Text as ChakraText, 
  Spinner, 
  Center,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  VStack,
  Button
} from '@chakra-ui/react'
import { ACC } from '../../Components/ComponentsTrial'
import { MealCardWithModal } from '../../Components/Cards'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useElements } from '../../Contexts/ElementsContext'
import { useCart } from '../../Contexts/CartContext'
import { ErrorBoundary } from 'react-error-boundary'

// Import icons
import makeSaladIcon from '../../assets/menu/fruit-salad.svg'
import proteinIcon from '../../assets/menu/protein.svg'
import cheeseIcon from '../../assets/menu/cheese.svg'
import extrasIcon from '../../assets/menu/extras.svg'
import dressingsIcon from '../../assets/menu/dressings.svg'
import saladIcon from '../../assets/menu/salad.svg'
import soupIcon from '../../assets/menu/soup.svg'
import fruitIcon from '../../assets/menu/fruit.svg'
import dessertIcon from '../../assets/menu/dessert.svg'
import MasonryMenuDemo from './MasonryAccordationPanel'

// Memoized section icons map
const SECTION_ICONS = {
  Salads: saladIcon,
  Soups: soupIcon,
  Proteins: proteinIcon,
  Cheese: cheeseIcon,
  Extras: extrasIcon,
  Dressings: dressingsIcon,
  Fruits: fruitIcon,
  'Make Your Own Salad': makeSaladIcon,
  'Make Your Own Fruit Salad': fruitIcon,
  'Our signature salad': saladIcon,
  Juices: fruitIcon,
  Desserts: dessertIcon,
}

const SELECTIVE_SECTION_MAP = {
  'make your own fruit salad': 'salad-fruits',
  'make your own salad': 'salad-items',
}

// Loading skeleton component
const MenuSectionSkeleton = () => (
  <Box p={4}>
    <Skeleton height="40px" mb={4} />
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height="200px" borderRadius="md" />
      ))}
    </SimpleGrid>
  </Box>
)

// Enhanced error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <Center height="100vh" flexDirection="column">
    <Alert status="error" mb={4} maxWidth="500px">
      <AlertIcon />
      <Box>
        <strong>Failed to load menu</strong>
        <Box fontSize="sm" mt={1}>
          {error.message || 'Please try refreshing the page'}
        </Box>
      </Box>
    </Alert>
    <Button colorScheme="blue" onClick={resetErrorBoundary}>
      Try Again
    </Button>
  </Center>
);
// Masonry grid component
const MasonryGrid = ({ children, columns = { base: 1, sm: 3, md: 2, lg: 3 }, gap = 4 }) => {
  const [columnCount, setColumnCount] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      let cols = 1;
      
      if (width >= 1024) cols = columns.lg || 3;
      else if (width >= 768) cols = columns.md || 2;
      else if (width >= 480) cols = columns.sm || 2;
      else cols = columns.base || 1;
      
      setColumnCount(cols);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [columns]);

  const childrenArray = React.Children.toArray(children);
  const columnWrappers = Array.from({ length: columnCount }, () => []);
  
  childrenArray.forEach((child, index) => {
    columnWrappers[index % columnCount].push(child);
  });

  return (
    <Box ref={containerRef} display="flex" gap={gap} width="100%">
      {columnWrappers.map((column, columnIndex) => (
        <Box key={columnIndex} flex="1" display="flex" flexDirection="column" gap={gap}>
          {column}
        </Box>
      ))}
    </Box>
  );
};
// Optimized meal section component
const MealSection = ({ section, selectiveItems, handlers, userFiltering }) => {
  const { handleAddToCart } = handlers
  
  // Safely destructure with defaults
  const { 
    isMealSafe = () => true,
    isItemSafe = () => true,
    unsafeItemIds = [],
    userAllergies = [],
    getMealAllergens = () => []
  } = userFiltering || {}

  // Validate section data
  if (!section?.meals?.length) {
    return (
      <Box p={4} textAlign="center">
        <ChakraText color="gray.500">No meals available</ChakraText>
      </Box>
    )
  }

  return (
     <MasonryGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={3}>
        {section.meals.map((meal) => {
        if (!meal?.id) return null
        
        const isSelective = meal.is_selective === true;
        const mealAllergens = getMealAllergens(meal)
        const isMealUnsafe = !isMealSafe(meal)
        
        let selectableItems = []
        if (isSelective && meal.name) {
          const itemSection = SELECTIVE_SECTION_MAP[meal.name.toLowerCase()]
          if (itemSection && selectiveItems) {
            selectableItems = selectiveItems[itemSection] || []
          }
        }

        return (
          <Box key={meal.id}>
            {isSelective ? (
              <CustomizableMealCard
                meal={meal}
                selectableItems={selectableItems}
                onhandleAddToCart={handleAddToCart}
                unsafeItemIds={unsafeItemIds}
                userAllergies={userAllergies}
                isItemSafe={isItemSafe}
                isMealUnsafe={isMealUnsafe}
                mealAllergens={mealAllergens}
              />
            ) : (
              <MealCardWithModal meal={meal} />
            )}
          </Box>
        )
      })}
    </MasonryGrid>
  )
}

const MenuPage = () => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { addMealToCart } = useCart()
  const location = useLocation()
  
  // State
  const [sections, setSections] = useState([])
  const [expandedIndex, setExpandedIndex] = useState(-1)
  const [selectiveItems, setSelectiveItems] = useState({
    'salad-fruits': [],
    'salad-items': [],
  })
  const [hasError, setHasError] = useState(false)

  // Context hooks
  const userMenuFiltering = useUserMenuFiltering()
  const { 
    meals = [], 
    fruitItems = [], 
    saladItems = [], 
    elementsLoading, 
    error: elementsError,
    isInitialized
  } = useElements()
  //Debug console for all used input data and states
  // useEffect(() => {
  //   console.log('MenuPage data $$$$$$$$$$$ :', {
  //     meals,
  //     fruitItems,
  //     saladItems,
  //     elementsLoading,
  //     elementsError,
  //     isInitialized,
  //     userMenuFiltering,
  //     sections,
  //     selectiveItems,
  //     hasError,
  //     expandedIndex,
  //     currentLanguage,
  //     initialLoadAttempted
  //   })
  // }, [meals, fruitItems, saladItems, elementsLoading, elementsError, isInitialized, userMenuFiltering, sections, selectiveItems, hasError, expandedIndex, currentLanguage])
  // Track if we have attempted initial load
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false)

  // Filter available meals
  const availableMeals = useMemo(() => {
    try {
      return (meals || []).filter(meal => 
        meal?.id && meal.is_available === true
      )
    } catch (error) {
      console.error('Error filtering meals:', error)
      return []
    }
  }, [meals])

  // Update selective items
  useEffect(() => {
    setSelectiveItems({
      'salad-fruits': (fruitItems || []).filter(item => item?.is_available),
      'salad-items': (saladItems || []).filter(item => item?.is_available)
    })
  }, [fruitItems, saladItems])

  // Organize meals into sections
  useEffect(() => {
    if (!availableMeals.length) {
      setSections([])
      return
    }

    try {
      const sectionsMap = new Map()

      availableMeals.forEach(meal => {
        if (!meal?.id) return
        
        const sectionName = String(meal.section || 'Other').trim()
        
        if (!sectionsMap.has(sectionName)) {
          sectionsMap.set(sectionName, {
            name: sectionName,
            name_arabic: meal.section_arabic || sectionName,
            meals: []
          })
        }
        sectionsMap.get(sectionName).meals.push(meal)
      })

      setSections(Array.from(sectionsMap.values()))
    } catch (error) {
      console.error('Error organizing sections:', error)
      setSections([])
    }
  }, [availableMeals])

  // Handle scroll to section
  useEffect(() => {
    const targetSection = location.state?.scrollTo
    if (!targetSection || !sections.length) return

    const sectionIndex = sections.findIndex(
      section => section?.name?.toLowerCase() === targetSection.toLowerCase()
    )

    if (sectionIndex !== -1) {
      setExpandedIndex(sectionIndex)
      setTimeout(() => {
        const element = document.getElementById(`section-${sectionIndex}`)
        element?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }, [location.state, sections])

  // Track initial load completion
  useEffect(() => {
    if (!elementsLoading && isInitialized) {
      setInitialLoadAttempted(true)
    }
  }, [elementsLoading, isInitialized])

  // Handle errors
  useEffect(() => {
    if (elementsError) {
      setHasError(true)
    }
  }, [elementsError])

  // Handlers
   const handleAddToCart = (meal, selectedItems = [], totalPrice = null) => {
  console.log('📦 MenuPage: Adding meal to cart', {
    meal: meal.name,
    selectedItems,
    totalPrice
  })
  
  // Ensure selectedItems is always an array
  const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : []
  
  const result = addMealToCart(meal, safeSelectedItems, totalPrice)
  
  if (!result.success) {
    toast({
      title: t('cart.error') || "Error",
      description: t('cart.failedToAdd') || "Failed to add item to cart",
      status: "error",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    })
  }
  
  return result
}

// const handleConfirm = (selectedItems, totalPrice) => {
//   // selectedItems is an object: { itemId: quantity, ... }
//   const addOnsArray = []
  
//   Object.entries(selectedItems).forEach(([itemId, quantity]) => {
//     if (quantity <= 0) return
    
//     // Find the item in groupedItems
//     let itemDetails = null
//     for (const section of Object.values(groupedItems)) {
//       itemDetails = section.find(item => item.id == itemId)
//       if (itemDetails) break
//     }
    
//     if (!itemDetails) return
    
//     // Push ONE entry per item with quantity property
//     addOnsArray.push({
//       item_id: itemDetails.id,
//       name: itemDetails.name,
//       name_arabic: itemDetails.name_arabic,
//       category: itemDetails.category,
//       unit_price: itemDetails.price || 0,
//       quantity: parseInt(quantity) || 1
//     })
//   })

//   onhandleAddToCart(meal, addOnsArray, totalPrice)
// }

  const handleRetry = useCallback(() => {
    setHasError(false)
    window.location.reload()
  }, [])

  // Loading state
  if (!initialLoadAttempted) {
    return (
      <Box p={4}>
        <Skeleton height="60px" mb={6} />
        <VStack spacing={6}>
          {[...Array(3)].map((_, i) => (
            <MenuSectionSkeleton key={i} />
          ))}
        </VStack>
      </Box>
    )
  }

  // Error state
  if (hasError) {
    return (
      <Center height="100vh" flexDirection="column">
        <Alert status="error" mb={4} maxWidth="500px">
          <AlertIcon />
          <Box>
            <strong>Failed to load menu</strong>
            <Box fontSize="sm" mt={1}>
              {elementsError?.message || 'Please try again later'}
            </Box>
          </Box>
        </Alert>
        <Button colorScheme="blue" onClick={handleRetry}>
          Retry
        </Button>
      </Center>
    )
  }

  // Empty state
  if (!sections.length) {
    return (
      <Center height="300px">
        <Box textAlign="center">
          <ChakraText fontSize="lg" mb={2}>
            {t('menuPage.noMenuItems', 'No menu items available')}
          </ChakraText>
          <ChakraText fontSize="sm" color="gray.500">
            {t('menuPage.checkBackLater', 'Please check back later')}
          </ChakraText>
        </Box>
      </Center>
    )
  }

  // Render menu
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={handleRetry}
    >
      <Box p={4}>
        <Heading mb={6} textStyle="heading">
          {t('menuPage.title', 'Menu')}
        </Heading>
        <ACC
          sections={sections.map((section, index) => ({
            title: currentLanguage === 'ar' ? section.name_arabic : section.name,
            icon: SECTION_ICONS[section.name] || makeSaladIcon,
            content: (
              <Box 
                id={`section-${index}`}
                p={4}
              >
                <MealSection
                  section={section}
                  selectiveItems={selectiveItems}
                  handlers={{ handleAddToCart }}
                  userFiltering={userMenuFiltering}
                />
              </Box>
            )
          }))}
          expandedIndex={expandedIndex}
          onToggle={setExpandedIndex}
        />
      </Box>
    </ErrorBoundary>
  )
}

export default MenuPage