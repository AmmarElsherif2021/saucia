import { createContext, useContext, useCallback, useEffect } from 'react';
import { useItems } from '../Hooks/useItems';
import { useMeals } from '../Hooks/useMeals';
import { usePlans } from '../Hooks/usePlans';

const ElementsContext = createContext();

export const ElementsProvider = ({ children }) => {
  const itemsHook = useItems();
  const mealsHook = useMeals();
  const plansHook = usePlans();

  // section field to items for backward compatibility
  const itemsWithSection = itemsHook.items.map(item => ({
    ...item,
    section: item.category
  }));

  // Compute derived data
  const featuredMeals = mealsHook.getFeaturedMeals();
  const offersMeals = mealsHook.getDiscountedMeals();
  const signatureSalads = mealsHook.getMealsBySection('Our signature salad');
  const saladItems = itemsWithSection.filter(
    item => item.category !== 'salad-fruits'
  );
  const fruitItems = itemsWithSection.filter(
    item => item.category === 'salad-fruits' // Adjust based on your actual fruit category
  );

  const elementsLoading = 
    itemsHook.loading || 
    mealsHook.loading || 
    plansHook.loading;

  const refreshElements = useCallback(() => {
    itemsHook.fetchItems();
    mealsHook.fetchMeals();
    plansHook.fetchPlans();
  }, [
    itemsHook.fetchItems, 
    mealsHook.fetchMeals, 
    plansHook.fetchPlans
  ]);
   //Debug
   useEffect(() => {
    //console.log('Featured meals:', featuredMeals);
    //console.log('Offers meals:', offersMeals);
   },[])
  // Initial fetch on mount
  useEffect(() => {
    refreshElements();
  }, [refreshElements]);

  const contextValue = {
    items: itemsWithSection,
    meals: mealsHook.meals,
    plans: plansHook.plans,
    featuredMeals,
    offersMeals,
    saladItems,
    fruitItems,
    signatureSalads,
    elementsLoading,
    refreshElements,
  };

  return (
    <ElementsContext.Provider value={contextValue}>
      {children}
    </ElementsContext.Provider>
  );
};

export const useElements = () => {
  const context = useContext(ElementsContext);
  if (!context) {
    throw new Error('useElements must be used within an ElementsProvider');
  }
  return context;
};