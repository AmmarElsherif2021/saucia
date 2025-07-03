import jwt from 'jsonwebtoken';


// Development mode check
const isDevelopment = false

// Mock development user
const createDevUser = () => ({
  id: 'dev-user-123',
  email: 'dev@example.com',
  displayName: 'Development User',
  //firstName: 'Dev',
  //lastName: 'User',
  isAdmin: true,
  emailVerified: true,
  accountStatus: 'active',
  language: 'en',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})


export const authenticate = (req, res, next) => {
  // Development bypass remains the same
  if (isDevelopment) {
    req.user = createDevUser();
    return next();
  }

  // JWT verification for production
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
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
    return next();
  }

  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'User not authenticated'
    });
  }

  // Efficient check for required fields
  if (!req.user.firstName || !req.user.lastName || !req.user.phoneNumber) {
    return res.status(403).json({
      error: 'Incomplete profile',
      message: 'Complete your profile to access this resource',
      requiredFields: ['firstName', 'lastName', 'phoneNumber']
    });
  }

  next();
};

// Helper functions


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