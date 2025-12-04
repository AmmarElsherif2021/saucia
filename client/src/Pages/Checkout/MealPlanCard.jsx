import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  Image,
  Text,
  Badge,
  Flex,
  Tooltip,
  VStack,
  HStack,
  Skeleton,
  useColorMode,
  useBreakpointValue,
  Heading
} from '@chakra-ui/react';
import { SmallCloseIcon, StarIcon, AddIcon } from '@chakra-ui/icons';

// Enhanced Image Component with loading states (from Cards.jsx)
const EnhancedImage = ({ 
  src, 
  alt, 
  fallback = '/placeholder-food.jpg',
  width,
  height,
  borderRadius = 'md',
  objectFit = 'cover',
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
  }, []);

  const handleError = useCallback(() => {
    setImageState({
      isLoading: false,
      hasError: true,
      isLoaded: false
    });
  }, []);

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

// Improved Responsive MealPlanCard
export const MealPlanCard = ({ 
  meal, 
  index, 
  onRemove, 
  onChoose, 
  isArabic = false, 
  t = (key) => key,
  variant = 'default' // 'default', 'compact', 'grid'
}) => {
  const { colorMode } = useColorMode();
  
  // Responsive breakpoint values
  const cardHeight = useBreakpointValue({ 
    base: variant === 'compact' ? '140px' : '200px',
    sm: variant === 'compact' ? '160px' : '220px',
    md: variant === 'compact' ? '180px' : '240px',
    lg: '200px'
  });
  
  const fontSize = useBreakpointValue({
    base: 'sm',
    sm: 'md', 
    md: 'lg'
  });
  
  const badgeSize = useBreakpointValue({
    base: '2xs',
    sm: 'xs',
    md: 'sm'
  });
  
  const padding = useBreakpointValue({
    base: 2,
    sm: 3,
    md: 4
  });

  // Color scheme
  const cardBg = colorMode === 'dark' ? 'gray.800' : 'white';
  const borderColor = colorMode === 'dark' ? 'gray.700' : 'gray.200';
  const hoverBg = colorMode === 'dark' ? 'gray.750' : 'gray.50';
  
  const displayName = isArabic ? (meal.name_arabic || meal.name) : meal.name;
  const displayIngredients = isArabic ? (meal.ingredients_arabic || meal.ingredients) : meal.ingredients;

  return (
    <Box
      as={onRemove ? 'div' : Button}
      position="relative"
      w="100%"
      h={cardHeight}
      borderRadius="5px"
      overflow="hidden"
      borderWidth="2px"
      borderColor={borderColor}
      bg={cardBg}
      cursor={onChoose ? "pointer" : "default"}
      transition="all 0.3s ease"
      _hover={{
        transform: onChoose ? 'translateY(-2px)' : undefined,
        borderColor: onChoose ? 'blue.400' : borderColor,
        bg: onChoose ? hoverBg : cardBg,
        shadow: onChoose ? 'lg' : 'none'
      }}
      onClick={onChoose ? () => onChoose(meal) : undefined}
      p={0}
    >
      {/* Background Image with Enhanced Loading */}
      <Box position="relative" h="100%" w="100%">
        <EnhancedImage
          src={meal.image_url}
          alt={displayName}
          height="100%"
          width="100%"
          borderRadius="none"
          fallback="https://via.placeholder.com/300x200/gray/white?text=No+Image"
        />
        
        {/* Gradient Overlay */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          h="70%"
          bgGradient="linear(to-t, blackAlpha.700, blackAlpha.300, transparent)"
        />
      </Box>

      {/* Remove Button - Top Right */}
      {onRemove && (
        <IconButton
          aria-label="Remove meal"
          icon={<SmallCloseIcon />}
          size={useBreakpointValue({ base: 'sm', md: 'md' })}
          colorScheme="red"
          variant="solid"
          position="absolute"
          top={2}
          right={2}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          zIndex="3"
          borderRadius="full"
          opacity={0.9}
        />
      )}

      {/* Custom Badge - Top Left */}
      {meal.isCustom && (
        <Badge
          position="absolute"
          top="8px"
          left="8px"
          colorScheme="brand"
          variant="solid"
          fontSize={badgeSize}
          borderRadius="full"
          px="2"
          py="1"
          zIndex="2"
        >
          {t('customized')}
        </Badge>
      )}

      {/* Rating Badge - Top Center */}
      {meal.rate > 0 && (
        <Flex
          position="absolute"
          top="8px"
          left="50%"
          transform="translateX(-50%)"
          align="center"
          bg="blackAlpha.700"
          px="2"
          py="1"
          borderRadius="full"
          zIndex="2"
        >
          <StarIcon color="yellow.400" boxSize="3" mr="1" />
          <Text fontSize="xs" color="white" fontWeight="bold">
            {meal.rate.toFixed(1)}
          </Text>
        </Flex>
      )}

      {/* Content Overlay - Bottom */}
      <VStack
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        p={padding}
        spacing="2"
        align="stretch"
        zIndex="2"
      >
        {/* Meal Name */}
        <Heading
          size={useBreakpointValue({ base: 'sm', sm: 'md', md: 'lg' })}
          color="white"
          noOfLines={variant === 'compact' ? 1 : 2}
          textAlign="center"
          bg="rgba(0,0,0,0.6)"
          borderRadius="md"
          px="2"
          py="1"
        >
          {displayName}
        </Heading>

        {/* Nutrition Info Row */}
        <HStack 
          justify="center" 
          spacing="2" 
          wrap="wrap"
          maxW="100%"
        >
          {meal.kcal && (
            <Badge 
              colorScheme="secondary" 
              variant="solid" 
              fontSize={badgeSize}
              borderRadius="full"
              px="2"
            >
              {meal.kcal} kcal
            </Badge>
          )}
          {meal.protein && (
            <Badge 
              colorScheme="warning" 
              variant="solid" 
              fontSize={badgeSize}
              borderRadius="full"
              px="2"
            >
              {meal.protein}g protein
            </Badge>
          )}
          {meal.carb && (
            <Badge 
              colorScheme="brand" 
              variant="solid" 
              fontSize={badgeSize}
              borderRadius="full"
              px="2"
            >
              {meal.carb}g carbs
            </Badge>
          )}
        </HStack>

        {/* Ingredients with Tooltip - Only show if not compact */}
        {variant !== 'compact' && displayIngredients && (
          <Tooltip
            label={displayIngredients}
            placement="top"
            bg="gray.800"
            color="white"
            fontSize="sm"
            borderRadius="md"
            hasArrow
          >
            <Text
              fontSize="xs"
              color="whiteAlpha.900"
              textAlign="center"
              noOfLines={1}
              textShadow="0 1px 2px rgba(0,0,0,0.8)"
              cursor="help"
              bg="rgba(0,0,0,0.4)"
              borderRadius="sm"
              px="2"
              py="1"
            >
              {displayIngredients.length > 30 
                ? `${displayIngredients.substring(0, 30)}...` 
                : displayIngredients}
            </Text>
          </Tooltip>
        )}

        {/* Action Button for Choose Mode */}
        {onChoose && !onRemove && (
          <IconButton
            icon={<AddIcon/>}
            size="sm"
            colorScheme="brand"
            variant="solid"
            borderRadius="full"
            aria-label="Choose meal"
            alignSelf="center"
            mt="1"
          />
        )}
      </VStack>
    </Box>
  );
};

// Demo Component with Mock Data
export const MealPlanCardDemo = () => {
  const [selectedMeals, setSelectedMeals] = useState([]);
  
  const mockMeals = [
    {
      id: 1,
      name: "Grilled Salmon with Quinoa",
      name_arabic: "سلمون مشوي مع الكينوا",
      image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      kcal: 450,
      protein: 35,
      carb: 25,
      rate: 4.8,
      ingredients: "Fresh salmon, quinoa, broccoli, lemon, olive oil, herbs",
      ingredients_arabic: "سلمون طازج، كينوا، بروكلي، ليمون، زيت زيتون، أعشاب",
      isCustom: false
    },
    {
      id: 2,
      name: "Mediterranean Chicken Bowl",
      name_arabic: "وعاء الدجاج المتوسطي",
      image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      kcal: 520,
      protein: 42,
      carb: 30,
      rate: 4.6,
      ingredients: "Grilled chicken, brown rice, chickpeas, cucumber, tomatoes, feta cheese",
      ingredients_arabic: "دجاج مشوي، أرز بني، حمص، خيار، طماطم، جبن فيتا",
      isCustom: true
    },
    {
      id: 3,
      name: "Vegetarian Buddha Bowl",
      name_arabic: "وعاء بوذا النباتي",
      image_url: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
      kcal: 380,
      protein: 18,
      carb: 45,
      rate: 4.4,
      ingredients: "Sweet potato, avocado, kale, hemp seeds, tahini dressing",
      ingredients_arabic: "بطاطا حلوة، أفوكادو، كرنب، بذور القنب، صلصة الطحينة",
      isCustom: false
    },
    {
      id: 4,
      name: "Beef Stir Fry",
      name_arabic: "لحم بقري مقلي",
      image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      kcal: 480,
      protein: 38,
      carb: 22,
      rate: 4.7,
      ingredients: "Lean beef strips, mixed vegetables, ginger, soy sauce, jasmine rice",
      ingredients_arabic: "شرائح لحم بقري قليل الدهن، خضار مشكلة، زنجبيل، صلصة الصويا، أرز الياسمين",
      isCustom: false
    }
  ];

  const t = (key) => {
    const translations = {
      'checkout.customized': 'Custom',
      'meal.remove': 'Remove',
      'meal.choose': 'Choose'
    };
    return translations[key] || key;
  };

  const handleRemoveMeal = (mealId) => {
    setSelectedMeals(prev => prev.filter(meal => meal.id !== mealId));
  };

  const handleChooseMeal = (meal) => {
    if (!selectedMeals.find(m => m.id === meal.id)) {
      setSelectedMeals(prev => [...prev, meal]);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Responsive MealPlanCard Demo
        </h1>
        
        {/* Available Meals - Grid Layout */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Available Meals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockMeals.map((meal, index) => (
              <MealPlanCard
                key={meal.id}
                meal={meal}
                index={index}
                onChoose={handleChooseMeal}
                isArabic={false}
                t={t}
                variant="default"
              />
            ))}
          </div>
        </section>

        {/* Compact Variant Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Compact Variant</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockMeals.slice(0, 6).map((meal, index) => (
              <MealPlanCard
                key={`compact-${meal.id}`}
                meal={meal}
                index={index}
                onChoose={handleChooseMeal}
                isArabic={false}
                t={t}
                variant="compact"
              />
            ))}
          </div>
        </section>

        {/* Selected Meals - With Remove Functionality */}
        {selectedMeals.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">
              Selected Meals ({selectedMeals.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedMeals.map((meal, index) => (
                <MealPlanCard
                  key={`selected-${meal.id}`}
                  meal={meal}
                  index={index}
                  onRemove={() => handleRemoveMeal(meal.id)}
                  isArabic={false}
                  t={t}
                  variant="default"
                />
              ))}
            </div>
          </section>
        )}

        {/* Arabic Version Demo */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Arabic Version</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMeals.slice(0, 3).map((meal, index) => (
              <MealPlanCard
                key={`arabic-${meal.id}`}
                meal={meal}
                index={index}
                onChoose={handleChooseMeal}
                isArabic={true}
                t={t}
                variant="default"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

