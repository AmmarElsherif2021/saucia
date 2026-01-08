import { useColorMode, VStack, Container } from '@chakra-ui/react'
import { CRT } from '../../Components/Cart'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../Contexts/CartContext'
import { OrderStatusTracker } from './OrderStatusTracker'

const CartPage = () => {
  const { colorMode } = useColorMode()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { 
    cart, 
    updateMealQuantity, 
    removeMealFromCart,
    updateClientInstructions
  } = useCart()

  const MAX_QUANTITY = 999

  const handleQuantityChange = (id, delta) => {
    const meal = cart.meals.find((m) => m.temp_meal_id === id)
    if (!meal) return

    const newQuantity = meal.quantity + delta
    if (newQuantity >= 1 && newQuantity <= MAX_QUANTITY) {
      updateMealQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (cart.meals.length === 0) return
    navigate('/checkout')
  }

  return (
    <VStack
      minH="100vh"
      w="100vw"
      bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
      py={8}
      px={4}
    >
      <Container maxW="container.xl" centerContent>
        <CRT
          meals={cart.meals}
          orderMetadata={cart.orderMetadata}
          onIncrease={(id) => handleQuantityChange(id, 1)}
          onDecrease={(id) => handleQuantityChange(id, -1)}
          onRemove={removeMealFromCart}
          onInstructionsChange={updateClientInstructions}
          onCheckout={handleCheckout}
          checkoutButton={true}
        />
      </Container>
      <Container maxW="container.xl" centerContent>
        <OrderStatusTracker/>
      </Container>
    </VStack>
  )
}

export default CartPage