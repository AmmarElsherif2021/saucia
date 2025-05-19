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
} from '@chakra-ui/react'
import { IconButton, AddIcon, MinusIcon, DeleteIcon } from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dailySaladIcon from '../assets/premium/dailySalad.png'
import { useElements } from '../Contexts/ElementsContext'
// Compact cart card
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

  useEffect(() => {
    console.log(`addOns from cart`, addOns)
  }, [addOns])

  return (
    <Flex
      direction="row"
      align="center"
      bg={colorMode === 'dark' ? 'gray.700' : 'white'}
      borderRadius="27px"
      p={2}
      mb={2}
      width="90%"
      position="relative"
      _hover={{
        transform: 'scale(1.01)',
      }}
      transition="all 0.2s"
    >
      <Box
        position="relative"
        width="100px"
        height="100px"
        overflow="hidden"
        borderRadius="25px"
        flexShrink={0}
      >
        <Box
          as="img"
          src={image}
          alt={name}
          objectFit="cover"
          width="100%"
          height="100%"
          filter="brightness(0.95)"
        />
        <Badge
          position="absolute"
          bottom="2"
          right="2"
          bg="brand.600"
          color="white"
          borderRadius="full"
          px={2}
          py={1}
          fontSize="xs"
        >
          ×{quantity}
        </Badge>
      </Box>

      <Box textAlign="left" flex="3" px={3} minW="50">
        <Text
          fontWeight="bold"
          fontSize="lg"
          color={colorMode === 'dark' ? 'white' : 'gray.800'}
          noOfLines={1}
          py={0.5}
          my={0.5}
        >
          {name}
        </Text>
        <Text fontSize="md" color="gray.800" fontWeight="bold" py={0.5} my={0.5}>
          ${(price * quantity)?.toFixed(2)}
        </Text>
        <Flex wrap="wrap" gap={1} py={0.5} my={0.5}>
          {Array.isArray(addOns) &&
            addOns.length > 0 &&
            addOns.map((addOnId, index) => {
              const addOn = items.find((item) => item.id === addOnId)
              return addOn ? (
                <Badge
                  key={`${addOnId}-${index}`}
                  colorScheme="teal"
                  borderRadius="full"
                  px={2}
                  py={1}
                  fontSize="xs"
                >
                  {addOn.name}
                </Badge>
              ) : null
            })}
        </Flex>
        <Text
          fontSize="sm"
          color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
          py={0.5}
          my={0.5}
        >
          ${price?.toFixed(2)} {t('common.each')}
        </Text>
      </Box>

      <Flex align="center">
        <IconButton
          icon={<MinusIcon />}
          aria-label={t('buttons.decreaseQuantity')}
          size="xs"
          as={Button}
          variant="outlined"
          onClick={onDecrease}
        />
        <Text mx={1} fontSize="sm" minW="20px" textAlign="center">
          {quantity}
        </Text>
        <IconButton
          icon={<AddIcon />}
          as={Button}
          aria-label={t('buttons.increaseQuantity')}
          size="xs"
          variant="outlined"
          onClick={onIncrease}
        />
        <Button
          aria-label={t('buttons.removeItem')}
          size="xs"
          variant="solid"
          onClick={onRemove}
          colorScheme="error"
          ml={2}
        >
          <DeleteIcon />
        </Button>
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
      borderRadius="25px"
      p={{ base: 8, md: 12 }}
      width="80%"
      maxW="600px"
      mx="auto"
    >
      <Flex align="center" justify="space-between" mb={4}>
        <Heading size="lg" fontWeight="semibold">
          {t('cart.yourCart')}
        </Heading>
        <Badge colorScheme="warning" fontSize="md" px={3} py={1} borderRadius="full">
          {items.length} {items.length === 1 ? t('cart.meal') : t('cart.meals')}
        </Badge>
      </Flex>

      {items.length === 0 ? (
        <Text color="gray.500" py={4} textAlign="center">
          {t('cart.emptyCart')}
        </Text>
      ) : (
        <Stack spacing={3} mb={6}>
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
          <Divider my={4} />
          <Stack spacing={2} mb={6}>
            <Flex justify="space-between">
              <Text fontWeight="medium">{t('cart.subtotal')}</Text>
              <Text fontWeight="medium">${totalPrice.toFixed(2)}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text color="gray.500">{t('cart.deliveryFee')}</Text>
              <Text color="gray.600">$2.99</Text>
            </Flex>
            <Divider my={2} />
            <Flex justify="space-between" fontSize="lg">
              <Text fontWeight="bold">{t('cart.total')}</Text>
              <Text fontWeight="bold" color="teal.600">
                ${(totalPrice + 2.99).toFixed(2)}
              </Text>
            </Flex>
          </Stack>
        </>
      )}

      <Stack spacing={6}>
        <Box>
          <Text fontWeight="medium" mb={2}>
            {t('cart.specialInstructions')}
          </Text>
          <Input
            placeholder={t('cart.specialInstructionsPlaceholder')}
            variant="filled"
            size="sm"
            w={'90%'}
            _focus={{ borderColor: 'teal.500' }}
          />
        </Box>

        <Box>
          <Text fontWeight="medium" mb={2}>
            {t('cart.promoCode')}
          </Text>
          <Flex gap={2} direction={{ base: 'column', sm: 'row' }}>
            <Input
              placeholder={t('cart.enterPromoCode')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              variant="filled"
              flex={1}
              w={'90%'}
              _focus={{ borderColor: 'teal.500' }}
            />
            <Button colorScheme="teal" onClick={handleApplyPromoCode} px={6} flexShrink={0}>
              {t('buttons.apply')}
            </Button>
          </Flex>
        </Box>

        {checkoutButton && items.length > 0 && (
          <Button
            colorScheme="teal"
            size="lg"
            width="full"
            onClick={onCheckout}
            height="48px"
            fontWeight="bold"
          >
            {t('buttons.proceedToCheckout')}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
