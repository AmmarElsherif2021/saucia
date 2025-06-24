import { useState, useCallback } from 'react'
import { setAdminStatus, getAllUsers } from '../../API/admin'

export function useAdmin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      return await getAllUsers()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAdminStatus = useCallback(async (userId, isAdmin) => {
    setLoading(true)
    setError(null)
    try {
      return await setAdminStatus(userId, isAdmin)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getAllUsers: fetchAllUsers,
    setAdminStatus: updateAdminStatus
  }
}