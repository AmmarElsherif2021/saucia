import { Box, Heading, SimpleGrid } from "@chakra-ui/react";
import { ACC } from "../../Components/ComponentsTrial";
import { FeaturedItemCard } from "../../Components/Cards";
import menuData from "./menuData.json";
import { useI18nContext } from "../../Contexts/I18nContext";
// Import all images
import greensA from "../../assets/menu/greens1.JPEG";
import greensB from "../../assets/menu/greens2.JPG";
import greensC from "../../assets/menu/greens3.JPG";
import greensD from "../../assets/menu/greens4.JPG";
import greensF from "../../assets/menu/greens5.JPG";
import grainsA from "../../assets/menu/grains1.JPG";
import grainsB from "../../assets/menu/grains2.JPG";
import grainsC from "../../assets/menu/grains3.JPG";
import grainsD from "../../assets/menu/grains4.JPG";
import fruitsA from "../../assets/menu/fruits1.JPG";
import fruitsB from "../../assets/menu/fruits2.JPG";
import fruitsC from "../../assets/menu/fruits3.JPG";
import fruitsD from "../../assets/menu/fruits4.JPG";
import vegetablesA from "../../assets/menu/vegetables1.JPG";
import vegetablesB from "../../assets/menu/vegetables2.JPG";
import vegetablesC from "../../assets/menu/vegetables3.JPG";
import vegetablesD from "../../assets/menu/vegetables4.JPG";
import cheeseA from "../../assets/menu/cheese1.JPG";
import cheeseB from "../../assets/menu/cheese2.JPG";
import cheeseC from "../../assets/menu/cheese3.JPG";
import cheeseD from "../../assets/menu/cheese4.JPG";

// Import icons
import ingredientIcon from "../../assets/menu/ingredient.svg";
import proteinIcon from "../../assets/menu/protein.svg";
import cheeseIcon from "../../assets/menu/cheese.svg";
import extrasIcon from "../../assets/menu/extras.svg";
import dressingsIcon from "../../assets/menu/dressings.svg";
import saladIcon from "../../assets/menu/salad.svg";
import { useTranslation } from "react-i18next";

// Map category names to their respective icons
const iconsMap = {
  "Base Ingredients": ingredientIcon,
  "Proteins": proteinIcon,
  "Cheese": cheeseIcon,
  "Toppings & Extras": extrasIcon,
  "Dressings": dressingsIcon,
  "Signature Salads": saladIcon,
};

export const MenuPage = () => {
  const { t } = useTranslation()
  const images = [
    greensA,
    greensB,
    greensC,
    greensD,
    greensF,
    grainsA,
    grainsB,
    grainsC,
    grainsD,
    fruitsA,
    fruitsB,
    fruitsC,
    fruitsD,
    vegetablesA,
    vegetablesB,
    vegetablesC,
    vegetablesD,
    cheeseA,
    cheeseB,
    cheeseC,
    cheeseD,
  ];

  let imageIndex = 0;

  // Generate accordion sections dynamically from menuData.json
  const menuSections = menuData.menu.categories.map((category) => ({
    title: t(`menuPage.${category.name}`), // Translate category name
    icon: iconsMap[category.name], // Use the proper icon based on category name
    content: (
      <Box>
        {/* Render subcategories if they exist */}
        {category.subcategories
          ? category.subcategories.map((subcategory, subIndex) => (
              <Box key={subIndex} mb={6}>
                <Heading size="md" mb={4}>
                  {t(`menuPage.${subcategory.name}`)} {/* Translate subcategory name */}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={1}>
                  {subcategory.items.map((item, itemIndex) => {
                    const assignedImage = images[imageIndex % images.length];
                    imageIndex++;
                    return (
                      <FeaturedItemCard
                        key={itemIndex}
                        name={item.name}
                        description={`${t("menuPage.weight")}: ${
                          item.weight || t("common.n/a")
                        }, ${t("menuPage.calories")}: ${
                          item.calories || t("common.n/a")
                        }`}
                        price={Math.random() * 10 + 5} // Random price for demo
                        image={assignedImage}
                        rating={Math.floor(Math.random() * 5) + 1} // Random rating for demo
                        category={subcategory.name}
                      />
                    );
                  })}
                </SimpleGrid>
              </Box>
            ))
          : null}

        {/* Render items directly if no subcategories */}
        {category.items && (
          <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={1}>
            {category.items.map((item, itemIndex) => {
              const assignedImage = images[imageIndex % images.length];
              imageIndex++;
              return (
                <FeaturedItemCard
                  key={itemIndex}
                  name={item.name}
                  description={`${t("menuPage.weight")}: ${
                    item.weight || t("common.n/a")
                  }, ${t("menuPage.calories")}: ${
                    item.calories || t("common.n/a")
                  }`}
                  price={Math.random() * 10 + 5} // Random price for demo
                  image={assignedImage}
                  rating={Math.floor(Math.random() * 5) + 1} // Random rating for demo
                  category={category.name}
                />
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    ),
  }));

  return (
    <Box p={4}>
      <Heading mb={6} textStyle="heading">
        {t("menuPage.title")} {/* Translate "Salad Menu" */}
      </Heading>
      <ACC sections={menuSections} />
    </Box>
  );
};