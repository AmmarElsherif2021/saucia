/* eslint-disable */
// Contexts/AuthContext.jsx
import { createContext, useContext } from 'react'
import { useAuth } from '../Hooks/useAuth'

// Create context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
