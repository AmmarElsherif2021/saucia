import { createContext, useEffect, useState, useContext } from 'react'
import { useToast } from '@chakra-ui/react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const toast = useToast()
  
  const [cart, setCart] = useState({
    meals: [],
    orderMetadata: {
      subtotal: 0,
      tax_amount: 0,
      delivery_fee: 0,
      discount_amount: 0,
      total_amount: 0,
      client_instructions: '' // Added client instructions
    }
  })

  // Recalculate cart totals whenever meals change
  useEffect(() => {
    // Calculate subtotal from all meals
    const subtotal = cart.meals.reduce((sum, meal) => sum + meal.total_price, 0)

    const tax_amount = subtotal * 0.0 // 0% tax to be updated by admin later
    const total_amount = subtotal + tax_amount + cart.orderMetadata.delivery_fee - cart.orderMetadata.discount_amount

    setCart(prev => ({
      ...prev,
      orderMetadata: {
        ...prev.orderMetadata,
        subtotal: Number(subtotal.toFixed(2)),
        tax_amount: Number(tax_amount.toFixed(2)),
        total_amount: Number(total_amount.toFixed(2))
      }
    }))
  }, [cart.meals, cart.orderMetadata.delivery_fee, cart.orderMetadata.discount_amount])

  const addMealToCart = (meal, selectedItems = [], totalPrice = null) => {
    console.group('🍽️ ADD MEAL TO CART')
    console.log('Meal input:', meal)
    console.log('Selected items input:', selectedItems)
    console.log('Total price input:', totalPrice)

    try {
      const mealId = meal.meal_id || meal.id

      if (!mealId || !meal.name) {
        console.error('❌ Invalid meal: missing id or name', meal)
        toast({
          title: 'Error',
          description: 'Invalid meal data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        console.groupEnd()
        return { success: false, error: 'Invalid meal' }
      }

      // Generate a temporary UUID for the cart meal
      const tempMealId = `temp_${mealId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('Generated temp meal ID:', tempMealId)

      const unit_price = Number(totalPrice || meal.unit_price || meal.base_price || meal.price || 0)
      if (unit_price <= 0) {
        console.error('❌ Invalid meal: price must be > 0', meal)
        toast({
          title: 'Error',
          description: 'Invalid meal price',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        console.groupEnd()
        return { success: false, error: 'Invalid price' }
      }

      const quantity = meal.quantity || 1
      const total_price = Number((unit_price * quantity).toFixed(2))

       // Process selected items with the temporary meal ID
        const processedItems = (selectedItems || []).map(item => {
          // Use proper quantity handling
          const itemQty = Number(item.quantity) || 1
          const itemUnitPrice = Number(item.unit_price || item.price || 0)
          const itemTotalPrice = Number((itemUnitPrice * itemQty).toFixed(2))
        
          console.log('Processing item:', {
            name: item.name,
            quantity: itemQty,
            unit_price: itemUnitPrice,
            total_price: itemTotalPrice
          })
          
          return {
            item_id: item.item_id || item.id,
            order_meal_id: tempMealId, // Link to parent meal
            name: item.name,
            name_arabic: item.name_arabic || null,
            category: item.category || null,
            quantity: itemQty,
            unit_price: itemUnitPrice,
            total_price: itemTotalPrice
          }
        }).filter(item => item.quantity > 0) // Only include items with positive quantity

        console.log('Processed items:', processedItems)

      const safeMeal = {
        meal_id: mealId,
        temp_meal_id: tempMealId,
        image: meal.image_url || meal.image || null,
        name: meal.name,
        name_arabic: meal.name_arabic || null,
        description: meal.description || null,
        quantity: quantity,
        unit_price: unit_price,
        total_price: total_price,
        calories: meal.calories || null,
        protein_g: meal.protein_g || null,
        carbs_g: meal.carbs_g || null,
        fat_g: meal.fat_g || null,
        customization_notes: meal.customization_notes || meal.notes || null,
        is_selective: meal.is_selective || false,
        selectedItems: processedItems // Link items to this meal via temp_meal_id
      }

      console.log('Final meal object:', safeMeal)

      setCart(prevCart => {
        const newMeals = [...prevCart.meals, safeMeal]
        console.log('Updated cart meals:', newMeals)
        return { ...prevCart, meals: newMeals }
      })

      // Show success toast
      toast({
        title: 'Added to cart!',
        description: `${meal.name} has been added to your cart`,
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top'
      })

      console.log('✅ Meal added successfully')
      console.groupEnd()
      return { success: true, meal: safeMeal }

    } catch (err) {
      console.error('❌ Failed to add meal to cart:', err)
      toast({
        title: 'Error',
        description: 'Failed to add meal to cart',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.groupEnd()
      return { success: false, error: err.message }
    }
  }

  const removeMealFromCart = (temp_meal_id) => {
    console.log('🗑️ Removing meal:', temp_meal_id)
    try {
      setCart(prevCart => ({
        ...prevCart,
        meals: prevCart.meals.filter(meal => meal.temp_meal_id !== temp_meal_id)
      }))
      toast({
        title: 'Removed from cart',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Failed to remove meal from cart:', err)
    }
  }

  const removeItemFromCart = (temp_meal_id, item_id) => {
    console.log('🗑️ Removing item:', { temp_meal_id, item_id })
    try {
      setCart(prevCart => ({
        ...prevCart,
        meals: prevCart.meals.map(meal => {
          if (meal.temp_meal_id === temp_meal_id && meal.selectedItems) {
            // Remove the specific item from this meal's selectedItems
            const updatedItems = meal.selectedItems.filter(item => item.item_id !== item_id)
            return { ...meal, selectedItems: updatedItems }
          }
          return meal
        })
      }))
      toast({
        title: 'Item removed',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Failed to remove item from cart:', err)
    }
  }

  const updateMealQuantity = (temp_meal_id, newQuantity) => {
    console.log('🔄 Updating meal quantity:', { temp_meal_id, newQuantity })
    try {
      if (newQuantity <= 0) {
        removeMealFromCart(temp_meal_id)
        return
      }
      setCart(prevCart => ({
        ...prevCart,
        meals: prevCart.meals.map(meal => {
          // FIX: Compare with temp_meal_id instead of id
          if (meal.temp_meal_id === temp_meal_id) {
            const newTotalPrice = Number((meal.unit_price * newQuantity).toFixed(2))
            return { ...meal, quantity: newQuantity, total_price: newTotalPrice }
          }
          return meal
        })
      }))
    } catch (err) {
      console.error('Failed to update meal quantity:', err)
    }
  }

  const updateItemQuantity = (temp_meal_id, item_id, newQuantity) => {
    console.log('🔄 Updating item quantity:', { temp_meal_id, item_id, newQuantity })
    try {
      if (newQuantity <= 0) {
        removeItemFromCart(temp_meal_id, item_id)
        return
      }
      setCart(prevCart => ({
        ...prevCart,
        meals: prevCart.meals.map(meal => {
          if (meal.temp_meal_id === temp_meal_id && meal.selectedItems) {
            // Update the specific item's quantity within this meal
            const updatedItems = meal.selectedItems.map(item => {
              if (item.item_id === item_id) {
                const newTotalPrice = Number((item.unit_price * newQuantity).toFixed(2))
                return { ...item, quantity: newQuantity, total_price: newTotalPrice }
              }
              return item
            })
            return { ...meal, selectedItems: updatedItems }
          }
          return meal
        })
      }))
    } catch (err) {
      console.error('Failed to update item quantity:', err)
    }
  }

  const updateClientInstructions = (instructions) => {
    try {
      setCart(prevCart => ({
        ...prevCart,
        orderMetadata: {
          ...prevCart.orderMetadata,
          client_instructions: instructions
        }
      }))
    } catch (err) {
      console.error('Failed to update client instructions:', err)
    }
  }

  const applyDiscount = (discountAmount) => {
    try {
      setCart(prevCart => ({
        ...prevCart,
        orderMetadata: {
          ...prevCart.orderMetadata,
          discount_amount: Number(discountAmount.toFixed(2))
        }
      }))
    } catch (err) {
      console.error('Failed to apply discount:', err)
    }
  }

  const clearCart = () => {
    try {
      setCart({
        meals: [],
        orderMetadata: {
          subtotal: 0,
          tax_amount: 0,
          delivery_fee: 15,
          discount_amount: 0,
          total_amount: 0,
          client_instructions: ''
        }
      })
      toast({
        title: 'Cart cleared',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    } catch (err) {
      console.error('Failed to clear cart:', err)
    }
  }

  const prepareOrderForSubmission = (additionalOrderData = {}) => {
    console.group('📦 PREPARE ORDER FOR SUBMISSION')
    try {
      const orderMeals = cart.meals.map(meal => ({
        meal_id: meal.meal_id,
        quantity: meal.quantity,
        unit_price: meal.unit_price,
        total_price: meal.total_price,
        name: meal.name,
        name_arabic: meal.name_arabic,
        description: meal.description,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        customization_notes: meal.customization_notes
      }))

      // No standalone items - all items are linked to meals via selectedItems
      const orderData = {
        ...additionalOrderData,
        subtotal: cart.orderMetadata.subtotal,
        tax_amount: cart.orderMetadata.tax_amount,
        delivery_fee: cart.orderMetadata.delivery_fee,
        discount_amount: cart.orderMetadata.discount_amount,
        total_amount: cart.orderMetadata.total_amount,
        client_instructions: cart.orderMetadata.client_instructions,
        order_meals: orderMeals,
        order_items: [], // Empty since items are part of meals
        meal_data: cart.meals.map(meal => ({
          temp_meal_id: meal.temp_meal_id,
          meal_id: meal.meal_id,
          selectedItems: meal.selectedItems || [] // Items belong to each meal
        }))
      }

      console.log('Order data prepared:', orderData)
      console.groupEnd()
      return orderData
    } catch (err) {
      console.error('Failed to prepare order for submission:', err)
      console.groupEnd()
      return null
    }
  }

  return (
    <CartContext.Provider value={{ 
      cart,
      addMealToCart,
      removeMealFromCart,
      removeItemFromCart,
      updateMealQuantity,
      updateItemQuantity,
      updateClientInstructions,
      applyDiscount,
      clearCart,
      prepareOrderForSubmission
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext