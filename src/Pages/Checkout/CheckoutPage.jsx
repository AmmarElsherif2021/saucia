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
  Icon,
} from "@chakra-ui/react";
import { ALT, TXT, BTN } from "../../Components/ComponentsTrial";
import saladIcon from "../../assets/menu/salad.svg";
import paymentIcon from "../../assets/payment.svg";
import orderIcon from "../../assets/order.svg";

const Section = ({ title, children, bgColor, titleColor, icon }) => {
  const { colorMode } = useColorMode();
  return (
    <Box
      bg={colorMode === "dark" ? "gray.700" : bgColor}
      borderRadius="45px"
      p={6}
      position="relative"
      overflow="hidden"
    >
      <Box position="relative" zIndex="1">
        <Flex align="center" mb={4}>
          {icon && (
            <Box as="img" src={icon} alt={`${title} icon`} boxSize="48px" mr={2} />
          )}
          <Heading size="md" color={titleColor}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Box>
    </Box>
  );
};

export const CheckoutPage = () => {
  const { colorMode } = useColorMode();

  return (
    <Box
      p={6}
      bg={colorMode === "dark" ? "brand.900" : "gray.50"}
      minHeight="100vh"
    >
      <Heading mb={6} textStyle="heading" textAlign="center">
        Checkout
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {/* Delivery Information */}
        <Section
          title="Delivery Information"
          bgColor="brand.300"
          titleColor="brand.900"
          icon={saladIcon}
        >
          <Stack spacing={1}>
            <TXT
              placeholder="Full Name"
              name="fullName"
              variant="outline"
              maxLength={50}
            />
            <TXT
              placeholder="Phone Number"
              name="phoneNumber"
              variant="outline"
              maxLength={15}
              mt={4}
            />
            <TXT
              placeholder="Delivery Address"
              name="address"
              variant="outline"
              maxLength={100}
              mt={4}
            />
          </Stack>
          <Select
            placeholder="Select City"
            mt={4}
            sx={{
              borderColor: "brand.300",
              _hover: { borderColor: "brand.400" },
              _focus: { boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" },
              bg: colorMode === "dark" ? "brand.900" : "brand.200",
            }}
          >
            <option value="new-york">New York</option>
            <option value="los-angeles">Los Angeles</option>
            <option value="chicago">Chicago</option>
          </Select>
          <Checkbox mt={4} colorScheme="brand">
            Save this address for future orders
          </Checkbox>
        </Section>

        {/* Payment Details */}
        <Section
          title="Payment Details"
          bgColor="warning.200"
          icon={paymentIcon}
        >
          <Select
            placeholder="Select Payment Method"
            focusBorderColor="warning.500"
            variant="outline"
            _hover={{ borderColor: "warning.400" }}
            _focus={{ boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)" }}
            sx={{
              borderColor: "warning.300",
              _hover: { borderColor: "warning.400" },
              _focus: { boxShadow: "0 0 0 1px var(--chakra-colors-warning-500)" },
              bg: colorMode === "dark" ? "brand.900" : "warning.100",
              mb: 2,
            }}
          >
            <option value="credit-card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="cash-on-delivery">Cash on Delivery</option>
          </Select>
          <Stack spacing={1}>
            <TXT
              placeholder="Card Number"
              name="cardNumber"
              variant="outline"
              maxLength={16}
              mt={4}
            />
            <Flex gap={2} mt={4}>
              <TXT
                placeholder="MM/YY"
                name="expiryDate"
                variant="outline"
                maxLength={5}
              />
              <TXT
                placeholder="CVV"
                name="cvv"
                variant="outline"
                maxLength={3}
              />
            </Flex>
          </Stack>
          <Checkbox mt={4} colorScheme="brand">
            Save this card for future payments
          </Checkbox>
        </Section>

        {/* Order Summary */}
        <Section
          title="Order Summary"
          bgColor="accent.700"
          icon={orderIcon}
        >
          <Text>Subtotal:</Text>
          <Text fontWeight="bold">$45.99</Text>

          <Flex justify="space-between" mb={2}>
            <Text>Delivery Fee:</Text>
            <Text fontWeight="bold">$5.00</Text>
          </Flex>
          <Flex justify="space-between" mb={2}>
            <Text>Promo Discount:</Text>
            <Text fontWeight="bold" color="gray.900">
              -$10.00
            </Text>
          </Flex>
          <Flex justify="space-between" mb={4}>
            <Text fontWeight="bold">Total:</Text>
            <Text fontWeight="bold" fontSize="lg" color="gray.900">
              $40.99
            </Text>
          </Flex>
          <ALT
            message={{
              title: "Order Minimum",
              description: "Your order must be at least $20.00 to proceed.",
            }}
            type="error"
            dismissible
          />
          <BTN
            type="button"
            size="lg"
            colorScheme="error"
            variant="outline"
            width="full"
          >
            Place Order
          </BTN>
        </Section>
      </SimpleGrid>
    </Box>
  );
};
