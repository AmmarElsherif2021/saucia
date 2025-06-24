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
import cartIcon from '../assets/cartIcon2.svg'
import { StarIcon, MinusIcon, AddIcon } from '@chakra-ui/icons'
// import dessertPic from "../assets/dessert.JPG";
// import fruitPic from "../assets/fruits.JPG";
// import leavesPic from "../assets/leaves.JPG"
import unknownDefaultImage from '../assets//menu/unknownMeal.JPG'
import { useI18nContext } from '../Contexts/I18nContext'
import { useTranslation } from 'react-i18next'
import { useCart } from '../Contexts/CartContext'


// Basic Food Card - Simple design with image, title, price
export const MealCard = ({
    id,
    name,
    name_arabic,
    description,
    description_arabic,
    base_price,
    calories,
    is_vegetarian,
    is_vegan,
    is_gluten_free,
    is_dairy_free,
    spice_level,
    prep_time_minutes,
    rating,
    rating_count,
    is_featured,
    discount_percentage,
    discount_valid_until,
    is_available,
    section,
    section_arabic,
    image_url,
    thumbnail_url,
    is_discount_active,
    price, // effective price from hook
    offerRatio, // from hook
    rate, // alias for rating from hook
}) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = currentLanguage === 'ar';
  const displayName = isArabic && name_arabic ? name_arabic : name;
  const displayDescription = isArabic && description_arabic ? description_arabic : description;

  // Offer logic
  const hasOffer = typeof offerRatio === 'number' && offerRatio < 1
  const discountPercentage = hasOffer ? (100 - offerRatio * 100).toFixed(0) : 0
  const discountedPrice = hasOffer ? price * offerRatio : price

  const handleConfirm = () => {
    addToCart({ id, name, price: discountedPrice, image, qty: quantity })
    setIsModalOpen(false)
  }

  return (
    <>
      <Box
        maxW="300px"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={colorMode === 'dark' ? 'gray.700' : 'secondary.300'}
        transition="transform 0.3s"
        _hover={{ transform: 'translateY(-5px)' }}
        position="relative"
      >
        {/* Offer badge */}
        {hasOffer && (
          <Badge
            position="absolute"
            top="10px"
            right="10px"
            colorScheme="green"
            borderRadius="full"
            px="2"
            py="1"
            zIndex={1}
          >
            {t('common.offer')} {discountPercentage}% OFF
          </Badge>
        )}

        <Image
          src={image ? image : unknownDefaultImage}
          alt={name}
          height="200px"
          width="100%"
          objectFit="cover"
        />

        <Box p="4">
          <Flex justify="space-between" align="baseline" mb="2">
          <Heading size="md" color="brand.700" textAlign="left">
                {displayName}
            </Heading>
            
            <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} fontSize="sm" mb="2">
                {displayDescription}
            </Text>
        
            <Text fontWeight="bold" fontSize="md" color="gray.800" as="span">
                ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
            </Text>
            
            <Flex wrap="wrap" gap="1" mt="2">
                {is_vegetarian && (
                <Badge colorScheme="green" variant="subtle">
                    {t('dietary.vegetarian')}
                </Badge>
                )}
                {is_vegan && (
                <Badge colorScheme="teal" variant="subtle">
                    {t('dietary.vegan')}
                </Badge>
                )}
                {is_gluten_free && (
                <Badge colorScheme="orange" variant="subtle">
                    {t('dietary.glutenFree')}
                </Badge>
                )}
                {is_dairy_free && (
                <Badge colorScheme="purple" variant="subtle">
                    {t('dietary.dairyFree')}
                </Badge>
                )}
            </Flex>
            
            <Text fontSize="sm">
                {t('common.spiceLevel')}: {spice_level}/5
            </Text>
          </Flex>

          <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} fontSize="sm" mb="2">
            {description}
          </Text>

          <Flex align="center" mb="2">
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
              {rate?.toFixed?.(1) || '0.0'}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" mb="2">
            <Badge colorScheme="brand" variant="subtle" borderRadius="full">
              {t(`foodCategories.${section?.toLowerCase?.()}`)}
            </Badge>
            <Badge colorScheme={type === 'custom' ? 'purple' : 'blue'} borderRadius="full">
              {type === 'custom' ? t('common.custom') : t('common.ready')}
            </Badge>
          </Flex>

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
            <Flex justify="space-between" align="center" mb="4">
              <Text fontWeight="bold">{t('profile.total')}:</Text>
              <Text fontWeight="bold" color="brand.700">
                ${typeof discountedPrice === 'number'
                  ? (discountedPrice * quantity).toFixed(2)
                  : 'N/A'}
              </Text>
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
export const PremiumMealCard = ({
  id,
  name,
  description,
  price,
  rate,
  offerRatio,
  section,
  type,
  items,
  image,
}) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Offer logic
  const hasOffer = typeof offerRatio === 'number' && offerRatio < 1
  const discountPercentage = hasOffer ? (100 - offerRatio * 100).toFixed(0) : 0
  const discountedPrice = hasOffer ? price * offerRatio : price

  const handleConfirm = () => {
    addToCart({ id, name, price: discountedPrice, image, qty: quantity })
    setIsModalOpen(false)
  }

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
            {t('common.offer')} {discountPercentage}% OFF
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
              {rate?.toFixed?.(1) || '0.0'} {t('common.stars')}
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
                  ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
                </Text>
              )}
              <Text fontWeight="bold" fontSize="xl" color="brand.700" as="span">
                ${typeof discountedPrice === 'number' ? discountedPrice.toFixed(2) : 'N/A'}
              </Text>
            </Box>
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
            <Flex justify="space-between" align="center" mb="4">
              <Text fontWeight="bold">{t('profile.total')}:</Text>
              <Text fontWeight="bold" color="brand.700">
                ${typeof discountedPrice === 'number'
                  ? (discountedPrice * quantity).toFixed(2)
                  : 'N/A'}
              </Text>
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
export const MinimalistMealCard = ({
  id,
  name,
  description,
  price,
  rate,
  offerRatio,
  section,
  type,
  items,
  image,
  prepTime,
  dietaryInfo,
}) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()

  // Offer logic
  const hasOffer = typeof offerRatio === 'number' && offerRatio < 1
  const discountPercentage = hasOffer ? (100 - offerRatio * 100).toFixed(0) : 0
  const discountedPrice = hasOffer ? price * offerRatio : price

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      overflow="hidden"
      bg={colorMode === 'dark' ? 'gray.700' : 'white'}
      borderRadius="lg"
      maxW="500px"
      borderWidth="1px"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      position="relative"
    >
      {/* Offer badge */}
      {hasOffer && (
        <Badge
          position="absolute"
          top="10px"
          right="10px"
          colorScheme="green"
          borderRadius="full"
          px="2"
          py="1"
          zIndex={1}
        >
          {t('common.offer')} {discountPercentage}% OFF
        </Badge>
      )}

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

        <Flex align="center" mb="2">
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
            {rate?.toFixed?.(1) || '0.0'}
          </Text>
        </Flex>

        <Flex justify="space-between" align="center" mt="2">
          <Box>
            {hasOffer && (
              <Text
                as="span"
                fontSize="sm"
                color="gray.500"
                textDecoration="line-through"
                mr="1"
              >
                ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
              </Text>
            )}
            <Text fontWeight="bold" fontSize="md" color="brand.700" as="span">
              ${typeof discountedPrice === 'number' ? discountedPrice.toFixed(2) : 'N/A'}
            </Text>
            <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
              {prepTime} {t('common.minPrepTime')}
            </Text>
          </Box>
          <Flex gap={2}>
            <Badge colorScheme="brand" variant="subtle" borderRadius="full">
              {t(`foodCategories.${section?.toLowerCase?.()}`)}
            </Badge>
            <Badge colorScheme={type === 'custom' ? 'purple' : 'blue'} borderRadius="full">
              {type === 'custom' ? t('common.custom') : t('common.ready')}
            </Badge>
          </Flex>
          <Button colorScheme="brand" size="sm">
            {t('buttons.order')}
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}

// Food Cards Demo Component

export const FeaturedMealCard = ({
  id,
  name,
  description,
  price,
  rate,
  offerRatio,
  section,
  type,
  items,
  image,
}) => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'

  // Pricing calculations
  const originalPrice = price || 0
  const hasOffer = typeof offerRatio === 'number' && offerRatio < 1
  const discountPercentage = hasOffer ? (100 - offerRatio * 100).toFixed(0) : 0
  const discountedPrice = hasOffer ? originalPrice * offerRatio : originalPrice

  const handleConfirm = () => {
    addToCart({
      id,
      name,
      price: discountedPrice,
      image,
      qty: quantity,
    })
    setIsModalOpen(false)
    // toast logic can be added here if needed
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
        }}
        height="60vh"
        my={2}
        mx="auto"
        cursor="pointer"
      >
        {/* Image Section */}
        <Box position="relative" height={'45%'} width="100%">
          <Image
            src={image || unknownDefaultImage}
            alt={name}
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
              {rate > 4.5 && (
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
              {t(`foodCategories.${section?.toLowerCase?.()}`)}
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
              {name}
            </Heading>

            <Text fontSize="sm" color="gray.500" minH="2vw" noOfLines={1}>
              {description}
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
                      color={i < (rate || 0) ? 'warning.300' : 'gray.300'}
                      boxSize="1.2em"
                    />
                  ))}
                <Text mx={2} fontSize="sm">
                  ({rate?.toFixed?.(1) || '0.0'})
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
              {t('buttons.addToCart')} {<Image src={cartIcon} alt="Cart" boxSize="1.7em" m={1} /> || null}
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
                <Text fontSize="lg" fontWeight="medium">
                  {t('cart.howManyWouldYouLike')}
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
                  <Text fontSize="lg">{t('profile.total')}:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="brand.500">
                    SAR {(discountedPrice * quantity).toFixed(2)}
                  </Text>
                </Flex>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mx={3} onClick={() => setIsModalOpen(false)}>
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

export const OfferMealCard = ({ item }) => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'

  // Pricing calculations
  const originalPrice = item?.price || 0
  const hasOffer = typeof item?.offerRatio === 'number' && item?.offerRatio < 1
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
    // Optionally add toast here if needed
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
            src={item?.image || unknownDefaultImage}
            alt={item?.name}
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
              {item?.type === 'custom' && (
                <Badge colorScheme="yellow" variant="solid" borderRadius="full" p={0}>
                  {t('common.custom')}
                </Badge>
              )}
              {hasOffer && (
                <Badge colorScheme="green" variant="solid" borderRadius="full" p={0}>
                  {t('common.offer')} {discountPercentage}% OFF
                </Badge>
              )}
            </Flex>
            <Badge bg="brand.600" color="white" borderRadius="full" p={0} fontSize="xs">
              {t(`foodCategories.${item?.section?.toLowerCase?.()}`)}
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
              {item?.name}
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
            {item?.description}
          </Text>

          <Flex justify="space-between" align="center">
            <Flex align="center">
              {Array(5)
                .fill('')
                .map((_, i) => (
                  <StarIcon
                    key={i}
                    color={i < (item?.rate || 0) ? 'warning.300' : 'gray.300'}
                    boxSize="1.2em"
                  />
                ))}
              <Text mx={2} fontSize="sm">
                ({item?.rate?.toFixed?.(1) || '0.0'})
              </Text>
            </Flex>
            <Button colorScheme="brand" size="sm" onClick={() => setIsModalOpen(true)}>
              {t('buttons.addToCart')} {<Image src={cartIcon} alt="Cart" boxSize="1.7em" m={1} />|| null}
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
                  {item?.name}
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
                <Text fontSize="lg" fontWeight="medium">
                  {t('cart.howManyWouldYouLike')}
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
                  <Text fontSize="lg">{t('profile.total')}:</Text>
                  <Text fontSize="xl" fontWeight="bold" color="brand.500">
                    SAR {(discountedPrice * quantity).toFixed(2)}
                  </Text>
                </Flex>
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mx={3} onClick={() => setIsModalOpen(false)}>
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
