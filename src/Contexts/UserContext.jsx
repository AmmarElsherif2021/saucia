import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut, getIdTokenResult } from 'firebase/auth'
import { auth } from '../../firebaseConfig.jsx'
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { getUserOrders } from '../API/orders.jsx'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userPlan, setUserPlan] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)
  const db = getFirestore()

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

  // New function to fetch plan details based on user's subscribedPlan
  const fetchUserPlanDetails = async (planId) => {
    if (!planId) return null
    
    try {
      setPlanLoading(true)
      // Try to fetch by ID first
      const planRef = doc(db, 'plans', planId)
      const planSnap = await getDoc(planRef)
      
      if (planSnap.exists()) {
        return { id: planSnap.id, ...planSnap.data() }
      }
      
      // If not found by ID, try to find by name
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
    if (user?.subscribedPlan) {
      fetchUserPlanDetails(user.subscribedPlan).then(planData => {
        setUserPlan(planData)
      })
    } else {
      setUserPlan(null)
    }
  }, [user?.subscribedPlan])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await getIdTokenResult(firebaseUser)
          const [userData, orders] = await Promise.all([
            getUserInfoFromFirestore(firebaseUser.uid),
            refreshOrders(firebaseUser),
          ])

          const userInfo = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userData?.displayName || '',
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            isAdmin: !!tokenResult.claims.admin,
            orders: orders,
            // Make sure to include subscription details
            subscribedPlan: userData?.subscribedPlan || '',
            subscriptionEndDate: userData?.subscriptionEndDate || null,
            ...(userData || {}),
          }
          
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

  const updateUserSubscription = async (planId) => {
    if (!user?.uid) return null
    
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        subscribedPlan: planId,
        updatedAt: new Date(),
        // Add subscription date if needed
        subscriptionStartDate: new Date()
      })
      
      const updatedUser = {
        ...user,
        subscribedPlan: planId
      }
      
      setUser(updatedUser)
      
      const newPlan = await fetchUserPlanDetails(planId)
      setUserPlan(newPlan)
      
      return { user: updatedUser, plan: newPlan }
    } catch (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }
  }
  const contextValue = {
    user,
    setUser,
    userPlan,
    planLoading,
    logout,
    loading,
    updateUserSubscription,
    refreshOrders: async () => {
      if (auth.currentUser) {
        const orders = await refreshOrders(auth.currentUser)
        setUser((prev) => ({ ...prev, orders }))
        return orders
      }
    },
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