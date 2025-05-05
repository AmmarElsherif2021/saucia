// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
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
  const refreshToken = useCallback(async () => {
    try {
      if (auth.currentUser) {
        // Force refresh to get latest claims
        await auth.currentUser.getIdToken(true);
        const tokenResult = await getIdTokenResult(auth.currentUser);
        console.log("Token refreshed, claims:", tokenResult.claims);
        return tokenResult.claims;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
    return null;
  }, []);

  // Check if user has admin role with the backend
  const checkAdminStatus = useCallback(async () => {
    try {
      console.log("Checking admin status with backend");
      const result = await verifyAdmin();
      const isAdmin = result?.isAdmin ?? false;
      
      console.log("Admin status from backend:", isAdmin);
      
      setUser((prevUser) => {
        if (!prevUser) return null;
        return { ...prevUser, isAdmin };
      });
      
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setUser((prevUser) => {
        if (!prevUser) return null;
        return { ...prevUser, isAdmin: false };
      });
      return false;
    }
  }, []);

  // Save or update user in Firestore
  const saveUserToFirestore = useCallback(async (firebaseUser) => {
    try {
      if (!firebaseUser || !firebaseUser.uid) {
        console.error("Invalid firebase user object");
        return null;
      }
      
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Update existing user - only update last login
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
        }, { merge: true });
      } else {
        // Create new user with default fields
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || '',
          isAdmin: false, // Default to non-admin
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      }
      
      // Get the updated user doc
      const updatedSnap = await getDoc(userRef);
      return updatedSnap.exists() ? updatedSnap.data() : null;
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
      throw error;
    }
  }, []);

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      if (!firebaseUser) {
        throw new Error("Sign in failed - no user returned");
      }
      
      console.log("Google sign in successful:", firebaseUser.uid);
      
      // Save user to Firestore
      const firestoreData = await saveUserToFirestore(firebaseUser);
      
      // Force refresh token to get updated claims
      const claims = await refreshToken();
      
      // Check admin status with backend
      const isAdmin = await checkAdminStatus();
      
      // Set user state with all available data
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        emailVerified: firebaseUser.emailVerified,
        isAdmin: Boolean(isAdmin || claims?.admin),
        ...(firestoreData || {})
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
          console.log("Auth state changed - user signed in:", firebaseUser.uid);
          
          // Get Firestore data
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          let firestoreData = null;
          
          // If user doesn't exist in Firestore, create them
          if (!userSnap.exists()) {
            firestoreData = await saveUserToFirestore(firebaseUser);
          } else {
            firestoreData = userSnap.data();
            // Update lastLogin time
            await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
          }
          
          // Get token to check admin status
          const tokenResult = await getIdTokenResult(firebaseUser);
          const isAdminClaim = tokenResult.claims?.admin === true;
          
          // Check admin status with backend
          const isAdminBackend = await checkAdminStatus();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            emailVerified: firebaseUser.emailVerified,
            isAdmin: Boolean(isAdminClaim || isAdminBackend || (firestoreData?.isAdmin === true)),
            ...(firestoreData || {})
          });
        } else {
          console.log("Auth state changed - user signed out");
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
  }, [saveUserToFirestore, checkAdminStatus, refreshToken]);

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