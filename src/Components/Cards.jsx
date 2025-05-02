//import { useState } from "react";
import {
  Box,
  Image,
  Text,
  Flex,
  Badge,
  Heading,
  Button,
  Stack,
  HStack,
  Card,
  CardBody,
  Tag,
  TagLabel,
  useColorMode,
} from "@chakra-ui/react";
import { IconButton, StarIcon, AddIcon, MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import dessertPic from "../assets/dessert.JPG";
import fruitPic from "../assets/fruits.JPG";
import leavesPic from "../assets/leaves.JPG"
import saladIcon from "../assets/salad.svg";
import { useI18nContext } from "../Contexts/I18nContext";
import { AnimatedText } from "../Pages/Home/Hero";
import saladImage from "../assets/premium/dailySalad.png"
import { useTranslation } from "react-i18next";
// Basic Food Card - Simple design with image, title, price
export const FoodCard = ({ name, description, price, image, rating, category }) => {
  const { colorMode } = useColorMode();
  const {t}=useTranslation()
  
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
          <Text fontWeight="bold" fontSize="md" color="brand.900">
            ${price.toFixed(2)}
          </Text>
        </Flex>
        
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} fontSize="sm" mb="3">
          {description}
        </Text>
        
        <Button colorScheme="brand" size="sm" width="full">
          {t('buttons.addToCart')}
        </Button>
      </Box>
    </Box>
  );
};

// Premium Food Card - More detailed with rating, tag, and action buttons
export const PremiumFoodCard = ({ name, description, price, image, rating, category, isPopular }) => {
  const { colorMode } = useColorMode();
  const {t}=useTranslation()
  
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
          {t('common.popular')}
        </Badge>
      )}
      
      <Image src={image?image:saladIcon} alt={name} height="180px" width="100%" objectFit="cover" />
      
      <Box p="5">
        <Flex justifyContent="space-between" alignItems="center" mb="2">
          <Heading size="md" color={colorMode === "dark" ? "white" : "brand.900"}>{name}</Heading>
          <Badge colorScheme="brand" variant="subtle" borderRadius="full">
            {t(`foodCategories.${category?.toLowerCase()}`)}
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
            {rating} {t('common.stars')}
          </Text>
        </Flex>
        
        <Flex justify="space-between" align="center" mt="4">
          <Text fontWeight="bold" fontSize="xl" color="brand.700">
            ${price.toFixed(2)}
          </Text>
          <Button colorScheme="brand" size="md">
            {t('buttons.addToCart')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

// Minimalist Food Card - Clean design with horizontal layout
export const MinimalistFoodCard = ({ name, description, price, image, prepTime, dietaryInfo }) => {
  const { colorMode } = useColorMode();
  const {t}=useTranslation()
  
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
              {t(`dietaryTags.${tag?.toLowerCase().replace('-', '')}`)}
            </Badge>
          ))}
        </Flex>
        
        <Flex justify="space-between" align="center" mt="2">
          <Box>
            <Text fontWeight="bold" fontSize="md" color="brand.700">
              ${price.toFixed(2)}
            </Text>
            <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.500"}>
              {prepTime} {t('common.minPrepTime')}
            </Text>
          </Box>
          <Button colorScheme="brand" size="sm">
            {t('buttons.order')}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

// Compact cart card
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
  const {t}=useTranslation()

  return (
    <Flex
      direction="row"
      align="center"
      bg={colorMode === "dark" ? "gray.700" : "brand.100"}
      borderRadius="27px"
      p={2}
      mb={2}
      width="100%"
      position="relative"
      _hover={{ 
        transform: "scale(1.01)"
      }}
      transition="all 0.2s"
    >
      <Box
        position="relative"
        width="100px"
        height="100px"
        overflow="hidden"
        borderRadius="25px"
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

      <Box textAlign="left" flex="3" px={3} minW="50">
        <Text 
          fontWeight="bold" 
          fontSize="lg" 
          color={colorMode === "dark" ? "white" : "brand.900"}
          noOfLines={1}
          py={0.5}
          my={0.5}
        >
          {name}
        </Text>
        <Text 
          fontSize="md" 
          color="brand.900"
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
          ${price.toFixed(2)} {t('common.each')}
        </Text>
      </Box>

      <Flex align="center">
        <IconButton
          icon={<MinusIcon />}
          aria-label={t('buttons.decreaseQuantity')}
          size="xs"
          as={Button}
          variant="outlined"
          onClick={onDecrease}
        />
        <Text mx={1} fontSize="sm" minW="20px" textAlign="center">
          {quantity}
        </Text>
        <IconButton
          icon={<AddIcon />}
          as={Button}
          aria-label={t('buttons.increaseQuantity')}
          size="xs"
          variant="outlined"
          onClick={onIncrease}
        />
        <Button
          aria-label={t('buttons.removeItem')}
          size="xs"
          variant="solid"
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
  const {t}=useTranslation()
  
  return (
    <Box p={4} bg={colorMode === "dark" ? "brand.900" : "gray.50"}>
      <Heading mb={6} textStyle="heading">{t('widgets.foodCards')}</Heading>
      
      <Stack spacing={8}>
        <Box>
          <Heading size="md" mb={4}>{t('widgets.basicFoodCard')}</Heading>
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
          <Heading size="md" mb={4}>{t('widgets.premiumFoodCard')}</Heading>
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
          <Heading size="md" mb={4}>{t('widgets.minimalistFoodCard')}</Heading>
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
  const {t}=useTranslation()
  
  return (
    <Box
      maxW="250px"
      borderRadius="xl"
      overflow="hidden"
      bg={colorMode === "dark" ? "gray.700" : "white"}
      position="relative"
      transition="transform 0.3s"
      _hover={{ transform: "translateY(-5px)" }}
      height="300px"
      my={2}
    >
      <Box position="relative" height="220px">
        <Image 
          src={image || saladIcon} 
          alt={name} 
          height="100%" 
          width="100%" 
          objectFit="cover"
        />
        
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
                {t('common.seasonal')}
              </Badge>
            )}
            {isTrending && (
              <Badge colorScheme="highlight" variant="solid" borderRadius="full" px="2">
                {t('common.trending')}
              </Badge>
            )}
          </Flex>
          {isRecommended && (
            <Badge colorScheme="success" variant="solid" borderRadius="full" px="2">
              {t('common.recommended')}
            </Badge>
          )}
        </Flex>
        
        <Badge
          position="absolute"
          bottom="2"
          right="2"
          bg="brand.600"
          color="white"
          borderRadius="full"
          px="2"
        >
          {t(`foodCategories.${category?.toLowerCase()}`)}
        </Badge>
      </Box>
      
      <Box p="3" bg={colorMode === "dark" ? "gray.700" : "white"}>
        <Flex justify="space-between" align="center" mb="1">
          <Heading size="sm" color={colorMode === "dark" ? "white" : "brand.900"} noOfLines={1}>
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
            {t('buttons.addToCart')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

// Offer Card with Image Prominence
export const OfferCard = ({ 
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
  const {t}=useTranslation()
  
  return (
    <Box
      maxW="500px"
      borderRadius="15%"
      overflow="hidden"
      position="relative"
      transition="transform 0.3s"
      _hover={{ transform: "translateY(-5px)" }}
      height="300px"
      my={2}
    >
      <Box position="relative" height="100%" zIndex={0}>
        <Image 
          src={image || saladIcon} 
          alt={name} 
          height="100%" 
          width="100%" 
          objectFit="cover"
          filter="brightness(0.7)"
        />
        
        <Flex 
          position="absolute" 
          top="4" 
          left="4" 
          right="4" 
          justifyContent="space-between"
          zIndex={2}
        >
          <Flex gap="2">
            {isSpecial && (
              <Badge colorScheme="accent" variant="solid" borderRadius="full" px="2">
                {t('common.seasonal')}
              </Badge>
            )}
            {isTrending && (
              <Badge colorScheme="highlight" variant="solid" borderRadius="full" px="2">
                {t('common.trending')}
              </Badge>
            )}
          </Flex>
          {isRecommended && (
            <Badge colorScheme="success" variant="solid" borderRadius="full" px="2">
              {t('common.recommended')}
            </Badge>
          )}
        </Flex>
        
        <Badge
          position="absolute"
          bottom="4"
          right="4"
          bg="brand.600"
          color="white"
          borderRadius="full"
          px="2"
          zIndex={2}
        >
          {t(`foodCategories.${category?.toLowerCase()}`)}
        </Badge>
      </Box>
      
      <Box 
        position="absolute" 
        bottom="0" 
        left="0" 
        right="0" 
        bg={colorMode === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)"} 
        p="4" 
        borderTopRadius="lg"
        zIndex={2}
      >
        <Flex justify="space-between" align="center" mb="2">
          <Heading size="md" color={colorMode === "dark" ? "white" : "brand.900"} noOfLines={1}>
            {name}
          </Heading>
          <Text fontWeight="bold" fontSize="lg" color="brand.700">
            ${price.toFixed(2)}
          </Text>
        </Flex>
        
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} fontSize="sm" mb="2" noOfLines={2}>
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
          <Button colorScheme="brand" size="sm">
            {t('buttons.addToCart')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
//Plan card
export const PlanCard = ({ name, description, image }) => {
  const { colorMode } = useColorMode();
  const {currentLanguage}=useI18nContext();
  const isArabic = currentLanguage === 'ar'; 
  return (
    <Box 
      bgImage={`url(${image})`}
      bgSize="cover"
      bgPosition="center"
      width={"50vw"}
      height={"60vh"}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      color="white"
      textAlign="center"
      borderRadius={"3xl"}
      px={8}
      mx={-12}
    >
      <Heading as="h1" opacity={"0.9"} color="brand.900" mb={1} p={4} sx={{ fontSize: "3em" }} className={isArabic ? "readex-pro" : "montserrat"}>
        <AnimatedText text={name} />
      </Heading>
      <Text fontSize="1.5em" bg="black" color="brand.500" sx={{ paddingY: 0 }} className={isArabic ? "lalezar" : "outfit"}>
        <AnimatedText text={description} delay={2} />
      </Text>
    </Box>
  );
};

//Tiny plan card
export const PlanTinyCard = ({ recommendedPlan, handleChoosePlan, selected = false }) => (
  <Box
      sx={{
          width: "auto",
          maxWidth: "20vw",
          minWidth: "10vw",
          bgImage: `url(${recommendedPlan?.image || saladImage})`,
          bgSize: "cover",
          bgPosition: "center",
          borderRadius: "30px",
          overflow: "hidden",
          transition: "transform 300ms",
          _hover: !selected && {
              transform: "scale(1.1)",
          },
      }}
      p="4"
      color="white"
      onClick={handleChoosePlan}
  >
      <Box>
          <Heading size="md" mt="4" color="brand.800" isTruncated>
              {recommendedPlan?.name}
          </Heading>
      </Box>
      <Box>
          <Flex align="start" spacing="2" mt="4" wrap="wrap">
              {["Carbs", "Protein", "Snacks", "Soups"].map((label, i) => (
                  <HStack key={i} spacing="1">
                      <Box
                          px="3"
                          my="1"
                          bg={"gray.900"}
                          borderRadius="md"
                          color={["brand.500", "secondary.500", "orange.500", "error.500"][i]}
                          fontWeight="bold"
                      >
                          {label}
                      </Box>
                      <Text fontSize="sm" isTruncated>
                          {label === "Carbs" || label === "Protein"
                              ? `${recommendedPlan?.[label.toLowerCase()]}g`
                              : `Choose your ${label.toLowerCase()}`}
                      </Text>
                  </HStack>
              ))}
          </Flex>
      </Box>
      {selected && (
        <Box mt={8}>
         <Text>{recommendedPlan.description}</Text>
          <Box>
              <Button mt="6" colorScheme="brand" onClick={handleChoosePlan}>
                  Select Plan
              </Button>
          </Box>
        </Box>
      )}
  </Box>
);
