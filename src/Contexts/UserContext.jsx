import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const UserContext = createContext();

// UserContext.jsx
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            providerData: firebaseUser.providerData,
            planTitle: "Premium Plan",
              nextMeal: {
                    time: "12:30 PM",
                    location: "Cafeteria",
        },
        timeRemaining: 75, 
        dietaryPreferences: [],  
        allergies: []              
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
  
      return unsubscribe;
    }, []);
  
    const logout = async () => {
      try {
        await auth.signOut();
        // No need to manually setUser(null) - listener will handle it
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
  
    return (
      <UserContext.Provider value={{ user, loading, logout }}>
        {!loading && children}
        {loading && <div>Loading user state...</div>}
      </UserContext.Provider>
    );
  };

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};