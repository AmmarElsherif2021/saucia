// supabase.js - Clean Supabase configuration
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('Missing required Supabase environment variables:', missingVars)
  process.exit(1)
}

console.log('Supabase environment variables loaded:', {
  url: process.env.SUPABASE_URL ? '✓ Present' : '✗ Missing',
  anonKey: process.env.SUPABASE_ANON_KEY ? '✓ Present' : '✗ Missing',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Present' : '✗ Missing',
})

// Create Supabase client for general operations (respects RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Create admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper function to verify JWT token and get user
export const verifyToken = async (token) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) {
      throw new Error(`Token verification failed: ${error.message}`)
    }

    if (!user) {
      throw new Error('Invalid token: No user found')
    }

    return user
  } catch (error) {
    console.error('Error verifying token:', error.message)
    throw error
  }
}

// Helper function to get user with profile data
export const getUserWithProfile = async (userId) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user profile:', error)
      throw error
    }

    return profile
  } catch (error) {
    console.error('Error in getUserWithProfile:', error)
    throw error
  }
}

// Helper function to set admin status
export const setAdminClaim = async (userId, isAdmin = true) => {
  try {
    // First check if user exists in auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      throw new Error(`User not found: ${userError?.message || 'Invalid user ID'}`)
    }

    // Update or create user profile with admin status
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({ 
        id: userId,
        is_admin: isAdmin,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error setting admin claim:', error)
      throw error
    }

    console.log(`Admin claim ${isAdmin ? 'granted' : 'revoked'} for user ${userId}`)
    return data
  } catch (error) {
    console.error('Error setting admin claim:', error)
    throw error
  }
}

// Helper function to check if user is admin
export const checkAdminStatus = async (userId) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return profile?.is_admin === true
  } catch (error) {
    console.error('Error in checkAdminStatus:', error)
    return false
  }
}