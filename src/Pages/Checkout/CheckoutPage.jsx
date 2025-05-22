import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Checkbox,
  Stack,
  Select,
  useColorMode,
} from '@chakra-ui/react'
import { ALT, TXT, BTN } from '../../Components/ComponentsTrial'
import saladIcon from '../../assets/menu/salad.svg'
import paymentIcon from '../../assets/payment.svg'
import orderIcon from '../../assets/order.svg'
//import { useI18nContext } from "../../Contexts/I18nContext";
import { useTranslation } from 'react-i18next'

const Section = ({ title, children, bgColor, titleColor, icon }) => {
  const { colorMode } = useColorMode()
  return (
    <Box
      bg={colorMode === 'dark' ? 'gray.700' : bgColor}
      borderRadius="45px"
      p={6}
      position="relative"
      overflow="hidden"
    >
      <Box position="relative" zIndex="1">
        <Flex align="center" mb={4}>
          {icon && <Box as="img" src={icon} alt={`${title} icon`} boxSize="48px" mr={2} />}
          <Heading size="md" color={titleColor}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  )
}
const CheckoutPage = () => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()

  return (
    <Box p={6} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} minHeight="100vh">
      <Heading mb={6} textStyle="heading" textAlign="center">
        {t('checkout.deliveryInformation')} {/* Translate "Checkout" */}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {/* Delivery Information */}
        <Section
          title={t('checkout.deliveryInformation')}
          bgColor="brand.300"
          titleColor="gray.800"
          icon={saladIcon}
        >
          <Stack spacing={1}>
            <TXT
              placeholder={t('checkout.fullName')}
              name="fullName"
              variant="outline"
              maxLength={50}
            />
            <TXT
              placeholder={t('checkout.phoneNumber')}
              name="phoneNumber"
              variant="outline"
              maxLength={15}
              mt={4}
            />
            <TXT
              placeholder={t('checkout.deliveryAddress')}
              name="address"
              variant="outline"
              maxLength={100}
              mt={4}
            />
          </Stack>
          <Select
            placeholder={t('checkout.selectCity')}
            mt={4}
            sx={{
              borderColor: 'brand.300',
              _hover: { borderColor: 'brand.400' },
              _focus: { boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
              bg: colorMode === 'dark' ? 'gray.800' : 'brand.200',
            }}
          >
            <option value="new-york">{t('checkout.newYork')}</option> {/* Translate "New York" */}
            <option value="los-angeles">{t('checkout.losAngeles')}</option>{' '}
            {/* Translate "Los Angeles" */}
            <option value="chicago">{t('checkout.chicago')}</option> {/* Translate "Chicago" */}
          </Select>
          <Checkbox mt={4} colorScheme="brand">
            {t('checkout.saveAddress')} {/* Translate "Save this address for future orders" */}
          </Checkbox>
        </Section>

        {/* Payment Details */}
        <Section title={t('checkout.paymentDetails')} bgColor="warning.200" icon={paymentIcon}>
          <Select
            placeholder={t('checkout.paymentMethod')}
            focusBorderColor="warning.500"
            variant="outline"
            _hover={{ borderColor: 'warning.400' }}
            _focus={{ boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
            sx={{
              borderColor: 'warning.300',
              _hover: { borderColor: 'warning.400' },
              _focus: { boxShadow: '0 0 0 1px var(--chakra-colors-warning-500)' },
              bg: colorMode === 'dark' ? 'gray.800' : 'warning.100',
              mb: 2,
            }}
          >
            <option value="credit-card">{t('checkout.creditCard')}</option>{' '}
            {/* Translate "Credit Card" */}
            <option value="paypal">{t('checkout.paypal')}</option> {/* Translate "PayPal" */}
            <option value="cash-on-delivery">{t('checkout.cashOnDelivery')}</option>{' '}
            {/* Translate "Cash on Delivery" */}
          </Select>
          <Stack spacing={1}>
            <TXT
              placeholder={t('checkout.cardNumber')}
              name="cardNumber"
              variant="outline"
              maxLength={16}
              mt={4}
            />
            <Flex gap={2} mt={4}>
              <TXT
                placeholder={t('checkout.expiryDate')}
                name="expiryDate"
                variant="outline"
                maxLength={5}
              />
              <TXT placeholder={t('checkout.cvv')} name="cvv" variant="outline" maxLength={3} />
            </Flex>
          </Stack>
          <Checkbox mt={4} colorScheme="brand">
            {t('checkout.saveCard')} {/* Translate "Save this card for future payments" */}
          </Checkbox>
        </Section>

        {/* Order Summary */}
        <Section title={t('checkout.orderSummary')} bgColor="accent.700" icon={orderIcon}>
          <Flex justify="space-between" mb={2}>
            <Text>{t('checkout.subtotal')}:</Text> {/* Translate "Subtotal" */}
            <Text fontWeight="bold">$45.99</Text>
          </Flex>
          <Flex justify="space-between" mb={2}>
            <Text>{t('checkout.deliveryFee')}:</Text> {/* Translate "Delivery Fee" */}
            <Text fontWeight="bold">$5.00</Text>
          </Flex>
          <Flex justify="space-between" mb={2}>
            <Text>{t('checkout.promoDiscount')}:</Text> {/* Translate "Promo Discount" */}
            <Text fontWeight="bold" color="gray.800">
              -$10.00
            </Text>
          </Flex>
          <Flex justify="space-between" mb={4}>
            <Text fontWeight="bold">{t('checkout.total')}:</Text> {/* Translate "Total" */}
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              $40.99
            </Text>
          </Flex>
          <ALT
            message={{
              title: t('checkout.orderMinimum'), // Translate "Order Minimum"
              description: t('checkout.orderMinimumDescription'), // Translate "Your order must be at least $20.00 to proceed."
            }}
            type="error"
            dismissible
          />
          <BTN type="button" size="lg" colorScheme="error" variant="outline" width="full">
            {t('checkout.placeOrder')} {/* Translate "Place Order" */}
          </BTN>
        </Section>
      </SimpleGrid>
    </Box>
  )
}
export default CheckoutPage
