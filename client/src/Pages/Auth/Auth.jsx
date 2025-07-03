import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Spinner, Box } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../hooks/useAuth';
import { useEffect } from 'react';
import CompleteProfile from './CompleteProfile'; // Add this import

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading, loginWithGoogle, handleToken, requiresProfileCompletion } = useAuth();
  const token = searchParams.get('token');

  // Handle JWT callback
  useEffect(() => {
    if (token && !user && !isLoading) {
      const decodedUser = handleToken(token);
      console.log('User after token handling:', decodedUser);
      
      if (requiresProfileCompletion()) {
        navigate('/complete-profile');
      } else {
        navigate('/');
      }
    }
  }, [token, user, isLoading, handleToken, navigate, requiresProfileCompletion]);

  // Show CompleteProfile if needed
  if (user && requiresProfileCompletion()) {
    return <CompleteProfile />;
  }

  if (token || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Button
          leftIcon={<FcGoogle />}
          onClick={loginWithGoogle}
          size="lg"
          width="full"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default Auth;