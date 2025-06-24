import express from 'express'
import { supabase, supabaseAdmin } from '../supabase.js'
import { User } from '../models/User.js'

const router = express.Router()

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.MODE === 'development'

// Mock development session
const createDevSession = () => ({
  access_token: 'dev-token-123',
  refresh_token: 'dev-refresh-123', 
  expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  token_type: 'bearer',
  user: {
    id: 'emulator-dev-user',
    email: 'dev@example.com',
    user_metadata: {
      full_name: 'Development User',
      given_name: 'Dev',
      family_name: 'User',
      avatar_url: 'https://via.placeholder.com/150'
    }
  }
})

const createDevUser = () => ({
  id: 'emulator-dev-user',
  email: 'dev@example.com',
  displayName: 'Development User',
  firstName: 'Dev',
  lastName: 'User',
  isAdmin: true,
  emailVerified: true,
  accountStatus: 'active',
  language: 'en',
  avatarUrl: 'https://via.placeholder.com/150',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})

// Initialize OAuth login
router.post('/oauth/init', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Bypassing OAuth init')
      return res.json({ 
        authUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?code=dev-auth-code`,
        message: 'Development mode - using mock OAuth'
      })
    }

    const { provider, redirectUrl } = req.body

    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' })
    }

    // Use environment variable for consistent redirect URL
    const finalRedirectUrl = redirectUrl || process.env.OAUTH_REDIRECT_URL || `${process.env.FRONTEND_URL}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: finalRedirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('OAuth init error:', error)
      return res.status(400).json({ error: error.message })
    }

    res.json({ authUrl: data.url })
  } catch (error) {
    console.error('OAuth initialization error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Fixed OAuth callback route - changed from /v1/callback to /oauth/callback
router.post('/oauth/callback', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Bypassing OAuth callback')
      const mockSession = createDevSession()
      const mockUser = createDevUser()
      
      return res.json({
        session: mockSession,
        user: mockUser,
        isNewUser: false,
        message: 'Development mode - using mock authentication'
      })
    }

    const { code } = req.body;
    console.log('Received OAuth callback with code:', code);
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Processing OAuth callback...');

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('OAuth callback error:', error);
      return res.status(400).json({ error: error.message });
    }

    const { user, session } = data;
    
    if (!user || !session) {
      console.error('Invalid session data received');
      return res.status(400).json({ error: 'Invalid session data' });
    }

    console.log(`Processing user: ${user.id} (${user.email})`);
    
    const provider = user?.app_metadata?.provider || 'unknown';
    let userProfile = null;
    let isNewUser = false;

    try {
      // Use the enhanced createFromAuth method
      userProfile = await User.createFromAuth(user.id, user);
      
      // Check if this was a new user creation
      const existingProfile = await User.getById(user.id);
      isNewUser = !existingProfile;

    } catch (profileError) {
      console.error('Error handling user profile:', profileError);
      
      // Try to get existing profile one more time
      userProfile = await User.getById(user.id);
      if (!userProfile) {
        return res.status(500).json({ 
          error: 'Failed to create user profile',
          details: profileError.message 
        });
      }
    }

    // Store session information (non-blocking)
    storeSessionAsync(user, session, provider).catch(sessionError => {
      console.error('Error storing session (non-blocking):', sessionError);
    });

    console.log(`OAuth callback successful for user: ${user.id}`);

    res.json({
      session: session,
      user: userProfile,
      isNewUser: isNewUser
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Enhanced session endpoint with proper error handling
router.get('/session', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Bypassing session check')
      const mockSession = createDevSession()
      const mockUser = createDevUser()
      
      return res.json({
        session: mockSession,
        user: mockUser,
        message: 'Development mode - using mock session'
      })
    }

    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split('Bearer ')[1]

    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    console.log(`Session check for user: ${user.id}`);

    // Use the enhanced ensureProfile method
    const userProfile = await User.ensureProfile(user.id, {
      email: user.email,
      display_name: extractDisplayName(user),
      first_name: user.user_metadata?.given_name || '',
      last_name: user.user_metadata?.family_name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
    });

    if (!userProfile) {
      console.error('Failed to ensure user profile exists');
      return res.status(500).json({ error: 'Failed to load user profile' });
    }

    res.json({
      user: userProfile,
      session: { 
        access_token: accessToken,
        expires_at: user.exp 
      }
    })
    
    console.log(`Session retrieved for user: ${user.id}`);
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Refresh session with proper error handling
router.post('/refresh', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Bypassing session refresh')
      const mockSession = createDevSession()
      const mockUser = createDevUser()
      
      return res.json({
        session: mockSession,
        user: mockUser,
        message: 'Development mode - mock session refreshed'
      })
    }

    const authHeader = req.headers.authorization
    const refreshToken = req.body?.refresh_token || authHeader?.split('Bearer ')[1]
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' })
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Update session in database
    if (data.session) {
      const sessionRecord = {
        user_id: data.user.id,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: new Date(data.session.expires_at * 1000),
      };
      
      try {
        await supabaseAdmin.from('user_sessions').upsert(sessionRecord, {
          onConflict: 'access_token'
        });
      } catch (sessionError) {
        console.error('Error updating session:', sessionError);
      }
    }

    // Get user profile using the proper method
    const userProfile = await User.getById(data.user.id)

    res.json({
      session: data.session,
      user: userProfile
    })
  } catch (error) {
    console.error('Refresh session error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign out with proper cleanup
router.post('/signout', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Mock signout successful')
      return res.json({ 
        success: true,
        message: 'Development mode - mock signout'
      })
    }

    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split('Bearer ')[1] || req.body.access_token

    if (accessToken) {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut(accessToken)
      
      if (error) {
        console.error('Supabase signout error:', error)
      }

      // Remove session from database
      try {
        await supabaseAdmin
          .from('user_sessions')
          .delete()
          .eq('access_token', accessToken)
      } catch (sessionError) {
        console.error('Error removing session:', sessionError)
      }
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Sign out error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user profile with proper method usage
router.get('/profile', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Returning mock profile')
      return res.json(createDevUser())
    }

    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split('Bearer ')[1]

    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Use ensureProfile to get or create profile
    const userProfile = await User.ensureProfile(user.id, {
      email: user.email,
      display_name: extractDisplayName(user)
    });

    res.json(userProfile)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user profile with proper validation
router.put('/profile', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Mock profile update')
      const updatedUser = { ...createDevUser(), ...req.body }
      return res.json(updatedUser)
    }

    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split('Bearer ')[1]

    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Update profile using the enhanced method
    const updatedUser = await User.update(user.id, req.body)
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(updatedUser)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Complete user profile with enhanced handling
router.post('/complete-profile', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Mock profile completion')
      const completedUser = { ...createDevUser(), ...req.body }
      return res.json({
        success: true,
        user: completedUser,
        message: 'Development mode - mock profile completed'
      })
    }

    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split('Bearer ')[1]

    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Update profile with validation
    const updatedUser = await User.update(user.id, {
      ...req.body,
      updated_at: new Date().toISOString()
    })
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile completed successfully'
    })
  } catch (error) {
    console.error('Complete profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Check admin status
router.get('/admin-status', async (req, res) => {
  try {
    // DEVELOPMENT MODE BYPASS
    if (isDevelopment) {
      console.log('🔧 Development mode: Mock admin status check')
      return res.json({ is_admin: true })
    }

    const authHeader = req.headers.authorization
    const accessToken = authHeader?.split('Bearer ')[1]

    if (!accessToken) {
      return res.status(401).json({ error: 'Authorization token required' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const userProfile = await User.getById(user.id)
    const isAdmin = userProfile?.isAdmin || false

    res.json({ is_admin: isAdmin })
  } catch (error) {
    console.error('Check admin status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper Functions

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

// Store session asynchronously
async function storeSessionAsync(user, session, provider) {
  try {
    const sessionRecord = {
      user_id: user.id,
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: new Date(session.expires_at * 1000),
      provider: provider,
      provider_token: session.provider_token,
      provider_refresh_token: session.provider_refresh_token
    };
    
    await supabaseAdmin.from('user_sessions').upsert(sessionRecord, {
      onConflict: 'access_token'
    });
    
    console.log('Session stored successfully');
  } catch (error) {
    console.error('Error storing session:', error);
  }
}

export default router