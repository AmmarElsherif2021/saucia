/* eslint-disable */
import { fetchWithAuth } from './fetchWithAuth'
//import { getAuth } from "firebase/auth";

// Verify if the current user has admin privileges
export const verifyAdmin = async () => {
  try {
    const response = await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/admin/verify`)
    console.log('Admin verification response:', response)
    return { isAdmin: response?.isAdmin === true }
  } catch (error) {
    console.error('Error verifying admin status:', error)
    return { isAdmin: false, error: error.message }
  }
}

// Get admin dashboard data
export const getAdminDashboard = async () => {
  try {
    return await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/admin/dashboard`)
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    throw error
  }
}

// Get all users (admin only endpoint)
export const getAllUsers = async () => {
  try {
    return await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/admin/users`)
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Set or remove admin status for a user
export const setAdminStatus = async (uid, isAdmin) => {
  try {
    return await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/admin/set-admin`, {
      method: 'POST',
      body: JSON.stringify({ uid, isAdmin }),
    })
  } catch (error) {
    console.error('Error setting admin status:', error)
    throw error
  }
}
