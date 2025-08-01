import { createContext, useEffect, useState, useContext } from 'react'
/* eslint-disable */
/**
 * CartContext provides:
 *   cart: Array<cartMeal>
 *   addToCart: (meal: cartMeal) => void
 *   removeFromCart: (id: string) => void
 *   clearCart: () => void
 * 
 * cartMeal schema:
 *   id: string (required)
 *   name: string (required)
 *   price: number (required)
 *   type: 'ready' | 'custom' (required)
 *   qty?: number (default: 1)
 *   addOns?: Array<CartAddOn>
 *   selectedItems?: Array<CartItem> (only for custom meals)
 * 
 * CartAddOn schema:
 *   id: string
 *   name: string
 *   price: number
 * 
 * CartItem schema:
 *   id: string
 *   name: string
 *   price: number
 */
const CartContext = createContext()

// CartContext provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  const addToCart = (meal) => {
    // Make sure item has all required properties
    if (!meal.id || !meal.name || meal.price === undefined) {
      console.error('Invalid item format for cart:', meal)
      return
    }

    // Enforce schema
    const safeMeal = {
      id: meal.id,
      name: meal.name,
      price: meal.price,
      type: meal.type,
      qty: meal.qty || 1,
      addOns: (meal.addOns || []).map(a => ({
        id: a.id,
        name: a.name,
        price: a.price
      }))
    }
    if (meal.type === 'custom') {
      safeMeal.selectedItems = (meal.selectedItems || []).map(i => ({
        id: i.id,
        name: i.name,
        price: i.price
      }))
    }
    //console.log('Adding to cart with safeMeal:', safeMeal)
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartMeal) => cartMeal.id === safeMeal.id)
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = safeMeal
        return updatedCart
      }
      // Add new item to the cart
      return [...prevCart, safeMeal]
    })
  }

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => meal.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  // useEffect(() => //console.log('from cart context', cart)
  // // 
  // , [cart])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
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
