import { getAuth } from 'firebase/auth'
export const fetchWithAuth = async (url, options = {}) => {
  // Check if we're in emulator mode
  const isEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

  // If emulator mode, bypass authentication
  if (isEmulator) {
    console.log('⚠️ Emulator mode: Bypassing authentication')

    try {
      console.log('Fetching:', url)

      // Use default admin token for emulator
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          // Using a mock token for emulator
          Authorization: `Bearer emulator-dev-token`,
        },
      })

      console.log(`Response status: ${response.status}`)

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (response.status === 204 || !contentType) {
        return { success: true } // No content response
      }

      // For non-JSON responses, return text
      if (!contentType.includes('application/json')) {
        const text = await response.text()
        if (!response.ok) {
          throw new Error(text || `Request failed with status ${response.status}`)
        }
        return { success: true, message: text }
      }

      // Parse JSON responses
      let responseBody
      try {
        responseBody = await response.json()
      } catch (error) {
        console.error('Error parsing response body:', error)
        throw new Error('Failed to parse JSON response')
      }

      if (!response.ok) {
        const errorMessage = responseBody.error || `Request failed with status ${response.status}`
        throw new Error(errorMessage)
      }

      return responseBody
    } catch (error) {
      console.error('Error in emulator fetch:', error)
      throw error
    }
  }

  // Regular authentication flow for production
  const auth = getAuth()
  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('No authenticated user')
  }

  try {
    // Get a fresh token each time
    const idToken = await currentUser.getIdToken(true)

    console.log('Fetching:', url)

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    })

    console.log(`Response status: ${response.status}`)

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (response.status === 204 || !contentType) {
      return { success: true } // No content response
    }

    // For non-JSON responses, return text
    if (!contentType.includes('application/json')) {
      const text = await response.text()
      if (!response.ok) {
        throw new Error(text || `Request failed with status ${response.status}`)
      }
      return { success: true, message: text }
    }

    // Parse JSON responses
    let responseBody
    try {
      responseBody = await response.json()
    } catch (error) {
      console.error('Error parsing response body:', error)
      throw new Error('Failed to parse JSON response')
    }

    if (!response.ok) {
      const errorMessage = responseBody.error || `Request failed with status ${response.status}`
      throw new Error(errorMessage)
    }

    return responseBody
  } catch (error) {
    console.error('Error in fetchWithAuth:', error)

    // Check if token expired and user needs to re-authenticate
    if (
      error.code === 'auth/id-token-expired' ||
      error.code === 'auth/user-token-expired' ||
      error.message?.includes('token')
    ) {
      // Force re-authentication
      auth.signOut().then(() => {
        window.location.href = '/login?session=expired'
      })
    }

    throw error
  }
}
