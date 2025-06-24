/* eslint-disable */
// Fixed users.js API client

export const login = async ({ username, password }) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Failed to login: ${res.status} - ${errorText}`)
    }

    return await res.json()
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}


export const setAdminStatus = async (uid, isAdmin) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/users/admin-status`, {
    method: 'POST',
    body: JSON.stringify({ uid, isAdmin }),
  })
}

export const getUserInfo = async (uid) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/users/${uid}`)
}

export const createUser = async (userData) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

export const updateUserProfile = async (uid, userData) => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/users/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  })
}

export const getAllUsers = async () => {
  return await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/admin/users`)
}