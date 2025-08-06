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
import { motion } from 'framer-motion'
import { FeaturedMealCard } from '../../Components/Cards'
// Simple embedded FeaturedCard component with motion
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', height: '100%' }}
    >
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
              as={motion.img}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
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
                <Badge 
                  colorScheme="yellow" 
                  borderRadius="full" 
                  px="3" 
                  py="1"
                  as={motion.div}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ⭐ Featured
                </Badge>
              )}
              {hasDiscount && (
                <Badge 
                  colorScheme="red" 
                  borderRadius="full" 
                  px="3" 
                  py="1"
                  as={motion.div}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
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
              as={motion.h2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
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
              as={motion.span}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
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
                    as={motion.p}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    ${base_price.toFixed(2)}
                  </Text>
                )}
                <Text 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color={hasDiscount ? "green.500" : "blue.600"}
                  as={motion.p}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
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
                  console.log('Add to cart clicked:', displayName)
                }}
                as={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                🛒 Add
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>
    </motion.div>
  )
}

export const FeaturedMeals = ({ 
  featuredMeals, 
  visibleCount = 3,
  autoPlay = true,
  transitionDuration = 600,
  pauseOnHover = true,
  carouselBg = 'teal.50',
  baseWidth = 300,
  round = true,
  style,
  spacing = 1,
}) => {
  const { t } = useTranslation()

  // Validate and transform data
  const validMeals = Array.isArray(featuredMeals) 
    ? featuredMeals.filter(meal => meal && meal.id && meal.name)
    : []

  if (!validMeals || validMeals.length === 0) {
    return (
      <VStack 
        mt={6} 
        p={4} 
        bg="transparent" 
        alignItems="center" 
        w="100%"
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Heading mb={6} fontSize="3xl" color="brand.800">
          {t('featuredSlide.title')}
        </Heading>
        <Text color="gray.500" fontSize="lg" textAlign="center">
          No featured meals available
        </Text>
      </VStack>
    )
  }

  // Calculate proper visibleCount based on available meals and screen space
  const effectiveVisibleCount = Math.min(visibleCount, validMeals.length, 4)

  return (
    <VStack 
      mt={6} 
      p={4} 
      bg="transparent" 
      alignItems="center" 
      w="100%"
      as={motion.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Heading mb={6} fontSize="3xl" color="brand.800">
        {t('featuredSlide.title')}
      </Heading>

      <Box 
        width="100%" 
        display="flex" 
        justifyContent="center"
        position="relative"
      >
        <ItemsCarousel
          items={validMeals}
          CardComponent={FeaturedMealCard}
          visibleCount={effectiveVisibleCount}
          visibleButtons={true}
          auto={autoPlay}
          transitionDuration={transitionDuration}
          autoPlayDelay={autoPlay ? 1700 : 2000}
          pauseOnHover={pauseOnHover}
          carouselBg={carouselBg}
          baseWidth={baseWidth}
          round={round}
          direction="forward"
          spacing={spacing}
          style={{
            maxWidth: '100%',
            margin: 'auto',
            ...style
          }}
        />
      </Box>
    </VStack>
  )
}