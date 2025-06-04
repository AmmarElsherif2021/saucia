/* eslint-disable */
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Badge,
  Divider,
  useColorMode,
  useToast,
  Input,
  Stack,
  Image,
} from '@chakra-ui/react'
import { IconButton, AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dailySaladIcon from '../assets/menu/unknownMeal.JPG'
import cartIcon from '../assets/cartIcon.svg'
import { useElements } from '../Contexts/ElementsContext'

export const CartCard = ({
  name,
  price,
  image,
  addOns = [],
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { items } = useElements()

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      bg={colorMode === 'dark' ? 'gray.700' : 'white'}
      borderRadius="lg"
      width="97%"
      p={2}
      m={1}
    >
      {/* Image with quantity badge */}
      <Box position="relative" width="60px" height="60px" borderRadius="md" flexShrink={0} mr={3}>
        <Image
          src={image}
          alt={name}
          objectFit="cover"
          width="100%"
          height="100%"
          borderRadius="md"
        />
        <Badge
          position="absolute"
          top="-1"
          right="-1"
          bg="error.300"
          color="white"
          borderRadius="full"
          px={1.5}
          fontSize="xs"
        >
          {quantity}
        </Badge>
      </Box>

      {/* Item details */}
      <Box flex="1" minW="0" mr={2}>
        <Text
          fontWeight="bold"
          fontSize="sm"
          color={colorMode === 'dark' ? 'white' : 'gray.800'}
          noOfLines={1}
        >
          {name}
        </Text>

        {/* Add-ons badges */}
        {Array.isArray(addOns) && addOns.length > 0 && (
          <Flex wrap="wrap" gap={1} mt={1}>
            {addOns.map((addOnId, index) => {
              const addOn = items.find((item) => item.id === addOnId)
              return addOn ? (
                <Badge
                  key={`${addOnId}-${index}`}
                  colorScheme="teal"
                  borderRadius="full"
                  px={1.5}
                  py={0.5}
                  fontSize="2xs"
                >
                  {addOn.name}
                </Badge>
              ) : null
            })}
          </Flex>
        )}
      </Box>

      {/* Price and controls */}
      <Flex direction="column" align="flex-end">
        <Text fontSize="sm" fontWeight="bold" mb={1}>
          ${(price * quantity).toFixed(2)}
        </Text>

        <Flex align="center">
          <IconButton
            icon={<MinusIcon />}
            aria-label={t('buttons.decreaseQuantity')}
            size="xs"
            variant="ghost"
            onClick={onDecrease}
          />
          <IconButton
            icon={<AddIcon />}
            aria-label={t('buttons.increaseQuantity')}
            size="xs"
            variant="ghost"
            onClick={onIncrease}
          />
          <IconButton
            icon={<DeleteIcon />}
            aria-label={t('buttons.removeItem')}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={onRemove}
            ml={1}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

export const CRT = ({
  items = [],
  totalPrice = 0,
  onIncrease,
  onDecrease,
  onRemove,
  checkoutButton = true,
  onCheckout,
}) => {
  const { colorMode } = useColorMode()
  const toast = useToast()
  const [promoCode, setPromoCode] = useState('')
  const { t } = useTranslation()

  const handleIncrease = (itemId) => {
    onIncrease(itemId)
    toast({
      title: t('toasts.quantityUpdated'),
      status: 'success',
      duration: 1000,
      isClosable: true,
    })
  }

  const handleDecrease = (itemId) => {
    const item = items.find((i) => i.id === itemId)
    if (item.quantity <= 1) {
      toast({
        title: t('toasts.minQuantity'),
        description: t('toasts.cantReduceQuantity'),
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }
    onDecrease(itemId)
  }

  const handleRemove = (itemId, itemName) => {
    onRemove(itemId)
    toast({
      title: t('toasts.mealRemoved'),
      description: t('toasts.mealRemovedDescription', { mealName: itemName }),
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const handleApplyPromoCode = () => {
    if (promoCode === 'DISCOUNT10') {
      toast({
        title: t('toasts.promoApplied'),
        description: t('toasts.discountApplied'),
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } else {
      toast({
        title: t('toasts.invalidPromo'),
        description: t('toasts.checkPromoCode'),
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }
  }

  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
      borderRadius="xl"
      width={['95%', '87%', '70%']}
      minWidth="280px"
      p={4}
      mx="5px"
      h={'auto'}
      overflowY="auto"
    >
      <Flex align="center" justify="space-between" mb={3}>
        <Flex align="center">
          <Image src={cartIcon} alt="Cart Icon" boxSize="30px" mr={2} />
        </Flex>
        <Badge colorScheme="orange" fontSize="sm" px={2} py={1} borderRadius="full">
          {items.length} {items.length === 1 ? t('cart.meal') : t('cart.meals')}
        </Badge>
      </Flex>

      {items.length === 0 ? (
        <Text color="gray.500" py={3} textAlign="center">
          {t('cart.emptyCart')}
        </Text>
      ) : (
        <Stack spacing={2} m={2} maxHeight="40vh" overflowY="auto" overflowX={'hidden'}>
          {items.map((item) => (
            <CartCard
              key={item.id}
              name={item.name}
              price={item.price}
              image={item.image || dailySaladIcon}
              quantity={item?.quantity || item?.qty}
              addOns={item.addOns || []}
              onIncrease={() => handleIncrease(item.id)}
              onDecrease={() => handleDecrease(item.id)}
              onRemove={() => handleRemove(item.id, item.name)}
            />
          ))}
        </Stack>
      )}

      {items.length > 0 && (
        <>
          <Divider my={3} />
          <Stack spacing={2} mb={4}>
            <Flex justify="space-between" fontSize="sm">
              <Text>{t('cart.subtotal')}</Text>
              <Text>${totalPrice.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between" fontSize="sm">
              <Text color="gray.500">{t('cart.deliveryFee')}</Text>
              <Text color="gray.600">$2.99</Text>
            </Flex>
            <Divider my={1} />
            <Flex justify="space-between" fontSize="md" fontWeight="bold">
              <Text>{t('cart.total')}</Text>
              <Text color="teal.600">${(totalPrice + 2.99).toFixed(2)}</Text>
            </Flex>
          </Stack>
        </>
      )}

      <Stack spacing={4}>
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>
            {t('cart.specialInstructions')}
          </Text>
          <Input placeholder={t('cart.specialInstructionsPlaceholder')} variant="ghost" size="sm" />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={1}>
            {t('cart.promoCode')}
          </Text>
          <Flex gap={2}>
            <Input
              placeholder={t('cart.enterPromoCode')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              variant="ghost"
              size="sm"
              flex={1}
            />
            <Button colorScheme="brand" onClick={handleApplyPromoCode} size="sm" px={4}>
              {t('buttons.apply')}
            </Button>
          </Flex>
        </Box>

        {checkoutButton && items.length > 0 && (
          <Button
            colorScheme="brand"
            size="md"
            width="full"
            onClick={onCheckout}
            fontWeight="bold"
            mt={2}
          >
            {t('buttons.proceedToCheckout')}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
