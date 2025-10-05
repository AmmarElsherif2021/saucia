import { Box, Heading, useColorMode, VStack } from '@chakra-ui/react'
import { CRT } from '../../Components/Cart'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useCart } from '../../Contexts/CartContext'
import { useEffect } from 'react'

const CartPage = () => {
  const { colorMode } = useColorMode()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { 
    cart, 
    updateMealQuantity, 
    updateItemQuantity,
    removeMealFromCart,
    //removeItemFromCart
  } = useCart()

  useEffect(() => {
    console.log('Cart state updated:', JSON.stringify(cart, null, 2))
  }, [cart])

  // Convert cart structure to format expected by CRT component
  // const cartMeals = [
  //   // Add meals to cart items
  //   ...cart.meals.map(meal => ({
  //     id: meal.meal_id,
  //     type: 'meal',
  //     name: meal.name,
  //     name_arabic: meal.name_arabic,
  //     unit_price: meal.unit_price,
  //     quantity: meal.quantity,
  //     image: meal.image_url,
  //     selectedItems: meal.selectedItems?.map(item => item.item_id) || []
  //   })),
    // Add standalone items to cart items
    // ...cart.items.map(item => ({
    //   id: item.item_id,
    //   type: 'item',
    //   name: item.name,
    //   price: item.unit_price,
    //   quantity: item.quantity,
    //   quantity: item.quantity,
    //   image: item.image_url,
    //   selectedItems: []
    // }))
    //]

  const handleIncrease = (id) => {
    const meal = cart.meals.find((m) => m.temp_meal_id === id)
    if (meal && meal.quantity<999) {
        updateMealQuantity(id, meal.quantity + 1)
    }
  }

  const handleDecrease = (id) => {
    const meal = cart.meals.find((m) => m.temp_meal_id === id)
    if (meal && meal.quantity > 1) {
       updateMealQuantity(id, meal.quantity - 1)
    }
  }

  const handleRemove = (id) => {
    const meal = cart.meals.find((m) => m.temp_meal_id === id)
    if (meal) {
      removeMealFromCart(id)
    }
  }

  // Use the calculated total from cart metadata
  const totalPrice = cart.orderMetadata.subtotal

  const handleCheckOut = () => {
    window.alert(t('cart.proceedToCheckout'))
    navigate('/checkout')
  }

  return (
    <VStack p={4} bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'} w={'100vw'} h={'100vh'}>
      <Heading size="lg" fontWeight="semibold" mb={4}>
        {t('cart.yourCart')}
      </Heading>
      <CRT
        meals={cart.meals}
        totalPrice={totalPrice}
        onIncrease={handleIncrease}
        onDecrease={handleDecrease}
        onCheckout={handleCheckOut}
        onRemove={handleRemove}
        checkoutButton={true}
      />
    </VStack>
  )
}

export default CartPage