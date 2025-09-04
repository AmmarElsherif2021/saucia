import { useRef, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Badge,
  Image,
  Grid,
  GridItem,
  useColorMode,
  Flex,
  IconButton,
  useBreakpointValue
} from "@chakra-ui/react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useTranslation } from "react-i18next";
import { useElements } from "../../Contexts/ElementsContext";
import { useI18nContext } from "../../Contexts/I18nContext";
import { useCart } from "../../Contexts/CartContext";
import { AddToCartModal } from "../../Components/Cards";
// Create motion components
const MotionBox = motion(Box);
const MotionContainer = motion(Container);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);
const MotionBadge = motion(Badge);
const MotionImage = motion(Image);
const MotionFlex = motion(Flex);

function useParallax(value, distance) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

function AnimatedText({ 
  text, 
  fontSize = "6xl", 
  fontWeight = "bold",
  color = "brand.500",
  delay = 0,
  isArabic = false,
  ...textProps 
}) {
  const { colorMode } = useColorMode();
  const words = text?.split(" ");
  
  return (
    <Box 
      display="flex" 
      flexWrap="wrap" 
      justifyContent={isArabic ? "flex-end" : "flex-start"} 
      dir={isArabic ? "rtl" : "ltr"}
      {...textProps}
    >
      {words.map((word, index) => (
        <MotionText
          key={`${text}-${index}`}
          as="span"
          mx={1}
          fontSize={fontSize}
          fontWeight={fontWeight}
          color={colorMode === "dark" ? "white" : color}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ 
            duration: 0.3, 
            delay: delay + (index * 0.15),
            ease: "easeOut"
          }}
        >
          {word}
        </MotionText>
      ))}
    </Box>
  );
}

function MealShowcase({ meal, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useParallax(scrollYProgress, 150);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';
  
  const handleAddToCart = () => {
    addToCart({
      id: meal.id,
      name: isArabic ? meal.name_arabic : meal.name,
      price: meal.basePrice || 28,
      image: meal.image_url || meal.thumbnailUrl,
      qty: quantity
    });
    setIsModalOpen(false);
  };

  // Responsive values
  const containerHeight = useBreakpointValue({ 
    base: "auto", 
    md: "100vh" 
  });
  const imageHeight = useBreakpointValue({ 
    base: "300px", 
    md: "400px", 
    lg: "500px" 
  });
  const textAlign = useBreakpointValue({
    base: "center",
    md: isArabic ? "right" : "left"
  });
  const flexAlign = useBreakpointValue({
    base: "center",
    md: isArabic ? "flex-end" : "flex-start"
  });

  return (
    <Box 
      as="section" 
      position="relative" 
      minH={containerHeight}
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      overflow="hidden"
      py={{ base: 12, md: 0 }}
    >
      <Container ref={ref} maxW="6xl" px={{ base: 4, md: 6 }}>
        <Grid 
          templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
          gap={{ base: 8, md: 12 }} 
          alignItems="center"
          dir={isArabic ? "rtl" : "ltr"}
        >
          {/* Image Side */}
          <GridItem order={{ base: 1, md: (isArabic ? index % 2 !== 0 : index % 2 === 0) ? 1 : 2 }}>
            <MotionBox
              initial={{ opacity: 0, x: (isArabic ? index % 2 !== 0 : index % 2 === 0) ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              position="relative"
              overflow="hidden"
              borderRadius="15%"
              h={imageHeight}
            >
              <MotionImage
                src={meal.image_url || meal.thumbnailUrl || `https://picsum.photos/seed/meal${meal.id}/800/600`}
                alt={isArabic ? meal.name_arabic : meal.name}
                w="100%"
                h="100%"
                objectFit="cover"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Gradient Overlay */}
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, blackAlpha.400, transparent, transparent)"
              />
              
              {/* Price Badge */}
              <MotionBadge
                position="absolute"
                top={4}
                right={isArabic ? 4 : "unset"}
                left={isArabic ? "unset" : 4}
                bg="brand.500"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="bold"
                fontSize="md"
                initial={{ scale: 0, rotate: -45 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                ${meal.basePrice || "28"}
              </MotionBadge>

              {/* Additional badges for dietary info */}
              {meal.isVegetarian && (
                <MotionBadge
                  position="absolute"
                  bottom={4}
                  left={isArabic ? 4 : "unset"}
                  right={isArabic ? "unset" : 4}
                  bg="green.500"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  🌱 {t('vegetarian', 'Vegetarian')}
                </MotionBadge>
              )}
            </MotionBox>
          </GridItem>

          {/* Content Side */}
          <GridItem order={{ base: 2, md: (isArabic ? index % 2 !== 0 : index % 2 === 0) ? 2 : 1 }}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              textAlign={textAlign}
              display="flex"
              flexDirection="column"
              alignItems={flexAlign}
            >
              <MotionBadge
                display="inline-block"
                px={3}
                py={1}
                bg={colorMode === "dark" ? "brand.900" : "brand.100"}
                color={colorMode === "dark" ? "brand.300" : "brand.700"}
                borderRadius="full"
                fontSize="sm"
                fontWeight="medium"
                textTransform="uppercase"
                letterSpacing="wide"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                mb={6}
                alignSelf={flexAlign}
              >
                {isArabic ? meal.section_arabic : meal.section}
              </MotionBadge>

              <AnimatedText
                text={isArabic ? meal.name_arabic : meal.name || t('signatureDish', 'Signature Dish')}
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "brand.600"}
                delay={0.5}
                mb={6}
                isArabic={isArabic}
              />

              <MotionText
                fontSize="lg"
                fontWeight="normal"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                lineHeight="relaxed"
                maxW="md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                mb={6}
                textAlign={textAlign}
              >
                {isArabic ? meal.description_arabic : meal.description || t('mealDescription', 'Experience the perfect blend of flavors and artistry in every bite.')}
              </MotionText>

              {/* Nutritional Info */}
              {(meal.calories || meal.proteinG) && (
                <MotionFlex
                  gap={3}
                  wrap="wrap"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  mb={6}
                  justifyContent={flexAlign}
                >
                  {meal.calories && (
                    <Badge colorScheme="orange" fontSize="sm" px={3} py={1} borderRadius="full">
                      {meal.calories} cal
                    </Badge>
                  )}
                  {meal.proteinG && (
                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                      {meal.proteinG}g {t('protein', 'protein')}
                    </Badge>
                  )}
                  {meal.prepTimeMinutes && (
                    <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                      {meal.prepTimeMinutes} min
                    </Badge>
                  )}
                </MotionFlex>
              )}

              <MotionFlex
                gap={4}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                flexDirection={{ base: "column", sm: "row" }}
                alignItems="center"
                justifyContent={flexAlign}
                width="100%"
              >
                <MotionButton
                  size="lg"
                  bg="brand.500"
                  color="white"
                  borderRadius="xl"
                  _hover={{ bg: "brand.600", transform: "translateY(-2px)" }}
                  transition="all 0.3s"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  px={8}
                  onClick={() => setIsModalOpen(true)} // Add this onClick handler
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
                    hasOffer={false} // You can modify this if you have discount info
                    discountPercentage={0}
                    colorMode={colorMode}
                  />
    
              </MotionFlex>
            </MotionBox>
          </GridItem>
        </Grid>
      </Container>
    </Box>
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
    ? featuredMeals.slice(0, 5) 
    : [
        { 
          id: 1, 
          name: t('signatureDish', 'Signature Dish'), 
          name_arabic: "طبق التوقيع",
          section: t('chefSpecial', "Chef's Special"),
          section_arabic: "طبق الشيف المميز",
          basePrice: 28 
        },
        { 
          id: 2, 
          name: t('freshPasta', 'Fresh Pasta'), 
          name_arabic: "باستا طازجة",
          section: t('italianCuisine', "Italian Cuisine"),
          section_arabic: "المطبخ الإيطالي",
          basePrice: 22 
        },
        { 
          id: 3, 
          name: t('grilledSalmon', 'Grilled Salmon'), 
          name_arabic: "سلمون مشوي",
          section: t('seafood', "Seafood"),
          section_arabic: "المأكولات البحرية",
          basePrice: 32 
        },
      ];

  return (
    <Box
      position="relative"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Featured Meals Section */}
      <Box position="relative" py={16} zIndex={20}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <MotionHeading
              fontSize={{ base: "6xl"}}
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
          </VStack>
        </Container>
      </Box>

      {/* Individual Meal Showcase Sections */}
      <Box position="relative" zIndex={20}>
        {displayMeals.slice(0, 3).map((meal, index) => (
          <MealShowcase key={meal.id} meal={meal} index={index} />
        ))}
      </Box>
      
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
        transition={{ delay: 2, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Shopping Cart"
        _hover={{ bg: "brand.600" }}
      >
        🛒
      </MotionBox>
    </Box>
  );
}