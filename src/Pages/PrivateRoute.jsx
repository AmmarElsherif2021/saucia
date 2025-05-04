
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../Contexts/AuthContext';
import { Spinner, Center, Text, VStack } from '@chakra-ui/react';

/**
 * A wrapper for routes that require authentication
 * @param {Object} props
 * @param {JSX.Element} props.children - The child component to render if authenticated
 * @param {boolean} props.requireAdmin - Whether the route requires admin privileges
 * @param {string} props.redirectTo - Where to redirect if not authenticated
 */
const PrivateRoute = ({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/auth' 
}) => {
  const { user, loading, checkAdminStatus } = useAuthContext();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(requireAdmin);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // If route requires admin, verify admin status
    const verifyAdmin = async () => {
      if (user && requireAdmin) {
        setIsVerifying(true);
        const hasAdminAccess = await checkAdminStatus();
        setIsAdmin(hasAdminAccess);
        setIsVerifying(false);
      }
    };

    verifyAdmin();
  }, [user, requireAdmin, checkAdminStatus]);

  // Show loading while checking auth
  if (loading || isVerifying) {
    return (
      <Center height="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Verifying access...</Text>
        </VStack>
      </Center>
    );
  }

  // No user, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User exists but needs admin rights and doesn't have them
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has necessary permissions
  return children;
};

export default PrivateRoute;