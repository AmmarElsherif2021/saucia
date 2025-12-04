/* eslint-disable */
//quantity
import gainWeightPlanImage from '../assets/premium/gainWeight.png'
import keepWeightPlanImage from '../assets/premium/keepWeight.png'
import loseWeightPlanImage from '../assets/premium/loseWeight.png'
import dailyMealPlanImage from '../assets/premium/dailymealplan.png'
import saladsPlanImage from '../assets/premium/proteinsaladplan.png'
import mealPlaceHolder from '../assets/menu/defaultMeal.jpg'
import { useState, useCallback, useEffect } from 'react'
import {
    Box,
  Flex,
  Text,
  Heading,
  Image,
  Badge,
  Button,
  useColorMode,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Skeleton,
  IconButton,
  useDisclosure,
  ScaleFade,
  Divider,
  useColorModeValue,
  Spinner,
  useToast
} from '@chakra-ui/react'
import { StarIcon, MinusIcon, AddIcon, InfoIcon } from '@chakra-ui/icons'
import unknownDefaultImage from '../assets/menu/unknownMeal.jpg'
import { useI18nContext } from '../Contexts/I18nContext'
import { useTranslation } from 'react-i18next'
import { useCart } from '../Contexts/CartContext'
import { motion } from 'framer-motion'
import { t } from 'i18next'
import { FaCartPlus } from 'react-icons/fa'

// Single Source of Truth for Menu Theming - Hex Format
const MENU_THEMES = {
  // Section themes
  sections: {
    'Salads': '#49924eff',
    'Soups': '#0288d1', 
    'Proteins': '#d32f2f',
    'Cheese': '#ed6c02',
    'Extras': '#7b1fa2',
    'Dressings': '#00796b',
    'Fruits': '#c2185b',
    'Make Your Own Salad': '#03894f',
    'Make Your Own Fruit Salad': '#03894f',
    'Our signature salad': '#03894f',
    'Juices': '#0288d1',
    'Desserts': '#7b1fa2',
    'Default': '#03894f'
  },
  
  // Card themes based on meal types
  cards: {
    customizable: '#03894f',
    salad: '#2d7d32',
    protein: '#d32f2f',
    default: '#03894f'
  },
  
  // Transparency levels for different UI elements
  transparency: {
    cardBg: '80', // 50% opacity
    border: '90', // 56% opacity  
    hover: '90',  // 56% opacity
    content: '40', // 25% opacity
    title: 'aa'   // 67% opacity
  }
}
//AddToCard
export const AddToCartModal = ({
  isOpen,
  onClose,
  name,
  price,
  quantity,
  setQuantity,
  onConfirm,
  t,
  hasOffer,
  discountPercentage,
  colorMode,
  currency = 'SAR',
}) => {
  
  const toast = useToast(); // Add toast hook

  const handleConfirm = () => {
    const result = onConfirm();
    if (result && result.success) {
      // Show success toast
      // toast({
      //   title: t('addedToCart') || "Added to cart!",
      //   description: `${quantity} × ${name} added to your cart`,
      //   status: "success",
      //   duration: 3000,
      //   isClosable: true,
      //   position: "top-right",
      // });
      //console.log(`${quantity} × ${name} added to your cart`);
      onClose();
    } else {
      // Show error toast if needed
  //     toast({
  //       title: t('cat.error') || "Error",
  //       description: t('failedToAdd') || "Failed to add item to cart",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //       position: "top-right",
  //     });
     }
   };
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1); 
    }
  }, [isOpen, setQuantity]);

  return (
  <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent
      width={['90%', '80%', '50%']}
      maxWidth="90vw"
      p={1}
      ml="1vw"
      mr="4vw"
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
    >
      <ModalHeader>
        <Flex align="center">
          <Text fontSize="xl" fontWeight="bold">
            {name}
          </Text>
          {hasOffer && (
            <Badge mx={2} colorScheme="green">
              {discountPercentage}% OFF
            </Badge>
          )}
        </Flex>
      </ModalHeader>
      <ModalBody>
        <Flex direction="column" gap={4}>
          <Text color={colorMode== "dark"?"brand.300":"brand.600" } fontSize="lg" fontWeight="medium">
            {t('howManyWouldYouLike')}
          </Text>
          <Flex align="center" justify="space-between">
            <Text>{t('quantity')}:</Text>
            <Flex align="center" gap={3}>
              <IconButton
                icon={<MinusIcon />}
                aria-label="Decrease quantity"
                onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                size="sm"
              />
              <Text fontSize="xl" fontWeight="bold" minW="2vw" textAlign="center">
                {quantity}
              </Text>
              <IconButton
                icon={<AddIcon />}
                aria-label="Increase quantity"
                onClick={() => setQuantity((prev) => prev + 1)}
                size="sm"
              />
            </Flex>
          </Flex>
          <Flex justify="space-between" align="center" mt={4}>
            <Text fontSize="lg">{t('total')}:</Text>
            <Text fontSize="xl" fontWeight="bold" color="brand.500">
              {currency} {(price * quantity).toFixed(2)}
            </Text>
          </Flex>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" mx={3} onClick={onClose}>
          {t('maybeLater') || t('cancel')}
        </Button>
        <Button colorScheme="brand" onClick={handleConfirm}>
          {t('addToCart') || t('confirm')} ({quantity})
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)};

// Enhanced Image Component with loading states
const EnhancedImage = ({ 
  src, 
  alt, 
  fallback = unknownDefaultImage,
  width,
  height,
  borderRadius = 'md',
  objectFit = 'cover',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageState, setImageState] = useState({
    isLoading: true,
    hasError: false,
    isLoaded: false
  });

  const handleLoad = useCallback(() => {
    setImageState({
      isLoading: false,
      hasError: false,
      isLoaded: true
    });
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setImageState({
      isLoading: false,
      hasError: true,
      isLoaded: false
    });
    onError?.();
  }, [onError]);

  return (
    <Box position="relative" width={width} height={height} {...props}>
      {imageState.isLoading && (
        <Skeleton
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          startColor="gray.200"
          endColor="gray.300"
        />
      )}
      
      <Image
        src={imageState.hasError ? fallback : src}
        alt={alt}
        width="100%"
        height="100%"
        objectFit={objectFit}
        borderRadius={borderRadius}
        onLoad={handleLoad}
        onError={handleError}
        opacity={imageState.isLoaded || imageState.hasError ? 1 : 0}
        transition="opacity 0.3s ease"
        position={imageState.isLoading ? 'absolute' : 'static'}
        top={0}
        left={0}
      />
    </Box>
  );
};

// Enhanced Star Rating Component
const StarRating = ({ rating = 0, rating_count = 0, size = "sm", showCount = true }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Flex align="center" gap={1}>
      <Flex>
        {Array(5)
          .fill('')
          .map((_, i) => (
            <StarIcon
              key={i}
              color={i < Math.floor(rating) ? 'yellow.400' : 'gray.300'}
              boxSize={size === "sm" ? "3" : "4"}
            />
          ))}
      </Flex>
      <Text 
        fontSize={size === "sm" ? "xs" : "sm"} 
        color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
        fontWeight="medium"
      >
        {rating?.toFixed?.(1) || '0.0'}
        {showCount && rating_count > 0 && (
          <Text as="span" ml={1}>
            ({rating_count})
          </Text>
        )}
      </Text>
    </Flex>
  );
};

// Dietary Badges Component
const DietaryBadges = ({ meal, size = "sm" }) => {
  const { t } = useTranslation();
  
  const badges = [];
  if (meal.is_vegetarian) badges.push({ key: 'vegetarian', color: 'green' });
  if (meal.is_vegan) badges.push({ key: 'vegan', color: 'teal' });
  if (meal.is_gluten_free) badges.push({ key: 'glutenFree', color: 'orange' });
  if (meal.is_dairy_free) badges.push({ key: 'dairyFree', color: 'secondary' });

  if (badges.length === 0) return null;

  return (
    <Flex wrap="wrap" justifyContent={'start'} gap={1}  w={'fit-content'} bg={'#096c3e73'} px={0} m={0} borderRadius={'md'}>
      {badges.map(({ key, color }) => (
        <Badge
          key={key}
          colorScheme={color}
          variant="solid"
          fontSize={size === "sm" ? "8px" : "8px"}
          borderRadius="sm"
          px={1}
          py={0.2}
        >
          {t(`dietaryTags.${key}`)}
        </Badge>
      ))}
    </Flex>
  );
};

// Price Display Component
const PriceDisplay = ({ base_price, is_discount_active, discount_percentage = 0, size = "md" }) => {
  const { t } = useTranslation();
  // Calculate price based on discount
  const price = is_discount_active && discount_percentage > 0
    ? base_price * (1 - discount_percentage / 100)
    : base_price;

  return (
    <VStack align="flex-start" spacing={0}>
      <Text
        fontWeight="bold"
        fontSize={size}
        color="secondary.800"
        lineHeight="2.2"
      >
        {typeof price === 'number' ? price.toFixed(2) : 'N/A'}{' '}{t('currency')}
      </Text>
      {is_discount_active && discount_percentage > 0 && (
        <Text
          fontSize="xs"
          color="gray.500"
          textDecoration="line-through"
          lineHeight="1"
        >
          {base_price.toFixed(2)}{' '}{t('currency')}
        </Text>
      )}
    </VStack>
  );
};

// Helper function to validate meal for cart
const validateMealForCart = (meal) => {
  if (!meal || !meal.id) {
    console.error('Invalid meal: missing id', meal);
    return false;
  }
  
  if (!meal.name) {
    console.error('Invalid meal: missing name', meal);
    return false;
  }
  
  const price = meal.base_price || meal.price;
  if (price === undefined || price === null) {
    console.error('Invalid meal: missing price', meal);
    return false;
  }
  
  return true;
};

// Enhanced Minimal Meal Card - Grid optimized
// Enhanced Minimal Meal Card - Grid optimized
export const MinimalMealCard = ({
  meal, 
  onClick, 
  colorInHex = '#03894f',
  applyTransparency,
  transparency
}) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addMealToCart } = useCart();
  const toast = useToast();

  const isArabic = currentLanguage === 'ar';
  const displayName = isArabic && meal.name_arabic ? meal.name_arabic : meal.name;
  const displayDescription = isArabic && meal.description_arabic ? meal.description_arabic : meal.description;

  // Default transparency function if not provided
  const defaultApplyTransparency = (hexColor, transparency = '80') => {
    return `${hexColor}${transparency}`;
  };

  // Default transparency values if not provided
  const defaultTransparency = {
    cardBg: '50',
    border: '80',
    hover: '90',
    content: '40',
    title: 'bb'
  };

  // Use provided or fallback values
  const effectiveApplyTransparency = applyTransparency || defaultApplyTransparency;
  const effectiveTransparency = transparency || defaultTransparency;

  const getColor = (level) => {
    return effectiveApplyTransparency(colorInHex, effectiveTransparency[level]);
  };

  const cardBg = getColor('cardBg');
  const borderColor = getColor('border');
  const hoverBg = getColor('hover');
  const contentBg = getColor('content');
  const titleBg = getColor('title');

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onClick?.(meal);
  };

  return (
    <Box
      position="relative"
      w={{ base: "100%" }}
      minH={{ base: "300px", sm: "350px", md: "370px" }}
      maxW="400px"
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'translateY(-8px) scale(1.02)',
        //boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}
      onClick={() => onClick?.(meal)}
      opacity={imageLoaded ? 1 : 0.9}
      //boxShadow="0 10px 30px rgba(0,0,0,0.2)"
    >
      {/* Background Image - Full Card Coverage */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={0}
      >
        <EnhancedImage
          src={meal.image_url || meal.thumbnail_url || meal.image || '/default-meal.jpg'}
          alt={displayName}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Gradient Overlays for better text visibility */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient={`linear(to-b, rgba(0,0,0,0.6) 0%, transparent 40%,  rgba(0, 32, 22, 0.8) 70%, rgba(0, 32, 22, 0.8) 100%)`}
          zIndex={1}
        />
      </Box>

      {/* Top Section - Badges and Status */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        zIndex={2}
        p={4}
      >
        <Flex justify="space-between" align="flex-start">
          {/* Discount Badge */}
          {meal.is_discount_active && meal.discount_percentage > 0 && (
            <Badge
              colorScheme="red"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="bold"
              //boxShadow="0 4px 12px rgba(0,0,0,0.3)"
              //backdropFilter="blur(10px)"
            >
              -{meal.discount_percentage.toFixed(0)}% OFF
            </Badge>
          )}
          
          {/* Prep Time */}
          {meal.prep_time_minutes && (
            <Badge
              bg="rgba(0,0,0,0.6)"
              color="white"
              fontSize="xs"
              px={3}
              py={1}
              borderRadius="full"
              //backdropFilter="blur(10px)"
              fontWeight="medium"
            >
              ⏱️ {meal.prep_time_minutes} {t('minutes')}
            </Badge>
          )}
        </Flex>

        {/* Dietary Badges - Top Right Corner */}
        <Box mt={2}>
          <DietaryBadges meal={meal} size="xs" />
        </Box>
      </Box>

      {/* Bottom Section - Content and Controls */}
      <VStack
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        zIndex={2}
        p={4}
        spacing={3}
        align="stretch"
      >
        {/* Title with Glassmorphism Effect */}
        <Box
          bg={'#ffffffca'}
          //backdropFilter="blur(20px)"
          borderRadius="lg"
          p={1}
          border="1px solid transparent"
          h={"fit-content"}
          w={"fit-content"}
          //borderColor="whiteAlpha.300"
          //boxShadow="0 8px 32px rgba(0,0,0,0.3)"
        >
          <Heading
            size="md"
            color="brand.700"
            noOfLines={2}
            lineHeight="1.1"
            fontSize={{ base: "lg", md: "xl" }}
            //textShadow="0 2px 8px rgba(0,0,0,0.5)"
          >
            {displayName}
          </Heading>
          
         
        </Box>

        {/* Price and Action Bar */}
        <Flex
          bg={'#000000a9'}//{contentBg}
          //backdropFilter="blur(20px)"
          borderRadius="lg"
          p={3}
          align="center"
          justify="space-between"
          border="1px solid"
          borderColor="transparent"
          //boxShadow="0 8px 32px rgba(255, 255, 255, 0.3)"
        >
          <Box>
            <PriceDisplay
              base_price={meal.base_price || meal.price || 0}
              is_discount_active={meal.is_discount_active}
              discount_percentage={meal.discount_percentage}
              size="xl"
            />
          </Box>
          
          {/* Add to Cart Button with Glow Effect */}
          <IconButton
            icon={<FaCartPlus size={20} color={'#03543cff'}/>}
            size="lg"
            onClick={handleAddToCart}
            colorScheme="secondary"
            variant="solid"
            borderRadius="full"
            aria-label={t('addToCart')}
            //boxShadow="0 4px 20px rgba(3, 137, 79, 0.4)"
            _hover={{
              transform: 'scale(1.1)',
              //boxShadow: '0 6px 30px rgba(3, 137, 79, 0.6)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s"
          />
        </Flex>

        {/* Status Badge at Bottom shadow*/}
        <Flex justify="center">
          <Badge
            colorScheme="secondary"
            fontSize="xs"
            px={3}
            py={1}
            borderRadius="full"
            bg="rgba(9, 156, 102, 0.56)"
            color="green.300"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="transparent"
          >
            ✓ {t('available')}
          </Badge>
        </Flex>
      </VStack>

      {/* Hover Border Effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        border="3px solid"
        borderColor={borderColor}
        borderRadius="xl"
        pointerEvents="none"
        transition="all 0.3s"
        opacity={0}
        _groupHover={{ opacity: 1 }}
        zIndex={3}
      />
    </Box>
  );
};

// Enhanced Full Meal Card with Add to Cart Modal
export const MealCard = ({ meal, isModal = false, onClose, quantity = 1, setQuantity, onAddToCart
 }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const { addMealToCart } = useCart();
  
  const isArabic = currentLanguage === 'ar';
  const displayName = isArabic && meal.name_arabic ? meal.name_arabic : meal.name;
  const displayDescription = isArabic && meal.description_arabic ? meal.description_arabic : meal.description;
  
  // Responsive values for modal vs regular card
  const cardWidth = isModal ? '80%' : useBreakpointValue({ base: '80vw', md: '70vw' ,lg:'50vw'});
  const imageHeight = isModal ? '250px' : useBreakpointValue({ base: '150px', sm: '210px' });

  const handleAddToCart = useCallback(() => {
    if (!validateMealForCart(meal)) {
      console.error('Cannot add invalid meal to cart');
      return;
    }

    onAddToCart();
    if (onClose) onClose();
  }, [meal, displayName, displayDescription, quantity, addMealToCart, onClose]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  if (!meal.is_available) return null;

  const CardContent = (
    <VStack spacing="2" align="stretch" >
      {/* Image Section */}
      <Box position="relative">
        <EnhancedImage
          src={meal.image_url|| mealPlaceHolder}
          alt={displayName}
          height={imageHeight}
          borderRadius="lg"
        />
        
        {/* Discount Badge */}
        {meal.is_discount_active && meal.discount_percentage > 0 && (
          <Badge
            position="absolute"
            top="12px"
            right="12px"
            colorScheme="red"
            borderRadius="full"
            px="3"
            py="1"
            fontSize="sm"
            fontWeight="bold"
          >
            -{meal.discount_percentage.toFixed(0)}% OFF
          </Badge>
        )}
      </Box>

      {/* Content Section */}
      <VStack align="stretch" spacing="3" flex="1">
        {/* Title and Prep Time */}
        <Flex justify="space-between" align="flex-start">
          <Heading 
            size="lg" 
            color={colorMode === 'dark' ? 'white' : 'brand.700'}
            flex="1"
            pr="2"
          >
            {displayName}
          </Heading>
          {meal.prep_time_minutes && (
            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
              {meal.prep_time_minutes} {t('minutes')}
            </Text>
          )}
        </Flex>
        
        {/* Description */}
        <Text 
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} 
          fontSize="sm"
          lineHeight="1.5"
        >
          {displayDescription}
        </Text>

        {/* Rating */}
        <StarRating 
          rating={meal.rating} 
          rating_count={meal.rating_count}
          size="md"
        />

        {/* Spice Level */}
        {meal.spice_level > 0 && (
          <Flex align="center" gap="2">
            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
              {t('spiceLevel')}:
            </Text>
            <Flex>
              {Array(5).fill('').map((_, i) => (
                <Box
                  key={i}
                  w="2"
                  h="2"
                  bg={i < meal.spice_level ? 'red.400' : 'gray.300'}
                  borderRadius="full"
                  mx="0.5"
                />
              ))}
            </Flex>
          </Flex>
        )}

        {/* Dietary Information */}
        <DietaryBadges meal={meal} size="sm" />

        <Divider />

        {/* Price Section */}
        <Flex justify="space-between" align="center">
          <PriceDisplay
            base_price={meal.base_price}
            is_discount_active={meal.is_discount_active}
            discount_percentage={meal.discount_percentage}
            size="xl"
          />
          
          <VStack spacing="1">
            <Badge colorScheme="blue" variant="subtle" borderRadius="full">
              {meal.section ? t(`foodCategories.${meal.section?.toLowerCase?.()}`) : t('uncategorized')}
            </Badge>
            <Badge colorScheme="green" borderRadius="full">
              {t('ready')}
            </Badge>
          </VStack>
        </Flex>

        {/* Quantity and Add to Cart for Modal */}
        {isModal && (
          <>
            <Divider />
            <VStack spacing="4">
              {/* Quantity Selector */}
              <Flex align="center" justify="center" gap="4">
                <Text fontWeight="medium">{t('quantity')}:</Text>
                <HStack>
                  <IconButton
                    icon={<MinusIcon />}
                    size="sm"
                    onClick={decrementQuantity}
                    isDisabled={quantity <= 1}
                    borderRadius="full"
                  />
                  <Text 
                    minW="8" 
                    textAlign="center" 
                    fontWeight="bold" 
                    fontSize="lg"
                  >
                    {quantity}
                  </Text>
                  <IconButton
                    icon={<AddIcon />}
                    size="sm"
                    onClick={incrementQuantity}
                    borderRadius="full"
                  />
                </HStack>
              </Flex>

              {/* Total Price */}
              <Text fontSize="lg" fontWeight="bold" color="secondary.800">
                {t('total')}: {((meal.base_price || meal.price || 0) * quantity).toFixed(2)} {t('currency')}
              </Text>

              {/* Add to Cart Button */}
              <Button
                colorScheme="brand"
                size="lg"
                width="full"
                onClick={handleAddToCart}
                leftIcon={<AddIcon />}
              >
                {t('addToCart')}
              </Button>
            </VStack>
          </>
        )}
      </VStack>
    </VStack>
  );

  // Return modal version or regular card
  if (isModal) {
    return CardContent;
  }

  return (
    <Box
      padding={2}
      w={cardWidth}
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      bg={colorMode === 'dark' ? 'gray.800' : 'warning.400'}
      borderColor={'transparent'}
      transition="all 0.3s ease"
      _hover={{ 
        transform: 'translateY(-4px)',
      }}
      p="4"
    >
      {CardContent}
    </Box>
  );
};

// Main Component with Modal System
export const MealCardWithModal = ({ meal, colorInHex = MENU_THEMES.cards.default }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [quantity, setQuantity] = useState(1);
  const { t } = useTranslation();
  const { addMealToCart } = useCart();
  const toast = useToast();

  const handleAddToCart = () => {
    const result = addMealToCart({
      meal_id: meal.id,
      name: meal.name,
      name_arabic: meal.name_arabic,
      description: meal.description,
      unit_price: meal.base_price || meal.price || 0,
      quantity: quantity,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
      is_selective: meal.is_selective
    });

    if (result.success) {
      // toast({
      //   title: t('addedToCart') || "Added to cart!",
      //   description: `${quantity} × ${meal.name} added to your cart`,
      //   status: "success",
      //   duration: 3000,
      //   isClosable: true,
      //   position: "top-right",
      // });
      
      onClose();
      setQuantity(1);
    } else {
      toast({
        title: t('addToCartError') || "Error",
        description: t('failedToAdd') || "Failed to add item to cart",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <MinimalMealCard meal={meal} onClick={onOpen} colorInHex={colorInHex} />
      
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered scrollBehavior={'inside'}>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          bg="secondary.100"
          w={{ base: '90vw', sm: '400px', md: '500px', lg: '600px' }}
          my={4}
          py={0}
          px={1}
          maxH={'92%'}
        >
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <Text fontSize="2xl" fontWeight="bold">
                {t('addToCart')}
              </Text>
              <ModalCloseButton position="relative" />
            </Flex>
          </ModalHeader>
          <ModalBody>
            <ScaleFade initialScale={0.9} in={isOpen}>
              <MealCard 
                meal={meal} 
                isModal={true} 
                onClose={onClose} 
                quantity={quantity}
                setQuantity={setQuantity}
                onAddToCart={handleAddToCart}
              />
            </ScaleFade>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
// Premium Food Card - More detailed with rating, tag, and action buttons
export const PremiumMealCard = ({ meal }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { addMealToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Extract values from meal object
  const {
    id,
    name,
    description,
    price,
    offerRatio,
    rate,
    section,
    type = 'ready',
    image_url: image,
    discount_percentage,
    is_discount_active: hasOffer,
  } = meal;

  const effectivePrice = hasOffer && discount_percentage > 0
  ? price * (1 - discount_percentage / 100)
  : price;

const handleConfirm = () => {
  addMealToCart({
    meal_id: id,
    name: name,
    unit_price: effectivePrice,
    quantity: quantity,
    //image: image,
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <Box
        maxW="320px"
        borderRadius="xl"
        overflow="hidden"
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
        position="relative"
        borderWidth="1px"
      >
        {hasOffer && (
          <Badge
            position="absolute"
            top="10px"
            right="10px"
            colorScheme="green"
            borderRadius="full"
            px="2"
            py="1"
          >
            {t('offer')} {discount_percentage.toFixed(0)}% OFF
          </Badge>
        )}

        <Image
          src={image || unknownDefaultImage}
          alt={name}
          height="180px"
          width="100%"
          objectFit="cover"
        />

        <Box p="5">
          <Flex justifyContent="space-between" alignItems="center" mb="2">
            <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'}>
              {name}
            </Heading>
            <Badge colorScheme="brand" variant="subtle" borderRadius="full">
              {t(`foodCategories.${section?.toLowerCase?.()}`)}
            </Badge>
          </Flex>

          <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} fontSize="sm" mb="3">
            {description}
          </Text>

          <Flex align="center" mt="2" mb="3">
            {Array(5)
              .fill('')
              .map((_, i) => (
                <StarIcon
                  key={i}
                  color={i < (rate || 0) ? 'brand.500' : 'gray.300'}
                  boxSize="3"
                  mr="1"
                />
              ))}
            <Text ml="1" fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
              {rate?.toFixed?.(1) || '0.0'} {t('stars')}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" mt="4">
            <Box>
              {hasOffer && (
                <Text
                  as="span"
                  fontSize="sm"
                  color="gray.500"
                  textDecoration="line-through"
                  mr="1"
                >
                  ${(price / (1 - discount_percentage/100)).toFixed(2)}
                </Text>
              )}
              <Text fontWeight="bold" fontSize="xl" color="brand.700" as="span">
                ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
              </Text>
            </Box>
            <Button colorScheme="brand" size="md" onClick={() => setIsModalOpen(true)}>
              {t('addToCart')}
            </Button>
          </Flex>
        </Box>
      </Box>

      {isModalOpen && (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          name={displayName}
          price={price}
          quantity={quantity}
          setQuantity={setQuantity}
          onConfirm={handleConfirm}
          t={t}
          hasOffer={hasOffer}
          discountPercentage={discount_percentage}
          colorMode={colorMode}
        />
      )}
    </>
  );
};



//featured cards
export const FeaturedMealCard = ({ item, index = 0 }) => {
  const { colorMode } = useColorMode();
  const { t, i18n } = useTranslation();
  const { addMealToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isArabic = i18n.language === 'ar';
  const toast = useToast(); 
  // Extract properties from item object
  const {
    id,
    name,
    name_arabic,
    description,
    description_arabic,
    base_price = 0, // Default to 0 if undefined
    rating: rate = 0,
    rating_count = 0,
    section,
    image_url: image,
    is_featured,
    is_discount_active: hasOffer = false,
    discount_percentage = 0,
    is_vegetarian,
    is_vegan,
    is_gluten_free,
    is_dairy_free,
    prep_time_minutes
  } = item;

  // Validate base_price
  if (typeof base_price !== 'number' || base_price <= 0) {
    console.error('Invalid base_price for meal:', item);
    return null;
  }

  // Price calculations (only using base_price)
  const originalPrice = base_price;
  const effectivePrice = hasOffer && discount_percentage > 0
    ? base_price * (1 - discount_percentage / 100)
    : base_price;

  // Display names based on language
  const displayName = isArabic ? name_arabic || name : name;
  const handleAddToCart = () => {
    const result = addToCart({
      id: meal.id,
      name: isArabic ? meal.name_arabic : meal.name,
      price: meal.basePrice || 28,
      image: meal.image_url || meal.thumbnailUrl,
      qty: quantity
    });

    if (result.success) {
      toast({
        title: t('addedToCart') || "Added to cart!",
        description: `${quantity} × ${isArabic ? meal.name_arabic : meal.name} added to your cart`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      setIsModalOpen(false);
      setQuantity(1);
    }
  };

  // Responsive values
  const cardWidth = useBreakpointValue({ 
    base: '190px',
    sm: '200px', 
    md: '200px', 
    lg: '220px',
    xl: '240px'
  });
  
  const cardHeight = useBreakpointValue({ 
    base: '100%',
    sm: '90%', 
    md: '95%',
    lg: '98%'
  });
  
  const imageHeight = useBreakpointValue({ 
    base: '180px',
    sm: '200px', 
    md: '220px',
    lg: '240px'
  });

  // Color values
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'brand.200';
  const hoverBg = colorMode === 'dark' ? 'gray.750' : 'brand.50';

  return (
    <>
      <Box
        w={cardWidth}
        h={cardHeight}
        bg={cardBg}
        borderWidth="3px"
        borderColor={borderColor}
        borderRadius="14px"
        overflow="hidden"
        cursor="pointer"
        transition="all 0.2s ease"
        _hover={{
          transform: 'translateY(-4px)',
          borderColor: 'brand.600',
          bg: hoverBg,
        }}
        onClick={() => setIsModalOpen(true)}
        position="relative"
        flexShrink={0} 
        pb={8}
        mb={2}
        mx={2}
      >
        {/* Top Badges Row */}
        <Box position="absolute" top="8px" left="8px" right="8px" zIndex={3}>
          <Flex justify="space-between" align="flex-start">
            {/* Featured Badge */}
            {is_featured && (
              <Badge
                colorScheme="yellow"
                borderRadius="full"
                px="2"
                py="0.5"
                fontSize="2xs"
                fontWeight="bold"
              >
                <StarIcon boxSize="2" mr="1" /> {t('featured')}
              </Badge>
            )}
            
            {/* Discount Badge */}
            {hasOffer && discount_percentage > 0 && (
              <Badge
                colorScheme="red"
                borderRadius="full"
                px="2"
                py="0.5"
                fontSize="2xs"
                fontWeight="bold"
              >
                -{discount_percentage.toFixed(0)}%
              </Badge>
            )}
          </Flex>
        </Box>

        {/* Image Section */}
        <Box position="relative" h={imageHeight} w="100%">
          <EnhancedImage
            src={image}
            alt={displayName}
            height="100%"
            width="100%"
            objectFit="cover"
            fallback={unknownDefaultImage}
          />
          
          {/* Bottom overlay with rating and time */}
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            bg="linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))"
            p="2"
          >
            <Flex justify="space-between" align="center">
              <StarRating 
                rating={rate} 
                rating_count={rating_count}
                size="xs"
                showCount={false}
                color="white"
              />
              {prep_time_minutes && (
                <Text fontSize="2xs" color="white" fontWeight="medium">
                  ⏱️ {prep_time_minutes}min
                </Text>
              )}
            </Flex>
          </Box>
        </Box>

        {/* Content Section */}
        <Box p="3" h={`calc(${cardHeight} - ${imageHeight})`}>
          <VStack spacing="2" align="stretch" h="100%">
            
            {/* Title and Category */}
            <Box>
              <Heading
                textAlign={'center'}
                color={colorMode === 'dark' ? 'white' : 'brand.700'}
                noOfLines={2}
                lineHeight="1.3"
                mb="1"
                fontSize={useBreakpointValue({ base: 'lg', md: 'xl' })}
              >
                {displayName}
              </Heading>
              
              <Badge
                colorScheme="brand"
                variant="subtle"
                fontSize="2xs"
                borderRadius="full"
                px="2"
                py="0.5"
              >
                {section ? t(`foodCategories.${section?.toLowerCase?.()}`) : t('uncategorized')}
              </Badge>
            </Box>

            {/* Dietary Badges */}
            <Box>
              <DietaryBadges meal={item} size="2xs" maxDisplay={3} />
            </Box>

            {/* Price and Action Section */}
            <Box mt="auto">
              <Flex justify="space-between" align="center" mb="2">
                <VStack spacing="0" align="flex-start">
                  {/* Original price if discounted */}
                  {hasOffer && discount_percentage > 0 && (
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textDecoration="line-through"
                      lineHeight="1"
                    >
                      {originalPrice.toFixed(2)}{t('currency')}
                    </Text>
                  )}
                  
                  {/* Current price */}
                  <Text
                    fontWeight="bold"
                    fontSize={useBreakpointValue({ base: 'lg', md: 'xl' })}
                    color={hasOffer ? 'green.500' : 'brand.700'}
                    lineHeight="1"
                  >
                    {effectivePrice.toFixed(2)}{t('currency')}
                  </Text>
                </VStack>

                {/* Compact Add Button */}
                <IconButton
                  colorScheme="brand"
                  size="sm"
                  icon={<Image src={cartIcon} alt="Cart" boxSize="4" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsModalOpen(true)
                  }}
                  borderRadius="full"
                  aria-label={t('addToCart')}
                />
              </Flex>
            </Box>
          </VStack>
        </Box>
      </Box>

      {/* Add to Cart Modal */}
      {isModalOpen && (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          name={displayName}
          price={base_price}
          quantity={quantity}
          setQuantity={setQuantity}
          onConfirm={handleConfirm}
          t={t}
          hasOffer={hasOffer}
          discountPercentage={discount_percentage}
          colorMode={colorMode}
        />
      )}
    </>
  );
};
//offers meal cards
export const OfferMealCard = ({ meal }) => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addMealToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'
  
  // Extract properties from meal object
 const {
  id,
  name,
  name_arabic,
  description,
  description_arabic,
  base_price,
  discount_percentage = 0,
  discount_valid_until,
  rating,
  rating_count,
  section,
  image_url: image,
  is_premium,
  is_vegetarian,
  is_vegan,
  is_gluten_free,
  is_dairy_free,
  created_at,
  updated_at
} = meal

// Calculate effective price and discount
const currentDate = new Date();
const isDiscountActive = discount_valid_until && new Date(discount_valid_until) > currentDate;
const discountPercentage = isDiscountActive ? discount_percentage : 0;
const effectivePrice = isDiscountActive && discount_percentage > 0
  ? base_price * (1 - discount_percentage / 100)
  : base_price;

// Determine dietary badges
const dietaryBadges = [];
if (is_vegetarian) dietaryBadges.push('vegetarian');
if (is_vegan) dietaryBadges.push('vegan');
if (is_gluten_free) dietaryBadges.push('glutenFree');
if (is_dairy_free) dietaryBadges.push('dairyFree');
if (is_premium) dietaryBadges.push('premium');

// Translation-aware content
const currentLanguage = useI18nContext().currentLanguage;
const displayName = currentLanguage === 'ar' ? name_arabic || name : name;
const displayDescription = currentLanguage === 'ar' 
  ? description_arabic || description 
  : description;

const handleConfirm = () => {
  addMealToCart({
    meal_id: id,
    name: displayName,
    unit_price: effectivePrice,
    quantity: quantity,
  })
  setIsModalOpen(false)
}

return (
  <>
    <Box
      maxW={['62vw', '54vw', '28vw']}
      minW={['50vw', '48vw', '20vw']}
      w="full"
      borderRadius="8%"
      overflow="hidden"
      position="relative"
      transition="transform 0.3s"
      _hover={{ transform: 'translateY(-1vw)' }}
      height="55vh"
      my="2vh"
    >
      <Box position="relative" height="100%" zIndex={0}>
        <Image
          src={image || unknownDefaultImage}
          alt={displayName}
          height="100%"
          width="100%"
          objectFit="cover"
          filter="brightness(0.7)"
        />

        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          justifyContent="space-between"
          zIndex={2}
          p={2}
        >
          <Flex gap={2} wrap="wrap">
            {dietaryBadges.map(badge => (
              <Badge 
                key={badge}
                colorScheme={badge === 'premium' ? 'purple' : 'green'} 
                variant="solid" 
                borderRadius="full" 
                px={2}
                fontSize="xs"
              >
                {t(`dietary.${badge}`)}
              </Badge>
            ))}
            {isDiscountActive && (
              <Badge colorScheme="red" variant="solid" borderRadius="full" px={2} fontSize="xs">
                {t('offer')} {discountPercentage}% OFF
              </Badge>
            )}
          </Flex>
          <Badge 
            bg="brand.600" 
            color="white" 
            borderRadius="full" 
            px={2} 
            fontSize="xs"
          >
            {t(`foodCategories.${section?.toLowerCase?.()}`)}
          </Badge>
        </Flex>
      </Box>

      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'}
        p="2vw"
        borderTopRadius="lg"
        zIndex={2}
      >
        <Flex justify="space-between" align="center" mb="1vw">
          <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1}>
            {displayName}
          </Heading>
          <Flex direction="column" align="flex-end">
            {isDiscountActive && (
              <Text as="s" fontSize="sm" color="gray.500" mr={1}>
                {t("common.currency")}{base_price.toFixed(2)}
              </Text>
            )}
            <Text fontWeight="bold" fontSize="xl" color="brand.700">
              {t("common.currency")}{effectivePrice.toFixed(2)}
            </Text>
          </Flex>
        </Flex>

        <Text
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
          fontSize="sm"
          mb="1vw"
          noOfLines={2}
        >
          {displayDescription}
        </Text>

        <Flex justify="space-between" align="center">
          <Flex align="center">
            {Array(5)
              .fill('')
              .map((_, i) => (
                <StarIcon
                  key={i}
                  color={i < Math.floor(rating) ? 'yellow.400' : 'gray.300'}
                  boxSize="1.2em"
                />
              ))}
            <Text mx={2} fontSize="sm">
              ({rating?.toFixed?.(1) || '0.0'}) {rating_count ? `(${rating_count})` : ''}
            </Text>
          </Flex>
          <Button 
            colorScheme="brand" 
            size="sm" 
            onClick={() => setIsModalOpen(true)}
            rightIcon={<Image src={cartIcon} alt="Cart" boxSize="1.7em" ml={1} />}
          >
            {t('addToCart')}
          </Button>
        </Flex>
      </Box>
    </Box>

    {/* Add to Cart Modal */}
    {isModalOpen && (
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        name={displayName}
        basePrice={base_price}
        price={effectivePrice}
        quantity={quantity}
        setQuantity={setQuantity}
        onConfirm={handleConfirm}
        t={t}
        hasOffer={isDiscountActive}
        discountPercentage={discount_percentage}
        colorMode={colorMode}
        dietaryFlags={{
          vegetarian: is_vegetarian,
          vegan: is_vegan,
          glutenFree: is_gluten_free,
          dairyFree: is_dairy_free
        }}
      />
    )}
  </>
)
}
export const PlanCard = ({ plan }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  const saladImage = saladsPlanImage // Fallback image for salad plans

  // Color mode specific styling
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.800', 'white')
  const descriptionBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800')
  const shadowColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)')

  // Fallback image if plan.image is not provided
  const imageUrl =
    plan?.image ||
    (() => {
      if (plan?.title?.includes('Gain Weight')) return gainWeightPlanImage
      if (plan?.title?.includes('Keep Weight')) return keepWeightPlanImage
      if (plan?.title?.includes('Lose Weight')) return loseWeightPlanImage
      if (plan?.title?.includes('Salad')) return saladsPlanImage
      return dailyMealPlanImage
    })()
  //useEffect(()=>//console.log(` from PlanCard ${JSON.stringify(plan)}`),[])
  // Construct description from plan data - with null checks
  const description = plan
    ? `${plan.carb || 0}g ${t('carbs')} • ${plan.protein || 0}g ${t('protein')} • ${plan.kcal || 0}${t('kcal')}`
    : ''
  const macros = description?.split(' • ')

  // Debug logs - remove in production
  // //console.log('PlanCard received plan:', plan);
  // //console.log('Image URL being used:', imageUrl);

  return (
    <Box
      width="98%"
      minWidth={"250px"}
      height="55vh"
      borderRadius="50px"
      overflow="hidden"
      position="relative"
      bg={cardBg}
      mx="auto"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
      }}
    >
      {/* Skeleton loader shown while image is loading */}
      {!imageLoaded && !imageError && (
        <Skeleton
          height="100%"
          width="100%"
          position="absolute"
          startColor="gray.100"
          endColor="gray.300"
        />
      )}

      {/* Actual image - with error handling */}
      <Image
        src={imageUrl}
        alt={plan?.title || 'Meal Plan'}
        width="100%"
        height="100%"
        objectFit="cover"
        opacity={imageLoaded ? 1 : 0}
        transition="opacity 0.5s"
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          console.error('Image failed to load:', imageUrl)
          setImageError(true)
          setImageLoaded(true)
        }}
        fallback={
          <Box
            width="100%"
            height="100%"
            bg="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner color='brand.300'/>
          </Box>
        }
      />

      {/* Gradient overlay for better text visibility */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} />

      {/* Content container */}
      <Flex
        position="absolute"
        direction="column"
        bottom={0}
        left={0}
        right={0}
        p={10}
        textAlign={isArabic ? 'right' : 'left'}
      >
        

        {/* Plan name */}
        <Heading
          as="h2"
          color="white"
          mb={2}
          fontSize="2xl"
          textShadow="0 2px 4px rgba(0,0,0,0.4)"
          bg={'rgba(0,0,0,0.7) 90%'}
          className={isArabic ? 'readex-pro' : 'montserrat'}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {isArabic ? plan.title_arabic : plan.title}
        </Heading>

        {/* Macros display */}
        <Flex gap={2} mb={1} flexWrap="wrap" justifyContent={isArabic ? 'flex-end' : 'flex-start'}>
          {macros?.map((macro, index) => (
            <Badge
              key={index}
              colorScheme={index === 0 ? 'warning' : index === 1 ? 'brand' : 'teal'}
              px={2}
              py={1}
              borderRadius="md"
              size={"xs"}
              fontSize="xs"
              variant={"solid"}
            >
              {macro}
            </Badge>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
