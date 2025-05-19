/* eslint-disable */
import { fetchWithAuth } from './fetchWithAuth'

// Get all plans
export const listPlans = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)
  const url = `${import.meta.env.VITE_BASE_URL}/plans?${searchParams}`
  const res= await fetch(url)
  return res.json()
}

// Get a plan by ID
export const getPlanById = async (planId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/plans/${planId}`
  return await fetchWithAuth(url)
}

// Create a new plan
export const createPlan = async (token, planData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/plans`
  return await fetchWithAuth(
    url,
    {
      method: 'POST',
      body: JSON.stringify(planData),
    },
    token,
  )
}

// Update a plan by ID
export const updatePlan = async (token, planId, updates) => {
  const url = `${import.meta.env.VITE_BASE_URL}/plans/${planId}`
  return await fetchWithAuth(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    token,
  )
}

// Delete a plan by ID
export const deletePlan = async (token, planId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/plans/${planId}`
  return await fetchWithAuth(
    url,
    {
      method: 'DELETE',
    },
    token,
  )
}
