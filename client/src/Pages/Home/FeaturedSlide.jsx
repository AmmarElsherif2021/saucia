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
import { useEffect } from 'react'

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
  //Debug console
  // useEffect(() => {
  //   //console.log('FeaturedMeals component mounted with props:', {
  //     featuredMeals, visibleCount, autoPlay, transitionDuration, pauseOnHover, carouselBg, baseWidth, round, style, spacing
  //   })
  // }, [featuredMeals, visibleCount, autoPlay, transitionDuration, pauseOnHover, carouselBg, baseWidth, round, style, spacing])
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