import { use, useState } from "react";
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
import { CRT } from "../../Components/Cart";
import { useNavigate } from "react-router";
import cartBg from "../../assets/CartBg.png";
export const CartPage = () => {
  const { colorMode } = useColorMode();
  const navigate=useNavigate()
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
  const handleCheckOut = () => {
    alert("Proceeding to checkout...");
    navigate("/checkout")
  };
  return (
    <Box p={4} bg={colorMode === "dark" ? "brand.900" : "gray.50"}
       bgImage={`url(${cartBg})`}
          bgSize="cover"
          bgPosition="center"
          w={"100vw"}
          h={"100vh"}
    >
    <CRT items={cartItems} totalPrice={totalPrice} onIncrease={handleIncrease} onDecrease={handleDecrease} onCheckout={handleCheckOut} onRemove={handleRemove} checkoutButton={true} />
    </Box>
  );
};