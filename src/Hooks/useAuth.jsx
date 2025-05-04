// hooks/useAuth.js
import { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../../firebaseConfig';
import { verifyAdmin } from '../API/admin';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Refresh the user's token to get the latest claims
  const refreshToken = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        const tokenResult = await getIdTokenResult(auth.currentUser);
        return tokenResult.claims;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
    return null;
  };

// Check if user has admin role
const checkAdminStatus = async () => {
  try {
    const result = await verifyAdmin();
    const isAdmin = result?.isAdmin ?? false;
    setUser((prevUser) => ({ ...prevUser, isAdmin }));
    return isAdmin; // Return the isAdmin value
  } catch (error) {
    console.error("Error checking admin status:", error);
    setUser((prevUser) => ({ ...prevUser, isAdmin: false }));
    return false; // Return false on error
  }
};

  // Save or update user in Firestore
  const saveUserToFirestore = async (firebaseUser) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Update existing user
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
          // Update additional fields only if they don't exist
          displayName: firebaseUser.displayName || userSnap.data().displayName,
          email: firebaseUser.email || userSnap.data().email,
          photoURL: firebaseUser.photoURL || userSnap.data().photoURL
        }, { merge: true });
      } else {
        // Create new user
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          isAdmin: false, // Default to non-admin
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      }
      
      // Get the updated user doc
      const updatedSnap = await getDoc(userRef);
      return updatedSnap.data();
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Save user to Firestore
      await saveUserToFirestore(firebaseUser);
      
      // Force refresh token to get updated claims
      await refreshToken();
      
      // Check admin status with backend
      const isAdmin = await checkAdminStatus();
      
      // Set user state with admin status
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isAdmin: Boolean(isAdmin),
      });
      
      return { success: true, isAdmin };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setAuthError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        if (firebaseUser) {
          // Get Firestore data
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          // If user doesn't exist in Firestore, create them
          if (!userSnap.exists()) {
            await saveUserToFirestore(firebaseUser);
          }
          
          // Get token to check admin status
          const tokenResult = await getIdTokenResult(firebaseUser);
          const isAdmin = tokenResult.claims.admin === true;
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            emailVerified: firebaseUser.emailVerified,
            isAdmin,
            ...(userSnap.exists() ? userSnap.data() : {})
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setAuthError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    authError,
    loginWithGoogle,
    logout,
    refreshToken,
    checkAdminStatus
  };
}