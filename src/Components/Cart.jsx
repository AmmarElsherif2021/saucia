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

  return (
    <Flex
      direction={['column', 'row']} // Stack vertically on mobile, row on larger screens
      align={['flex-start', 'center']}
      justify="space-between"
      bg={colorMode === 'dark' ? 'gray.700' : 'white'}
      borderRadius="lg"
      width="100%"
      maxWidth="600px"
      p={[3, 4]}
      my={2}
      mx="auto"
      boxShadow="sm"
      position="relative"
      _hover={{
        transform: 'scale(1.01)',
      }}
      transition="all 0.2s"
    >
      {/* Image and basic info row */}
      <Flex direction={['row', 'row']} align="center" width={['100%', 'auto']} mb={[2, 0]}>
        <Box
          position="relative"
          width={['80px', '100px']}
          height={['80px', '100px']}
          overflow="hidden"
          borderRadius="md"
          flexShrink={0}
          mx={[3, 4]}
        >
          <Image
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
            bg="error.300"
            color="white"
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
          >
            ×{quantity}
          </Badge>
        </Box>

        {/* Item details */}
        <Box flex="1" minW="0">
          {' '}
          {/* minW="0" prevents overflow issues */}
          <Text
            fontWeight="bold"
            fontSize={['md', 'lg']}
            color={colorMode === 'dark' ? 'white' : 'gray.800'}
            noOfLines={1}
            mb={1}
          >
            {name}
          </Text>
          <Text fontSize={['sm', 'md']} color="gray.600" mb={1}>
            ${price?.toFixed(2)} {t('common.unitPrice')}
          </Text>
          <Text fontSize={['md', 'lg']} color="gray.800" fontWeight="bold" mb={2}>
            ${(price * quantity)?.toFixed(2)}
          </Text>
          {/* Add-ons badges - only show if exists */}
          {Array.isArray(addOns) && addOns.length > 0 && (
            <Flex wrap="wrap" gap={1} mb={[2, 0]}>
              {addOns.map((addOnId, index) => {
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
          )}
        </Box>
      </Flex>

      {/* Quantity controls - positioned differently based on screen size */}
      <Flex
        align="center"
        justify="center" //{['space-between', 'flex-end']}
        width={['100%', 'auto']}
        mt={[3, 0]}
      >
        <Flex direction={['row', 'column', 'column']} align="center" mr={[0, 2]}>
          <IconButton
            icon={<AddIcon />}
            aria-label={t('buttons.increaseQuantity')}
            size="sm"
            variant="outline"
            onClick={onIncrease}
          />
          <Text mx={2} fontSize="md" minW="20px" textAlign="center">
            {quantity}
          </Text>
          <IconButton
            icon={<MinusIcon />}
            aria-label={t('buttons.decreaseQuantity')}
            size="sm"
            variant="outline"
            colorScheme="error"
            onClick={onDecrease}
          />
        </Flex>

        <Button
          aria-label={t('buttons.removeItem')}
          size="sm"
          variant="ghost"
          onClick={onRemove}
          colorScheme="error"
          ml={[0, 2]}
          leftIcon={<DeleteIcon />}
        >
          <Text display={['none', 'inline']}>{t('buttons.remove')}</Text>
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
      width={['95%', '87%', '70%']}
      minWidth="280px"
      p={4}
      ml="1vw"
      mr="2vw"
    >
      <Flex align="center" justify="space-between" mb={4}>
        <Image src={cartIcon} alt="Cart Icon" boxSize="12vw" borderRadius={"50%"} m={4} bg={'whiteAlpha.900'} />
        <Badge colorScheme="warning" fontSize="md" px={3} py={1} borderRadius="full">
          {items.length} {items.length === 1 ? t('cart.meal') : t('cart.meals')}
        </Badge>
      </Flex>

      {items.length === 0 ? (
        <Text color="gray.500" py={4} textAlign="center">
          {t('cart.emptyCart')}
        </Text>
      ) : (
        <Stack spacing={3} mb={6} px={4} maxHeight={"60vh"} overflowY="auto" overflowX="hidden">
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
            variant="outline"
            size="sm"
            w={'90%'}
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
              variant="outline"
              flex={1}
              w={'90%'}
            />
            <Button colorScheme="brand" onClick={handleApplyPromoCode} px={6} flexShrink={0}>
              {t('buttons.apply')}
            </Button>
          </Flex>
        </Box>

        {checkoutButton && items.length > 0 && (
          <Button
            colorScheme="brand"
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
