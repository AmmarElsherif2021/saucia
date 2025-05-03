// Auth.jsx - Firestore Version
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../firebaseConfig";
import { 
  doc, 
  getDoc, 
  setDoc, 
  getFirestore 
} from "firebase/firestore";
import {
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  useToast,
  Spinner,
  Box
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import "./Auth.css";
import { useUser } from "../../Contexts/UserContext";

const Auth = () => {
  const { user, logout, setUser } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize Firestore
  const db = getFirestore();

  const getUserInfo = async (uid) => {
    try {
      console.log("Getting user info from Firestore for UID:", uid);
      
      // Reference to the user document in Firestore
      const userRef = doc(db, "users", uid);
      
      // Get the user document
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log("No user found with this UID");
        throw new Error("User not found");
      }
      
      // Get user data
      const userData = userSnap.data();
      console.log("User data retrieved:", userData);
      
      return userData;
    } catch (error) {
      console.error("Error getting user info from Firestore:", error);
      throw error;
    }
  };

  const createUser = async (uid, userData) => {
    try {
      console.log("Creating new user in Firestore:", userData);
      
      // Reference to the user document in Firestore
      const userRef = doc(db, "users", uid);
      
      // Default user data structure
      const userDataToSave = {
        email: userData.email,
        displayName: userData.displayName,
        isAdmin: false, // Default to non-admin
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Save the user document to Firestore
      await setDoc(userRef, userDataToSave);
      console.log("User created successfully in Firestore");
      
      return userDataToSave;
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      console.log("Signed in with Google. User ID:", uid);

      try {
        // Try to get existing user
        const userData = await getUserInfo(uid);
        
        // Update last login timestamp
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
        
        setUser({
          ...userData,
          uid,
          email: result.user.email,
          displayName: result.user.displayName || userData.displayName
        });

        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.displayName || result.user.displayName}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate(userData.isAdmin ? '/admin' : '/');
        //navigate("/")
      } catch (error) {
        console.log("Error in get user flow:", error.message);
        
        if (error.message.includes('User not found')) {
          console.log("Creating new user");
          
          // Create new user in Firestore
          const newUserData = await createUser(uid, {
            displayName: result.user.displayName,
            email: result.user.email
          });

          setUser({
            ...newUserData,
            uid,
            email: result.user.email,
            displayName: result.user.displayName
          });

          toast({
            title: "Account created",
            description: "Your account was created successfully!",
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          navigate('/');
        } else {
          console.error("Error handling user:", error);
          toast({
            title: "Login failed",
            description: `There was an error logging you in: ${error.message}. Please try again.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Authentication error",
        description: `Could not sign in with Google: ${error.message}. Please try again.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">🔐</span>
        </div>

        <Heading>Welcome</Heading>
        <Text mb={6}>Secure access to your account</Text>

        {!user ? (
          <Button
            w="full"
            variant="outline"
            leftIcon={isLoading ? <Spinner size="sm" /> : <Icon as={FcGoogle} boxSize={5} />}
            borderRadius="12px"
            height="52px"
            borderColor="gray.200"
            boxShadow="sm"
            onClick={signInWithGoogle}
            isDisabled={isLoading}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s"
          >
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        ) : (
          <VStack spacing={4}>
            <Text>Welcome, {user.displayName || user.email}!</Text>
            <Button onClick={logout}>
              Sign Out
            </Button>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </VStack>
        )}

        <div className="auth-footer">
          <p>New user? Access is automatic with Google sign in</p>
          <p className="auth-terms">
            By continuing, you agree to our <a href="/terms" className="auth-link">Terms</a> 
            and <a href="/privacy" className="auth-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;