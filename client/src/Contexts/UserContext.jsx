// src/context/UserContext.jsx

/**
 * UserContext provides:
 *   user: User | null
 *   userPlan: Plan | null
 *   loading: boolean
 *   planLoading: boolean
 *   userAddress: Address | null
 *   logout: () => Promise<void>
 *   updateUserProfile: (userId: string, updateData: UserProfileUpdate) => Promise<...>
 *   updateUserSubscription: (subscriptionData: Subscription) => Promise<...>
 *   refreshOrders: () => Promise<Array<Order>>
 * 
 * User schema:
 *   id: string
 *   email: string
 *   firstName: string
 *   lastName: string
 *   phoneNumber: string
 *   addresses: Array<Address>
 *   orders: Array<Order>
 *   subscription: Subscription
 *   healthProfile: HealthProfile
 *   isAdmin: boolean
 * 
 * Address schema:
 *   id: string
 *   street: string
 *   city: string
 *   state: string
 *   postalCode: string
 *   isDefault: boolean
 * 
 * Subscription schema:
 *   planId: string
 *   planName: string
 *   startDate: string (ISO)
 *   endDate: string (ISO)
 *   status: 'active' | 'paused' | 'cancelled'
 * 
 * HealthProfile schema:
 *   fitnessGoal: string
 *   dietaryPreferences: Array<string>
 *   allergies: Array<string>
 * 
 * Order schema:
 *   id: string
 *   items: Array<OrderItem>
 *   total: number
 *   status: 'pending' | 'delivered' | 'cancelled'
 * 
 * OrderItem schema:
 *   itemId: string
 *   quantity: number
 *   price: number
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOrders } from '../hooks/useOrders'
import { supabase } from '../../supabaseClient.jsx'
import { userAPI } from '../API/userAPI.jsx'
const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userPlan, setUserPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [userAddress, setUserAddress] = useState(null)
  
  // Use the auth hook
  const { 
    user: authUser, 
    loading: authLoading, 
    logout: authLogout,
    updateProfile: authUpdateProfile 
  } = useAuth()
  
  // Use the orders hook
  const { 
    orders,
    fetchUserOrders,
    loading: ordersLoading 
  } = useOrders()

  const createDefaultUserStructure = (authUserData, profileData = {}) => {
    // Core validation
    if (!authUserData?.id) throw new Error('Invalid user data')
    
    return {
      // Required fields
      id: authUserData.id,
      email: authUserData.email || '',
      firstName: profileData?.first_name || '',
      lastName: profileData?.last_name || '',
      phoneNumber: profileData?.phone_number || '',
      isAdmin: profileData?.is_admin || authUserData.isAdmin || false,
      
      // Structured nested objects
      addresses: (profileData?.user_addresses || []).map(a => ({
        id: a.id,
        street: a.street,
        city: a.city,
        state: a.state,
        postalCode: a.postal_code,
        isDefault: a.is_default
      })),
      
      subscription: profileData?.subscription ? {
        planId: profileData.subscription.plan_id,
        planName: profileData.subscription.plan_name || '',
        startDate: profileData.subscription.start_date,
        endDate: profileData.subscription.end_date,
        status: profileData.subscription.status || 'inactive'
      } : {
        planId: '',
        planName: '',
        startDate: null,
        endDate: null,
        status: 'inactive'
      },
      
      healthProfile: {
        fitnessGoal: profileData?.fitness_goal || '',
        dietaryPreferences: profileData?.dietary_preferences || [],
        allergies: profileData?.allergies || []
      },
      
      orders: [] // Populated separately
    }
  }

  const getUserProfileFromAPI = async (userId) => {
    try {
      const profileData = await userAPI.getUserInfo(userId)
      return profileData
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  const refreshOrders = useCallback(async () => {
    if (!user?.id) return []
    
    try {
      const fetchedOrders = await fetchUserOrders()
      
      return fetchedOrders.map(o => ({
        id: o.id,
        total: o.total,
        status: o.status,
        createdAt: o.created_at,
        items: (o.items || []).map(i => ({
          itemId: i.item_id,
          quantity: i.quantity,
          price: i.price
        }))
      }))
    } catch (error) {
      console.error('Error refreshing orders:', error)
      return []
    }
  }, [user?.id, fetchUserOrders])

  const fetchUserPlanDetails = async (planId) => {
    if (!planId) return null
    
    try {
      setPlanLoading(true)
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Plan fetch error:', error)
      return null
    } finally {
      setPlanLoading(false)
    }
  }

  const updateUserProfile = async (userId, updateData) => {
    if (!userId) throw new Error('User ID is required')

    try {
      // Use userAPI instead of direct API call
      const result = await userAPI.updateUserProfile(userId, updateData)

      // Update local user state immediately for better UX
      setUser((prevUser) => ({
        ...prevUser,
        ...updateData,
        updatedAt: new Date().toISOString(),
      }))

      return { success: true, data: result }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  const updateUserSubscription = async (subscriptionData) => {
    if (!user?.id) return null

    try {
      // Use userAPI to update subscription
      const updateData = {
        subscription: subscriptionData,
        updatedAt: new Date().toISOString(),
      }

      await userAPI.updateUserProfile(user.id, updateData)

      const updatedUser = {
        ...user,
        subscription: subscriptionData,
      }

      setUser(updatedUser)

      const newPlan = await fetchUserPlanDetails(subscriptionData.planId)
      setUserPlan(newPlan)

      return { user: updatedUser, plan: newPlan }
    } catch (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authLogout()
      setUser(null)
      setUserPlan(null)
      setUserAddress(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Sync with auth user changes
  useEffect(() => {
    const syncUserData = async () => {
      if (authUser) {
        try {
          const profile = await getUserProfileFromAPI(authUser.id)
          const userInfo = createDefaultUserStructure(authUser, profile)
          
          // Get orders separately
          const userOrders = await refreshOrders()
          userInfo.orders = userOrders
          
          setUser(userInfo)
        } catch (error) {
          console.error('Error syncing user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
        setUserPlan(null)
        setUserAddress(null)
      }
    }

    syncUserData()
  }, [authUser, refreshOrders])

  // Load user plan whenever the user subscription changes
  useEffect(() => {
    if (user?.subscription?.planId) {
      fetchUserPlanDetails(user.subscription.planId).then((planData) => {
        setUserPlan(planData)
      })
    } else {
      setUserPlan(null)
    }
  }, [user?.subscription?.planId])

  // Update user orders when orders from hook change
  useEffect(() => {
    if (user && orders.length > 0) {
      const formattedOrders = orders.map(o => ({
        id: o.id,
        total: o.total,
        status: o.status,
        createdAt: o.created_at || o.createdAt,
        items: (o.items || []).map(i => ({
          itemId: i.item_id || i.itemId,
          quantity: i.quantity,
          price: i.price
        }))
      }))

      setUser(prev => ({
        ...prev,
        orders: formattedOrders
      }))
    }
  }, [orders, user?.id])

  const contextValue = {
    user,
    setUser,
    userPlan,
    setUserPlan,
    loading: authLoading || ordersLoading,
    planLoading,
    logout,
    updateUserSubscription,
    updateUserProfile,
    refreshOrders: async () => {
      if (user?.id) {
        const freshOrders = await refreshOrders()
        setUser((prev) => ({ ...prev, orders: freshOrders }))
        return freshOrders
      }
      return []
    },
    userAddress,
    setUserAddress,
  }

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserContext