import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner, VStack, Text, useToast } from '@chakra-ui/react'
import { useAuth } from '../../Hooks/useAuth'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleOAuthCallback } = useAuth()
  const toast = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        // Handle OAuth errors (user cancelled, etc.)
        if (error) {
          const errorMsg = errorDescription || error || 'Authentication was cancelled'
          throw new Error(errorMsg)
        }

        // Validate required parameters
        if (!code) {
          throw new Error('Missing authentication code')
        }

        if (!state) {
          throw new Error('Missing state parameter - possible security issue')
        }

        // Handle the OAuth callback
        const result = await handleOAuthCallback(code, state)
        
        if (result?.success && result?.user) {
          // Show success message
          toast({
            title: 'Login successful',
            description: `Welcome, ${result.user.displayName || result.user.email}!`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          })

          // Redirect based on user role
          if (result.user.isAdmin) {
            navigate('/admin', { replace: true })
          } else {
            navigate('/', { replace: true })
          }
        } else {
          throw new Error(result?.error || 'Authentication failed')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        
        // Show error message
        toast({
          title: 'Authentication failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })

        // Redirect back to auth page with error
        navigate(`/auth?error=${encodeURIComponent(error.message)}`, { replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams, handleOAuthCallback, toast])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Completing authentication...</Text>
          <Text fontSize="sm" color="gray.500">
            Please wait while we verify your credentials
          </Text>
        </VStack>
      </div>
    </div>
  )
}

export default AuthCallback