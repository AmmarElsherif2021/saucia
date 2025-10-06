/* eslint-disable */
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Divider,
  useColorMode,
  useToast,
  Stack,
  Image,
  Textarea,
  IconButton,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import dailySaladIcon from '../assets/menu/unknownMeal.jpg'
import cartIcon from '../assets/cartIcon.svg'
import { useI18nContext } from '../Contexts/I18nContext'

const CartCard = ({ meal, onIncrease, onDecrease, onRemove }) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  const isDark = colorMode === 'dark'

  const mealName = isArabic ? meal.name_arabic : meal.name
  const mealTotal = (meal.unit_price * meal.quantity).toFixed(2)

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      bg={isDark ? 'teal.700' : 'secondary.200'}
      borderWidth={"2px"}
      borderColor={isDark ? 'teal.500' : 'secondary.400'}
      borderRadius="lg"
      p={3}
      transition="all 0.2s"
      _hover={{ bg:isDark ? 'teal.600' : 'secondary.300', transform: 'translateY(-2px)' }} 
    >
      {/* Image with quantity badge */}
      <Box position="relative" width="70px" height="70px" borderRadius="md" flexShrink={0} mr={3}>
        <Image
          src={meal?.image || meal?.image_url || dailySaladIcon}
          alt={mealName}
          objectFit="cover"
          width="100%"
          height="100%"
          borderRadius="lg"
        />
        <Badge
          position="absolute"
          top="-2"
          right="-2"
          bg="orange.500"
          color="white"
          borderRadius="full"
          px={2}
          fontSize="xs"
          fontWeight="bold"
        >
          {meal.quantity}
        </Badge>
      </Box>

      {/* Meal details */}
      <VStack flex="1" align="flex-start" spacing={1} mr={2}>
        <Text
          fontWeight="bold"
          fontSize="md"
          color={isDark ? 'white' : 'gray.800'}
          noOfLines={1}
        >
          {mealName}
        </Text>

        {/* Add-ons badges */}
        {Array.isArray(meal?.selectedItems) && meal.selectedItems.length > 0 && (
          <Flex wrap="wrap" gap={1}>
            {meal.selectedItems.map((item, index) =>
              item.item_id ? (
                <Badge
                  key={`${item.item_id}-${index}`}
                  colorScheme="orange"
                  variant="subtle"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="2xs"
                >
                  {isArabic ? item?.name_arabic : item?.name} ×{item?.quantity}
                </Badge>
              ) : null
            )}
          </Flex>
        )}

        {/* Price */}
        <Text fontSize="lg" fontWeight="bold" color="teal.500">
          {mealTotal} {t('common.currency')}
        </Text>
      </VStack>

      {/* Controls */}
     
        <HStack spacing={1}>
          <IconButton
            icon={<MinusIcon boxSize={3} />}
            aria-label={t('buttons.decreaseQuantity')}
            size="sm"
            colorScheme="gray"
            variant="ghost"
            onClick={onDecrease}
            isDisabled={meal.quantity <= 1}
          />
          <IconButton
            icon={<AddIcon boxSize={3} />}
            aria-label={t('buttons.increaseQuantity')}
            size="sm"
            colorScheme="teal"
            variant="ghost"
            onClick={onIncrease}
          />
        </HStack>
        <IconButton
          icon={<DeleteIcon />}
          aria-label={t('buttons.removeMeal')}
          size="sm"
          colorScheme="red"
          variant="ghost"
          onClick={onRemove}
          ml={2}
        />
    </Flex>
  )
}

const OrderSummaryRow = ({ label, value, isTotal, isDiscount, colorMode }) => (
  <Flex justify="space-between" fontSize={isTotal ? 'lg' : 'sm'} fontWeight={isTotal ? 'bold' : 'medium'}>
    <Text color={isDiscount ? 'green.500' : isTotal ? (colorMode === 'dark' ? 'white' : 'gray.800') : 'gray.600'}>
      {label}
    </Text>
    <Text color={isDiscount ? 'green.600' : isTotal ? 'teal.600' : 'gray.700'} fontWeight={isTotal ? 'bold' : 'normal'}>
      {isDiscount && '-'}{value}
    </Text>
  </Flex>
)

export const CRT = ({
  orderMetadata = {},
  meals = [],
  onIncrease,
  onDecrease,
  onRemove,
  onInstructionsChange,
  checkoutButton = true,
  onCheckout,
}) => {
  const { colorMode } = useColorMode()
  const toast = useToast()
  const { t } = useTranslation()
  const isDark = colorMode === 'dark'

  const showToast = (title, description, status) => {
    toast({
      title,
      description,
      status,
      duration: 2000,
      isClosable: true,
      position: 'top-right',
    })
  }

  const handleIncrease = (meal) => {
    onIncrease(meal.temp_meal_id)
    showToast(t('toasts.quantityUpdated'), null, 'success')
  }

  const handleDecrease = (meal) => {
    if (meal.quantity <= 1) {
      showToast(t('toasts.minQuantity'), t('toasts.cantReduceQuantity'), 'warning')
      return
    }
    onDecrease(meal.temp_meal_id)
  }

  const handleRemove = (meal) => {
    onRemove(meal.temp_meal_id)
    showToast(
      t('toasts.mealRemoved'),
      t('toasts.mealRemovedDescription', { mealName: meal.name }),
      'info'
    )
  }

  const isEmpty = meals.length === 0
  const hasDiscount = orderMetadata.discount_amount > 0

  return (
    <Box
      bg={isDark ? 'gray.800' : 'white'}
      borderRadius="2xl"
      width={['95%', '90%', '75%', '60%']}
      maxW="800px"
      minWidth="300px"
      p={6}
      //boxShadow="xl"
      borderWidth="4px"
      borderColor={isDark ? 'gray.700' : 'secondary.300'}
    >
      {/* Header */}
      <Flex align="center" justify="space-between" mb={4}>
        <HStack spacing={2}>
          <Image src={cartIcon} alt="Cart" boxSize="32px" />
          <Text fontSize="3xl" fontWeight="bold" color={isDark ? 'white' : 'brand.800'}>
            {t('cart.yourCart')}
          </Text>
        </HStack>
        <Badge colorScheme="orange" fontSize="md" px={3} py={1} borderRadius="full">
          {meals.length} {meals.length === 1 ? t('cart.meal') : t('cart.meals')}
        </Badge>
      </Flex>

      <Divider mb={4} />

      {/* Cart Items */}
      {isEmpty ? (
        <VStack py={12} spacing={3}>
          <Text fontSize="6xl">🛒</Text>
          <Text color="gray.500" fontSize="lg" textAlign="center">
            {t('cart.emptyCart')}
          </Text>
        </VStack>
      ) : (
        <>
          <Stack spacing={3} maxHeight="45vh" overflowY="auto" pr={2} mb={4}>
            {meals.map((meal) => (
              <CartCard
                key={meal.temp_meal_id}
                meal={meal}
                onIncrease={() => handleIncrease(meal)}
                onDecrease={() => handleDecrease(meal)}
                onRemove={() => handleRemove(meal)}
              />
            ))}
          </Stack>

          <Divider my={4} />

          {/* Order Summary */}
          <Stack spacing={2} mb={5}>
            <OrderSummaryRow
              label={t('cart.subtotal')}
              value={`${orderMetadata.subtotal?.toFixed(2) || '0.00'} ${t('common.currency')}`}
              colorMode={colorMode}
            />
            <OrderSummaryRow
              label={t('cart.deliveryFee')}
              value={`${orderMetadata.delivery_fee?.toFixed(2) || '0.00'} ${t('common.currency')}`}
              colorMode={colorMode}
            />
            {hasDiscount && (
              <OrderSummaryRow
                label={t('cart.discount')}
                value={`${orderMetadata.discount_amount?.toFixed(2)} ${t('common.currency')}`}
                isDiscount
                colorMode={colorMode}
              />
            )}
            <Divider my={2} />
            <OrderSummaryRow
              label={t('cart.total')}
              value={`${orderMetadata.total_amount?.toFixed(2) || '0.00'} ${t('common.currency')}`}
              isTotal
              colorMode={colorMode}
            />
          </Stack>

          {/* Special Instructions */}
          <Box mb={4}>
            <Text fontSize="sm" fontWeight="semibold" mb={2} color={isDark ? 'gray.300' : 'gray.700'}>
              {t('cart.specialInstructions')}
            </Text>
            <Textarea
              placeholder={t('cart.specialInstructionsPlaceholder')}
              variant="filled"
              size="md"
              value={orderMetadata.client_instructions || ''}
              onChange={(e) => onInstructionsChange && onInstructionsChange(e.target.value)}
              rows={3}
              resize="vertical"
              bg={isDark ? 'gray.700' : 'gray.50'}
              _hover={{ bg: isDark ? 'gray.650' : 'gray.100' }}
              _focus={{ bg: isDark ? 'gray.700' : 'white', borderColor: 'teal.400' }}
            />
          </Box>

          {/* Checkout Button */}
          {checkoutButton && (
            <Button
              colorScheme="teal"
              size="lg"
              width="full"
              onClick={onCheckout}
              fontWeight="bold"
              py={6}
              fontSize="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.2s"
            >
              {t('buttons.proceedToCheckout')}
            </Button>
          )}
        </>
      )}
    </Box>
  )
}