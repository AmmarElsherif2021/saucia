// Featured Food Items Component with Image-Based Cards
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Image,
  Text,
  Flex,
  Badge,
  Heading,
  Button,
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@chakra-ui/icons";
import dessertPic from "../assets/dessert.JPG";
import fruitPic from "../assets/fruits.JPG";
import leavesPic from "../assets/leaves.JPG";
import saladIcon from "../assets/salad.svg";
import { FeaturedItemCard } from "./Cards";

// Carousel Component for Featured Items
const ItemsCarousel = ({ items, title, subtitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);
  const { colorMode } = useColorMode();
  const carouselRef = useRef(null);

  // Responsive items to show based on container width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) setItemsToShow(1);
      else if (width < 900) setItemsToShow(2);
      else if (width < 1200) setItemsToShow(3);
      else setItemsToShow(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (currentIndex < items.length - itemsToShow) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(items.length - itemsToShow); // Loop to end
    }
  };

  return (
    <Box mb={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading size="md" textStyle="heading" textAlign="left">{title}</Heading>
          <Text fontSize="sm" color={colorMode === "dark" ? "gray.400" : "gray.600"} textAlign="left">{subtitle}</Text>
        </Box>
        <Flex>
          <IconButton
            icon={<ChevronLeftIcon />}
            aria-label="Previous"
            mr={1}
            onClick={prevSlide}
            isDisabled={items.length <= itemsToShow}
            variant="outline"
            colorScheme="brand"
          />
          <IconButton
            icon={<ChevronRightIcon />}
            aria-label="Next"
            onClick={nextSlide}
            isDisabled={items.length <= itemsToShow}
            variant="outline"
            colorScheme="brand"
          />
        </Flex>
      </Flex>

      <Box position="relative" overflow="hidden" ref={carouselRef}>
        <Flex
          transition="transform 0.5s ease"
          transform={`translateX(-${currentIndex * (100 / itemsToShow)}%)`}
          width={`${(items.length / itemsToShow) * 100}%`}
        >
          {items.map((item, index) => (
            <Box
              key={index}
              flex={`0 0 ${100 / itemsToShow}%`}
              px={2}
            >
              <FeaturedItemCard {...item} />
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

// Main Featured Food Items Component

export const FEAT = ({
  trendingItems = [],
  recommendedItems = [],
  seasonalSpecials = [],
}) => {
  const { colorMode } = useColorMode();

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
    <Box p={4} bg={colorMode === "dark" ? "gray.800" : "gray.50"}>
      <Heading mb={6} textStyle="heading">
        Featured Food Items
      </Heading>

    {/* Buttons to control the displayed category */}
        <Flex mb={6} gap={1} wrap="wrap">
          {["all", "trending", "recommended", "seasonal"].map((category) => (
            <Button
            key={category}
            colorScheme={selectedCategory === category ? "brand" : "gray"}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "solid" : "outline"}
            size={"sm"}
            >
            {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </Flex>

        {/* Display the filtered items */}
      {displayedItems.length > 0 ? (
        <ItemsCarousel
          items={displayedItems}
          title={
            selectedCategory === "trending"
              ? "Trending Now"
              : selectedCategory === "recommended"
              ? "Recommended For You"
              : selectedCategory === "seasonal"
              ? "Seasonal Specials"
              : "All Items"
          }
          subtitle={
            selectedCategory === "trending"
              ? "Our most popular items this week"
              : selectedCategory === "recommended"
              ? "Handpicked selections you might enjoy"
              : selectedCategory === "seasonal"
              ? "Limited time offerings with seasonal ingredients"
              : "Explore all our featured items"
          }
        />
      ) : (
        <Text>No items available for this category.</Text>
      )}
    </Box>
  );
};

// Example usage
export const FeaturedFoodsDemo = () => {
  const sampleItems = [
    {
      name: "Artisan Sourdough Pizza",
      description: "Hand-stretched sourdough crust with fresh mozzarella and basil",
      price: 14.99,
      image: leavesPic,
      rating: 4.9,
      category: "Pizza",
      isTrending: true
    },
    {
      name: "Avocado Toast Deluxe",
      description: "Artisan bread topped with avocado, poached eggs, and microgreens",
      price: 11.99,
      image: fruitPic,
      rating: 4.6,
      category: "Breakfast",
      isRecommended: true
    },
    {
      name: "Triple Chocolate Brownie",
      description: "Decadent brownie with dark, milk, and white chocolate chunks",
      price: 5.99,
      image: dessertPic,
      rating: 4.8,
      category: "Dessert",
      isSpecial: true,
      isTrending: true
    },
    {
      name: "Mediterranean Bowl",
      description: "Quinoa, hummus, falafel, and roasted vegetables with tahini dressing",
      price: 13.49,
      image: leavesPic,
      rating: 4.5,
      category: "Healthy",
      isRecommended: true
    },
    {
      name: "Mango Tango Smoothie",
      description: "Fresh mango blended with pineapple, banana and a hint of lime",
      price: 6.49,
      image: fruitPic,
      rating: 4.7,
      category: "Drinks",
      isSpecial: true
    }
  ];

  return (
    <FEAT 
      trendingItems={sampleItems.filter(item => item.isTrending)}
      recommendedItems={sampleItems.filter(item => item.isRecommended)}
      seasonalSpecials={sampleItems.filter(item => item.isSpecial)}
    />
  );
};