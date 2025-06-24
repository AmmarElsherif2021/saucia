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

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient.jsx'
import { getUserOrders } from '../API/orders.jsx'
import { getUserInfo, updateUserProfile as apiUpdateUserProfile } from '../API/users.jsx'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [userAddress, setUserAddress] = useState(null)

  const createDefaultUserStructure = (supabaseUser, profileData = {}) => {
    // Core validation
    if (!supabaseUser?.id) throw new Error('Invalid user data')
    
    return {
      // Required fields
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: profileData?.first_name || '',
      lastName: profileData?.last_name || '',
      phoneNumber: profileData?.phone_number || '',
      isAdmin: profileData?.is_admin || false,
      
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
  
  const refreshOrders = async () => {
    const orders = await getUserOrders(user.id)
    
    return orders.map(o => ({
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
  }

  const fetchUserPlanDetails = async (planId) => {
    if (!planId) return null;
    
    try {
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
    }
  };

  const updateUserProfile = async (userId, updateData) => {
    if (!userId) throw new Error('User ID is required')

    try {
      // Use API function instead of direct Supabase update
      const result = await apiUpdateUserProfile(userId, updateData)

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
      // Use API to update subscription
      const updateData = {
        subscription: subscriptionData,
        updatedAt: new Date().toISOString(),
      }

      await apiUpdateUserProfile(user.id, updateData)

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
      await supabase.auth.signOut()
      setUser(null)
      setUserPlan(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Load user plan whenever the user changes
  useEffect(() => {
    if (user?.subscription?.planId) {
      fetchUserPlanDetails(user.subscription.planId).then((planData) => {
        setUserPlan(planData)
      })
    } else {
      setUserPlan(null)
    }
  }, [user?.subscription?.planId])

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true)
        
        try {
          if (session?.user) {
            const userId = session.user.id
            const [profile, orders] = await Promise.all([
              getUserProfileFromSupabase(userId),
              refreshOrders()
            ])

            // Create user object with default structure
            const userInfo = createDefaultUserStructure(session.user, profile)
            userInfo.orders = orders

            setUser(userInfo)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const userId = session.user.id
        const profile = await getUserProfileFromSupabase(userId)
        const orders = await refreshOrders()
        
        const userInfo = createDefaultUserStructure(session.user, profile)
        userInfo.orders = orders
        
        setUser(userInfo)
      }
      setLoading(false)
    }

    checkSession()

    return () => subscription?.unsubscribe()
  }, [])

  const contextValue = {
    user,
    setUser,
    userPlan,
    setUserPlan,
    planLoading,
    logout,
    loading,
    updateUserSubscription,
    updateUserProfile,
    refreshOrders: async () => {
      if (user?.id) {
        const orders = await refreshOrders()
        setUser((prev) => ({ ...prev, orders }))
        return orders
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