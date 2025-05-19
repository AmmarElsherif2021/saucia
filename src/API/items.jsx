/* eslint-disable */
// Helper function to handle API requests
import { fetchWithAuth } from './fetchWithAuth'

export const listItems = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)
  const url = `${import.meta.env.VITE_BASE_URL}/items?${searchParams}`
  const response = await fetch(url)
  return await response.json() // Add JSON parsing
}

export const getItemById = async (itemId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/items/${itemId}`
  const response = await fetch(url)
  return await response.json() // Add JSON parsing
}

export const getItemsBySection = async (section) => {
  const url = `${import.meta.env.VITE_BASE_URL}/items/section/${section}`
  const response = await fetch(url)
  return await response.json()
}

// Create a new item
export const createItem = async (token, itemData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/items`
  return await fetchWithAuth(
    url,
    {
      method: 'POST',
      body: JSON.stringify(itemData),
    },
    token,
  )
}

// Update an item by ID
export const updateItem = async (token, itemId, updates) => {
  const url = `${import.meta.env.VITE_BASE_URL}/items/${itemId}`
  return await fetchWithAuth(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    token,
  )
}

// Delete an item by ID
export const deleteItem = async (token, itemId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/items/${itemId}`
  return await fetchWithAuth(
    url,
    {
      method: 'DELETE',
    },
    token,
  )
}
