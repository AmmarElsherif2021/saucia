/* eslint-disable */
import { createContext, useState, useEffect, useContext } from 'react'
import { listItems } from '../API/items'
import { getMeals } from '../API/meals'
import { listPlans } from '../API/plans'

const ElementsContext = createContext()

export const ElementsProvider = ({ children }) => {
  const [elementsState, setElementsState] = useState({
    items: [],
    meals: [],
    plans: [],
    featuredMeals: [],
    offersMeals: [],
    saladItems: [],
    fruitItems: [],
    elementsLoading: true,
  })

  const fetchElements = async () => {
    try {
      console.log('Fetching elements data...')

      // Fetch all base data
      const [items, meals, plans] = await Promise.all([listItems(), getMeals(), listPlans()])

      console.log('Data fetched successfully:', {
        itemsCount: items?.length || 0,
        mealsCount: meals?.length || 0,
        plansCount: plans?.length || 0,
      })

      // Filter featured and offer meals
      const featuredMeals = meals?.filter((x) => x.rate > 4.7) || []
      const offersMeals = meals?.filter((x) => x.offerRatio < 1) || []

      // Fetch section-specific items for selective meals
      const saladItems = items?.filter((item) => item.section !== 'salad-fruits') || []
      const fruitItems = items?.filter((item) => item.section === 'salad-fruits') || []

      setElementsState({
        items: items || [],
        meals: meals || [],
        plans: plans || [],
        featuredMeals,
        offersMeals,
        saladItems,
        fruitItems,
        elementsLoading: false,
      })
    } catch (error) {
      console.error('Error fetching elements:', error)
      setElementsState((prev) => ({ ...prev, elementsLoading: false }))
    }
  }

  // Log meals when they change
  // useEffect(() => {
  //   if (elementsState.meals.length > 0) {
  //     console.log(`Retrieved plans ${JSON.stringify(elementsState.plans)}`)
  //   }
  // }, [elementsState.meals])

  // Fetch elements only once on component mount
  useEffect(() => {
    fetchElements()
  }, [])

  // Provide a way to manually refresh data if needed
  const refreshElements = () => {
    setElementsState((prev) => ({ ...prev, elementsLoading: true }))
    fetchElements()
  }

  const contextValue = {
    ...elementsState,
    refreshElements,
  }

  return <ElementsContext.Provider value={contextValue}>{children}</ElementsContext.Provider>
}

export const useElements = () => {
  const context = useContext(ElementsContext)
  if (!context) {
    throw new Error('useElements must be used within an ElementsProvider')
  }
  return context
}
