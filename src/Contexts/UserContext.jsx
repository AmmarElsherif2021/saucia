import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut, getIdToken } from 'firebase/auth'
import { auth } from '../../firebaseConfig.jsx'
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getUserOrders } from '../API/orders.jsx'
import { getUserInfo, updateUserProfile as apiUpdateUserProfile } from '../API/users.jsx'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [userAddress, setUserAddress] = useState(null)
  const db = getFirestore()

  // Helper function to create default user structure
  const createDefaultUserStructure = (firebaseUser, userData = {}) => {
    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || userData?.displayName || '',
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      phoneNumber: userData?.phoneNumber || '',
      photoURL: firebaseUser.photoURL || '',
      emailVerified: firebaseUser.emailVerified,
      addresses: userData?.addresses || [],
      defaultAddress: userData?.defaultAddress || '',
      favoriteItems: userData?.favoriteItems || [],
      favoriteMeals: userData?.favoriteMeals || [],
      paymentMethods: userData?.paymentMethods || [],
      defaultPaymentMethod: userData?.defaultPaymentMethod || '',
      loyaltyPoints: Number(userData?.loyaltyPoints) || 0,
      notes: userData?.notes || '',
      language: userData?.language || 'en',
      age: userData?.age || 0,
      gender: userData?.gender || 'male',
      createdAt: userData?.createdAt || new Date().toISOString(),
      updatedAt: userData?.updatedAt || new Date().toISOString(),
      lastLogin: userData?.lastLogin || new Date(),
      orders: [], // Will be populated separately
      subscription: userData?.subscription || {
        planId: '',
        price: 0,
        endDate: null,
        paymentMethod: '',
        planName: '',
        startDate: null,
        status: 'inactive',
        mealsCount: 0,
        consumedMeals: 0,
      },
      notificationPreferences: userData?.notificationPreferences || {
        email: true,
        sms: false,
        push: true,
      },
      healthProfile: userData?.healthProfile || {
        fitnessGoal: '',
        gender: '',
        height: null,
        weight: null,
        dietaryPreferences: [],
        allergies: [],
        activityLevel: '',
      },
    }
  }

  const refreshOrders = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken()
      const orders = await getUserOrders(token)
      return Array.isArray(orders) ? orders : []
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  // Use API instead of direct Firestore access
  const getUserInfoFromAPI = async (uid) => {
    try {
      const userData = await getUserInfo(uid)
      return userData
    } catch (error) {
      console.error('Error getting user from API:', error)
      // Fallback to Firestore if API fails
      return await getUserInfoFromFirestore(uid)
    }
  }

  // Keep as fallback for API failures
  const getUserInfoFromFirestore = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      return userSnap.exists() ? userSnap.data() : null
    } catch (error) {
      console.error('Error getting user from Firestore:', error)
      return null
    }
  }

  const fetchUserPlanDetails = async (planId) => {
    if (!planId) return null

    try {
      setPlanLoading(true)
      const planRef = doc(db, 'plans', planId)
      const planSnap = await getDoc(planRef)

      if (planSnap.exists()) {
        return { id: planSnap.id, ...planSnap.data() }
      }

      const plansRef = collection(db, 'plans')
      const planQuery = query(plansRef, where('title', '==', planId))
      const querySnapshot = await getDocs(planQuery)

      if (!querySnapshot.empty) {
        const planDoc = querySnapshot.docs[0]
        return { id: planDoc.id, ...planDoc.data() }
      }

      return null
    } catch (error) {
      console.error('Error fetching plan details:', error)
      return null
    } finally {
      setPlanLoading(false)
    }
  }

  // Updated to use API function
  const updateUserProfile = async (uid, updateData) => {
    if (!uid) throw new Error('User ID is required')

    try {
      // Use API function instead of direct Firestore update
      const result = await apiUpdateUserProfile(uid, updateData)

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

  // Updated to use API for subscription updates
  const updateUserSubscription = async (subscriptionData) => {
    if (!user?.uid) return null

    try {
      // Use API to update subscription
      const updateData = {
        subscription: subscriptionData,
        updatedAt: new Date().toISOString(),
      }

      await apiUpdateUserProfile(user.uid, updateData)

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
      await signOut(auth)
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult()
          const [userData, orders] = await Promise.all([
            getUserInfoFromAPI(firebaseUser.uid), // Use API instead of Firestore
            refreshOrders(firebaseUser),
          ])

          // Create user object with default structure
          const userInfo = createDefaultUserStructure(firebaseUser, userData)
          userInfo.isAdmin = !!tokenResult.claims.admin
          userInfo.orders = orders

          setUser(userInfo)
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
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
      if (auth.currentUser) {
        const orders = await refreshOrders(auth.currentUser)
        setUser((prev) => ({ ...prev, orders }))
        return orders
      }
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
