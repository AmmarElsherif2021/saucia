// middlewares/authMiddleware.js
import { auth } from "../firebase.js";

// Middleware to verify Firebase ID token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }
    
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        // Store any custom claims in the request object
        admin: decodedToken.admin === true
      };
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Middleware to check for admin privileges
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }
    
    // Check if the user has admin claim
    if (req.user.admin === true) {
      return next();
    }
    
    // If not in request object, double-check with Firebase
    try {
      const userRecord = await auth.getUser(req.user.uid);
      const isAdmin = userRecord.customClaims?.admin === true;
      
      if (isAdmin) {
        req.user.admin = true;
        return next();
      }
      
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    } catch (error) {
      console.error("Error verifying admin status:", error);
      return res.status(403).json({ error: 'Forbidden - Admin verification failed' });
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({ error: 'Internal server error during admin verification' });
  }
};