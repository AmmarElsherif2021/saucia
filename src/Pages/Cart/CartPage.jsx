import { Box, useColorMode } from '@chakra-ui/react'
import { CRT } from '../../Components/Cart'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../Contexts/CartContext'

const CartPage = () => {
  const { colorMode } = useColorMode()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { cart, addToCart, removeFromCart } = useCart()

  const handleIncrease = (id) => {
    const item = cart.find((item) => item.id === id)
    if (item) {
      // We're updating an existing item's quantity by 1
      const updatedItem = { ...item }
      updatedItem.qty = 1 // Just pass 1 as the qty to increment by one
      addToCart(updatedItem)
    }
  }

  const handleDecrease = (id) => {
    const item = cart.find((item) => item.id === id)
    if (item && item.qty > 1) {
      // We're decreasing the quantity, so we pass a negative value
      const updatedItem = { ...item }
      updatedItem.qty = -1 // Negative value to decrement
      addToCart(updatedItem)
    }
  }

  const handleRemove = (id) => {
    removeFromCart(id)
  }

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty, // Use qty instead of quantity
    0,
  )

  const handleCheckOut = () => {
    window.alert(t('cart.proceedToCheckout')) // Translate "Proceeding to checkout..."
    navigate('/checkout')
  }

  return (
    <Box p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} w={'100vw'} h={'100vh'}>
      <CRT
        items={cart.map((item) => ({
          ...item,
          name: item.name,
          quantity: item.qty, // Map qty to quantity for the CRT component
        }))}
        totalPrice={totalPrice}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onCheckout={handleCheckOut}
        onRemove={handleRemove}
        checkoutButton={true}
      />
    </Box>
  )
}

export default CartPage
