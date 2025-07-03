import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  
  // Add any computed values you need
  const contextValue = {
    ...auth,
    // Alias for backward compatibility
    requiresCompletion: auth.requiresProfileCompletion(),
    // Additional computed properties
    hasAddress: !!auth.userAddress,
    hasSubscription: !!auth.user?.subscription,
    isAdmin: auth.user?.isAdmin || false,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// For backward compatibility, you can also export this as useUser
export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};