import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Badge,
  Image,
  useColorMode,
  Flex,
  IconButton,
  SimpleGrid,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import veganIcon from '../../assets/icons/vegan.svg';
import vegetarianIcon from '../../assets/icons/vegetarian.svg';
import glutenFreeIcon from '../../assets/icons/gluten-free.svg';
import dairyFreeIcon from '../../assets/icons/dairy-free.svg';
import premiumIcon from '../../assets/icons/premium.svg';
import lightSAR from '../../assets/icons/lite-sar.svg';
import {
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useTranslation } from "react-i18next";
import { useElements } from "../../Contexts/ElementsContext";
import { useI18nContext } from "../../Contexts/I18nContext";
import { useCart } from "../../Contexts/CartContext";

// Create motion components
const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);
const MotionBadge = motion(Badge);
const MotionImage = motion(Image);
const MotionFlex = motion(Flex);

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

// Enhanced badge component based on schema
const DietaryBadges = ({ meal, colorMode, isArabic=false }) => {
  const badges = [];

  if (meal.is_vegetarian) {
    badges.push({ label: <Image src={vegetarianIcon} alt="Vegetarian" w="16px" h="16px" />, color: 'green', alt: "Vegetarian",altArabic:"نباتي" });
  }
  if (meal.is_vegan) {
    badges.push({ label: <Image src={veganIcon} alt="Vegan" w="16px" h="16px" />, color: 'green', alt: "Vegan", altArabic:"vegan" });
  }
  if (meal.is_gluten_free) {
    badges.push({ label: <Image src={glutenFreeIcon} alt="Gluten Free" w="16px" h="16px" />, color: 'blue', alt: "Gluten Free", altArabic:"خالي جلوتين" });
  }
  if (meal.is_dairy_free) {
    badges.push({ label: <Image src={dairyFreeIcon} alt="Dairy Free" w="16px" h="16px" />, color: 'cyan', alt: "Dairy Free", altArabic:"خالي ألبان" });
  }
  if (meal.is_premium) {
    badges.push({ label: <Image src={premiumIcon} alt="Premium" w="16px" h="16px" />, color: 'purple', alt: "Premium", altArabic:"مميز" });
  }

  if (badges.length === 0) return null;

  return (
    <MotionFlex
      gap={1}
      wrap="wrap"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      justifyContent="flex-start"
      bg={'whiteAlpha.500'}
      borderRadius={'full'}
      p={2}
      w={'fit-content'}
    >
      {badges.map((badge, idx) => (
        <Badge
          key={idx}
          colorScheme={badge.color}
          fontSize="2xs"
          px={2}
          py={1}
          borderRadius="full"
          bg="secondary.900"
          //backdropFilter="blur(10px)"
          color="white"
          display={'flex'}
          flexDir={'column'}
          alignItems={'center'}
        >
          {badge.label}
          <small>{isArabic?badge.altArabic:badge.alt}</small>
        </Badge>
      ))}
    </MotionFlex>
  );
};

function MasonryCard({ meal, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addMealToCart } = useCart();
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';
  
  const handleAddToCart = () => {
    addMealToCart({
      id: meal.id,
      name: isArabic ? meal.name_arabic : meal.name,
      price: meal.base_price || 28,
      image: meal.image_url || meal.thumbnail_url,
      qty: quantity
    });
    setIsExpanded(false);
    setQuantity(1);
  };

  const imageHeights = ["340px", "400px", "440px", "380px", "430px"];
  const imageHeight = imageHeights[index % imageHeights.length];
  
  const displayPrice = meal.discount_percentage 
    ? (meal.base_price * (1 - meal.discount_percentage / 100)).toFixed(2)
    : (meal.base_price || 28).toFixed(2);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      position="relative"
      borderRadius="3xl"
      overflow="hidden"
      boxShadow={colorMode === "dark" ? "xl" : "md"}
      _hover={{ 
        boxShadow: "2xl",
      }}
      dir={isArabic ? "rtl" : "ltr"}
      h={isExpanded ? "auto" : imageHeight}
      //transition="height 0.4s ease-in-out"
    >
      
      {/* Full Background Image */}
      <MotionImage
        src={meal.image_url || meal.thumbnail_url || `https://picsum.photos/seed/meal${meal.id}/800/600`}
        alt={isArabic ? meal.name_arabic : meal.name}
        w="100%"
        h={isExpanded ? "250px" : "100%"}
        objectFit="cover"
        position={isExpanded ? "relative" : "absolute"}
        inset={isExpanded ? "unset" : 0}
        transition="all 0.4s ease-in-out"
      />
     
      {/* Gradient Overlay */}
        <Box
          position={isExpanded ? "relative" : "absolute"}
          inset={isExpanded ? "unset" : 0}
          bgGradient={isExpanded ? "none" : "linear(to-b,blackAlpha.600, blackAlpha.50, blackAlpha.600)"}
          h={isExpanded ? "0" : "100%"}
        />
        {
          !isExpanded && (
            <MotionBadge
          alignSelf={isArabic ? "flex-end" : "flex-start"}
          px={3}
          py={1}
          bg={isExpanded ? "brand.100" : "brand.700"}
          backdropFilter={isExpanded ? "none" : "blur(10px)"}
          color={isExpanded ? "brand.700" : "white"}
          borderRadius="full"
          fontSize="2xs"
          fontWeight="medium"
          textTransform="uppercase"
          letterSpacing="wide"
          initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          w="fit-content"
          position="absolute"
          top={4}
          left={isArabic ? "auto" : 4}
          right={isArabic ? 4 : "auto"}
          zIndex={3}
            >
          {isArabic ? meal.section_arabic : meal.section}
            </MotionBadge>
          )
        }

        {/* Price and Discount Badges */}
        {!isExpanded && (
          <Flex
            position="absolute"
            top={4}
            right={isArabic ? "auto" : 4}
            left={isArabic ? 4 : "auto"}
            gap={2}
            zIndex={3}
            flexDirection={isArabic ? "row-reverse" : "row"}
          >
            <MotionBadge
          bg="secondary.800"
          color="white"
          px={4}
          py={2}
          borderRadius="20px"
          fontWeight="bold"
          fontSize="sm"
          initial={{ scale: 0, rotate: -45 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          flex={'row'}
            >
          {meal.base_price}{isArabic ? <Image src={lightSAR} alt="SAR" w="16px" h="16px" /> : " SAR"}
            </MotionBadge>
            
            {meal.discount_percentage && (
          <MotionBadge
            bg="red.500"
            color="white"
            px={3}
            py={2}
            borderRadius="20px"
            fontSize="sm"
            fontWeight="bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            -{Math.round(meal.discount_percentage)}%
          </MotionBadge>
            )}
          </Flex>
        )}

        {/* Content Section */}
      <VStack 
        align="stretch" 
        position={isExpanded ? "relative" : "absolute"}
        bottom={isExpanded ? "unset" : 0}
        left={0}
        right={0}
        p={6} 
        spacing={3}
        zIndex={2}
        bg={isExpanded ? (colorMode === "dark" ? "gray.800" : "secondary.700") : "transparent"}
        borderTopRadius={0}
      >
     

        {/* Meal Name */}
           
        <MotionHeading
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          color={isExpanded ? "secondary.700" : "secondary.700"}
          textAlign={isArabic ? "right" : "left"}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          dir={isArabic ? 'rtl' : 'ltr'}
          textShadow={isExpanded ? "none" : "0 2px 10px rgba(0,0,0,0.5)"}
          fontFamily={isArabic && '"Playpen Sans Arabic", cursive'}
          bg={'blackAlpha.800'}
          px={0}
          w={'fit-content'}
          borderRadius={isExpanded ? '0' : 'md'}
        >
          {isArabic ? meal.name_arabic : meal.name}
        </MotionHeading>

        {/* Description */}
        <MotionText
          fontSize="sm"
          color={isExpanded ? (colorMode === "dark" ? "gray.300" : "gray.600") : "whiteAlpha.900"}
          lineHeight="relaxed"
          textAlign={isArabic ? "right" : "left"}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          dir={isArabic ? 'rtl' : 'ltr'}
          noOfLines={isExpanded ? 3 : 2}
          textShadow={isExpanded ? "none" : "0 1px 5px rgba(0,0,0,0.5)"}
        >
          {isArabic ? meal.description_arabic : meal.description}
        </MotionText>

        {/* Dietary Badges */}
        <DietaryBadges meal={meal} colorMode={colorMode} isArabic={isArabic} />

        {/* Nutritional Info */}
        {(meal.calories || meal.protein_g || meal.prep_time_minutes) && (
          <MotionFlex
            gap={2}
            wrap="wrap"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            justifyContent={isArabic ? "flex-end" : "flex-start"}
          >
            {meal.calories && (
              <Badge 
                fontSize="xs" 
                px={2} 
                py={1} 
                borderRadius="full"
                bg={isExpanded ? "orange.100" : "whiteAlpha.300"}
                color={isExpanded ? "orange.700" : "white"}
              >
                {meal.calories} cal
              </Badge>
            )}
            {meal.protein_g && (
              <Badge 
                fontSize="xs" 
                px={2} 
                py={1} 
                borderRadius="full"
                bg={isExpanded ? "purple.100" : "whiteAlpha.300"}
                color={isExpanded ? "purple.700" : "white"}
              >
                {meal.protein_g}g protein
              </Badge>
            )}
            {meal.prep_time_minutes && (
              <Badge 
                fontSize="xs" 
                px={2} 
                py={1} 
                borderRadius="full"
                bg={isExpanded ? "blue.100" : "whiteAlpha.300"}
                color={isExpanded ? "blue.700" : "white"}
              >
                {meal.prep_time_minutes} min
              </Badge>
            )}
          </MotionFlex>
        )}

        {/* Purchase Controls - Only show when expanded */}
        {isExpanded && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VStack spacing={4} w="100%">
              {/* Quantity Selector */}
              <Flex align="center" justify="space-between" w="100%">
                <Text fontWeight="medium">{t('quantity')}:</Text>
                <Flex borderWidth={'3px'} borderColor={'brand.600'} align="center" gap={3} bg={colorMode === "dark" ? "gray.700" : "gray.100"} p={2} borderRadius="3xl">
                  <IconButton
                    icon={<MinusIcon />}
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                    size="sm"
                    variant="ghost"
                    _hover={{ bg: "brand.500", color: "white" }}
                  />
                  <Text fontSize="lg" fontWeight="bold" minW="2rem" textAlign="center">
                    {quantity}
                  </Text>
                  <IconButton
                    icon={<AddIcon />}
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    size="sm"
                    variant="ghost"
                    _hover={{ bg: "brand.500", color: "white" }}
                  />
                </Flex>
              </Flex>

              {/* Total Price */}
              <Flex justify="space-between" align="center" w="100%" pt={2} borderTop="2px" borderColor={colorMode === "dark" ? "gray.700" : "brand.700"}>
                <Text fontSize="lg" fontWeight="bold">{t('total')}:</Text>
                <Text fontSize="xl" fontWeight="bold" color="whiteAlpha.900" display="flex" alignItems="center" gap={1}>
                  {(displayPrice * quantity).toFixed(2)}<Image src={lightSAR} w={'20px'}/> 
                </Text>
              </Flex>

              {/* Action Buttons */}
              <Flex gap={3} w="100%">
                <Button
                  flex={1}
                  variant="outline"
                  borderWidth="3px"
                  borderColor="brand.700"
                  color="brand.700"
                  onClick={() => {
                    setIsExpanded(false);
                    setQuantity(1);
                  }}
                  _hover={{ bg: "secondary.500" }}
                >
                  {t('maybeLater') || t('cancel')}
                </Button>
                <Button
                  flex={1}
                  bgGradient="linear(to-br, secondary.800, teal.700)"
                  color="white"
                  onClick={handleAddToCart}
                  _hover={{ boxShadow: "lg" }}
                >
                  {t('addToCart')} ({quantity})
                </Button>
              </Flex>
            </VStack>
          </MotionBox>
        )}

        {/* Order Button - Show when not expanded */}
        {!isExpanded && (
          <MotionButton
            w="100%"
            size="md"
            bgGradient="linear(to-br, secondary.800, teal.700)"
            color="white"
            borderRadius="xl"
            _hover={{ bg: "brand.800" }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            onClick={() => setIsExpanded(true)}
            backdropFilter="blur(10px)"
            boxShadow="0 4px 20px rgba(0,0,0,0.3)"
          >
            {t('order')}
          </MotionButton>
        )}
      </VStack>
    </MotionBox>
  );
}

export default function Intro() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { featuredMeals, elementsLoading, elementsError } = useElements();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';

  return (
    <Box
      position="relative"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
      dir={isArabic ? "rtl" : "ltr"}
      minH="100vh"
    >
      {/* Header Section */}
      <Box position="relative" py={{ base: 12, md: 16 }} zIndex={20}>
        <Container maxW="6xl">
          <VStack spacing={4}>
            <MotionHeading
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              fontWeight="bold"
              color={colorMode === "dark" ? "white" : "brand.600"}
              textAlign="center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {t('introTitle') || 'Featured Signature Dishes'}
            </MotionHeading>
            
            <MotionText
              fontSize={{ base: "md", md: "lg" }}
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              textAlign="center"
              maxW="2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {t('introSubtitle') || 'Discover our carefully crafted selection of exceptional dishes'}
            </MotionText>
          </VStack>
        </Container>
      </Box>

      {/* Masonry Grid Section */}
      <Container
        maxW="full"
        px={{ base: 4, md: 6 }}
        mx={3}
        p={8}
        borderRadius="25px"
        bgGradient={
          colorMode === "dark"
            ? "linear(to-br, gray.800, brand.700)"
            : "linear(to-br, brand.600, green.200, secondary.800)"
        }
      >
        <MasonryGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={2}>
          {featuredMeals && featuredMeals.length > 0 ? (
            featuredMeals.slice(0, 6).map((meal, index) => (
              <MasonryCard key={meal.id} meal={meal} index={index} />
            ))
          ) : (
            <Text>{t('noMealsAvailable') || 'No meals available'}</Text>
          )}
        </MasonryGrid>
      </Container>

      {/* Enhanced Progress Bar */}
      <MotionBox
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        h="1"
        bg={colorMode === "dark" ? "gray.700" : "gray.200"}
        transformOrigin="left"
        zIndex={50}
      >
        <MotionBox
          h="full"
          bg="brand.500"
          style={{ scaleX }}
        />
      </MotionBox>

      {/* Floating Action Button */}
      <MotionBox
        as={IconButton}
        position="fixed"
        bottom={8}
        right={isArabic ? "unset" : 8}
        left={isArabic ? 8 : "unset"}
        w={14}
        h={14}
        bg="brand.500"
        color="white"
        borderRadius="full"
        zIndex={40}
        fontSize="xl"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Shopping Cart"
        _hover={{ bg: "brand.600" }}
        boxShadow="lg"
        icon="🛒"
      />
    </Box>
  );
}