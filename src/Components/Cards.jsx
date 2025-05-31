/* eslint-disable */
import gainWeightPlanImage from '../assets/premium/gainWeight.png'
import keepWeightPlanImage from '../assets/premium/keepWeight.png'
import loseWeightPlanImage from '../assets/premium/loseWeight.png'
import dailyMealPlanImage from '../assets/premium/dailymealplan.png'
import saladsPlanImage from '../assets/premium/proteinsaladplan.png'
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
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  IconButton,
} from '@chakra-ui/react'

import { StarIcon, MinusIcon, AddIcon } from '@chakra-ui/icons'
// import dessertPic from "../assets/dessert.JPG";
// import fruitPic from "../assets/fruits.JPG";
// import leavesPic from "../assets/leaves.JPG"
import unknownDefaultImage from '../assets//menu/unknownMeal.JPG'
import { useI18nContext } from '../Contexts/I18nContext'
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

export const FeaturedItemCard = ({ item }) => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'

  // Pricing calculations
  const originalPrice = item?.price || 0
  const hasOffer = item?.offerRatio < 1
  const discountPercentage = hasOffer ? (100 - item.offerRatio * 100).toFixed(0) : 0
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
    toast({
      title: t('cart.added'),
      description: `${quantity} × ${item.name} ${t('cart.addedToCart')}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <>
      {/* Card Container */}
      <Box
        maxW={['62vw', '54vw', '28vw']}
        minW={['50vw', '48vw', '20vw']}
        w="full"
        borderRadius="xl"
        overflow="hidden"
        bg={colorMode === 'dark' ? 'gray.700' : 'white'}
        position="relative"
        transition="all 0.3s ease"
        _hover={{
          transform: 'translateY(-0.5vw)',
          boxShadow: 'xl',
        }}
        height="60vh"
        my={2}
        mx="auto"
        cursor="pointer"
        boxShadow="md"
      >
        {/* Image Section */}
        <Box position="relative" height={'45%'} width="100%">
          <Image
            src={item?.image || unknownDefaultImage}
            alt={isArabic ? item?.name_arabic : item?.name}
            height="100%"
            width="100%"
            objectFit="cover"
            fallback={<Skeleton height="100%" />}
          />

          {/* Badges */}
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            px={2}
            justifyContent="space-between"
            bg="linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)"
          >
            <Flex gap={2} m={2}>
              {item?.rate > 4.5 && (
                <Badge colorScheme="yellow" variant="solid" borderRadius="md" p={0}>
                  {t('common.featured')}
                </Badge>
              )}
              {hasOffer && (
                <Badge colorScheme="green" variant="solid" borderRadius="md" p={0}>
                  {t('common.offer')} {discountPercentage}% OFF
                </Badge>
              )}
            </Flex>

            <Badge bg="brand.600" color="white" borderRadius="md" p={0} m={2} fontSize="xs">
              {isArabic
                ? item?.section_arabic
                : t(`foodCategories.${item?.section?.toLowerCase()}`)}
            </Badge>
          </Flex>
        </Box>

        {/* Content Section */}
        <Box p={2} bg={colorMode === 'dark' ? 'gray.700' : 'white'} height={'30%'}>
          <Flex direction="column" gap={2}>
            <Heading
              fontSize={'1.3em'}
              color={colorMode === 'dark' ? 'white' : 'gray.800'}
              noOfLines={1}
            >
              {isArabic ? item?.name_arabic : item?.name}
            </Heading>

            <Text fontSize="sm" color="gray.500" minH="2vw" noOfLines={1}>
              {isArabic ? item?.ingredients_arabic : item?.ingredients}
            </Text>

            {/* Price and Rating */}
            <Flex justify="space-between" align="center" mt={0}>
              <Flex direction="column">
                {hasOffer && (
                  <Text fontSize="0.7em" color="gray.500" textDecoration="line-through">
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
                      color={i < item?.rate ? 'warning.300' : 'gray.300'}
                      boxSize="1.2em"
                    />
                  ))}
                <Text mx={2} fontSize="sm">
                  ({item?.rate?.toFixed(1)})
                </Text>
              </Flex>
            </Flex>

            <Button
              colorScheme="brand"
              size="md"
              mt={2}
              width="full"
              onClick={() => setIsModalOpen(true)}
            >
              {t('buttons.addToCart')} 🛒
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Add to Cart Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
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
                  {isArabic ? item?.name_arabic : item?.name}
                </Text>
                {hasOffer && (
                  <Badge ml={2} colorScheme="green">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </Flex>
            </ModalHeader>

            <ModalBody>
              <Flex direction="column" gap={4}>
                <Text fontSize="lg" fontWeight="medium">
                  {t('modal.howManyWouldYouLike')}
                </Text>

                <Flex align="center" justify="space-between">
                  <Text>{t('common.quantity')}:</Text>
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
                  <Text fontSize="lg">{t('common.total')}:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="brand.500">
                    SAR {(discountedPrice * quantity).toFixed(2)}
                  </Text>
                </Flex>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mr={3} onClick={() => setIsModalOpen(false)}>
                {t('buttons.maybeLater')}
              </Button>
              <Button colorScheme="brand" onClick={handleConfirm}>
                {t('buttons.addToCart')} ({quantity})
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
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

  // Pricing calculations
  const originalPrice = item?.price || 0
  const hasOffer = item?.offerRatio < 1
  const discountPercentage = hasOffer ? (100 - item.offerRatio * 100).toFixed(0) : 0
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
    toast({
      title: t('cart.added'),
      description: `${quantity} × ${item.name} ${t('cart.addedToCart')}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
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
        boxShadow="md"
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
            top="0"
            left="0"
            right="0"
            justifyContent="space-between"
            zIndex={2}
            p={2}
          >
            <Flex gap={4}>
              {item?.isPremium && (
                <Badge colorScheme="yellow" variant="solid" borderRadius="full" p={0}>
                  {t('common.premium')}
                </Badge>
              )}
              {hasOffer && (
                <Badge colorScheme="green" variant="solid" borderRadius="full" p={0}>
                  {t('common.offer')} {discountPercentage}% OFF
                </Badge>
              )}
            </Flex>
            <Badge bg="brand.600" color="white" borderRadius="full" p={0} fontSize="xs">
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
          p="2vw"
          borderTopRadius="lg"
          zIndex={2}
        >
          <Flex justify="space-between" align="center" mb="1vw">
            <Heading size="md" color={colorMode === 'dark' ? 'white' : 'gray.800'} noOfLines={1}>
              {isArabic ? item?.name_arabic : item?.name}
            </Heading>
            <Text fontWeight="bold" fontSize="xl" color="brand.700">
              SAR {discountedPrice.toFixed(2)}
            </Text>
          </Flex>

          <Text
            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            fontSize="sm"
            mb="1vw"
            noOfLines={2}
          >
            {isArabic ? item?.ingredients_arabic : item?.ingredients}
          </Text>

          <Flex justify="space-between" align="center">
            <Flex align="center">
              {Array(5)
                .fill('')
                .map((_, i) => (
                  <StarIcon
                    key={i}
                    color={i < item?.rate ? 'warning.300' : 'gray.300'}
                    boxSize="1.2em"
                  />
                ))}
              <Text mx={2} fontSize="sm">
                ({item?.rate?.toFixed(1)})
              </Text>
            </Flex>
            <Button colorScheme="brand" size="sm" onClick={() => setIsModalOpen(true)}>
              {t('buttons.addToCart')} 🛒
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Add to Cart Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
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
                  {isArabic ? item?.name_arabic : item?.name}
                </Text>
                {hasOffer && (
                  <Badge ml={2} colorScheme="green">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </Flex>
            </ModalHeader>

            <ModalBody>
              <Flex direction="column" gap={4}>
                <Text fontSize="lg" fontWeight="medium">
                  {t('modal.howManyWouldYouLike')}
                </Text>

                <Flex align="center" justify="space-between">
                  <Text>{t('common.quantity')}:</Text>
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
                  <Text fontSize="lg">{t('common.total')}:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="brand.500">
                    SAR {(discountedPrice * quantity).toFixed(2)}
                  </Text>
                </Flex>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mr={3} onClick={() => setIsModalOpen(false)}>
                {t('buttons.maybeLater')}
              </Button>
              <Button colorScheme="brand" onClick={handleConfirm}>
                {t('buttons.addToCart')} ({quantity})
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}
//Plan card
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
  //useEffect(()=>console.log(` from PlanCard ${JSON.stringify(plan)}`),[])
  // Construct description from plan data - with null checks
  const description = plan
    ? `${plan.carb || 0}g ${t('premium.carbs')} • ${plan.protein || 0}g ${t('premium.protein')} • ${plan.kcal || 0}${t('premium.kcal')}`
    : ''
  const macros = description?.split(' • ')

  // Debug logs - remove in production
  // console.log('PlanCard received plan:', plan);
  // console.log('Image URL being used:', imageUrl);

  return (
    <Box
      width="98%"
      height="55vh"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      bg={cardBg}
      mx="auto"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: `0 15px 35px ${shadowColor}`,
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
            <Text color="gray.500" fontSize="lg">
              Image unavailable
            </Text>
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
        {/* Premium badge */}
        <Badge
          colorScheme="brand"
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
          bg={'rgba(0,0,0,0.7) 90%'}
          className={isArabic ? 'readex-pro' : 'montserrat'}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {isArabic ? plan.title_arabic : plan.title}
        </Heading>

        {/* Macros display */}
        <Flex gap={3} mb={3} flexWrap="wrap" justifyContent={isArabic ? 'flex-end' : 'flex-start'}>
          {macros?.map((macro, index) => (
            <Badge
              key={index}
              colorScheme={index === 0 ? 'secondary' : index === 1 ? 'error' : 'accent'}
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
            >
              {macro}
            </Badge>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
//Tiny plan card
export const PlanTinyCard = ({ recommendedPlan, handleChoosePlan, selected = false }) => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  const saladImage = saladsPlanImage // Fallback image for salad plans
  return
  ;<Box
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
        {[t('premium.carbs'), t('premium.protein'), t('premium.snacks'), t('premium.soups')].map(
          (label, i) => (
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
                {label === t('premium.carbs') || label === t('premium.protein')
                  ? `${recommendedPlan?.[label.toLowerCase()]}g`
                  : label === t('premium.snacks')
                    ? t('premium.chooseYourSnacks')
                    : t('premium.chooseYourSoups')}
              </Text>
            </HStack>
          ),
        )}
      </Flex>
    </Box>
    {selected && (
      <Box mt={8}>
        <Text>{isArabic ? recommendedPlan.description_arabic : recommendedPlan.description}</Text>
        <Box>
          <Button mt="6" colorScheme="brand" onClick={handleChoosePlan}>
            Select Plan
          </Button>
        </Box>
      </Box>
    )}
  </Box>
}
