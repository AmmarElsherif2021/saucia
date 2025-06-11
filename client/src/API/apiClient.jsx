/* eslint-disable */
// src/services/apiClient.js
import axios from 'axios'
import { auth } from '../../firebaseConfig.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout for requests
  timeout: 10000,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  } catch (error) {
    console.error('Error in request interceptor:', error)
    return Promise.reject(error)
  }
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Add detailed error logging
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        endpoint: error.config.url,
      })

      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized access
        console.log('Unauthorized access, redirecting to login')
        //window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request)
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message)
    }

    return Promise.reject(error)
  },
)

export const publicApi = {
  // Add public endpoints here
  health: () => apiClient.get('/health'),
}

export const authenticatedApi = {
  users: {
    get: (uid) => apiClient.get(`/users/${uid}`),
    list: () => apiClient.get('/users'),
    update: (uid, data) => apiClient.put(`/users/${uid}`, data),
    delete: (uid) => apiClient.delete(`/users/${uid}`),
  },
  meals: {
    list: () => apiClient.get('/meals'),
    create: (mealData) => apiClient.post('/meals', mealData),
    update: (id, mealData) => apiClient.put(`/meals/${id}`, mealData),
    delete: (id) => apiClient.delete(`/meals/${id}`),
  },
  plans: {
    list: () => apiClient.get('/plans'),
    create: (planData) => apiClient.post('/plans', planData),
    update: (id, planData) => apiClient.put(`/plans/${id}`, planData),
    delete: (id) => apiClient.delete(`/plans/${id}`),
  },
  admin: {
    verify: () => apiClient.get('/admin/verify-admin'),
    metrics: () => apiClient.get('/admin/metrics'),
  },
}
