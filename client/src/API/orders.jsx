/* eslint-disable */

import { fetchWithAuth } from './fetchWithAuth'

// Helper function to handle API requests

// Get all orders (admin only)
export const getAllOrders = async (token) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/orders`
  return await fetchWithAuth(url, {}, token)
}
//Create order
export const createOrder = async (token, orderData) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/orders`
  return await fetchWithAuth(
    url,
    {
      method: 'POST',
      body: JSON.stringify(orderData),
    },
    token,
  )
}

// Get orders for the authenticated user
export const getUserOrders = async () => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/orders/user`)
}

// Update an order by ID
export const updateOrder = async (orderId, updates) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}
// Delete an order by ID
export const deleteOrder = async (token, orderId) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`
  return await fetchWithAuth(
    url,
    {
      method: 'DELETE',
    },
    token,
  )
}
