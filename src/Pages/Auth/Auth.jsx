// components/Auth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import "./Auth.css";
import { useAuthContext } from "../../Contexts/AuthContext";

const Auth = () => {
  const { user, loading, authError, loginWithGoogle, logout } = useAuthContext(); 
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Get redirect location if any
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user && !loading) {
      // Check if user is admin to redirect to appropriate page
      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate(from);
      }
    }
  }, [user, loading, navigate, from]);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: `Welcome${user?.displayName ? `, ${user.displayName}` : ""}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Navigate based on admin status
        if (result.isAdmin) {
          navigate("/admin");
        } else {
          navigate(from);
        }
      } else {
        toast({
          title: "Login failed",
          description: result.error || "An error occurred during login",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error during Google sign in:", error);
      toast({
        title: "Authentication error",
        description: error.message || "Failed to sign in with Google",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Logout error",
        description: "There was an issue logging you out.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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

        {authError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {authError}
          </Alert>
        )}

        {loading ? (
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Checking authentication...</Text>
          </VStack>
        ) : !user ? (
          <Button
            w="full"
            variant="outline"
            leftIcon={isLoggingIn ? <Spinner size="sm" /> : <Icon as={FcGoogle} boxSize={5} />}
            borderRadius="12px"
            height="52px"
            borderColor="gray.200"
            boxShadow="sm"
            onClick={handleGoogleSignIn}
            isDisabled={isLoggingIn}
            _hover={{
              transform: "translateY(-1px)",
              boxShadow: "md"
            }}
            transition="all 0.2s"
          >
            {isLoggingIn ? "Signing in..." : "Sign in with Google"}
          </Button>
        ) : (
          <VStack spacing={4}>
            <Text>
              Welcome, {user.displayName || user.email}!
              {user.isAdmin && " (Admin)"}
            </Text>
            <Button onClick={handleLogout} colorScheme="red" variant="outline">
              Sign Out
            </Button>
            <Button onClick={() => navigate('/')} colorScheme="blue">
              Go to Home
            </Button>
            {user.isAdmin && (
              <Button onClick={() => navigate('/admin')} colorScheme="green">
                Admin Dashboard
              </Button>
            )}
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