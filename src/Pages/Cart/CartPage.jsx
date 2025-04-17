import { useState } from "react";
import {
  Box,
  useColorMode,
} from "@chakra-ui/react";
import fruitsA from "../../assets/menu/fruits1.jpg";
import vegeA from "../../assets/menu/vegetables1.jpg";
import grainsA from "../../assets/menu/grains1.jpg";
import cartBg from "../../assets/CartBg.png";
import { CRT } from "../../Components/Cart";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next"; // Import useTranslation

export const CartPage = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  // Temporary cart items with English and Arabic data
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: {
        en: "Avocado Salad",
        ar: "سلطة الأفوكادو",
      },
      price: 12.99,
      quantity: 2,
      image: fruitsA,
    },
    {
      id: 2,
      name: {
        en: "Mexican Salad",
        ar: "سلطة مكسيكية",
      },
      price: 14.99,
      quantity: 1,
      image: vegeA,
    },
    {
      id: 3,
      name: {
        en: "Quinoa Bowl",
        ar: "وعاء الكينوا",
      },
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

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckOut = () => {
    alert(t("cart.proceedToCheckout")); // Translate "Proceeding to checkout..."
    navigate("/checkout");
  };

  return (
    <Box
      p={4}
      bg={colorMode === "dark" ? "brand.900" : "gray.50"}
      bgImage={`url(${cartBg})`}
      bgSize="cover"
      bgPosition="center"
      w={"100vw"}
      h={"100vh"}
    >
      <CRT
        items={cartItems.map((item) => ({
          ...item,
          name: item.name[i18n.language], // Use the appropriate language for the item name
        }))}
        totalPrice={totalPrice}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onCheckout={handleCheckOut}
        onRemove={handleRemove}
        checkoutButton={true}
      />
    </Box>
  );
};