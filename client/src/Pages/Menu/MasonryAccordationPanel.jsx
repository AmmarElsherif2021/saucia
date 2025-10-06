import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Spinner, Center } from '@chakra-ui/react';

// Masonry Grid Component
const MasonryGrid = ({ children, columns = { base: 1, sm: 2, md: 2, lg: 3 }, gap = 4 }) => {
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

  // Distribute children into columns
  const childrenArray = React.Children.toArray(children);
  const columnWrappers = Array.from({ length: columnCount }, () => []);
  
  childrenArray.forEach((child, index) => {
    columnWrappers[index % columnCount].push(child);
  });

  return (
    <Box ref={containerRef} display="flex" gap={gap} width="100%">
      {columnWrappers.map((column, columnIndex) => (
        <Box
          key={columnIndex}
          flex="1"
          display="flex"
          flexDirection="column"
          gap={gap}
        >
          {column}
        </Box>
      ))}
    </Box>
  );
};

// Enhanced Meal Card with variable heights
const EnhancedMealCard = ({ meal, onClick, colorMode = 'light' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';
  
  // Random height variation for demo (remove in production)
  const heightVariant = Math.random() > 0.5 ? 'auto' : 'auto';
  
  return (
    <Box
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      transition="all 0.3s ease"
      cursor="pointer"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
        borderColor: 'brand.500'
      }}
      onClick={() => onClick?.(meal)}
      height={heightVariant}
    >
      {/* Image */}
      <Box position="relative" paddingBottom="75%" bg="gray.200">
        {!imageLoaded && (
          <Center position="absolute" top="0" left="0" right="0" bottom="0">
            <Spinner color="brand.500" />
          </Center>
        )}
        <Box
          as="img"
          src={meal.image || 'https://via.placeholder.com/400x300'}
          alt={meal.name}
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          objectFit="cover"
          onLoad={() => setImageLoaded(true)}
          opacity={imageLoaded ? 1 : 0}
          transition="opacity 0.3s"
        />
        
        {/* Badges */}
        {meal.discount && (
          <Box
            position="absolute"
            top="2"
            right="2"
            bg="red.500"
            color="white"
            px="2"
            py="1"
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
          >
            -{meal.discount}%
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box p="4">
        <Text
          fontSize="lg"
          fontWeight="bold"
          mb="2"
          noOfLines={2}
          color={colorMode === 'dark' ? 'white' : 'gray.800'}
        >
          {meal.name}
        </Text>
        
        <Text
          fontSize="sm"
          color="gray.600"
          noOfLines={expanded ? undefined : 2}
          mb="3"
        >
          {meal.description}
        </Text>

        {/* Price and category */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="bold" color="brand.600">
            ${meal.price}
          </Text>
          <Text fontSize="xs" color="gray.500" textTransform="uppercase">
            {meal.category}
          </Text>
        </Box>

        {/* Rating */}
        {meal.rating && (
          <Box display="flex" alignItems="center" mt="2" gap="1">
            <Text color="yellow.400">★</Text>
            <Text fontSize="sm" color="gray.600">
              {meal.rating} ({meal.reviews})
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Demo Component
const MasonryMenuDemo = () => {
  // Sample data with varying content lengths
  const sampleMeals = [
    {
      id: 1,
      name: "Caesar Salad Supreme",
      description: "Fresh romaine lettuce with parmesan cheese, croutons, and our signature Caesar dressing.",
      price: 12.99,
      category: "Salads",
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
      rating: 4.5,
      reviews: 120,
      discount: 15
    },
    {
      id: 2,
      name: "Grilled Salmon",
      description: "Wild-caught Atlantic salmon grilled to perfection, served with seasonal vegetables and lemon butter sauce. A healthy and delicious option rich in omega-3 fatty acids.",
      price: 24.99,
      category: "Proteins",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
      rating: 4.8,
      reviews: 89
    },
    {
      id: 3,
      name: "Margherita Pizza",
      description: "Classic Italian pizza with fresh mozzarella.",
      price: 15.99,
      category: "Mains",
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
      rating: 4.6,
      reviews: 200
    },
    {
      id: 4,
      name: "Fresh Fruit Bowl",
      description: "A colorful mix of seasonal fruits including strawberries, blueberries, mango, kiwi, and pineapple. Perfect for a light, refreshing snack or healthy dessert option.",
      price: 8.99,
      category: "Fruits",
      image: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400",
      rating: 4.7,
      reviews: 156,
      discount: 10
    },
    {
      id: 5,
      name: "Chocolate Lava Cake",
      description: "Decadent warm chocolate cake with a molten center.",
      price: 7.99,
      category: "Desserts",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
      rating: 4.9,
      reviews: 340
    },
    {
      id: 6,
      name: "Greek Salad",
      description: "Traditional Greek salad with feta cheese, olives, tomatoes, cucumbers, and red onions.",
      price: 11.99,
      category: "Salads",
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
      rating: 4.4,
      reviews: 95
    }
  ];

  const handleMealClick = (meal) => {
    console.log('Clicked meal:', meal);
  };

  return (
    <Box p={6} bg="gray.50" minHeight="100vh">
      <Text fontSize="3xl" fontWeight="bold" mb={6} color="gray.800">
        Menu Selection
      </Text>
      
      <MasonryGrid
        columns={{ base: 1, sm: 2, md: 2, lg: 3 }}
        gap={4}
      >
        {sampleMeals.map((meal) => (
          <EnhancedMealCard
            key={meal.id}
            meal={meal}
            onClick={handleMealClick}
          />
        ))}
      </MasonryGrid>
    </Box>
  );
};

export default MasonryMenuDemo;