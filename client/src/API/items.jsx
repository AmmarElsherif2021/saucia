/* eslint-disable */
// Helper function to handle API requests
import { fetchWithAuth } from './fetchWithAuth'

export const listItems = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)
  const url = `${import.meta.env.VITE_API_BASE_URL}/items?${searchParams}`
  const response = await fetch(url)
  return await response.json() // Add JSON parsing
}

export const getItemById = async (itemId) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/items/${itemId}`
  const response = await fetch(url)
  return await response.json() // Add JSON parsing
}

export const getItemsBySection = async (section) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/items/section/${section}`
  const response = await fetch(url)
  return await response.json()
}

// Create a new item
export const createItem = async (itemData) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/items`, {
    method: 'POST',
    body: JSON.stringify(itemData),
  })
}

// Update an item by ID
export const updateItem = async (itemId, updates) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

// Delete an item by ID
export const deleteItem = async (itemId) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/items/${itemId}`, {
    method: 'DELETE',
  })
}