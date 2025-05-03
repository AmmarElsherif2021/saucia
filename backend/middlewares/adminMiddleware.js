// middlewares/adminMiddleware.js
import { auth } from "../firebase.js";

/**
 * Middleware to verify user has admin privileges
 */
const isAdmin = async (req, res, next) => {
  try {
    // We already have the user's UID from the authenticate middleware
    const { uid } = req.user;
    
    // Get the user's ID token claims
    const userRecord = await auth.getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    // Check if user has admin claim
    if (customClaims.admin === true) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied: Admin privileges required' });
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ error: 'Server error during authorization' });
  }
};

export { isAdmin };