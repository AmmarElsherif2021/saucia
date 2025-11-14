import React from 'react'
import { 
  VStack, 
  Heading, 
  Text, 
  Box,
  Image,
  Badge,
  Flex,
  Button
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { ItemsCarousel } from '../../Components/ItemsCarousel'

// Simple embedded FeaturedCard component
const SimpleFeaturedCard = ({ item }) => {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  // Extract item properties with fallbacks
  const {
    id,
    name = 'Unknown Meal',
    name_arabic,
    price = 0,
    base_price,
    image_url,
    rating = 0,
    is_featured = false,
    is_discount_active = false,
    discount_percentage = 0,
    prep_time_minutes,
    section = 'Food'
  } = item || {}

  const displayName = isArabic ? name_arabic || name : name
  const displayPrice = price || base_price || 0
  const hasDiscount = is_discount_active && discount_percentage > 0

  //console.log('🎨 SimpleFeaturedCard rendering:', { id, displayName, displayPrice })

  return (
    <Box
      w="100%"
      h="400px"
      bg="white"
      borderRadius="16px"
      overflow="hidden"
      shadow="lg"
      cursor="pointer"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-8px)',
        shadow: 'xl'
      }}
      border="1px solid"
      borderColor="gray.200"
    >
      {/* Image Section */}
      <Box 
        position="relative" 
        h="200px" 
        bg="gray.100"
        overflow="hidden"
      >
        {image_url ? (
          <Image
            src={image_url}
            alt={displayName}
            w="100%"
            h="100%"
            objectFit="cover"
          />
        ) : (
          <Flex 
            w="100%" 
            h="100%" 
            align="center" 
            justify="center"
            bg="gray.200"
          >
            <Text color="gray.500" fontSize="sm">🍽️ No Image</Text>
          </Flex>
        )}
        
        {/* Badges */}
        <Box position="absolute" top="12px" left="12px" right="12px">
          <Flex justify="space-between">
            {is_featured && (
              <Badge colorScheme="yellow" borderRadius="full" px="3" py="1">
                ⭐ Featured
              </Badge>
            )}
            {hasDiscount && (
              <Badge colorScheme="red" borderRadius="full" px="3" py="1">
                -{discount_percentage}% OFF
              </Badge>
            )}
          </Flex>
        </Box>

        {/* Rating & Time Overlay */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg="linear-gradient(transparent, rgba(0,0,0,0.7))"
          p="3"
        >
          <Flex justify="space-between" align="center">
            {rating > 0 && (
              <Text color="white" fontSize="sm" fontWeight="medium">
                ⭐ {rating.toFixed(1)}
              </Text>
            )}
            {prep_time_minutes && (
              <Text color="white" fontSize="sm">
                🕒 {prep_time_minutes}min
              </Text>
            )}
          </Flex>
        </Box>
      </Box>

      {/* Content Section */}
      <Box p="4" h="200px" display="flex" flexDirection="column">
        {/* Title & Category */}
        <Box mb="3">
          <Heading 
            size="md" 
            color="gray.800" 
            noOfLines={2}
            textAlign="center"
            mb="2"
          >
            {displayName}
          </Heading>
          <Badge 
            colorScheme="blue" 
            variant="subtle" 
            borderRadius="full"
            px="2"
            py="1"
            fontSize="xs"
          >
            {section}
          </Badge>
        </Box>

        {/* Price Section */}
        <Box mt="auto">
          <Flex justify="space-between" align="center" mb="3">
            <Box>
              {hasDiscount && base_price > displayPrice && (
                <Text 
                  fontSize="sm" 
                  color="gray.500" 
                  textDecoration="line-through"
                >
                  ${base_price.toFixed(2)}
                </Text>
              )}
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                color={hasDiscount ? "green.500" : "blue.600"}
              >
                ${displayPrice.toFixed(2)}
              </Text>
            </Box>
            
            <Button 
              colorScheme="blue" 
              size="sm" 
              borderRadius="full"
              onClick={(e) => {
                e.stopPropagation()
                //console.log('Add to cart clicked:', displayName)
              }}
            >
              🛒 Add
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export const FeaturedMeals = ({ 
  featuredMeals, 
  visibleCount = 3,
  autoPlay = true,
  transitionDuration = 5000,
  pauseOnHover = true,
  transitionType = 'slide',
  carouselBg = 'secondary.600',
  baseWidth = 300,
  round = false,
  loop = false,
  style,
}) => {
  const { t } = useTranslation()

  //console.log('🔍 FeaturedMeals received:', featuredMeals)

  // Validate and transform data
  const validMeals = Array.isArray(featuredMeals) 
    ? featuredMeals.filter(meal => meal && meal.id && meal.name)
    : []

  //console.log('🔍 Valid meals after filtering:', validMeals)

  if (!validMeals || validMeals.length === 0) {
    return (
      <VStack mt={6} p={4} bg="transparent" alignItems="center" w="99%">
        <Heading mb={6} fontSize="3em" color="brand.800">
          {t('featuredSlide.title')}
        </Heading>
        <Text color="gray.500" fontSize="lg" textAlign="center">
          No featured meals available
        </Text>
      </VStack>
    )
  }

  return (
    <VStack mt={6} p={4} bg="transparent" alignItems="center" w="99%">
      <Heading mb={6} fontSize="3em" color="brand.800">
        {t('featuredSlide.title')}
      </Heading>

      <Box 
        width="100%" 
        minHeight="450px" 
        display="flex" 
        justifyContent="center"
        position="relative"
      >
        <ItemsCarousel
          items={validMeals}
          CardComponent={SimpleFeaturedCard}
          visibleCount={visibleCount}
          visibleButtons={true}
          auto={autoPlay}
          transitionDuration={transitionDuration}
          autoPlayDelay={transitionDuration}
          transitionType={transitionType}
          pauseOnHover={pauseOnHover}
          carouselBg={carouselBg}
          baseWidth={baseWidth}
          round={round}
          loop={loop}
          style={{
            width: '100%',
            minHeight: '450px',
            ...style
          }}
        />
      </Box>
    </VStack>
  )
}