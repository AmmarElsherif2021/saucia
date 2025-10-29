import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useUserMenuFiltering } from '../../Hooks/setUserMenuFiltering'
import { useLocation } from 'react-router-dom'
import { CustomizableMealCard } from './CustomizableCard'
import { 
  Box, 
  Heading, 
  Text as ChakraText, 
  Center,
  Skeleton,
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

//Menu theming constants
const MENU_THEMES = {
  sections: {
    'Salads': '#da5151',
    'Soups': '#daba51', 
    'Proteins': '#da5151',
    'Cheese': '#62c5b8',
    'Extras': '#1fa28e',
    'Dressings': '#d7b741',
    'Fruits': '#59ac53',
    'make your own salad': '#da5151',
    'Make your own fruit salad': '#a8cc6f',
    'Our signature salad': '#10b26c',
    'Juices': '#63c15a',
    'Desserts': '#51c5c3',
    'Default': '#f179b5'
  },
  cards: {
    customizable: '#03894f',
    salad: '#2d7d32',
    protein: '#d32f2f',
    default: '#03894f'
  },
  transparency: {
    cardBg: '60',
    border: '80',
    hover: '70',
    content: '40',
    title: 'aa'
  }
};

const applyTransparency = (hexColor, transparency = '80') => {
  return `${hexColor}${transparency}`;
};

const getSectionTheme = (sectionName) => {
  return MENU_THEMES.sections[sectionName] || MENU_THEMES.sections.Default;
};

const getCardTheme = (meal) => {
  if (MENU_THEMES.sections.hasOwnProperty(meal.section)) return MENU_THEMES.sections[meal.section];
  return MENU_THEMES.cards.default;
};

// Memoized section icons map
const SECTION_ICONS = {
  Salads: saladIcon,
  Soups: soupIcon,
  Proteins: proteinIcon,
  Cheese: cheeseIcon,
  Extras: extrasIcon,
  Dressings: dressingsIcon,
  Fruits: fruitIcon,
  'make your own salad': makeSaladIcon,
  'Make your own fruit salad': fruitIcon,
  'Our signature salad': saladIcon,
  Juices: fruitIcon,
  Desserts: dessertIcon,
}

// Loading skeleton component
const MenuSectionSkeleton = () => (
  <Box p={4}>
    <Skeleton height="40px" mb={4} />
    <VStack spacing={4}>
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} height="200px" borderRadius="md" width="100%" />
      ))}
    </VStack>
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
const MasonryGrid = ({ children, columns = { base: 1, sm: 2, md: 3, lg: 4 }, gap = 4 }) => {
  const [columnCount, setColumnCount] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      let cols = 1;
      
      if (width >= 1280) cols = columns.xl || columns.lg || 4;
      else if (width >= 1024) cols = columns.lg || 4;
      else if (width >= 768) cols = columns.md || 3;
      else if (width >= 480) cols = columns.sm || 2;
      else cols = columns.base || 1;
      
      if (cols !== columnCount) {
        setColumnCount(cols);
      }
    };

    updateColumns();
    
    const resizeObserver = new ResizeObserver(updateColumns);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateColumns);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateColumns);
    };
  }, [columns, columnCount]);

  const childrenArray = React.Children.toArray(children);
  const columnWrappers = Array.from({ length: columnCount }, () => []);
  
  childrenArray.forEach((child, index) => {
    columnWrappers[index % columnCount].push(child);
  });

  return (
    <Box 
      ref={containerRef} 
      display="flex" 
      gap={gap} 
      width="100%"
      minHeight="200px"
    >
      {columnWrappers.map((column, columnIndex) => (
        <Box 
          key={columnIndex} 
          flex="1" 
          display="flex" 
          flexDirection="column" 
          gap={gap}
          minWidth="0"
        >
          {column}
        </Box>
      ))}
    </Box>
  );
};

// Updated MealSection component - fetches selectable items per meal
const MealSection = ({ section, handlers, userFiltering, themeUtils, getMealSelectableItems }) => {
  const { handleAddToCart } = handlers;
  const [mealSelectableItems, setMealSelectableItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  
  const { 
    applyTransparency = (hexColor, transparency = '80') => `${hexColor}${transparency}`,
    transparency = MENU_THEMES.transparency
  } = themeUtils || {};
  
  const { 
    isMealSafe = () => true,
    isItemSafe = () => true,
    unsafeItemIds = [],
    userAllergies = [],
    getMealAllergens = () => []
  } = userFiltering || {};

  // Fetch selectable items for selective meals
  useEffect(() => {
    const fetchSelectiveItems = async () => {
      if (!section?.meals?.length) return;
      
      const selectiveMeals = section.meals.filter(meal => meal?.is_selective === true);
      
      for (const meal of selectiveMeals) {
        if (mealSelectableItems[meal.id]) continue; // Already loaded
        
        setLoadingItems(prev => ({ ...prev, [meal.id]: true }));
        
        try {
          const items = await getMealSelectableItems(meal.id);
          setMealSelectableItems(prev => ({
            ...prev,
            [meal.id]: items || []
          }));
        } catch (error) {
          console.error(`Failed to fetch selectable items for meal ${meal.id}:`, error);
          setMealSelectableItems(prev => ({
            ...prev,
            [meal.id]: []
          }));
        } finally {
          setLoadingItems(prev => ({ ...prev, [meal.id]: false }));
        }
      }
    };
    
    fetchSelectiveItems();
  }, [section?.meals, getMealSelectableItems]);

  if (!section?.meals?.length) {
    return (
      <Box p={4} textAlign="center">
        <ChakraText color="gray.500">No meals available</ChakraText>
      </Box>
    );
  }

  return (
    <MasonryGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
      {section.meals.map((meal) => {
        if (!meal?.id) return null;
        
        const isSelective = meal.is_selective === true;
        const mealAllergens = getMealAllergens(meal);
        const isMealUnsafe = !isMealSafe(meal);
        const cardColor = getCardTheme(meal);

        // For selective meals, get their selectable items
        let selectableItems = [];
        if (isSelective) {
          selectableItems = mealSelectableItems[meal.id] || [];
          
          // Show loading state while fetching items
          if (loadingItems[meal.id]) {
            return (
              <Box key={meal.id}>
                <Skeleton height="370px" borderRadius="xl" />
              </Box>
            );
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
                colorInHex={cardColor}
                applyTransparency={applyTransparency}
                transparency={transparency}
              />
            ) : (
              <MealCardWithModal 
                meal={meal}
                colorInHex={cardColor}
                applyTransparency={applyTransparency}
                transparency={transparency}
              />
            )}
          </Box>
        );
      })}
    </MasonryGrid>
  );
};

const MenuPage = () => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { addMealToCart } = useCart()
  const location = useLocation()
  const themeUtils = {
    applyTransparency,
    transparency: MENU_THEMES.transparency
  };
  
  // State
  const [sections, setSections] = useState([])
  const [expandedIndex, setExpandedIndex] = useState(-1)
  const [hasError, setHasError] = useState(false)

  // Context hooks
  const userMenuFiltering = useUserMenuFiltering()
  const { 
    meals = [], 
    elementsLoading, 
    error: elementsError,
    isInitialized,
    getMealSelectableItems // NEW: Get function from context
  } = useElements()

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
      // You can add toast notification here if needed
      console.error('Failed to add meal to cart')
    }
    
    return result
  }

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
            theme: getSectionTheme(section.name),
            content: (
              <Box 
                id={`section-${index}`}
                p={4}
              >
                <MealSection
                  section={section}
                  handlers={{ handleAddToCart }}
                  userFiltering={userMenuFiltering}
                  themeUtils={themeUtils}
                  getMealSelectableItems={getMealSelectableItems}
                />
              </Box>
            )
          }))}
          expandedIndex={expandedIndex}
          onToggle={setExpandedIndex}
        />
      </Box>
    </ErrorBoundary>
  );
};

export default MenuPage