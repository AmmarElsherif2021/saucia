import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useUserMenuFiltering } from '../../Hooks/setUserMenuFiltering'
import { useLocation } from 'react-router-dom'
import { CustomizableMealCard } from './CustomizableCard'
import { Box, Heading, SimpleGrid, Text as ChakraText, Spinner, Center } from '@chakra-ui/react'
import { ACC } from '../../Components/ComponentsTrial'
import { MealCardWithModal } from '../../Components/Cards'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useElements } from '../../Contexts/ElementsContext'

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
import { useCart } from '../../Contexts/CartContext'

const MenuPage = () => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { addToCart } = useCart()
  const location = useLocation()
  const isArabic = currentLanguage === 'ar'
  const { 
    unsafeItems, 
    userAllergies, 
    isMealSafe,
    isItemSafe,
    unsafeItemIds,
    isLoadingAllergies,
    getMealAllergens,
    getItemAllergens
  } = useUserMenuFiltering();

  // Define section refs
  const sectionRefs = {
    Salads: useRef(null),
    Soups: useRef(null),
    Proteins: useRef(null),
    Cheese: useRef(null),
    Extras: useRef(null),
    Dressings: useRef(null),
    Fruits: useRef(null),
    'Make Your Own Salad': useRef(null),
    'Make Your Own Fruit Salad': useRef(null),
    'Our signature salad': useRef(null),
    Desserts: useRef(null),
  }

  // Map section names to their icons
  const sectionIcons = {
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

  const selectiveSectionMap = {
    'make your own fruit salad': 'salad-fruits',
    'make your own salad': 'salad-items',
  }

  // Elements context
  const { meals, fruitItems, saladItems, elementsLoading } = useElements()
  const [sections, setSections] = useState([])
  const [expandedIndex, setExpandedIndex] = useState(-1)
  const [selectiveItems, setSelectiveItems] = useState({
    'salad-fruits': [],
    'salad-items': [],
  })
  
  // Combine loading states
  const overallLoading = elementsLoading || isLoadingAllergies;
  
  // Filter meals - include all available meals (both safe and unsafe)
  const availableMeals = useMemo(() => {
    if (overallLoading) return [];
    return meals.filter(meal => meal.is_available);
  }, [meals, overallLoading]);

  // Set selectable items - include all available items (both safe and unsafe)
  useEffect(() => {
    if (!overallLoading) {
      setSelectiveItems({
        'salad-fruits': (fruitItems || []).filter(item => item.is_available),
        'salad-items': (saladItems || []).filter(item => item.is_available),
      });
    }
  }, [fruitItems, saladItems, overallLoading]);

  // Organize meals by sections
  useEffect(() => {
    if (!overallLoading && availableMeals.length > 0) {
      // Group meals by section
      const sectionsMap = {}

      availableMeals.forEach((meal) => {
        // Normalize section name
        const section = (meal.section || 'Other')
          .trim()
          .replace(/\s+/g, ' ') // Remove extra spaces
          .replace(/['"]/g, '') // Remove special characters

        if (!sectionsMap[section]) {
          sectionsMap[section] = []
        }
        sectionsMap[section].push(meal)
      })

      // Convert to array format for accordion
      const sectionsArray = Object.keys(sectionsMap).map((sectionName) => {
        return {
          name: sectionName,
          name_arabic: sectionsMap[sectionName][0].section_arabic || sectionName,
          meals: sectionsMap[sectionName],
        }
      })

      setSections(sectionsArray)
    }
  }, [availableMeals, overallLoading])

  // Handle scrolling to section based on URL state
  useEffect(() => {
    const targetSection = location.state?.scrollTo

    if (targetSection && sections.length > 0) {
      // Find the index of the section to scroll to (case-insensitive matching)
      const sectionIndex = sections.findIndex(
        (section) => section.name.toLowerCase() === targetSection.toLowerCase(),
      )

      if (sectionIndex !== -1) {
        // Expand the accordion panel
        setExpandedIndex(sectionIndex)

        // Use setTimeout to wait for accordion to expand before scrolling
        setTimeout(() => {
          const element = document.getElementById(`section-${sectionIndex}`)
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })

            // Add visual indicator
            element.style.boxShadow = '0 0 10px rgba(0,255,0,0.5)'
            setTimeout(() => {
              element.style.boxShadow = ''
            }, 2000)
          }
        }, 300)
      }
    }
  }, [location.state, sections])

  const handleAccordionToggle = (expandedIndexes) => {
    // Check the format of expandedIndexes (could be array or single value)
    if (Array.isArray(expandedIndexes)) {
      setExpandedIndex(expandedIndexes.length > 0 ? expandedIndexes[0] : -1)
    } else {
      setExpandedIndex(expandedIndexes)
    }
  }

  const handleAddToCart = (meal) => {
    // This is the correct format to add a new item to cart
    const itemToAdd = {
      id: meal.id,
      name: meal.name,
      price: parseFloat(meal.price),
      image: meal.image,
      qty: Number(meal.qty) || 1,
      addOns: meal.addOns || [],
    }

    addToCart(itemToAdd)
  }

  // Generate menu sections for the accordion
  const menuSections = sections.map((section) => ({
    title:
      currentLanguage === 'ar'
        ? section.name_arabic || section.name
        : t(`menuPage.${section.name}`, { defaultValue: section.name }),
    icon: sectionIcons[section.name] || makeSaladIcon,
    content: (
      <Box borderStyle={'none'} key={`section-${sections.indexOf(section)}`} p={4}>
        <SimpleGrid ref={sectionRefs[section.name]} columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {section.meals.map((meal, index) => {
            const isSelective = meal.preparation_instructions === 'selective'
            const mealAllergens = getMealAllergens(meal)
            const isMealUnsafe = !isMealSafe(meal)
            
            let selectableItems = []
            if (isSelective) {
              const itemSection = selectiveSectionMap[meal.name.toLowerCase()]
              if (itemSection) {
                selectableItems = selectiveItems[itemSection]
              }
            }

            return isSelective ? (
              <CustomizableMealCard
                key={index+ meal.id}
                meal={meal}
                selectableItems={selectableItems}
                onhandleAddToCart={handleAddToCart}
                unsafeItemIds={unsafeItemIds}
                userAllergies={userAllergies}
                isItemSafe={isItemSafe}
                // Pass meal safety info for special UI
                isMealUnsafe={isMealUnsafe}
                mealAllergens={mealAllergens}
              />
            ) : (
              <Box key={index + meal.id}>
                <MealCardWithModal key={meal.id} meal={meal}/>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>
    ),
  }))

  if (overallLoading) {
    return (
      <Center h="300px">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Box p={4}>
      <Heading mb={6} textStyle="heading">
        {t('menuPage.title', { defaultValue: 'Menu' })}
      </Heading>
      <ACC sections={menuSections} expandedIndex={expandedIndex} onToggle={handleAccordionToggle} />
    </Box>
  )
}
export default MenuPage