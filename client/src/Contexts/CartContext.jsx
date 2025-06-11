import { createContext, useEffect, useState, useContext } from 'react'
/* eslint-disable */
// Create the CartContext
export const CartContext = createContext()

// CartContext provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  const addToCart = (item) => {
    // Make sure item has all required properties
    if (!item.id || !item.name || item.price === undefined) {
      console.error('Invalid item format for cart:', item)
      return
    }

    const itemToAdd = {
      ...item,
      qty: item.qty || 1,
      addOns: item.addOns || [],
    }
    console.log('Adding to cart with itemToAdd:', itemToAdd)
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === itemToAdd.id)
      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = itemToAdd
        return updatedCart
      }
      // Add new item to the cart
      return [...prevCart, itemToAdd]
    })
  }

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  useEffect(() => console.log('from cart context', cart), [cart])

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
