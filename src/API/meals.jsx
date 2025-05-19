/* eslint-disable */
//const response = await fetch('/users');  // Relative path
// Helper function to handle API requests
import { fetchWithAuth } from './fetchWithAuth'

// Get all meals
export const getMeals = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)
  const url = `${import.meta.env.VITE_BASE_URL}/meals?${searchParams}`
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch meals:', error)
    throw error
  }
}

// Get meals for a specific plan
export const getPlanMeals = async (planId, queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)
  const url = `${import.meta.env.VITE_BASE_URL}/meals/plan/${planId}?${searchParams}`
  return await fetchWithAuth(url)
}

// Get a specific meal by ID
export const getMealById = async (mealId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/meals/${mealId}`
  return await fetchWithAuth(url)
}

// Create a new meal
export const createMeal = async (token, mealData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/meals`
  return await fetchWithAuth(
    url,
    {
      method: 'POST',
      body: JSON.stringify(mealData),
    },
    token,
  )
}

// Update a meal
export const updateMeal = async (token, mealId, mealData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/meals/${mealId}`
  return await fetchWithAuth(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(mealData),
    },
    token,
  )
}

// Delete a meal
export const deleteMeal = async (token, mealId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/meals/${mealId}`
  return await fetchWithAuth(
    url,
    {
      method: 'DELETE',
    },
    token,
  )
}

// Get favorite meals of a client
export const getFavMealsOfClient = async (token, userId) => {
  const searchParams = new URLSearchParams({
    uid: userId,
    sortBy: 'createdAt',
    sortOrder: 'descending',
  })
  const url = `${import.meta.env.VITE_BASE_URL}/users/${userId}/meals?${searchParams}`
  return await fetchWithAuth(url, {}, token)
}
