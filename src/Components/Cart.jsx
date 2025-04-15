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
    Input
  } from "@chakra-ui/react";
  import { AddIcon } from "@chakra-ui/icons";
  import { useState } from "react";
  import dessertPic from "../assets/dessert.JPG";
  import fruitPic from "../assets/fruits.JPG";
  import leavesPic from "../assets/leaves.JPG";
  import { CartCard } from "./Cards";
  
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
    const handleIncrease = (itemId) => {
      onIncrease(itemId);
      toast({
        title: "Item updated",
        status: "success",
        duration: 1000,
        isClosable: true,
      });
    };
  
    const handleDecrease = (itemId) => {
      const item = items.find(i => i.id === itemId);
      if (item.quantity <= 1) {
        toast({
          title: "Can't reduce quantity",
          description: "Minimum quantity is 1. Remove item instead.",
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
        title: "Item removed",
        description: `${itemName} has been removed from your cart`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    };
   const handleApplyPromoCode = () => {
      if (promoCode === "DISCOUNT10") {
        toast({
          title: "Promo code applied",
          description: "You have received a 10% discount!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please check the code and try again.",
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
          Your Cart
          <Badge ml={3} colorScheme="warning" fontSize="md">
            {items.length} {items.length === 1 ? "item" : "items"}
          </Badge>
        </Heading>
  
        {items.length === 0 ? (
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} py={4}>
            Your cart is empty
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
                Subtotal:
              </Text>
              <Text fontWeight="bold" fontSize="xl" color="brand.900">
                ${totalPrice.toFixed(2)}
              </Text>
            </Flex>
            <Flex justify="space-between" align="center" mb={0.5}>
              <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.900"}>
                Delivery Fee:
              </Text>
              <Text color="brand.900">$2.99</Text>
            </Flex>
            <Divider my={1} />
            <Flex justify="space-between" align="center" mb={0.5}>
              <Text fontWeight="bold" fontSize="lg">
                Total:
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
                  Special Instructions
                </Heading>
                <Input
                  placeholder="Add any special instructions for your order..."
                  variant="outline"
                  size="md"
                  w={"md"}
                  sx={{
                    borderColor: "brand.800",
                    borderWidth: "2px",
                    bg: colorMode === "dark" ? "gray.800" : "brand.200",
                  }}  
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
                    sx={{
                      borderColor: "brand.800",
                      borderWidth: "2px",
                      bg: colorMode === "dark" ? "gray.800" : "brand.200",
                    }}
                  />
                  <Button colorScheme="brand" onClick={handleApplyPromoCode}>
                    Apply
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
            Proceed to Checkout
          </Button>
        )}
      </Box>
    );
  };
  
  export const CartDemo = () => {
    const [cartItems, setCartItems] = useState([
      {
        id: 1,
        name: "Classic Chocolate Cake",
        price: 8.99,
        quantity: 2,
        image: dessertPic,
      },
      {
        id: 2,
        name: "Fresh Fruit Platter",
        price: 12.99,
        quantity: 1,
        image: fruitPic,
      },
      {
        id: 3,
        name: "Fresh Leaves Platter",
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
      console.log("Proceeding to checkout", cartItems);
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