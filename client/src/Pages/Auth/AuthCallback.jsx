import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '@chakra-ui/react';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleToken } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        const token = new URLSearchParams(location.search).get('token');
        
        if (!token) {
          setError('No authentication token found');
          navigate('/auth');
          return;
        }

        // Handle the token and get the decoded user
        const decodedUser = handleToken(token);
        
        // Check if profile completion is needed
        if (decodedUser && !decodedUser.profile_completed) {
          navigate('/auth/complete-profile');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Authentication error:', err);  
        setError(err.message || 'Authentication failed');
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [location, navigate, handleToken]);

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 mb-4">Authentication Error: {error}</p>
        <button 
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Spinner size="xl" className="mb-4" />
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback;