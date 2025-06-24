/* eslint-disable */
//const response = await fetch('/users');  // Relative path
// Helper function to handle API requests
import { fetchWithAuth } from './fetchWithAuth'

// Get all meals
export const getMeals = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)
  const url = `${import.meta.env.VITE_API_BASE_URL}/meals?${searchParams}`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    console.log(`Meals fetched from meals client API: ${url}, ${data.length} meals`)
    return data
  } catch (error) {
    console.error('Failed to fetch meals:', error)
    throw error
  }
}

// Get a specific meal by ID
export const getMealById = async (mealId) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/meals/${mealId}`
  return await fetchWithAuth(url)
}
// Get meals for a specific plan
export const getPlanMeals = async (planId) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/meals/plan/${planId}`)
}

// Create a new meal
export const createMeal = async (mealData) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/meals`, {
    method: 'POST',
    body: JSON.stringify(mealData),
  })
}

// Update a meal
export const updateMeal = async (mealId, mealData) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/meals/${mealId}`, {
    method: 'PUT',
    body: JSON.stringify(mealData),
  })
}

// Delete a meal
export const deleteMeal = async (mealId) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/meals/${mealId}`, {
    method: 'DELETE',
  })
}

// Get favorite meals of a client
export const getFavMealsOfClient = async (token, userId) => {
  const searchParams = new URLSearchParams({
    uid: userId,
    sortBy: 'createdAt',
    sortOrder: 'descending',
  })
  const url = `${import.meta.env.VITE_API_BASE_URL}/users/${userId}/meals?${searchParams}`
  return await fetchWithAuth(url, {}, token)
}
