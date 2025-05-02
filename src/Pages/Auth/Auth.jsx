// Auth.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../../../firebaseConfig";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Center,
  useColorModeValue,
  Button,
  Icon
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import "./Auth.css";
import { useUser } from "../../Contexts/UserContext";
const Auth = () => {
  const { user, loading, logout } = useUser();
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  //const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       setUser(user);
  //       console.log("User is logged in:",user.email);
  //     } else {
  //       setUser(null);
  //       console.log("User is logged out");
  //     }
  //   });

  //   // Cleanup subscription
  //   return () => unsubscribe();
  // }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Context will auto-update through onAuthStateChanged listener
      navigate('/');  // Redirect after successful login
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  // const logout = async () => {
  //   try {
  //     await signOut(auth);
  //     console.log("User signed out");
  //   } catch (error) {
  //     console.error("Error signing out:", error.message);
  //   }
  // };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ background: cardBg }}>
        <div className="auth-logo">
          <span className="logo-text">🔐</span>
        </div>
        
        <Heading color={textColor}>Welcome Back</Heading>
        <Text color={textColor} mb={6}>Secure access to your account</Text>

        {!user ? (
          <Button
            w="full"
            variant="outline"
            leftIcon={<Icon as={FcGoogle} boxSize={5} />}
            borderRadius="12px"
            height="52px"
            borderColor="gray.200"
            boxShadow="sm"
            onClick={signInWithGoogle}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s"
          >
            Sign in with Google
          </Button>
        ) : (
          <VStack spacing={4}>
            <Text>Welcome, {user.email}!</Text>
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