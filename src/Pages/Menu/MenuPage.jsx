import { useState, useEffect } from "react";
// Removed unused import
import {CustomizableMealCard } from "./CustomizableCard" 
import { Box, Heading, SimpleGrid, Text as ChakraText, Spinner, Center } from "@chakra-ui/react"; // Renamed Text to ChakraText to avoid conflicts
import { ACC } from "../../Components/ComponentsTrial";
import { FoodCard } from "../../Components/Cards";
import { useTranslation } from "react-i18next";
import { useI18nContext } from "../../Contexts/I18nContext";
import { useElements } from "../../Contexts/ElementsContext";
// Removed unused import

// Import icons
import makeSaladIcon from "../../assets/menu/ingredient.svg";
import proteinIcon from "../../assets/menu/protein.svg";
import cheeseIcon from "../../assets/menu/cheese.svg";
import extrasIcon from "../../assets/menu/extras.svg";
import dressingsIcon from "../../assets/menu/dressings.svg";
import saladIcon from "../../assets/menu/salad.svg";
import soupIcon from "../../assets/menu/soup.svg";
import fruitIcon from "../../assets/menu/fruit.svg"; // Corrected the icon for fruits

import { useCart } from "../../Contexts/CartContext";


const iconsMap = {
  "Salads": saladIcon,
  "Soups": soupIcon,
  "Proteins": proteinIcon,
  "Cheese": cheeseIcon,
  "Extras": extrasIcon,
  "Dressings": dressingsIcon,
  "Fruits": fruitIcon,  
  "Make Your Own Salad": makeSaladIcon,
  "Make Your Own Fruit Salad": fruitIcon,
};
const selectiveSectionMap = {
  "make your own fruit salad": "salad-fruits",
  "make your own salad": "salad-items",
};
const MenuPage = () => {
  const { t } = useTranslation();
  const {currentLanguage}= useI18nContext();
  const {addToCart}=useCart();
  const { meals, fruitItems, saladItems, elementsLoading } = useElements();
  const [sections, setSections] = useState([]);
  const [selectiveItems, setSelectiveItems] = useState({
    "salad-fruits": [],
    "salad-items": []
  });
  const [loading] = useState(false); 
  const isArabic = currentLanguage === "ar" ;
  const handleAddToCart = (meal) => {
    // This is the correct format to add a new item to cart
    const itemToAdd = {
      id: meal.id,
      name: meal.name,
      price: meal.price,
      image: meal.image,
      qty: meal.qty || 1,
      addOns: meal.addOns || [] // Make sure we use the correct property name
    };
    
    console.log("Adding to cart with addOns:", itemToAdd.addOns); // Debug logging
    addToCart(itemToAdd);
  };
  
  // Use the items from context
  useEffect(() => {
    if (!elementsLoading) {
      setSelectiveItems({
        "salad-fruits": fruitItems || [],
        "salad-items": saladItems || []
      });
    }
  }, [fruitItems, saladItems, elementsLoading]);

  // Organize meals by sections
  useEffect(() => {
    if (!elementsLoading && !loading && meals.length > 0) {
      // Group meals by section
      const sectionsMap = {};
      
    meals.forEach(meal => {
  // Normalize section name
  const section = (meal.section || "Other")
    .trim()
    .replace(/\s+/g, ' ') // Remove extra spaces
    .replace(/['"]/g, ''); // Remove special characters
  
  if (!sectionsMap[section]) {
    sectionsMap[section] = [];
  }
  sectionsMap[section].push(meal);
});
      
      // Convert to array format for accordion
      const sectionsArray = Object.keys(sectionsMap).map(sectionName => {
        return {
          name: sectionName,
          name_arabic: sectionsMap[sectionName][0].section_arabic || sectionName,
          meals: sectionsMap[sectionName]
        };
      });
      
      setSections(sectionsArray);
    }
  }, [meals, elementsLoading, loading]);

  // Generate menu sections for the accordion
  // Generate menu sections for the accordion
const menuSections = sections.map((section) => ({
  title:
    currentLanguage === "ar"
      ? section.name_arabic || section.name
      : t(`menuPage.${section.name}`, { defaultValue: section.name }),
  icon: iconsMap[section.name] || makeSaladIcon,
  content: (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {section.meals.map((meal, index) => {
          const isSelective = meal.policy === "selective";
          let selectableItems = [];
          let sectionRules = {};

          if (isSelective) {
            const itemSection = selectiveSectionMap[meal.name.toLowerCase()];
            if (itemSection) {
              selectableItems = selectiveItems[itemSection];
              sectionRules = selectableItems[0] || {};
            }
          }

          return isSelective ? (
            <CustomizableMealCard
              key={index}
              meal={meal}
              sectionRules={sectionRules}
              selectableItems={selectableItems}
              onhandleAddToCart={handleAddToCart}
            />
          ) : (
            <FoodCard
              key={meal.id || index}
              id={meal.id}
              nameArabic={meal.name_arabic}
              name={meal.name}
              description={
                <Box>
                  <ChakraText>{isArabic?meal.ingredients_arabic:meal.ingredients}</ChakraText>
                  <ChakraText>
                    {t("menuPage.calories")}: {meal.kcal || "N/A"}
                  </ChakraText>
                  {meal.protein > 0 && (
                    <ChakraText>
                      {t("menuPage.protein")}: {meal.protein}g
                    </ChakraText>
                  )}
                  {meal.carb > 0 && (
                    <ChakraText>
                      {t("menuPage.carbs")}: {meal.carb}g
                    </ChakraText>
                  )}
                  {isSelective && (
                    <ChakraText color="green.500">
                      {t("menuPage.customizable")}
                    </ChakraText>
                  )}
                </Box>
              }
              price={meal.price}
              image={meal.image || null}
              rating={meal.rating || 4}
              category={section.name}
              isSelective={isSelective}
              policy={meal.policy}
            />
          );
        })}
      </SimpleGrid>
    </Box>
  ),
}));

  if (elementsLoading || loading) {
    return (
      <Center h="300px">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box p={4}>
      <Heading mb={6} textStyle="heading">
        {t("menuPage.title", { defaultValue: "Menu" })}
      </Heading>
      <ACC sections={menuSections} />
    </Box>
  );
};

export default MenuPage;