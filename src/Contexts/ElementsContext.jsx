import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Import initialized Firebase services
import { doc, getDoc, getFirestore } from "firebase/firestore";

// Create context
const ElementsContext = createContext();

export const ElementsProvider = ({ children }) => {
  const elementsReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        heroData: action.payload.heroData|| state.heroData,
        featuredData: action.payload.featuredData || state.featuredData,
        offeredData: action.payload.offeredData || state.offeredData,
        items: action.payload.items || state.items,
        meals: action.payload.meals || state.meals,
        plans: action.payload.plans || state.plans,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };
    case "ADD_MEAL":
      return { ...state, meals: [...state.meals, action.payload] };
    case "ADD_PLAN":
      return { ...state, plans: [...state.plans, action.payload] };
    case "EDIT_ITEM":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case "EDIT_MEAL":
      return {
        ...state,
        meals: state.meals.map(meal =>
          meal.id === action.payload.id ? action.payload : meal
        ),
      };
    case "DELETE_MEAL":
      return {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload),
      };
    case "EDIT_PLAN":
      return {
        ...state,
        plans: state.plans.map(plan =>
          plan.id === action.payload.id ? action.payload : plan
        ),
      };
    case "DELETE_PLAN":
      return {
        ...state,
        plans: state.plans.filter(plan => plan.id !== action.payload),
      };
    case "SET_SELECTED_ITEM":
      return { ...state, selectedItem: action.payload };
    case "SET_SELECTED_MEAL":
      return { ...state, selectedMeal: action.payload };
    case "SET_SELECTED_PLAN":
      return { ...state, selectedPlan: action.payload };
    default:
      return state;
  }
};

const initialState = {
  dashboardData: null,
  users: [],
  items: [],
  meals: [],
  plans: [],
  orders: [],
  loading: true,
  error: null,
  selectedItem: null,
  selectedMeal: null,
  selectedPlan: null,
};


  // Get user data directly from Firestore instead of API
  const getUserInfoFromFirestore = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log("No user document found in Firestore");
        return null;
      }
      
      return userSnap.data();
    } catch (error) {
      console.error("Error getting user from Firestore:", error);
      return null;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get token result to check for admin claim
          const tokenResult = await getIdTokenResult(firebaseUser);
          const isAdmin = !!tokenResult.claims.admin;
          
          // Get user data from Firestore
          const userData = await getUserInfoFromFirestore(firebaseUser.uid);

          // Combine Firebase Auth user with Firestore user data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || (userData?.displayName || ''),
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            // Include admin status from token claim
            isAdmin: isAdmin,
            // Include Firestore data if available
            ...(userData || {}),
          });
        } catch (error) {
          console.error("Error in auth state change:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const contextValue = {
    user,
    setUser,
    logout,
    loading,
  };

  return (
    <ElementsContext.Provider value={contextValue}>
      {children}
    </ElementsContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(ElementsContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a ElementsProvider");
  }
  return context;
};

export default ElementsContext;