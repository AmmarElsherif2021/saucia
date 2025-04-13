import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Button,
  Input,
  Divider,
  SimpleGrid,
  Badge,
  useColorMode,
  Image,
} from "@chakra-ui/react";
import { CartCard } from "../../Components/Cards";
import fruitsA from "../../assets/menu/fruits1.jpg";
import fruitsB from "../../assets/menu/fruits2.jpg";
import vegeA from "../../assets/menu/vegetables1.jpg";
import vegeB from "../../assets/menu/vegetables2.jpg";
import grainsA from "../../assets/menu/grains1.jpg";
import grainsB from "../../assets/menu/grains2.jpg";
import cartIcon from "../../assets/cart.svg";

export const CartPage = () => {
  const { colorMode } = useColorMode();
  const [promoCode, setPromoCode] = useState("");
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Avocado Salad",
      price: 12.99,
      quantity: 2,
      image: fruitsA,
    },
    {
      id: 2,
      name: "Mexican Salad",
      price: 14.99,
      quantity: 1,
      image: vegeA,
    },
    {
      id: 3,
      name: "Quinoa Bowl",
      price: 10.99,
      quantity: 1,
      image: grainsA,
    },
  ]);

  const handleIncrease = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleApplyPromoCode = () => {
    alert(`Promo code "${promoCode}" applied!`);
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Box p={4} bg={colorMode === "dark" ? "gray.800" : "gray.50"}>
      <Flex align="center" justify="space-between" mb={6}>
        <Heading textStyle="heading">Your Cart</Heading>
        <Image src={cartIcon} alt="Cart Icon" boxSize="50px" />
      </Flex>

      {/* Items Summary */}
      <Box mb={6}>
        {cartItems.map((item) => (
          <CartCard
            key={item.id}
            name={item.name}
            price={item.price}
            quantity={item.quantity}
            image={item.image}
            onIncrease={() => handleIncrease(item.id)}
            onDecrease={() => handleDecrease(item.id)}
            onRemove={() => handleRemove(item.id)}
          />
        ))}
      </Box>

      {/* Special Instructions */}
      <Box mb={6}>
        <Heading size="md" mb={4}>
          Special Instructions
        </Heading>
        <Input
          placeholder="Add any special instructions for your order..."
          variant="outline"
          size="md"
        />
      </Box>

      {/* Promo Code */}
      <Box mb={6}>
        <Heading size="md" mb={4}>
          Promo Code
        </Heading>
        <Flex gap={2}>
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            variant="outline"
            size="md"
          />
          <Button colorScheme="brand" onClick={handleApplyPromoCode}>
            Apply
          </Button>
        </Flex>
      </Box>

      {/* Order Summary */}
      <Box mb={6}>
        <Heading size="md" mb={4}>
          Order Summary
        </Heading>
        <SimpleGrid columns={2} spacing={2}>
          <Text>Subtotal:</Text>
          <Text fontWeight="bold">${totalPrice.toFixed(2)}</Text>
          <Text>Delivery Fee:</Text>
          <Text fontWeight="bold">$5.00</Text>
          <Text>Estimated Delivery Time:</Text>
          <Text fontWeight="bold">30-40 mins</Text>
          <Text>Order Minimum:</Text>
          <Text fontWeight="bold">$20.00</Text>
        </SimpleGrid>
      </Box>

      {/* Checkout Button */}
      <Divider mb={6} />
      <Button
        colorScheme="brand"
        size="lg"
        width="full"
        isDisabled={totalPrice < 20}
      >
        Proceed to Checkout
      </Button>
      {totalPrice < 20 && (
        <Text mt={2} color="red.500" fontSize="sm">
          Your order must be at least $20.00 to proceed.
        </Text>
      )}
    </Box>
  );
};