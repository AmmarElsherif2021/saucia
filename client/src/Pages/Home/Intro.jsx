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
import {
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useTranslation } from "react-i18next";
import { useElements } from "../../Contexts/ElementsContext";
import { useI18nContext } from "../../Contexts/I18nContext";
import { useCart } from "../../Contexts/CartContext";
import { AddToCartModal } from "../../Components/Cards";

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

function MasonryCard({ meal, index }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      price: meal.basePrice || 28,
      image: meal.image_url || meal.thumbnailUrl,
      qty: quantity
    });
    setIsModalOpen(false);
  };

  // Varying heights for masonry effect
  const imageHeights = ["320px", "380px", "420px", "360px", "400px"];
  const imageHeight = imageHeights[index % imageHeights.length];

  return (
    <MotionBox
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderRadius="2xl"
      overflow="hidden"
      boxShadow={colorMode === "dark" ? "xl" : "md"}
      _hover={{ 
        boxShadow: "2xl",
        transform: "translateY(-4px)"
      }}
      dir={isArabic ? "rtl" : "ltr"}
      h={'fit-content'}
    >
      {/* Image Section */}
      <Box position="relative" h={imageHeight} overflow="hidden">
        <MotionImage
          src={meal.image_url || meal.thumbnailUrl || `https://picsum.photos/seed/meal${meal.id}/800/600`}
          alt={isArabic ? meal.name_arabic : meal.name}
          w="100%"
          h="100%"
          objectFit="cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Gradient Overlay */}
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-t, blackAlpha.600, transparent)"
        />
        
        {/* Price Badge */}
        <MotionBadge
          position="absolute"
          top={4}
          right={isArabic ? 4 : "unset"}
          left={isArabic ? "unset" : 4}
          bg="brand.600"
          color="white"
          px={4}
          py={2}
          borderRadius="full"
          fontWeight="bold"
          fontSize="lg"
          initial={{ scale: 0, rotate: -45 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          ${meal.basePrice || "28"}
        </MotionBadge>

        {/* Vegetarian Badge */}
        {meal.isVegetarian && (
          <MotionBadge
            position="absolute"
            bottom={4}
            left={isArabic ? 4 : "unset"}
            right={isArabic ? "unset" : 4}
            bg="green.500"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            🌱 {t('vegetarian', 'Vegetarian')}
          </MotionBadge>
        )}
      </Box>

      {/* Content Section */}
      <VStack align="stretch" p={6} spacing={3}>
        {/* Section Badge */}
        <MotionBadge
          alignSelf={isArabic ? "flex-end" : "flex-start"}
          px={3}
          py={1}
          bg={colorMode === "dark" ? "brand.900" : "brand.100"}
          color={colorMode === "dark" ? "brand.300" : "brand.700"}
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          textTransform="uppercase"
          letterSpacing="wide"
          initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          w="fit-content"
        >
          {isArabic ? meal.section_arabic : meal.section}
        </MotionBadge>

        {/* Meal Name */}
        <MotionHeading
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="bold"
          color={colorMode === "dark" ? "white" : "brand.600"}
          textAlign={isArabic ? "right" : "left"}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {isArabic ? meal.name_arabic : meal.name || t('signatureDish', 'Signature Dish')}
        </MotionHeading>

        {/* Description */}
        <MotionText
          fontSize="sm"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          lineHeight="relaxed"
          textAlign={isArabic ? "right" : "left"}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          dir={isArabic ? 'rtl' : 'ltr'}
          noOfLines={3}
        >
          {isArabic ? meal.description_arabic : meal.description || t('mealDescription', 'Experience the perfect blend of flavors and artistry in every bite.')}
        </MotionText>

        {/* Nutritional Info */}
        {(meal.calories || meal.proteinG || meal.prepTimeMinutes) && (
          <MotionFlex
            gap={2}
            wrap="wrap"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            justifyContent={isArabic ? "flex-end" : "flex-start"}
          >
            {meal.calories && (
              <Badge colorScheme="orange" fontSize="xs" px={2} py={1} borderRadius="full">
                {meal.calories} cal
              </Badge>
            )}
            {meal.proteinG && (
              <Badge colorScheme="blue" fontSize="xs" px={2} py={1} borderRadius="full">
                {meal.proteinG}g {t('protein', 'protein')}
              </Badge>
            )}
            {meal.prepTimeMinutes && (
              <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="full">
                {meal.prepTimeMinutes} min
              </Badge>
            )}
          </MotionFlex>
        )}

        {/* Order Button */}
        <MotionButton
          w="100%"
          size="md"
          bg="brand.500"
          color="white"
          borderRadius="xl"
          _hover={{ bg: "brand.600" }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          onClick={() => setIsModalOpen(true)}
        >
          {t('buttons.order')}
        </MotionButton>

        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          name={isArabic ? meal.name_arabic : meal.name}
          price={meal.basePrice || 28}
          quantity={quantity}
          setQuantity={setQuantity}
          onConfirm={handleAddToCart}
          t={t}
          hasOffer={false}
          discountPercentage={0}
          colorMode={colorMode}
        />
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

  // Use actual featured meals data or fallback
  const displayMeals = featuredMeals && featuredMeals.length > 0 
    ? featuredMeals.slice(0, 6) 
    : [
        { 
          id: 1, 
          name: t('signatureDish', 'Signature Dish'), 
          name_arabic: "طبق التوقيع",
          section: t('chefSpecial', "Chef's Special"),
          section_arabic: "طبق الشيف المميز",
          basePrice: 28,
          description: "A delightful combination of fresh ingredients",
          description_arabic: "مزيج رائع من المكونات الطازجة",
          calories: 450,
          proteinG: 32
        },
        { 
          id: 2, 
          name: t('freshPasta', 'Fresh Pasta'), 
          name_arabic: "باستا طازجة",
          section: t('italianCuisine', "Italian Cuisine"),
          section_arabic: "المطبخ الإيطالي",
          basePrice: 22,
          description: "Handmade pasta with authentic Italian sauce",
          description_arabic: "باستا مصنوعة يدوياً مع صلصة إيطالية أصيلة",
          prepTimeMinutes: 25
        },
        { 
          id: 3, 
          name: t('grilledSalmon', 'Grilled Salmon'), 
          name_arabic: "سلمون مشوي",
          section: t('seafood', "Seafood"),
          section_arabic: "المأكولات البحرية",
          basePrice: 32,
          description: "Fresh Atlantic salmon grilled to perfection",
          description_arabic: "سلمون أطلسي طازج مشوي بإتقان",
          calories: 380,
          proteinG: 42,
          prepTimeMinutes: 20
        },
        { 
          id: 4, 
          name: "Garden Salad", 
          name_arabic: "سلطة الحديقة",
          section: "Healthy Options",
          section_arabic: "خيارات صحية",
          basePrice: 16,
          description: "Fresh greens with house vinaigrette",
          description_arabic: "خضروات طازجة مع صلصة الخل المنزلية",
          isVegetarian: true,
          calories: 220
        },
        { 
          id: 5, 
          name: "Beef Tenderloin", 
          name_arabic: "فيليه اللحم",
          section: "Premium Cuts",
          section_arabic: "قطع فاخرة",
          basePrice: 45,
          description: "Prime cut beef cooked to your liking",
          description_arabic: "لحم بقري فاخر مطبوخ حسب رغبتك",
          proteinG: 48,
          prepTimeMinutes: 30
        },
        { 
          id: 6, 
          name: "Mushroom Risotto", 
          name_arabic: "ريزوتو الفطر",
          section: "Italian Cuisine",
          section_arabic: "المطبخ الإيطالي",
          basePrice: 24,
          description: "Creamy Arborio rice with wild mushrooms",
          description_arabic: "أرز أربوريو كريمي مع فطر بري",
          isVegetarian: true,
          calories: 380,
          prepTimeMinutes: 35
        },
      ];

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
              {t('featuredSlide.title') || 'Featured Signature Dishes'}
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
              {t('featuredSlide.subtitle') || 'Discover our carefully crafted selection of exceptional dishes'}
            </MotionText>
          </VStack>
        </Container>
      </Box>

      {/* Masonry Grid Section */}
      <Container maxW="7xl" px={{ base: 4, md: 6 }} mx={2} p={8} borderRadius={'25px'} bg={'secondary.500'}>
         
      <MasonryGrid
        columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
        gap={2}
      >
         {displayMeals.map((meal, index) => (
            <MasonryCard key={meal.id} meal={meal} index={index} />
          ))}
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
      >
        🛒
      </MotionBox>
    </Box>
  );
}