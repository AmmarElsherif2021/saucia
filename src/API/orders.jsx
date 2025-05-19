/* eslint-disable */

import { fetchWithAuth } from './fetchWithAuth'

// Helper function to handle API requests

// Get all orders (admin only)
export const getAllOrders = async (token) => {
  const url = `${import.meta.env.VITE_BASE_URL}/orders`
  return await fetchWithAuth(url, {}, token)
}

// Get orders for the authenticated user
export const getUserOrders = async (token) => {
  const url = `${import.meta.env.VITE_BASE_URL}/orders/user`
  return await fetchWithAuth(url, {}, token)
}

// Update an order by ID
export const updateOrder = async (token, orderId, updates) => {
  const url = `${import.meta.env.VITE_BASE_URL}/orders/${orderId}`
  return await fetchWithAuth(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    token,
  )
}

// Delete an order by ID
export const deleteOrder = async (token, orderId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/orders/${orderId}`
  return await fetchWithAuth(
    url,
    {
      method: 'DELETE',
    },
    token,
  )
}
