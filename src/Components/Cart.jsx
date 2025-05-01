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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useState } from "react";
import dessertPic from "../assets/dessert.JPG";
import fruitPic from "../assets/fruits.JPG";
import leavesPic from "../assets/leaves.JPG";
import { CartCard } from "./Cards";
import { useI18nContext } from "../Contexts/I18nContext";

export const CRT = ({
  items = [],
  totalPrice = 0,
  onIncrease,
  onDecrease,
  onRemove,
  checkoutButton = true,
  onCheckout,
}) => {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const [promoCode, setPromoCode] = useState("");
  const { t } = useI18nContext(); 

  const handleIncrease = (itemId) => {
    onIncrease(itemId);
    toast({
      title: t("toasts.quantityUpdated"), // Translate "Quantity updated"
      status: "success",
      duration: 1000,
      isClosable: true,
    });
  };

  const handleDecrease = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (item.quantity <= 1) {
      toast({
        title: t("toasts.minQuantity"), // Translate "Minimum quantity is 1"
        description: t("toasts.cantReduceQuantity"), // Translate "Cannot reduce quantity further"
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    onDecrease(itemId);
  };

  const handleRemove = (itemId, itemName) => {
    onRemove(itemId);
    toast({
      title: t("toasts.itemRemoved"), // Translate "Item removed from cart"
      description: t("toasts.itemRemovedDescription", { itemName }), // Translate "Removed {itemName} from cart"
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleApplyPromoCode = () => {
    if (promoCode === "DISCOUNT10") {
      toast({
        title: t("toasts.promoApplied"), // Translate "Promo code applied"
        description: t("toasts.discountApplied"), // Translate "Discount applied successfully"
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: t("toasts.invalidPromo"), // Translate "Invalid promo code"
        description: t("toasts.checkPromoCode"), // Translate "Please check the promo code and try again"
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg={colorMode === "dark" ? "gray.700" : "brand.400"}
      borderRadius="50px"
      boxShadow="none"
      p={6}
      width="100%"
      maxW="500px"
      mx="auto"
    >
      <Heading size="lg" mb={0.5} color="brand.900">
        {t("cart.yourCart")} {/* Translate "Your Cart" */}
        <Badge ml={3} colorScheme="warning" fontSize="md">
          {items.length} {items.length === 1 ? t("cart.item") : t("cart.items")} {/* Translate "item/items" */}
        </Badge>
      </Heading>

      {items.length === 0 ? (
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} py={4}>
          {t("cart.emptyCart")} {/* Translate "Your cart is empty" */}
        </Text>
      ) : (
        <Box mb={4}>
          {items.map((item) => (
            <CartCard
              key={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
              quantity={item.quantity}
              onIncrease={() => handleIncrease(item.id)}
              onDecrease={() => handleDecrease(item.id)}
              onRemove={() => handleRemove(item.id, item.name)}
            />
          ))}
        </Box>
      )}

      {items.length > 0 && (
        <>
          <Divider my={2} />
          <Flex justify="space-between" align="center" mb={0.5}>
            <Text fontWeight="bold" fontSize="lg">
              {t("cart.subtotal")} {/* Translate "Subtotal" */}
            </Text>
            <Text fontWeight="bold" fontSize="xl" color="brand.900">
              ${totalPrice.toFixed(2)}
            </Text>
          </Flex>
          <Flex justify="space-between" align="center" mb={0.5}>
            <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.900"}>
              {t("cart.deliveryFee")} {/* Translate "Delivery Fee" */}
            </Text>
            <Text color="brand.900">$2.99</Text>
          </Flex>
          <Divider my={1} />
          <Flex justify="space-between" align="center" mb={0.5}>
            <Text fontWeight="bold" fontSize="lg">
              {t("cart.total")} {/* Translate "Total" */}
            </Text>
            <Text fontWeight="bold" fontSize="xl" color="brand.900">
              ${(totalPrice + 2.99).toFixed(2)}
            </Text>
          </Flex>
        </>
      )}

      {/* Special Instructions */}
      <Box mb={6}>
        <Heading size="md" mb={4}>
          {t("cart.specialInstructions")} {/* Translate "Special Instructions" */}
        </Heading>
        <Input
          placeholder={t("cart.specialInstructionsPlaceholder")} 
          variant="outline"
          size="md"
          w={"md"}
          sx={{
            borderColor: "brand.800",
            borderWidth: "2px",
            bg: colorMode === "dark" ? "brand.900" : "brand.200",
          }}
        />
      </Box>

      {/* Promo Code */}
      <Box mb={6}>
        <Heading size="md" mb={4}>
          {t("cart.promoCode")} {/* Translate "Promo Code" */}
        </Heading>
        <Flex gap={2}>
          <Input
            placeholder={t("cart.enterPromoCode")} 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            variant="outline"
            size="md"
            sx={{
              borderColor: "brand.800",
              borderWidth: "2px",
              bg: colorMode === "dark" ? "brand.900" : "brand.200",
            }}
          />
          <Button colorScheme="brand" onClick={handleApplyPromoCode}>
            {t("buttons.apply")} {/* Translate "Apply" */}
          </Button>
        </Flex>
      </Box>

      {checkoutButton && items.length > 0 && (
        <Button
          colorScheme="brand"
          size="lg"
          width="full"
          rightIcon={<AddIcon />}
          onClick={onCheckout}
        >
          {t("buttons.proceedToCheckout")} {/* Translate "Proceed to Checkout" */}
        </Button>
      )}
    </Box>
  );
};

export const CartDemo = () => {
  const { t } = useI18nContext();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: t("classicChocolateCake"),
      price: 8.99,
      quantity: 2,
      image: dessertPic,
    },
    {
      id: 2,
      name: t("freshFruitPlatter"),
      price: 12.99,
      quantity: 1,
      image: fruitPic,
    },
    {
      id: 3,
      name: t("freshLeavesPlatter"),
      price: 15.99,
      quantity: 3,
      image: leavesPic,
    },
  ]);

  const handleIncrease = (itemId) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (itemId) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const handleRemove = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const handleCheckout = () => {
    console.log(t("proceedingToCheckout"), cartItems);
    // Add your checkout logic here
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Box p={4}>
      <CRT
        items={cartItems}
        totalPrice={totalPrice}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
      />
    </Box>
  );
};