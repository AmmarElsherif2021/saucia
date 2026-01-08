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
  useBreakpointValue,
  Grid,
  GridItem,
  Card,
  CardBody,
  Tooltip,
} from '@chakra-ui/react'
import { AddIcon, MinusIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons'
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
  const unitPrice = meal.unit_price.toFixed(2)

  return (
    <Card
      bg={isDark ? 'gray.700' : 'secondary.400'}
      borderRadius="16px"
      borderWidth="3px"
      borderColor={isDark ? 'gray.600' : 'brand.300'}
      overflow="hidden"
      transition="all 0.3s ease"
      width={{ base: '98%',sm:'530px', md: '740px' }}
      _hover={{
        borderColor: 'teal.400',
        // boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 180, 158, 0.1)',
        transform: 'translateY(-4px)',
      }}
      h={'auto'}
    >
      <CardBody p={0}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={0.5}>
          {/* Left: Image Section */}
          <Box
            position="relative"
            width={{ base: '90%',sm:'50%', md: '140px' }}
            height={{ base: '200px', md: '140px' }}
            flexShrink={0}
            overflow="hidden"
            borderRadius="35px"
            borderWidth="3px"
            borderColor={isDark ? 'gray.600' : 'secondary.700'}
            m={'10px'}
            md={{
              borderRadius: '16px',
            }}
          >
            <Image
              src={meal?.image || meal?.image_url || dailySaladIcon}
              alt={mealName}
              objectFit="cover"
              width="100%"
              height="100%"
              _hover={{ transform: 'scale(1.05)' }}
              transition="transform 0.3s ease"
            />
            
            {/* Quantity Badge - Floating */}
            <Badge
              position="absolute"
              top={3}
              right={3}
              bg="secondary.800"
              color="white"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="sm"
              fontWeight="bold"
              //boxShadow="0 2px 8px rgba(0,0,0,0.2)"
            >
              ×{meal.quantity}
            </Badge>

            {/* Overlay for better text contrast */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height="60px"
              bgGradient="linear(to-top, rgba(0, 0, 0, 0.4), transparent)"
            />
          </Box>

          {/* Right: Details Section */}
          <Flex
            direction="column"
            justify="center"
            flex={1}
            py={{ base: 1, md: 1 }}
            px={{ base: 4, md: 4 }}
            mt={0}
          >
            {/* Top: Meal Info */}
            <VStack align="flex-start" spacing={1} mb={3}>
              <Text
                as={'h3'}
                fontWeight="700"
                fontSize={{ base: '2xl', md: '3xl' }}
                color={isDark ? 'white' : 'brand.600'}
                lineHeight="tight"
                mb={0}
                pb={0}
              >
                {mealName}
              </Text>

              {/* Add-ons */}
              {Array.isArray(meal?.selectedItems) && meal.selectedItems.length > 0 && (
                <VStack align="flex-start" spacing={1} width="100%">
                  <Text
                    fontSize="md"
                    fontWeight="600"
                    color={isDark ? 'gray.400' : 'gray.600'}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    {t('addOns')}:
                  </Text>
                  <Flex wrap="wrap" gap={1.5}>
                    {meal.selectedItems.map((item, index) =>
                      item.item_id ? (
                        <Badge
                          key={`${item.item_id}-${index}`}
                          variant="outline"
                          borderColor="teal.600"
                          color={isDark ? 'teal.300' : 'teal.600'}
                          borderRadius="full"
                          px={2.5}
                          py={0.5}
                          fontSize="xs"
                          fontWeight="500"
                        >
                          {isArabic ? item?.name_arabic : item?.name} (×{item?.quantity})
                        </Badge>
                      ) : null
                    )}
                  </Flex>
                </VStack>
              )}
            </VStack>

            {/* Bottom: Price & Controls */}
            <Flex
              direction={{ base: 'row' }}
              justify="space-between"
              align={{ base: 'flex-end', md: 'flex-start' }}
              gap={1}
              mt={0}
            >
              {/* Pricing Info */}
              <VStack align="flex-start" spacing={0}>
                <HStack spacing={1.5} fontSize="xs" color={isDark ? 'gray.400' : 'secondary.400'}>
                  <Text fontSize={'sm'} bg={'secondary.100'}>{unitPrice} {t('currency')} × {meal.quantity}</Text>
                  <Text>=</Text>
                </HStack>
                <Text
                  fontSize={{ base: 'xl', md: 'lg' }}
                  fontWeight="800"
                  color="teal.500"
                >
                  {mealTotal} {t('currency')}
                </Text>
              </VStack>

              {/* Controls - Bottom Right */}
              <Flex gap={1.5} align="center">
                <HStack
                  spacing={0}
                  border="1px solid"
                  borderColor={isDark ? 'gray.600' : 'secondary.200'}
                  borderRadius="8px"
                  overflow="hidden"
                  bg={isDark ? 'gray.600' : 'secondary.200'}
                >
                  
                    <IconButton
                      icon={<MinusIcon boxSize={3} />}
                      aria-label={t('decreaseQuantity')}
                      size="sm"
                      variant="outline"
                      colorScheme="secondary"
                      onClick={onDecrease}
                      isDisabled={meal.quantity <= 1}
                      _hover={{ bg: isDark ? 'gray.500' : 'secondary.100' }}
                      borderRadius="full"
                      borderWidth={'3px'}
                      height="32px"
                    />
                
                  <Divider orientation="vertical" height="24px" />
                  <Text
                    px={2.5}
                    fontWeight="bold"
                    fontSize="lg"
                    color={isDark ? 'white' : 'gray.800'}
                    minWidth="30px"
                    textAlign="center"
                  >
                    {meal.quantity}
                  </Text>
                  <Divider orientation="vertical" height="24px" />
                  
                    <IconButton
                      icon={<AddIcon boxSize={3} />}
                      aria-label={t('increaseQuantity')}
                      size="sm"
                      variant="outline"
                      colorScheme="secondary"
                      onClick={onIncrease}
                      isDisabled={meal.quantity < 1}
                      _hover={{ bg: isDark ? 'gray.500' : 'secondary.100' }}
                      borderRadius="full"
                      borderWidth={'3px'}
                      height="32px"
                    />
                </HStack>

                <Tooltip label={t('removeMeal')} placement="top">
                  <IconButton
                    icon={<DeleteIcon boxSize={4} />}
                    aria-label={t('removeMeal')}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={onRemove}
                    _hover={{ bg: 'red.100', color: 'red.600' }}
                  />
                </Tooltip>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  )
}

const SummaryCard = ({ title, rows, colorMode, isDark, isTotal = false }) => (
  <Card
    bg={isTotal ? (isDark ? 'teal.700' : 'teal.50') : 'transparent'}
    border={isTotal ? 'none' : '1px solid'}
    borderColor={isDark ? 'gray.600' : 'gray.200'}
    borderRadius={isTotal ? '16px' : '0'}
    p={isTotal ? 4 : 0}
    mb={isTotal ? 0 : 3}
  >
    <CardBody p={0}>
      <Stack spacing={isTotal ? 2.5 : 2}>
        {rows.map((row, idx) => (
          <Flex
            key={idx}
            justify="space-between"
            align="center"
            fontSize={row.isBold ? 'lg' : 'sm'}
            fontWeight={row.isBold ? '700' : '500'}
          >
            <Text color={isDark ? (row.isBold ? 'white' : 'gray.300') : (row.isBold ? 'gray.900' : 'gray.700')}>
              {row.label}
            </Text>
            <Text
              color={row.isDiscount ? 'green.500' : row.isBold ? 'white' : 'gray.700'}
              fontWeight={row.isBold ? '700' : '500'}
            >
              {row.isDiscount && '-'}{row.value}
            </Text>
          </Flex>
        ))}
      </Stack>
    </CardBody>
  </Card>
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
  isLoading = false,
}) => {
  const { colorMode } = useColorMode()
  const toast = useToast()
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  const isDark = colorMode === 'dark'
  const isMobile = useBreakpointValue({ base: true, md: false })

  const showToast = (title, description, status) => {
    toast({
      title,
      description,
      status,
      duration: 2000,
      isClosable: true,
      position: isMobile ? 'bottom' : 'top-right',
    })
  }

  const handleIncrease = (meal) => {
    onIncrease(meal.temp_meal_id)
    showToast(t('s.quantityUpdated'), null, 'success')
  }

  const handleDecrease = (meal) => {
    if (meal.quantity <= 1) {
      showToast(t('s.minQuantity'), t('s.cantReduceQuantity'), 'warning')
      return
    }
    onDecrease(meal.temp_meal_id)
  }

  const handleRemove = (meal) => {
    onRemove(meal.temp_meal_id)
    showToast(
      t('s.mealRemoved'),
      t('s.mealRemovedDescription', { mealName: meal.name }),
      'info'
    )
  }

  const isEmpty = meals.length === 0
  const hasDiscount = orderMetadata.discount_amount > 0
  const totalItems = meals.reduce((sum, meal) => sum + meal.quantity, 0)

  // Summary rows
  const summaryRows = [
    {
      label: t('subtotal'),
      value: `${orderMetadata.subtotal?.toFixed(2) || '0.00'} ${t('currency')}`,
    },
    {
      label: t('deliveryFee'),
      value: `${orderMetadata.delivery_fee?.toFixed(2) || '0.00'} ${t('currency')}`,
    },
    ...(hasDiscount
      ? [
          {
            label: t('discount'),
            value: `${orderMetadata.discount_amount?.toFixed(2)} ${t('currency')}`,
            isDiscount: true,
          },
        ]
      : []),
  ]

  const totalRow = {
    label: t('total'),
    value: `${orderMetadata.total_amount?.toFixed(2) || '0.00'} ${t('currency')}`,
    isBold: true,
  }

  return (
    <Grid
      templateColumns={{ base: '1fr', lg: '1fr 380px' }}
      gap={{ base: 4, lg: 6 }}
      width="100%"
      maxW="1400px"
      mx="auto"
      px={{ base: 3, sm: 4, lg: 0 }}
      py={{ base: 4, lg: 6 }}
    >
      {/* Main Cart Items Section */}
      <Box>
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          mb={6}
          pb={4}
          borderBottom="2px solid"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
        >
          <HStack spacing={3}>
            <Image src={cartIcon} alt="Cart" boxSize={{ base: '80px', md: '170px' }} />
            <VStack align="flex-start" spacing={0}>
              <Text
                fontSize={{ base: '3xl', md: '3xl' }}
                fontWeight="800"
                color={isDark ? 'white' : 'brand.700'}
              >
                {t('yourCart')}
              </Text>
              <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.600'}>
                {totalItems} {totalItems === 1 ? t('item') : t('items')}
              </Text>
            </VStack>
          </HStack>
          <Badge
            colorScheme="teal"
            fontSize={{ base: 'sm', md: 'md' }}
            px={3}
            py={1.5}
            borderRadius="8px"
            variant="subtle"
          >
            {meals.length} {meals.length === 1 ? t('meal') : t('meals')}
          </Badge>
        </Flex>

        {/* Cart Items or Empty State */}
        {isEmpty ? (
          <VStack py={16} spacing={4}>
            <Image src={cartIcon} alt="Empty Cart" boxSize="80px" opacity={0.2} />
            <VStack spacing={1}>
              <Text
                color="gray.500"
                fontSize="lg"
                fontWeight="600"
                textAlign="center"
              >
                {t('emptyCart')}
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {t('addItemsToGetStarted') || 'Browse our menu to add items'}
              </Text>
            </VStack>
          </VStack>
        ) : (
          <>
            {/* Items Grid */}
            <Stack
              spacing={3}
              maxHeight={{ base: '90%' }}
              overflowY={{ base: 'visible'}}
              pr={{ base: 0, lg: 2 }}
              mb={6}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: isDark ? '#2D3748' : '#F7FAFC',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: isDark ? '#4A5568' : '#CBD5E0',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: isDark ? '#718096' : '#A0AEC0',
                },
              }}
            >
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

            {/* Special Instructions */}
            <Box
              bg={isDark ? 'gray.700' : 'gray.50'}
              p={4}
              borderRadius="16px"
              borderWidth="1px"
              borderColor={isDark ? 'gray.600' : 'gray.200'}
            >
              <Text
                fontSize="sm"
                fontWeight="700"
                mb={3}
                color={isDark ? 'white' : 'gray.900'}
                textTransform="uppercase"
                letterSpacing="0.5px"
              >
                {t('specialInstructions')}
              </Text>
              <Textarea
                placeholder={t('specialInstructionsPlaceholder')}
                variant="filled"
                size="sm"
                value={orderMetadata.client_instructions || ''}
                onChange={(e) => onInstructionsChange && onInstructionsChange(e.target.value)}
                rows={3}
                resize="vertical"
                bg={isDark ? 'gray.600' : 'white'}
                borderColor={isDark ? 'gray.500' : 'gray.200'}
                _hover={{ bg: isDark ? 'gray.600' : 'white' }}
                _focus={{ bg: isDark ? 'gray.600' : 'white', borderColor: 'teal.400' }}
                isDisabled={isLoading}
                fontSize="sm"
              />
            </Box>
          </>
        )}
      </Box>

      {/* Sidebar - Order Summary */}
      {!isEmpty && (
        <Box
          position={{ base: 'sticky', lg: 'sticky' }}
          bottom={0}
          lg={{ bottom: 'auto', top: 0 }}
          bg={isDark ? 'gray.800' : 'white'}
          borderRadius="20px"
          p={{ base: 4, md: 5 }}
          borderWidth="1px"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          boxShadow={{ base: 'lg', lg: 'md' }}
          zIndex={10}
          height="fit-content"
        >
          <VStack spacing={0} align="stretch">
            {/* Summary Details */}
            <Stack spacing={2} mb={3}>
              {summaryRows.map((row, idx) => (
                <Flex
                  key={idx}
                  justify="space-between"
                  fontSize="sm"
                  fontWeight="500"
                >
                  <Text color={isDark ? 'gray.300' : 'gray.700'}>
                    {row.label}
                  </Text>
                  <Text color={row.isDiscount ? 'green.500' : 'gray.700'} fontWeight="600">
                    {row.isDiscount && '-'}{row.value}
                  </Text>
                </Flex>
              ))}
            </Stack>

            <Divider my={3} borderColor={isDark ? 'gray.600' : 'gray.200'} />

            {/* Total */}
            <Flex justify="space-between" mb={4} align="center">
              <Text
                fontSize="lg"
                fontWeight="700"
                color={isDark ? 'white' : 'gray.900'}
              >
                {t('total')}
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="800"
                color="teal.500"
              >
                {orderMetadata.total_amount?.toFixed(2) || '0.00'}
              </Text>
            </Flex>

            {/* Checkout Button */}
            {checkoutButton && (
              <Button
                colorScheme="teal"
                size="lg"
                width="full"
                onClick={onCheckout}
                fontWeight="700"
                py={6}
                fontSize="md"
                borderRadius="12px"
                isLoading={isLoading}
                loadingText={t('processing')}
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
                disabled={isLoading}
                display="flex"
                gap={2}
                mb={2}
              >
                <CheckIcon boxSize={4} />
                {t('proceedToCheckout')}
              </Button>
            )}

            {/* Promo/Info Section */}
            <Box
              bg={isDark ? 'teal.900' : 'teal.50'}
              p={3}
              borderRadius="12px"
              borderWidth="1px"
              borderColor={isDark ? 'teal.700' : 'teal.200'}
              textAlign="center"
            >
              <Text fontSize="xs" color={isDark ? 'teal.200' : 'teal.700'} fontWeight="500">
                ✓ {t('freeDelivery') || 'Free delivery on orders over 50 SAR'}
              </Text>
            </Box>
          </VStack>
        </Box>
      )}
    </Grid>
  )
}