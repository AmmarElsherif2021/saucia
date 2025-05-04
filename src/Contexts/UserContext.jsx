import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getIdTokenResult } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Import initialized Firebase services
import { doc, getDoc, getFirestore } from "firebase/firestore";

// Create context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

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
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;