/* eslint-disable */
import { fetchWithAuth } from './fetchWithAuth'

// Get all plans
export const listPlans = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)
  const url = `${import.meta.env.VITE_API_BASE_URL}/plans?${searchParams}`
  const res = await fetch(url)
  return res.json()
}

// Get a plan by ID
export const getPlanById = async (planId) => {
  const url = `${import.meta.env.VITE_API_BASE_URL}/plans/${planId}`
  return await fetchWithAuth(url)
}

// Create a new plan
export const createPlan = async (planData) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/plans`, {
    method: 'POST',
    body: JSON.stringify(planData),
  })
}

// Update a plan by ID
export const updatePlan = async (planId, updates) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/plans/${planId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

// Delete a plan by ID
export const deletePlan = async (planId) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/plans/${planId}`, {
    method: 'DELETE',
  })
}