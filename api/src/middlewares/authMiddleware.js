// Enhanced authMiddleware.js with development mode bypass

import { supabase } from '../supabase.js'
import { User } from '../models/User.js'

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.MODE === 'development'

// Mock development user
const createDevUser = () => ({
  id: 'dev-user-123',
  email: 'dev@example.com',
  displayName: 'Development User',
  firstName: 'Dev',
  lastName: 'User',
  isAdmin: true,
  emailVerified: true,
  accountStatus: 'active',
  language: 'en',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

// Replace authenticate middleware
export const authenticate = (req, res, next) => {
  if (isDevelopment) {
    req.user = createDevUser();
    return next();
  }
  
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ error: 'Unauthorized' });
};

export const requireAdmin = (req, res, next) => {
  // DEVELOPMENT MODE BYPASS
  if (isDevelopment) {
    console.log('🔧 Development mode: Bypassing admin check')
    return next()
  }

  if (!req.user || !req.user.isAdmin) {
    console.log(`Admin access denied for user: ${req.user?.id || 'unknown'}`);
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Admin privileges required' 
    })
  }
  
  console.log(`Admin access granted for user: ${req.user.id}`);
  next()
}

// Optional: Middleware to ensure user profile is complete
export const requireCompleteProfile = (req, res, next) => {
  // DEVELOPMENT MODE BYPASS
  if (isDevelopment) {
    console.log('🔧 Development mode: Bypassing profile completeness check')
    return next()
  }

  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'User not authenticated'
    });
  }

  // Define required fields for a complete profile
  const requiredFields = ['firstName', 'lastName', 'phoneNumber'];
  const missingFields = requiredFields.filter(field => !req.user[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Incomplete profile',
      message: 'Profile must be completed before accessing this resource',
      missingFields: missingFields
    });
  }

  next();
}

// Optional: Middleware for user or admin access
export const requireUserOrAdmin = (req, res, next) => {
  // DEVELOPMENT MODE BYPASS
  if (isDevelopment) {
    console.log('🔧 Development mode: Bypassing user/admin access check')
    return next()
  }

  const targetUserId = req.params.id || req.params.userId;
  const currentUserId = req.user?.id;
  const isAdmin = req.user?.isAdmin;

  if (!targetUserId) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'User ID is required'
    });
  }

  if (targetUserId !== currentUserId && !isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied - can only access own resources or must be admin'
    });
  }

  next();
}

// Helper functions
function extractDisplayName(user) {
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name;
  }
  
  if (user.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  const firstName = user.user_metadata?.given_name || user.user_metadata?.first_name;
  const lastName = user.user_metadata?.family_name || user.user_metadata?.last_name;
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  
  if (firstName) {
    return firstName;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return `User_${user.id.substring(0, 8)}`;
}

function extractLanguage(user) {
  if (user.user_metadata?.locale) {
    const locale = user.user_metadata.locale.toLowerCase();
    if (locale.startsWith('ar')) return 'ar';
    if (locale.startsWith('en')) return 'en';
  }
  
  return 'en';
}

/**
 * Alternative admin middleware for backwards compatibility
 */
export const isAdmin = isDevelopment? true: requireAdmin