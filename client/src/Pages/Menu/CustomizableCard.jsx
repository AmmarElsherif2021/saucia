// CustomizableCard.jsx 
import { useState, useCallback, useEffect } from 'react'
import mealImage from '../../assets/menu/defaultMeal.jpg'
import {
  Box,
  Text,
  useDisclosure,
  Image,
  Heading,
  Flex,
  useColorMode,
  Badge,
  VStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { CustomizableMealModal } from './CustomizableMealModal'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'
import { FaCartPlus } from 'react-icons/fa'

// Free item counts for each salad section
const SECTION_FREE_COUNTS = {
  protein: { value: 0, key_arabic: 'بروتين' },
  nuts: { value: 1, key_arabic: 'مكسرات' },
  dressings: { value: 1, key_arabic: 'صوصات' },
  Fruits: { value: 1, key_arabic: 'الفواكه' },
  Cheese: { value: 1, key_arabic: 'جبن' },
  Greens: { value: 2, key_arabic: 'الخضار الورقية' },
  'add-ons': { value: 2, key_arabic: 'ملحقات' },
  Vegetables: { value: 4, key_arabic: 'خضروات' },
}

// Free item count for fruit salad section
const FRUIT_SECTION_FREE_COUNT = {
  'salad-fruits': { value: 5, key_arabic: 'سلطة فواكه' },
}

// Enhanced Image Component for CustomizableCard
const EnhancedImage = ({ 
  src, 
  alt, 
  fallback = mealImage,
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

export const CustomizableMealCard = ({
  meal,
  selectableItems,
  onhandleAddToCart,
  unsafeItemIds = [],
  userAllergies = [],
  isItemSafe = () => true,
  isMealUnsafe = false,
  mealAllergens = [],
  colorInHex = '#03894f',
  applyTransparency,
  transparency
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { currentLanguage } = useI18nContext();
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isArabic = currentLanguage === 'ar';
  useEffect(() => {
    //console.log(`selectableItems for meal ${meal.id}:`, JSON.stringify(selectableItems));
  }, [selectableItems, meal.id]);
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

  const [imageLoaded, setImageLoaded] = useState(false);

  // Group selectable items by their category
  const groupedItems = selectableItems.reduce((acc, item) => {
    const section = item.category || 'Uncategorized'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(item)
    return acc
  }, {})

  /**
   * Handle confirmation from the modal
   * Converts selectedItems object to array with ONE entry per unique item
   */
  const handleConfirm = (selectedItems, totalPrice) => {
    console.group('🎯 CUSTOMIZABLE CARD - HANDLE CONFIRM')
    //console.log('Selected items from modal (object):', selectedItems)
    //console.log('Total price:', totalPrice)
    
    // Convert selectedItems object to array format expected by cart
    const addOnsArray = Object.entries(selectedItems)
      .filter(([itemId, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        // Find the item in groupedItems to get full details
        let itemDetails = null
        for (const section of Object.values(groupedItems)) {
          itemDetails = section.find(item => item.id == itemId)
          if (itemDetails) break
        }
        
        if (!itemDetails) {
          console.warn('Item not found:', itemId)
          return null
        }
        
        return {
          item_id: itemDetails.id,
          name: itemDetails.name,
          name_arabic: itemDetails.name_arabic,
          category: itemDetails.category,
          unit_price: itemDetails.price || 0,
          quantity: Number(quantity)
        }
      })
      .filter(Boolean) // Remove null entries

    //console.log('Final addOns array:', addOnsArray)
    console.groupEnd()
    
    // Call parent handler with the correct parameters
    onhandleAddToCart(meal, addOnsArray, totalPrice)
  }

  // Get display values
  const displayPrice = meal.price || meal.base_price || 0
  const mealName = isArabic ? meal.name_arabic || meal.name : meal.name
  const mealDescription = isArabic
    ? meal.description_arabic || meal.description
    : meal.description;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true);
  };

  const handleCustomizeClick = (e) => {
    e.stopPropagation();
    onOpen();
  };

  // Calculate total free items
  const totalFreeItems = Object.values(SECTION_FREE_COUNTS).reduce(
    (acc, count) => acc + count.value,
    0,
  );

  return (
    <>
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
        }}
        onClick={onOpen}
        opacity={imageLoaded ? 1 : 0.9}
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
            src={meal.image_url || meal.thumbnail_url || meal.image || mealImage}
            alt={mealName}
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
            bgGradient="linear(to-b, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.8) 100%)"
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
            {/* Customizable Badge */}
            <Badge
              colorScheme="brand"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="bold"
              bg="rgba(3, 137, 79, 0.9)"
              color="white"
            >
              {t('menuPage.customizable')}
            </Badge>
            
            {/* Prep Time */}
            {meal.prep_time_minutes && (
              <Badge
                bg="rgba(0,0,0,0.6)"
                color="white"
                fontSize="xs"
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="medium"
              >
                ⏱️ {meal.prep_time_minutes} {t('common.minutes')}
              </Badge>
            )}
          </Flex>

          {/* Free Items Info */}
          <Box mt={2}>
            <Badge
              colorScheme="green"
              variant="solid"
              fontSize="xs"
              borderRadius="full"
              px={2}
              py={1}
              bg="rgba(34, 197, 129, 0.9)"
            >
              {t('menuPage.freeItems', { count: totalFreeItems })}
            </Badge>
          </Box>
        </Box>

        {/* Middle Section - Title and Description */}
        <VStack
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={2}
          p={4}
          spacing={3}
          align="center"
          textAlign="center"
          w="90%"
        >
          {/* Title with Glassmorphism Effect */}
          <Box
            bg={'#ffffffca'}
            borderRadius="lg"
            p={3}
            border="1px solid transparent"
            w="fit-content"
            maxW="100%"
          >
            <Heading
              size="md"
              color="brand.700"
              noOfLines={2}
              lineHeight="1.1"
              fontSize={{ base: "lg", md: "xl" }}
            >
              {mealName}
            </Heading>
          </Box>

          {/* Description */}
          {mealDescription && (
            <Box
              bg="rgba(0,0,0,0.7)"
              borderRadius="lg"
              p={2}
              border="1px solid transparent"
              maxW="100%"
            >
              <Text
                fontSize="sm"
                color="gray.100"
                noOfLines={3}
                lineHeight="1.4"
              >
                {mealDescription}
              </Text>
            </Box>
          )}
        </VStack>

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
       

          {/* Price and Customize Button */}
          <Flex
            bg={'#000000a9'}
            borderRadius="lg"
            p={3}
            align="center"
            justify="space-between"
            border="1px solid"
            borderColor="transparent"
          >
            <Box>
              <Text
                fontWeight="bold"
                fontSize="xl"
                color="secondary.800"
                lineHeight="1.2"
              >
                {displayPrice.toFixed(2)} {t('common.currency')}
              </Text>
              <Text fontSize="xs" color="gray.300">
                {t('common.price')}
              </Text>
            </Box>
            
            {/* Customize Button with Glow Effect */}
            <IconButton
              icon={<FaCartPlus size={20} color={'#03543cff'}/>}
              size="lg"
              onClick={handleCustomizeClick}
              colorScheme="secondary"
              variant="solid"
              borderRadius="full"
              aria-label={t('menuPage.customize')}
              _hover={{
                transform: 'scale(1.1)',
              }}
              _active={{
                transform: 'scale(0.95)',
              }}
              transition="all 0.2s"
            />
          </Flex>

          {/* Status Badge */}
          <Flex justify="center">
            <Badge
              colorScheme="secondary"
              fontSize="xs"
              px={3}
              py={1}
              borderRadius="full"
              bg="rgba(9, 156, 112, 0.56)"
              color="green.300"
              border="1px solid"
              borderColor="transparent"
            >
              {t('menuPage.fullyCustomizable')}
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

      {/* Modal for customizing meal */}
      <CustomizableMealModal
        isOpen={isOpen}
        onClose={onClose}
        meal={meal}
        groupedItems={groupedItems}
        isArabic={isArabic}
        t={t}
        sectionFreeCounts={SECTION_FREE_COUNTS}
        onConfirm={handleConfirm}
        unsafeItemIds={unsafeItemIds}
        userAllergies={userAllergies}
        isItemSafe={isItemSafe}
      />
    </>
  )
}