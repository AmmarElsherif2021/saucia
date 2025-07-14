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
import { motion } from 'framer-motion'


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
}) => (
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
              {currency} {(price * quantity).toFixed(2)}
            </Text>
          </Flex>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" mx={3} onClick={onClose}>
          {t('buttons.maybeLater') || t('buttons.cancel')}
        </Button>
        <Button colorScheme="brand" onClick={onConfirm}>
          {t('buttons.addToCart') || t('buttons.confirm')} ({quantity})
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)

// Basic Food Card - Simple design with image, title, price
// Basic Food Card - Simple design with image, title, price
export const MealCard = ({ meal }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { currentLanguage } = useI18nContext();
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const isArabic = currentLanguage === 'ar';
  const displayName = isArabic && meal.name_arabic ? meal.name_arabic : meal.name;
  const displayDescription = isArabic && meal.description_arabic ? meal.description_arabic : meal.description;
  
  // Extract values from meal object (corrected field mappings)
  const {
    id,
    image_url,
    price, // This is the calculated effective price from useMeals
    base_price,
    rating, // Changed from 'rate' to 'rating'
    type = 'ready',
    is_discount_active, // Changed from 'hasOffer'
    discount_percentage,
    is_vegetarian,
    is_vegan,
    is_gluten_free,
    is_dairy_free,
    spice_level,
    section,
    is_available = true,
    prep_time_minutes,
    rating_count
  } = meal;

  const handleConfirm = () => {
    addToCart({ 
      id, 
      name: displayName, 
      price: price, 
      image: image_url, 
      qty: quantity 
    });
    setIsModalOpen(false);
  };

  // Don't render if meal is not available
  if (!is_available) {
    return null;
  }

  return (
    <>
      <Box
        maxW="300px"
        h="400px"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        bg={colorMode === 'dark' ? 'gray.700' : 'secondary.500'}
        transition="transform 0.3s"
        _hover={{ transform: 'translateY(-5px)' }}
        position="relative"
      >
        {/* Offer badge */}
        {is_discount_active && discount_percentage > 0 && (
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
            {t('common.offer')} {discount_percentage.toFixed(0)}% OFF
          </Badge>
        )}

        <Image
          src={image_url || unknownDefaultImage}
          alt={displayName}
          height="200px"
          width="100%"
          objectFit="cover"
        />

        <Box p="4">
          <Flex justify="space-between" align="baseline" mb="2">
            <Heading size="md" color="brand.700" textAlign="left">
              {displayName}
            </Heading>
            {prep_time_minutes && (
              <Text fontSize="xs" color="gray.500">
                {prep_time_minutes} {t('common.minutes')}
              </Text>
            )}
          </Flex>
          
          <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'} fontSize="sm" mb="2">
            {displayDescription}
          </Text>
          
          <Flex justify="space-between" align="center" mb="2">
            <Box>
              <Text fontWeight="bold" fontSize="md" color="gray.800">
                ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
              </Text>
              {/* Show original price if discounted */}
              {is_discount_active && base_price && base_price !== price && (
                <Text
                  fontSize="sm"
                  color="gray.500"
                  textDecoration="line-through"
                >
                  ${base_price.toFixed(2)}
                </Text>
              )}
            </Box>
            
            <Flex wrap="wrap" gap="1" justify="flex-end">
              {is_vegetarian && (
                <Badge colorScheme="green" variant="subtle" size="sm">
                  {t('dietaryTags.vegetarian')}
                </Badge>
              )}
              {is_vegan && (
                <Badge colorScheme="teal" variant="subtle" size="sm">
                  {t('dietaryTags.vegan')}
                </Badge>
              )}
              {is_gluten_free && (
                <Badge colorScheme="orange" variant="subtle" size="sm">
                  {t('dietaryTags.glutenFree')}
                </Badge>
              )}
              {is_dairy_free && (
                <Badge colorScheme="teal" variant="subtle" size="sm">
                  {t('dietaryTags.dairyFree')}
                </Badge>
              )}
            </Flex>
          </Flex>
          
          {spice_level > 0 && (
            <Text fontSize="sm" mb="2" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
              {t('common.spiceLevel')}: {spice_level}/5
            </Text>
          )}

          <Flex align="center" mb="2">
            {Array(5)
              .fill('')
              .map((_, i) => (
                <StarIcon
                  key={i}
                  color={i < (rating || 0) ? 'warning.500' : 'orange.300'}
                  boxSize="3"
                  mr="1"
                />
              ))}
            <Text mx="1" bg={"tertiary.100"} fontSize="sm" color={colorMode === 'dark' ? 'error.400' : 'gray.500'}>
              {rating?.toFixed?.(1) || '0.0'}
              {rating_count > 0 && (
                <Text as="span" ml="1">
                  ({rating_count})
                </Text>
              )}
            </Text>
          </Flex>

          <Flex justify="space-between" align="center" mb="2">
            <Badge colorScheme="brand" variant="subtle" borderRadius="full">
              {section ? t(`foodCategories.${section?.toLowerCase?.()}`) : t('common.uncategorized')}
            </Badge>
            <Badge colorScheme={type === 'custom' ? 'purple' : 'blue'} borderRadius="full">
              {type === 'custom' ? t('common.custom') : t('common.ready')}
            </Badge>
          </Flex>

          <Button 
            colorScheme="brand" 
            size="sm" 
            width="full" 
            onClick={() => setIsModalOpen(true)}
            isDisabled={!is_available}
          >
            {t('buttons.addToCart')}
          </Button>
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
          hasOffer={is_discount_active}
          discountPercentage={discount_percentage}
          colorMode={colorMode}
        />
      )}
    </>
  );
};
// Premium Food Card - More detailed with rating, tag, and action buttons
export const PremiumMealCard = ({ meal }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const { addToCart } = useCart();
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

  const handleConfirm = () => {
    addToCart({ 
      id, 
      name, 
      price, 
      image, 
      qty: quantity 
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
            {t('common.offer')} {discount_percentage.toFixed(0)}% OFF
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
                  ${(price / (1 - discount_percentage/100)).toFixed(2)}
                </Text>
              )}
              <Text fontWeight="bold" fontSize="xl" color="brand.700" as="span">
                ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
              </Text>
            </Box>
            <Button colorScheme="brand" size="md" onClick={() => setIsModalOpen(true)}>
              {t('buttons.addToCart')}
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

// Minimalist Food Card - Clean design with horizontal layout
export const MinimalistMealCard = ({ meal }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  
  // Extract values from meal object
  const {
    id,
    name,
    description,
    price,
    rate,
    section,
    type = 'ready',
    image_url: image,
    discount_percentage,
    prep_time_minutes: prepTime,
    is_discount_active: hasOffer,
    is_vegetarian,
    is_vegan,
    is_gluten_free,
    is_dairy_free,
  } = meal;

  // Generate dietary info array
  const dietaryInfo = [];
  if (is_vegetarian) dietaryInfo.push('vegetarian');
  if (is_vegan) dietaryInfo.push('vegan');
  if (is_gluten_free) dietaryInfo.push('gluten-free');
  if (is_dairy_free) dietaryInfo.push('dairy-free');

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
          {t('common.offer')} {discount_percentage.toFixed(0)}% OFF
        </Badge>
      )}

      <Image
        src={image || unknownDefaultImage}
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
          {dietaryInfo.map((tag, index) => (
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
                ${(price / (1 - discount_percentage/100)).toFixed(2)}
              </Text>
            )}
            <Text fontWeight="bold" fontSize="md" color="brand.700" as="span">
              ${typeof price === 'number' ? price.toFixed(2) : 'N/A'}
            </Text>
            {prepTime && (
              <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                {prepTime} {t('common.minPrepTime')}
              </Text>
            )}
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
  );
};

// Food Cards Demo Component

export const FeaturedMealCard = ({ item,index = 0 }) => { 
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'
  const cardVariants = {
    hidden: {
      opacity: 0.7,
      x: 50,     
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  const elementVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }
  // Extract properties from item object (changed from 'meal' to 'item')
  const {
    id,
    name,
    name_arabic,
    description,
    base_price: originalPrice = 0,
    price: effectivePrice = 0,
    rating: rate = 0,
    offerRatio = 1,
    section,
    image_url: image,
    is_featured,
    is_discount_active: hasOffer
  } = item 
  // Motion components
  const MotionBox = motion(Box)
  const MotionFlex = motion(Flex)
  const MotionHeading = motion(Heading)
  const MotionText = motion(Text)
  const MotionButton = motion(Button)
  // Pricing calculations
  const discountPercentage = hasOffer ? (100 - offerRatio * 100).toFixed(0) : 0

  const handleConfirm = () => {
    addToCart({
      id,
      name,
      price: effectivePrice,
      image,
      qty: quantity,
    })
    setIsModalOpen(false)
  }

  return (
    <>
      {/* Card Container with Motion */}
      <MotionBox
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
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        custom={index} // Pass index for custom staggering
        style={{
          animationDelay: `${index * 0.1}s` // Additional stagger delay
        }}
      >
        {/* Image Section */}
        <Box 
          position="relative" 
          height={'45%'} 
          width="100%"
          variants={elementVariants}
        >
          <Image
            src={image || unknownDefaultImage}
            alt={name}
            height="100%"
            width="100%"
            objectFit="cover"
            fallback={<Skeleton height="100%" />}
          />

          {/* Badges */}
          <MotionFlex
            position="absolute"
            top="0"
            left="0"
            right="0"
            px={2}
            justifyContent="space-between"
            variants={elementVariants}
          >
            <Flex gap={2} m={2}>
              {is_featured && (
                <motion.div variants={elementVariants}>
                  <Badge colorScheme="yellow" variant="solid" borderRadius="md" p={0}>
                    {t('common.featured')}
                  </Badge>
                </motion.div>
              )}
              {hasOffer && (
                <motion.div variants={elementVariants}>
                  <Badge colorScheme="green" variant="solid" borderRadius="md" p={0}>
                    {t('common.offer')} {discountPercentage}% OFF
                  </Badge>
                </motion.div>
              )}
            </Flex>

            <motion.div variants={elementVariants}>
              <Badge bg="brand.600" color="white" borderRadius="md" p={0} m={2} fontSize="xs">
                {t(`foodCategories.${section?.toLowerCase?.()}`)}
              </Badge>
            </motion.div>
          </MotionFlex>
        </Box>

        {/* Content Section */}
        <MotionBox 
          p={2} 
          bg={colorMode === 'dark' ? 'gray.700' : 'white'} 
          height={'30%'}
          variants={elementVariants}
        >
          <MotionFlex direction="column" gap={2} variants={elementVariants}>
            <MotionHeading
              fontSize={'1.3em'}
              color={colorMode === 'dark' ? 'white' : 'brand.700'}
              noOfLines={1}
              variants={elementVariants}
            >
              {isArabic? name_arabic || name : name}
            </MotionHeading>

            <MotionText 
              fontSize="sm" 
              color="gray.500" 
              minH="2vw" 
              noOfLines={1}
              variants={elementVariants}
            >
              {description}
            </MotionText>

            {/* Price and Rating */}
            <MotionFlex 
              justify="space-between" 
              align="center" 
              mt={0}
              variants={elementVariants}
            >
              <Flex direction="column">
                {hasOffer && (
                  <motion.div variants={elementVariants}>
                    <Text fontSize="0.7em" color="gray.500" textDecoration="line-through">
                     {t("common.currency")}{originalPrice.toFixed(2)}
                    </Text>
                  </motion.div>
                )}
                <motion.div variants={elementVariants}>
                  <Text
                    fontWeight="bold"
                    fontSize={['md', 'lg']}
                    color={hasOffer ? 'green.500' : 'brand.700'}
                  >
                   {effectivePrice.toFixed(2)}{t("common.currency")}
                  </Text>
                </motion.div>
              </Flex>

              <motion.div variants={elementVariants}>
                <Flex align="center">
                  {Array(5)
                    .fill('')
                    .map((_, i) => (
                      <StarIcon
                        key={i}
                        color={i < rate ? 'warning.300' : 'gray.300'}
                        boxSize="1.2em"
                      />
                    ))}
                  <Text mx={2} fontSize="sm">
                    ({rate?.toFixed?.(1) || '0.0'})
                  </Text>
                </Flex>
              </motion.div>
            </MotionFlex>

            <MotionButton
              colorScheme="brand"
              size="md"
              mt={2}
              width="full"
              onClick={() => setIsModalOpen(true)}
              variants={elementVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('buttons.addToCart')} {<Image src={cartIcon} alt="Cart" boxSize="1.7em" m={1} /> || null}
            </MotionButton>
          </MotionFlex>
        </MotionBox>
      </MotionBox>

      {/* Add to Cart Modal */}
      {isModalOpen && (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          name={name}
          price={effectivePrice}
          quantity={quantity}
          setQuantity={setQuantity}
          onConfirm={handleConfirm}
          t={t}
          hasOffer={hasOffer}
          discountPercentage={discountPercentage}
          colorMode={colorMode}
        />
      )}
    </>
  )
}

export const OfferMealCard = ({ meal }) => {
  const { colorMode } = useColorMode()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const isArabic = i18n.language === 'ar'

  // Extract properties from meal object
  const {
    id,
    name,
    description,
    base_price: originalPrice = 0,
    price: effectivePrice = 0,
    rating: rate = 0,
    offerRatio = 1,
    section,
    image_url: image,
    type,
    is_discount_active: hasOffer
  } = meal

  // Pricing calculations
  const discountPercentage = hasOffer ? (100 - offerRatio * 100).toFixed(0) : 0

  const handleConfirm = () => {
    addToCart({
      id,
      name,
      price: effectivePrice,
      image,
      qty: quantity,
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
            alt={name}
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
              {type === 'custom' && (
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
              {name}
            </Heading>
            <Text fontWeight="bold" fontSize="xl" color="brand.700">
             {t("common.currency")}{effectivePrice.toFixed(2)}
            </Text>
          </Flex>

          <Text
            color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            fontSize="sm"
            mb="1vw"
            noOfLines={2}
          >
            {description}
          </Text>

          <Flex justify="space-between" align="center">
            <Flex align="center">
              {Array(5)
                .fill('')
                .map((_, i) => (
                  <StarIcon
                    key={i}
                    color={i < rate ? 'warning.300' : 'gray.300'}
                    boxSize="1.2em"
                  />
                ))}
              <Text mx={2} fontSize="sm">
                ({rate?.toFixed?.(1) || '0.0'})
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
