import { useState } from "react";
import {
  Box,
  Image,
  Text,
  Flex,
  Badge,
  Heading,
  Button,
  Stack,
  SimpleGrid,
  Card,
  CardBody,
  Tag,
  useColorMode,
} from "@chakra-ui/react";
import { IconButton,StarIcon, AddIcon, MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import dessertPic from "../assets/dessert.JPG";
import fruitPic from "../assets/fruits.JPG";
import leavesPic from "../assets/leaves.JPG"
import saladIcon from "../assets/salad.svg";
// Basic Food Card - Simple design with image, title, price
export const FoodCard = ({ name, description, price, image, rating, category }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      maxW="300px"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={colorMode === "dark" ? "gray.700" : "gray.100"}
      transition="transform 0.3s"
      _hover={{ transform: "translateY(-5px)" }}
    >
      <Image src={image? image:saladIcon} alt={name} height="200px" width="100%" objectFit="cover" />
      
      <Box p="4">
        <Flex variant="solid" justify="space-between" align="baseline" mb="2">
          <Heading size="md" color="brand.700" textAlign="left">{name}</Heading>
          <Text  fontWeight="bold" fontSize="md" color="brand.900">
          <br/>
            ${price.toFixed(2)}
          </Text>
        </Flex>
        
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} fontSize="sm" mb="3">
          {description}
        </Text>
        
        <Button colorScheme="brand" size="sm" width="full">
          Add to Cart
        </Button>
      </Box>
    </Box>
  );
};

// Premium Food Card - More detailed with rating, tag, and action buttons
export const PremiumFoodCard = ({ name, description, price, image, rating, category, isPopular }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      maxW="320px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="none"
      bg={colorMode === "dark" ? "gray.700" : "white"}
      position="relative"
    >
      {isPopular && (
        <Badge 
          position="absolute" 
          top="10px" 
          right="10px" 
          bg="brand.600" 
          color="white" 
          borderRadius="full" 
          px="2"
          py="1"
        >
          Popular
        </Badge>
      )}
      
      <Image src={image?image:saladIcon} alt={name} height="180px" width="100%" objectFit="cover" />
      
      <Box p="5">
        <Flex justifyContent="space-between" alignItems="center" mb="2">
          <Heading size="md" color={colorMode === "dark" ? "white" : "gray.800"}>{name}</Heading>
          <Badge colorScheme="brand" variant="subtle" borderRadius="full">
            {category}
          </Badge>
        </Flex>
        
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} fontSize="sm" mb="3">
          {description}
        </Text>
        
        <Flex align="center" mt="2" mb="3">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <StarIcon
                key={i}
                color={i < rating ? "brand.500" : "gray.300"}
                boxSize="3"
                mr="1"
              />
            ))}
          <Text ml="1" fontSize="sm" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
            {rating} stars
          </Text>
        </Flex>
        
        <Flex justify="space-between" align="center" mt="4">
          <Text fontWeight="bold" fontSize="xl" color="brand.700">
            ${price.toFixed(2)}
          </Text>
          <Button colorScheme="brand" size="md">
            Add to Cart
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

// Minimalist Food Card - Clean design with horizontal layout
export const MinimalistFoodCard = ({ name, description, price, image, prepTime, dietaryInfo }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      overflow="hidden"
      bg={colorMode === "dark" ? "gray.700" : "white"}
      borderRadius="lg"
      boxShadow="sm"
      maxW="500px"
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
    >
      <Image 
        src={image?image:saladIcon} 
        alt={name} 
        objectFit="cover" 
        maxW={{ base: "100%", md: "150px" }} 
        height={{ base: "150px", md: "auto" }}
      />
      
      <Box p="4" width="100%">
        <Heading size="md" color="brand.700" mb="1">{name}</Heading>
        
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} fontSize="sm" noOfLines={2} mb="2">
          {description}
        </Text>
        
        <Flex wrap="wrap" mb="2">
          {dietaryInfo && dietaryInfo.map((tag, index) => (
            <Badge 
              key={index} 
              bg="secondary.100" 
              color="secondary.700" 
              mr="2" 
              mb="1"
              borderRadius="full"
              px="2"
              py="0.5"
              fontSize="xs"
            >
              {tag}
            </Badge>
          ))}
        </Flex>
        
        <Flex justify="space-between" align="center" mt="2">
          <Box>
            <Text fontWeight="bold" fontSize="md" color="brand.700">
              ${price.toFixed(2)}
            </Text>
            <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
              {prepTime} min prep time
            </Text>
          </Box>
          <Button colorScheme="brand" size="sm">
            Order
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};
//compact cart card
export const CartCard = ({ 
  name, 
  price, 
  image, 
  quantity,
  onIncrease,
  onDecrease,
  onRemove 
}) => {
  const { colorMode } = useColorMode();

  return (
    <Flex
      direction="row"
      align="center"
      bg={colorMode === "dark" ? "gray.700" : "white"}
      borderRadius="md"
      boxShadow="sm"
      p={2}
      mb={2}
      width="100%"
      position="relative"
      _hover={{ 
        boxShadow: colorMode === "dark" ? "dark-lg" : "md",
        transform: "scale(1.01)"
      }}
      transition="all 0.2s"
    >
      {/* Enhanced Image with border radius */}
      <Box
        position="relative"
        width="100px"
        height="100px"
        overflow="hidden"
        borderRadius="md"
        flexShrink={0}
      >
        <Image
          src={image}
          alt={name}
          objectFit="cover"
          width="100%"
          height="100%"
          filter="brightness(0.95)"
        />
        {/* Quantity badge overlay */}
        <Badge
          position="absolute"
          bottom="2"
          right="2"
          bg="brand.600"
          color="white"
          borderRadius="full"
          px={2}
          py={1}
          fontSize="xs"
        >
          ×{quantity}
        </Badge>
      </Box>

      {/* Item details */}
      <Box textAlign="left" flex="3" px={3} minW="50">
        <Text 
          fontWeight="bold" 
          fontSize="lg" 
          color={colorMode === "dark" ? "white" : "gray.800"}
          noOfLines={1}
          py={0.5}
          my={0.5}
        >
          {name}
        </Text>
        <Text 
          fontSize="md" 
          color="brand.700"
          fontWeight="bold"
          py={0.5}
          my={0.5}
        >
          ${(price * quantity).toFixed(2)}
        </Text>
        <Text 
          fontSize="sm" 
          color={colorMode === "dark" ? "gray.400" : "gray.500"}
          py={0.5}
          my={0.5}
        >
          ${price.toFixed(2)} each
        </Text>
      </Box>

      {/* Quantity controls */}
      <Flex align="center">
        <IconButton
          icon={<MinusIcon />}
          aria-label="Decrease quantity"
          size="xs"
          as={Button}
          variant="outlined"
       
          onClick={onDecrease}
          colorScheme="brand"
        />
        <Text mx={1} fontSize="sm" minW="20px" textAlign="center">
          {quantity}
        </Text>
        <IconButton
          icon={<AddIcon />}
          as={Button}
          aria-label="Increase quantity"
          size="xs"
          variant="outlined"
          onClick={onIncrease}
          colorScheme="brand"
        />
        <Button
          as={Button}
          aria-label="Remove item"
          size="xs"
          variant="outline"
          onClick={onRemove}
          colorScheme="error"
          ml={2}
        ><DeleteIcon /></Button>
      </Flex>
    </Flex>
  );
};


// Food Cards Demo Component
export const FoodCards = () => {
  const { colorMode } = useColorMode();
  
  return (
    <Box p={4} bg={colorMode === "dark" ? "gray.800" : "gray.50"}>
      <Heading mb={6} textStyle="heading">Food Cards</Heading>
      
      <Stack spacing={8}>
        <Box>
          <Heading size="md" mb={4}>Basic Food Card</Heading>
          <Flex wrap="wrap" gap={6} justify="center">
            <FoodCard 
              name="Classic Chocolate Cake" 
              description="Rich chocolate cake with a delicious ganache topping and a hint of espresso."
              price={8.99}
              image={dessertPic}
              rating={4.5}
              category="Dessert"
            />
          </Flex>
        </Box>
        
        <Box>
          <Heading size="md" mb={4}>Premium Food Card</Heading>
          <Flex wrap="wrap" gap={6} justify="center">
            <PremiumFoodCard 
              name="Fresh Fruit Platter" 
              description="A seasonal selection of fresh fruits, carefully arranged for maximum visual appeal."
              price={12.99}
              image={fruitPic}
              rating={5}
              category="Healthy"
              isPopular={true}
            />
          </Flex>
        </Box>
        
        <Box>
          <Heading size="md" mb={4}>Minimalist Food Card</Heading>
          <Flex wrap="wrap" gap={6} justify="center">
            <MinimalistFoodCard 
              name="Garden Salad" 
              description="Fresh mixed greens with seasonal vegetables, topped with our signature vinaigrette."
              price={7.49}
              image={leavesPic}
              prepTime={10}
              dietaryInfo={["Vegan", "Gluten-Free", "Low-Carb"]}
            />
          </Flex>
        </Box>
      </Stack>
    </Box>
  );
};
// Featured Item Card with Image Prominence
export const FeaturedItemCard = ({ 
  name, 
  description, 
  price, 
  image, 
  rating, 
  category, 
  isSpecial, 
  isTrending,
  isRecommended 
}) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      maxW="300px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      bg={colorMode === "dark" ? "gray.700" : "white"}
      position="relative"
      transition="transform 0.3s"
      _hover={{ transform: "translateY(-5px)" }}
      height="320px"
    >
      {/* Image takes most of the card */}
      <Box position="relative" height="220px">
        <Image 
          src={image || saladIcon} 
          alt={name} 
          height="100%" 
          width="100%" 
          objectFit="cover"
        />
        
        {/* Badges overlay on image */}
        <Flex 
          position="absolute" 
          top="0" 
          left="0" 
          right="0" 
          p="2" 
          justifyContent="space-between"
        >
          <Flex gap="2">
            {isSpecial && (
              <Badge colorScheme="accent" variant="solid" borderRadius="full" px="2">
                Seasonal
              </Badge>
            )}
            {isTrending && (
              <Badge colorScheme="highlight" variant="solid" borderRadius="full" px="2">
                Trending
              </Badge>
            )}
          </Flex>
          {isRecommended && (
            <Badge colorScheme="success" variant="solid" borderRadius="full" px="2">
              Recommended
            </Badge>
          )}
        </Flex>
        
        {/* Category tag */}
        <Badge
          position="absolute"
          bottom="2"
          right="2"
          bg="brand.600"
          color="white"
          borderRadius="full"
          px="2"
        >
          {category}
        </Badge>
      </Box>
      
      {/* Content overlays bottom of image */}
      <Box p="3" bg={colorMode === "dark" ? "gray.700" : "white"}>
        <Flex justify="space-between" align="center" mb="1">
          <Heading size="sm" color={colorMode === "dark" ? "white" : "gray.800"} noOfLines={1}>
            {name}
          </Heading>
          <Text fontWeight="bold" fontSize="md" color="brand.700">
            ${price.toFixed(2)}
          </Text>
        </Flex>
        
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} fontSize="xs" mb="2" noOfLines={2}>
          {description}
        </Text>
        
        <Flex justify="space-between" align="center">
          <Flex align="center">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <StarIcon
                  key={i}
                  color={i < rating ? "brand.500" : "gray.300"}
                  boxSize="3"
                />
              ))}
            <Text ml="1" fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
              ({rating})
            </Text>
          </Flex>
          <Button colorScheme="brand" size="xs">
            Add to Cart
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};