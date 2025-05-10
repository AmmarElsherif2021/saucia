import { createContext, useState, useEffect, useContext } from "react";
import { listItems, getItemsBySection } from "../API/items";
import { getMeals } from "../API/meals";
import { listPlans } from "../API/plans";

const ElementsContext = createContext();

export const ElementsProvider = ({ children }) => {
  const [elementsState, setElementsState] = useState({
    items: [],
    meals: [],
    plans: [],
    featuredMeals: [],
    offersMeals: [],
    saladItems: [],
    fruitItems: [],
    elementsLoading: true
  });

  const fetchElements = async () => {
    try {
      // Fetch all base data
      const [items, meals, plans] = await Promise.all([
        listItems(),
        getMeals(),
        listPlans()
      ]);
      
      // Filter featured and offer meals
      const featuredMeals = meals.filter((x) => x.rate > 4.7);
      const offersMeals = meals.filter((x) => x.offerRatio < 1);
      
      // Fetch section-specific items for selective meals
      const saladItems = items.filter(item => item.section !== "salad-fruits");
      const fruitItems = items.filter(item => item.section === "salad-fruits");
      
      setElementsState({
        items: items || [],
        meals: meals || [],
        plans: plans || [],
        featuredMeals: featuredMeals || [],
        offersMeals: offersMeals || [],
        saladItems: saladItems || [],
        fruitItems: fruitItems || [],
        elementsLoading: false
      });
    } catch (error) {
      console.error("Error fetching elements:", error);
      setElementsState(prev => ({ ...prev, elementsLoading: false }));
    }
  };

  useEffect(() => {
    fetchElements();
  }, []);

  return (
    <ElementsContext.Provider value={elementsState}>
      {children}
    </ElementsContext.Provider>
  );
};

export const useElements = () => {
  const context = useContext(ElementsContext);
  if (!context) {
    throw new Error("useElements must be used within an ElementsProvider");
  }
  return context;
};