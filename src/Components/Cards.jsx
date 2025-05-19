/* eslint-disable */
import gainWeightPlanImage from '../assets/premium/gainWeight.png';
import keepWeightPlanImage from '../assets/premium/keepWeight.png';
import loseWeightPlanImage from '../assets/premium/loseWeight.png';
import dailyMealPlanImage from '../assets/premium/dailyMeal.png';
import saladsPlanImage from '../assets/premium/saladMeal.png';
import { useEffect, useState } from 'react'
import {
  Skeleton,
  Box,
  Image,
  Text,
  Flex,
  Badge,
  Heading,
  Button,
  Stack,
  HStack,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'

import { StarIcon } from '@chakra-ui/icons'
// import dessertPic from "../assets/dessert.JPG";
// import fruitPic from "../assets/fruits.JPG";
// import leavesPic from "../assets/leaves.JPG"
import unknownDefaultImage from '../assets//menu/unknownMeal.JPG'
import { useI18nContext } from '../Contexts/I18nContext'
import { AnimatedText } from '../Pages/Home/Hero'

import { useTranslation } from 'react-i18next'
import { useCart } from '../Contexts/CartContext'
// Basic Food Card - Simple design with image, title, price
export const FoodCard = ({ id, name, nameArabic, description, price, image }) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = currentLanguage === 'ar'
  const handleConfirm = () => {
    addToCart({ id, name, price, image, qty: quantity })
    setIsModalOpen(false)
  }

  return (
    <>
      <Box
        maxW="300px"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
        transition="transform 0.3s"
        _hover={{ transform: 'translateY(-5px)' }}
      >
        <Image
          src={image ? image : unknownDefaultImage}
          alt={name}
          height="200px"
          width="100%"
          objectFit="cover"
        />

        <Box p="4">
          <Flex variant="solid" justify="space-between" align="baseline" mb="2">
            <Heading size="md" color="brand.700" textAlign="left">
              {isArabic ? nameArabic : name}
            </Heading>
            <Text fontWeight="bold" fontSize="md" color="gray.800">
              ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
            </Text>
          </Flex>

          <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} fontSize="sm" mb="3">
            {description}
          </Text>

          <Button colorScheme="brand" size="sm" width="full" onClick={() => setIsModalOpen(true)}>
            {t('buttons.addToCart')}
          </Button>
        </Box>
      </Box>

      {isModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex="1000"
        >
          <Box
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            p="6"
            borderRadius="lg"
            boxShadow="lg"
            width="90%"
            maxW="400px"
          >
            <Heading size="md" mb="4">
              {t('modal.addToCart')}
            </Heading>
            <Flex align="center" justify="space-between" mb="4">
              <Text>{t('common.quantity')}:</Text>
              <Flex align="center">
                <Button size="sm" onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}>
                  -
                </Button>
                <Text mx="2">{quantity}</Text>
                <Button size="sm" onClick={() => setQuantity((prev) => prev + 1)}>
                  +
                </Button>
              </Flex>
            </Flex>
            <Flex justify="space-between">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('buttons.cancel')}
              </Button>
              <Button colorScheme="brand" onClick={handleConfirm}>
                {t('buttons.confirm')}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  )
}

// Premium Food Card - More detailed with rating, tag, and action buttons
export const PremiumFoodCard = ({
  id,
  name,
  description,
  price,
  image,
  rating,
  category,
  isPopular,
}) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const handleConfirm = () => {
    addToCart({ id, name, price, image, qty: quantity })
    setIsModalOpen(false)
  }

  return (
    <>
      <Box
        maxW="320px"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="none"
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
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

        <Image
          src={image ? image : unknownDefaultImage}
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
              {t(`foodCategories.${category?.toLowerCase()}`)}
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
                  color={i < rating ? 'brand.500' : 'gray.300'}
                  boxSize="3"
                  mr="1"
                />
              ))}
            <Text ml="1" fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
              {rating} {t('common.stars')}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" mt="4">
            <Text fontWeight="bold" fontSize="xl" color="brand.700">
              ${price?.toFixed(2)}
            </Text>
            <Button colorScheme="brand" size="md" onClick={() => setIsModalOpen(true)}>
              {t('buttons.addToCart')}
            </Button>
          </Flex>
        </Box>
      </Box>

      {isModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex="1000"
        >
          <Box
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            p="6"
            borderRadius="lg"
            boxShadow="lg"
            width="90%"
            maxW="400px"
          >
            <Heading size="md" mb="4">
              {t('modal.addToCart')}
            </Heading>
            <Flex align="center" justify="space-between" mb="4">
              <Text>{t('common.quantity')}:</Text>
              <Flex align="center">
                <Button size="sm" onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}>
                  -
                </Button>
                <Text mx="2">{quantity}</Text>
                <Button size="sm" onClick={() => setQuantity((prev) => prev + 1)}>
                  +
                </Button>
              </Flex>
            </Flex>
            <Flex justify="space-between">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('buttons.cancel')}
              </Button>
              <Button colorScheme="brand" onClick={handleConfirm}>
                {t('buttons.confirm')}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  )
}

// Minimalist Food Card - Clean design with horizontal layout
export const MinimalistFoodCard = ({ name, description, price, image, prepTime, dietaryInfo }) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      overflow="hidden"
      bg={colorMode === 'dark' ? 'gray.700' : 'white'}
      borderRadius="lg"
      boxShadow="sm"
      maxW="500px"
      borderWidth="1px"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
    >
      <Image
        src={image ? image : unknownDefaultImage}
        alt={name}
        objectFit="cover"
        maxW={{ base: '100%', md: '150px' }}
        height={{ base: '150px', md: 'auto' }}
      />

      <Box p="4" width="100%">
        <Heading size="md" color="brand.700" mb="1">
          {name}
        </Heading>

        <Text
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
          fontSize="sm"
          noOfLines={2}
          mb="2"
        >
          {description}
        </Text>

        <Flex wrap="wrap" mb="2">
          {dietaryInfo &&
            dietaryInfo.map((tag, index) => (
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
              ${price?.toFixed(2)}
            </Text>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
              {prepTime} {t('common.minPrepTime')}
            </Text>
          </Box>
          <Button colorScheme="brand" size="sm">
            {t('buttons.order')}
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}

// Food Cards Demo Component
export const FoodCards = () => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const foodItem = {
    name: 'Shrimp soup',
    name_arabic: 'شوربة الروبيان',
    section: 'Soups',
    section_arabic: 'الشوربات',
    price: 30,
    kcal: 153,
    protein: 0,
    carb: 0,
    policy: 'ready dish',
    ingredients: 'Shrimp soup',
    ingredients_arabic: 'شوربة الروبيان',
  }

  return (
    <Box p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}>
      <Heading mb={6} textStyle="heading">
        {t('widgets.foodCards')}
      </Heading>

      <Stack spacing={8}>
        <Box>
          <Heading size="md" mb={4}>
            {t('widgets.basicFoodCard')}
          </Heading>
          <Flex wrap="wrap" gap={6} justify="center">
            <FoodCard
              name={isArabic ? foodItem.name_arabic : foodItem.name}
              description={isArabic ? foodItem.ingredients_arabic : foodItem.ingredients}
              price={foodItem.price}
              image={null}
              rating={4.5}
              category={isArabic ? foodItem.section_arabic : foodItem.section}
            />
          </Flex>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            {t('widgets.premiumFoodCard')}
          </Heading>
          <Flex wrap="wrap" gap={6} justify="center">
            <PremiumFoodCard
              name={isArabic ? foodItem.name_arabic : foodItem.name}
              description={isArabic ? foodItem.ingredients_arabic : foodItem.ingredients}
              price={foodItem.price}
              image={null}
              rating={5}
              category={isArabic ? foodItem.section_arabic : foodItem.section}
              isPopular={true}
            />
          </Flex>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            {t('widgets.minimalistFoodCard')}
          </Heading>
          <Flex wrap="wrap" gap={6} justify="center">
            <MinimalistFoodCard
              name={isArabic ? foodItem.name_arabic : foodItem.name}
              description={isArabic ? foodItem.ingredients_arabic : foodItem.ingredients}
              price={foodItem.price}
              image={null}
              prepTime={10}
              dietaryInfo={['Low-Carb']}
            />
          </Flex>
        </Box>
      </Stack>
    </Box>
  )
}

export const FeaturedItemCard = ({ item }) => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'

  // Calculate pricing based on offer ratio
  const originalPrice = item?.price || 0
  const hasOffer = item?.offerRatio < 1
  const discountedPrice = hasOffer ? originalPrice * item.offerRatio : originalPrice

  const handleConfirm = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: discountedPrice,
      image: item.image,
      qty: quantity,
    })
    setIsModalOpen(false)
  }

  return (
    <>
      <Box
        maxW={['200px', '250px', '300px']}
        minW={['180px', '220px', '250px']}
        borderRadius="xl"
        overflow="hidden"
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
        position="relative"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: 'xl',
        }}
        height={['320px', '340px', '360px']}
        my={2}
        mx={1}
        cursor="pointer"
      >
        <Box position="relative" height={['180px', '200px', '220px']}>
          <Image
            src={item?.image || unknownDefaultImage}
            alt={isArabic ? item?.name_arabic : item?.name}
            height="100%"
            width="100%"
            objectFit="cover"
            fallback={<Skeleton height="100%" />}
          />

          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            p={2}
            justifyContent="space-between"
            bg="linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)"
          >
            <Flex gap={1} flexWrap="wrap">
              {item?.rate > 4.5 && (
                <Badge colorScheme="yellow" variant="solid" borderRadius="md" px={2}>
                  {t('common.featured')}
                </Badge>
              )}
              {hasOffer && (
                <Badge colorScheme="green" variant="solid" borderRadius="md" px={2}>
                  {t('common.offer')} {(100 - item.offerRatio * 100).toFixed(0)}%
                </Badge>
              )}
            </Flex>

            <Badge bg="brand.600" color="white" borderRadius="md" px={2} fontSize={['xs', 'sm']}>
              {isArabic
                ? item?.section_arabic
                : t(`foodCategories.${item?.section?.toLowerCase()}`)}
            </Badge>
          </Flex>
        </Box>

        <Box p={[2, 3]} bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
          <Flex direction="column" gap={1}>
            <Heading
              fontSize={['sm', 'md']}
              color={colorMode === 'dark' ? 'white' : 'gray.800'}
              noOfLines={1}
            >
              {isArabic ? item?.name_arabic : item?.name}
            </Heading>

            <Text fontSize={['xx-small', 'xs']} color="brand.500" noOfLines={1}>
              {isArabic ? item?.ingredients_arabic : item?.ingredients}
            </Text>

            <Flex justify="space-between" align="center">
              <Flex direction="column">
                {hasOffer && (
                  <Text fontSize="xs" color="gray.500" textDecoration="line-through">
                    SAR {originalPrice.toFixed(2)}
                  </Text>
                )}
                <Text
                  fontWeight="bold"
                  fontSize={['md', 'lg']}
                  color={hasOffer ? 'green.500' : 'brand.700'}
                >
                  SAR {discountedPrice.toFixed(2)}
                </Text>
              </Flex>

              <Flex align="center">
                {Array(5)
                  .fill('')
                  .map((_, i) => (
                    <StarIcon
                      key={i}
                      color={i < item?.rate ? 'brand.500' : 'gray.300'}
                      boxSize={[2.5, 3]}
                    />
                  ))}
              </Flex>
            </Flex>

            <Button
              colorScheme="brand"
              size={['xs', 'sm']}
              mt={1}
              width="full"
              onClick={() => setIsModalOpen(true)}
            >
              {t('buttons.addToCart')}
            </Button>
          </Flex>
        </Box>
      </Box>

      {isModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex="1000"
        >
          <Box
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            p="6"
            borderRadius="lg"
            boxShadow="lg"
            width="90%"
            maxW="400px"
          >
            <Heading size="md" mb="4">
              {t('modal.addToCart')}
            </Heading>
            <Flex align="center" justify="space-between" mb="4">
              <Text>{t('common.quantity')}:</Text>
              <Flex align="center">
                <Button size="sm" onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}>
                  -
                </Button>
                <Text mx="2">{quantity}</Text>
                <Button size="sm" onClick={() => setQuantity((prev) => prev + 1)}>
                  +
                </Button>
              </Flex>
            </Flex>
            <Flex justify="space-between">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('buttons.cancel')}
              </Button>
              <Button colorScheme="brand" onClick={handleConfirm}>
                {t('buttons.confirm')}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  )
}

export const OfferCard = ({ item }) => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'

  // Calculate pricing based on offer ratio
  const originalPrice = item?.price || 0
  const hasOffer = item?.offerRatio < 1
  const discountedPrice = hasOffer ? originalPrice * item.offerRatio : originalPrice

  const handleConfirm = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: discountedPrice,
      image: item.image,
      qty: quantity,
    })
    setIsModalOpen(false)
  }

  return (
    <>
      <Box
        maxW="500px"
        borderRadius="15%"
        overflow="hidden"
        position="relative"
        transition="transform 0.3s"
        _hover={{ transform: 'translateY(-5px)' }}
        height="300px"
        my={2}
      >
        <Box position="relative" height="100%" zIndex={0}>
          <Image
            src={item?.image || unknownDefaultImage}
            alt={isArabic ? item?.name_arabic : item?.name}
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
              {item?.isPremium && (
                <Badge colorScheme="accent" variant="solid" borderRadius="full" px="2">
                  {t('common.premium')}
                </Badge>
              )}
              {hasOffer && (
                <Badge colorScheme="highlight" variant="solid" borderRadius="full" px="2">
                  {t('common.offer')} {(100 - item.offerRatio * 100).toFixed(0)}%
                </Badge>
              )}
            </Flex>
            <Badge bg="brand.600" color="white" borderRadius="full" px="2" fontSize="xs">
              {isArabic
                ? item?.section_arabic
                : t(`foodCategories.${item?.section?.toLowerCase()}`)}
            </Badge>
          </Flex>
        </Box>

        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          bg={colorMode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'}
          p="4"
          borderTopRadius="lg"
          zIndex={2}
        >
          <Flex justify="space-between" align="center" mb="2">
            <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1}>
              {isArabic ? item?.name_arabic : item?.name}
            </Heading>
            <Text fontWeight="bold" fontSize="lg" color="brand.700">
              SAR {discountedPrice.toFixed(2)}
            </Text>
          </Flex>

          <Text
            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            fontSize="sm"
            mb="2"
            noOfLines={2}
          >
            {isArabic ? item?.ingredients_arabic : item?.ingredients}
          </Text>

          <Flex justify="space-between" align="center">
            <Flex align="center">
              {Array(5)
                .fill('')
                .map((_, i) => (
                  <StarIcon key={i} color={i < item?.rate ? 'brand.500' : 'gray.300'} boxSize="3" />
                ))}
              <Text ml="1" fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                ({item?.rate})
              </Text>
            </Flex>
            <Button colorScheme="brand" size="sm" onClick={() => setIsModalOpen(true)}>
              {t('buttons.addToCart')}
            </Button>
          </Flex>
        </Box>
      </Box>

      {isModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          justifyContent="center"
          alignItems="center"
          zIndex="1000"
        >
          <Box
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            p="6"
            borderRadius="lg"
            boxShadow="lg"
            width="90%"
            maxW="400px"
          >
            <Heading size="md" mb="4">
              {t('modal.addToCart')}
            </Heading>
            <Flex align="center" justify="space-between" mb="4">
              <Text>{t('common.quantity')}:</Text>
              <Flex align="center">
                <Button size="sm" onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}>
                  -
                </Button>
                <Text mx="2">{quantity}</Text>
                <Button size="sm" onClick={() => setQuantity((prev) => prev + 1)}>
                  +
                </Button>
              </Flex>
            </Flex>
            <Flex justify="space-between">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('buttons.cancel')}
              </Button>
              <Button colorScheme="brand" onClick={handleConfirm}>
                {t('buttons.confirm')}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  )
}
//Plan card
export const PlanCard = ({ plan }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';

  // Color mode specific styling
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const descriptionBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800');
  const shadowColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)');

  // Fallback image if plan.image is not provided
  const imageUrl = plan?.image || (() => {
    if (plan?.title?.includes('Gain Weight')) return gainWeightPlanImage;
    if (plan?.title?.includes('Keep Weight')) return keepWeightPlanImage;
    if (plan?.title?.includes('Lose Weight')) return loseWeightPlanImage;
    if (plan?.title?.includes('Salad')) return saladsPlanImage;
    return dailyMealPlanImage;
  })();
  useEffect(()=>console.log(` from PlanCard ${JSON.stringify(plan)}`),[])
  // Construct description from plan data - with null checks
  const description = plan ? `${plan.carb || 0}g carbs • ${plan.protein || 0}g protein • ${plan.kcal || 0}kcal` : '';
  const macros = description?.split(' • ');

  // Debug logs - remove in production
  console.log('PlanCard received plan:', plan);
  console.log('Image URL being used:', imageUrl);

  return (
    <Box
      width="46vw"
      height="55vh"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      boxShadow={`0 10px 30px ${shadowColor}`}
      bg={cardBg}
      mx="auto"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: `0 15px 35px ${shadowColor}`
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
          console.error('Image failed to load:', imageUrl);
          setImageError(true);
          setImageLoaded(true);
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
            <Text color="gray.500" fontSize="lg">Image unavailable</Text>
          </Box>
        }
      />
        
      {/* Gradient overlay for better text visibility */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear(to-b, transparent 30%, rgba(0,0,0,0.7) 90%)"
      />
      
      {/* Content container */}
      <Flex
        position="absolute"
        direction="column"
        bottom={0}
        left={0}
        right={0}
        p={6}
        textAlign={isArabic ? "right" : "left"}
      >
        {/* Premium badge */}
        <Badge 
          colorScheme="green" 
          position="absolute" 
          top={-12} 
          right={6}
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
        >
          Premium
        </Badge>
        
        {/* Plan name */}
        <Heading
          as="h2"
          color="white"
          mb={2}
          fontSize="2xl"
          textShadow="0 2px 4px rgba(0,0,0,0.4)"
          className={isArabic ? 'readex-pro' : 'montserrat'}
          dir={isArabic ? "rtl" : "ltr"}
        >
          {plan?.title || 'Plan Title'}
        </Heading>
        
        {/* Macros display */}
        <Flex 
          gap={3} 
          mb={3}
          flexWrap="wrap"
          justifyContent={isArabic ? "flex-end" : "flex-start"}
        >
          {macros?.map((macro, index) => (
            <Badge 
              key={index} 
              colorScheme={index === 0 ? "purple" : index === 1 ? "blue" : "orange"}
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
            >
              {macro}
            </Badge>
          ))}
        </Flex>
        
        {/* Description shown at bottom */}
        <Text
          color="white"
          fontSize="md"
          className={isArabic ? 'lalezar' : 'outfit'}
          bg={descriptionBg}
          p={2}
          borderRadius="md"
          textShadow="0 1px 2px rgba(0,0,0,0.4)"
          dir={isArabic ? "rtl" : "ltr"}
          width="fit-content"
          mx={isArabic ? "auto 0" : "0 auto"}
        >
          Premium Meal Plan
        </Text>
      </Flex>
    </Box>
  );
};
//Tiny plan card
export const PlanTinyCard = ({ recommendedPlan, handleChoosePlan, selected = false }) => (
  <Box
    sx={{
      width: 'auto',
      maxWidth: '20vw',
      minWidth: '10vw',
      bgImage: `url(${recommendedPlan?.image || saladImage})`,
      bgSize: 'cover',
      bgPosition: 'center',
      borderRadius: '30px',
      overflow: 'hidden',
      transition: 'transform 300ms',
      _hover: !selected && {
        transform: 'scale(1.1)',
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
        {['Carbs', 'Protein', 'Snacks', 'Soups'].map((label, i) => (
          <HStack key={i} spacing="1">
            <Box
              px="3"
              my="1"
              bg={'gray.800'}
              borderRadius="md"
              color={['brand.500', 'secondary.500', 'orange.500', 'error.500'][i]}
              fontWeight="bold"
            >
              {label}
            </Box>
            <Text fontSize="sm" isTruncated>
              {label === 'Carbs' || label === 'Protein'
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
)
