import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  Box,
} from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook } from 'react-icons/fa'
import { useAuth } from '../../Hooks/useAuth'
import logoIcon from '../../assets/logo.PNG'

const Auth = () => {
  const { 
    user, 
    loading, 
    authError, 
    isInitialized,
    loginWithOAuth, 
    logout 
  } = useAuth()
  
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginProvider, setLoginProvider] = useState(null)

  const from = location.state?.from?.pathname || '/'

  // Handle authentication redirect after login
  useEffect(() => {
    if (user && !loading) {
      navigate(user.isAdmin || user.is_admin ? '/admin' : '/')
    }
  }, [user, loading])

  const handleOAuthSignIn = async (provider) => {
    setIsLoggingIn(true)
    setLoginProvider(provider)
    
    try {
      const result = await loginWithOAuth(provider)
      
      if (result.success) {
        const providerName = provider === 'google' ? 'Google' : 'Facebook'
        toast({
          title: `Redirecting to ${providerName}`,
          description: 'You will be redirected to complete sign-in...',
          status: 'info',
          duration: 3000,
          isClosable: false,
        })
      } else {
        toast({
          title: 'Login failed',
          description: result.error || 'An error occurred during login',
          status: 'error',
          duration: 5000,
          isClosable: false,
        })
      }
    } catch (error) {
      const providerName = provider === 'google' ? 'Google' : 'Facebook'
      toast({
        title: 'Authentication error',
        description: error.message || `Failed to sign in with ${providerName}`,
        status: 'error',
        duration: 5000,
        isClosable: false,
      })
    } finally {
      setIsLoggingIn(false)
      setLoginProvider(null)
    }
  }

  const handleGoogleSignIn = () => handleOAuthSignIn('google')
  const handleFacebookSignIn = () => handleOAuthSignIn('facebook')

  const handleLogout = async () => {
    try {
      const result = await logout()
      
      if (result.success) {
        toast({
          title: 'Logged out',
          description: 'You have been successfully logged out.',
          status: 'info',
          duration: 3000,
          isClosable: false,
        })
      } else {
        toast({
          title: 'Logout error',
          description: result.error || 'There was an issue logging you out.',
          status: 'error',
          duration: 5000,
          isClosable: false,
        })
      }
    } catch (error) {
      toast({
        title: 'Logout error',
        description: error.message || 'There was an issue logging you out.',
        status: 'error',
        duration: 5000,
        isClosable: false,
      })
    }
  }

  // Show loading while initializing
  if (!isInitialized || loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>
              {!isInitialized ? 'Initializing...' : 'Checking authentication...'}
            </Text>
          </VStack>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src={logoIcon} width={'50px'} alt="Logo" />
        </div>

        <Heading>Welcome</Heading>
        <Text mb={6}>Secure access to your account</Text>

        {authError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            {authError}
          </Alert>
        )}

        {!user ? (
          <VStack spacing={4} width="full">
            <Text>Sign in to continue</Text>
            
            <Button
              leftIcon={<FcGoogle />}
              onClick={handleGoogleSignIn}
              colorScheme="blue"
              variant="solid"
              isLoading={isLoggingIn && loginProvider === 'google'}
              loadingText="Redirecting..."
              size="lg"
              width="full"
              disabled={loading || isLoggingIn}
            >
              Sign in with Google
            </Button>

            <Box position="relative" width="full">
              <Divider />
              <Text
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg="white"
                px={2}
                fontSize="sm"
                color="gray.500"
              >
                or
              </Text>
            </Box>

            <Button
              leftIcon={<FaFacebook />}
              onClick={handleFacebookSignIn}
              colorScheme="facebook"
              variant="solid"
              isLoading={isLoggingIn && loginProvider === 'facebook'}
              loadingText="Redirecting..."
              size="lg"
              width="full"
              disabled={loading || isLoggingIn}
              bg="#1877F2"
              _hover={{ bg: "#166FE5" }}
              _active={{ bg: "#1464CC" }}
            >
              Sign in with Facebook
            </Button>
          </VStack>
        ) : (
          <VStack spacing={4}>
            <Text>
              Welcome, {user.displayName || user.email}!
              {user.isAdmin && ' (Admin)'}
            </Text>
            <Button 
              onClick={handleLogout} 
              colorScheme="red" 
              variant="outline"
              disabled={loading}
            >
              Sign Out
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              colorScheme="brand"
              disabled={loading}
            >
              Go to Home
            </Button>
            {user.isAdmin && (
              <Button 
                onClick={() => navigate('/admin')} 
                colorScheme="green"
                disabled={loading}
              >
                Admin Dashboard
              </Button>
            )}
          </VStack>
        )}

        <div className="auth-footer">
          <p>New user? Access is automatic with Google or Facebook sign in</p>
          <p className="auth-terms">
            By continuing, you agree to our{' '}
            <a href="/terms" className="auth-link">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="auth-link">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth