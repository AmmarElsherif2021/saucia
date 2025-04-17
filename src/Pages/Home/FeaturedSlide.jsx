import { useState } from "react";
import {
  Box,
  Text,
  Flex,
  Heading,
  Button,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { FeaturedItemCard } from "../../Components/Cards";
import { ItemsCarousel } from "../../Components/ItemsCarousel";
import dessertPic from "../../assets/dessert.JPG";
import fruitPic from "../../assets/fruits.JPG";
import leavesPic from "../../assets/leaves.JPG";

export const FEAT = ({
  trendingItems = [],
  recommendedItems = [],
  seasonalSpecials = [],
}) => {
  const { t } = useTranslation(); // Initialize useTranslation

  // Default items in case none are provided
  const defaultItems = [
    { 
      name: "Classic Chocolate Cake",
      description: "Rich chocolate cake with a delicious ganache topping and a hint of espresso.",
      price: 8.99,
      image: dessertPic,
      rating: 4.5,
      category: "Dessert",
      isTrending: true,
    },
    {
      name: "Fresh Fruit Platter",
      description: "A seasonal selection of fresh fruits, carefully arranged for maximum visual appeal.",
      price: 12.99,
      image: fruitPic,
      rating: 5,
      category: "Healthy",
      isRecommended: true,
    },
    {
      name: "Garden Salad",
      description: "Fresh mixed greens with seasonal vegetables, topped with our signature vinaigrette.",
      price: 7.49,
      image: leavesPic,
      rating: 4.2,
      category: "Salad",
      isSpecial: true,
    },
    {
      name: "Classic Cake",
      description: "Rich chocolate cake with a delicious ganache topping and a hint of espresso.",
      price: 6.99,
      image: dessertPic,
      rating: 4.5,
      category: "Dessert",
      isTrending: false,
    },
    {
      name: "Berry Smoothie Bowl",
      description: "Blended acai and mixed berries topped with granola, coconut flakes, and fresh fruit.",
      price: 9.99,
      image: fruitPic,
      rating: 4.7,
      category: "Breakfast",
      isRecommended: true,
      isTrending: true,
    },
    {
      name: "Tiramisu Delight",
      description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
      price: 6.99,
      image: dessertPic,
      rating: 4.8,
      category: "Dessert",
      isSpecial: true,
    },
  ];

  // Use provided items or fallback to default items
  const trending = trendingItems.length > 0 ? trendingItems : defaultItems.filter((item) => item.isTrending);
  const recommended = recommendedItems.length > 0 ? recommendedItems : defaultItems.filter((item) => item.isRecommended);
  const seasonal = seasonalSpecials.length > 0 ? seasonalSpecials : defaultItems.filter((item) => item.isSpecial);

  // State to control the displayed category
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Determine items to display based on the selected category
  const displayedItems =
    selectedCategory === "trending"
      ? trending
      : selectedCategory === "recommended"
      ? recommended
      : selectedCategory === "seasonal"
      ? seasonal
      : defaultItems; // "all" or fallback

  return (
    <VStack p={4} bg="transparent" alignItems={"center"}>
      <Heading mb={6} fontSize={"3em"} textStyle="heading">
        {t("featuredSlide.title")} {/* Translate "Featured Food Items" */}
      </Heading>

      {/* Buttons to control the displayed category */}
      <Flex mb={6} gap={1} wrap="wrap" alignItems={"center"} justifyContent="center">
        {["all", "trending", "recommended", "seasonal"].map((category) => (
          <Button
            key={category}
            colorScheme={selectedCategory === category ? "brand" : "gray"}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "outline" : "underlined"}
            size={"xs"}
          >
            {t(`featuredSlide.${category}`)} {/* Translate category buttons */}
          </Button>
        ))}
      </Flex>

      {/* Display the filtered items */}
      {displayedItems.length > 0 ? (
        <ItemsCarousel
          items={displayedItems}
          CardComponent={FeaturedItemCard}
          visibleCount={4}
        />
      ) : (
        <Text>{t("featuredSlide.noItems")}</Text> 
      )}
    </VStack>
  );
};

// Example usage
export const FeaturedFoodsDemo = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  const sampleItems = [
    {
      name: t("featuredSlide.sampleItem1.name"),
      description: t("featuredSlide.sampleItem1.description"),
      price: 14.99,
      image: leavesPic,
      rating: 4.9,
      category: t("foodCategories.pizza"),
      isTrending: true,
    },
    {
      name: t("featuredSlide.sampleItem2.name"),
      description: t("featuredSlide.sampleItem2.description"),
      price: 11.99,
      image: fruitPic,
      rating: 4.6,
      category: t("foodCategories.breakfast"),
      isRecommended: true,
    },
  ];

  return (
    <FEAT
      trendingItems={sampleItems.filter((item) => item.isTrending)}
      recommendedItems={sampleItems.filter((item) => item.isRecommended)}
      seasonalSpecials={sampleItems.filter((item) => item.isSpecial)}
    />
  );
};