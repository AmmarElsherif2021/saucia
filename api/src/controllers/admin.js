import { supabaseAdmin } from '../supabase.js'
import { User } from '../models/User.js'

/**
 * Set or remove admin status for a user
 */
export const setUserAdminStatus = async (req, res) => {
  try {
    const { uid, isAdmin } = req.body

    // Validate input
    if (!uid) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'User ID is required' 
      })
    }

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'isAdmin must be a boolean value' 
      })
    }

    // Check if user exists in auth system first
    const userExistsInAuth = await User.existsInAuth(uid);
    if (!userExistsInAuth) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: `User with ID ${uid} does not exist in authentication system` 
      })
    }

    // Ensure profile exists before updating
    await User.ensureProfile(uid);

    // Update user profile
    const updatedUser = await User.update(uid, { isAdmin })
    
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: `User profile with ID ${uid} could not be updated` 
      })
    }

    res.json({
      success: true,
      message: `Admin status for user ${uid} ${isAdmin ? 'granted' : 'revoked'} successfully`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error in setUserAdminStatus:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to update admin status' 
    })
  }
}

/**
 * Get admin dashboard data with optimized queries
 */
export const getDashboardData = async (req, res) => {
  try {
    console.log('Fetching admin dashboard data...')
    // DEVELOPMENT MODE BYPASS
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        data: {
          totalUsers: 42,
          totalAdmins: 3,
          totalOrders: 100,
          activeSubscriptions: 30,
          recentUsers: [
            { id: 'user1', displayName: 'User One' },
            { id: 'user2', displayName: 'User Two' }
          ],
          metrics: {
            adminPercentage: 7.1,
            avgOrdersPerUser: 2.4,
            userGrowthRate: 12.5
          }
        }
      });
    }
    // Parallel queries for better performance
    const [
      userStatsResult,
      adminStatsResult,
      recentUsersResult,
      orderStatsResult,
      subscriptionStatsResult
    ] = await Promise.allSettled([
      // Get total user count
      supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      
      // Get admin count
      supabaseAdmin
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', true),
      
      // Get recent users with essential info
      supabaseAdmin
        .from('user_profiles')
        .select('id, display_name, first_name, last_name, created_at, is_admin, account_status')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Get order statistics (if orders table exists)
      supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true }),
      
      // Get subscription statistics (if user_subscriptions table exists)
      supabaseAdmin
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
    ])

    // Process results with error handling
    const totalUsers = userStatsResult.status === 'fulfilled' && !userStatsResult.value.error 
      ? userStatsResult.value.count 
      : 0

    const totalAdmins = adminStatsResult.status === 'fulfilled' && !adminStatsResult.value.error 
      ? adminStatsResult.value.count 
      : 0

    const recentUsers = recentUsersResult.status === 'fulfilled' && !recentUsersResult.value.error 
      ? recentUsersResult.value.data || []
      : []

    const totalOrders = orderStatsResult.status === 'fulfilled' && !orderStatsResult.value.error 
      ? orderStatsResult.value.count 
      : 0

    const activeSubscriptions = subscriptionStatsResult.status === 'fulfilled' && !subscriptionStatsResult.value.error 
      ? subscriptionStatsResult.value.count 
      : 0

    // Log any errors for debugging
    const results = [userStatsResult, adminStatsResult, recentUsersResult, orderStatsResult, subscriptionStatsResult]
    const errors = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error))
    
    if (errors.length > 0) {
      console.warn('Some dashboard queries had errors:', errors.map(e => 
        e.status === 'rejected' ? e.reason : e.value.error
      ))
    }

    // Calculate additional metrics
    const adminPercentage = totalUsers > 0 ? ((totalAdmins / totalUsers) * 100).toFixed(1) : 0
    const avgOrdersPerUser = totalUsers > 0 ? (totalOrders / totalUsers).toFixed(1) : 0

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAdmins,
        totalOrders,
        activeSubscriptions,
        recentUsers,
        metrics: {
          adminPercentage: parseFloat(adminPercentage),
          avgOrdersPerUser: parseFloat(avgOrdersPerUser),
          userGrowthRate: 0 // Could be calculated with time-series data
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch dashboard data' 
    })
  }
}

/**
 * Get all users (admin only) with optimized pagination and search
 */
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      includeAuth = false,
      orderBy = 'created_at',
      orderDirection = 'desc',
      filterBy = '',
      filterValue = ''
    } = req.query

    console.log('Getting all users with params:', {
      page, limit, search, orderBy, orderDirection, filterBy, filterValue
    })

    // Build options for User model
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Cap at 100 for performance
      search: search.trim(),
      includeAuthData: includeAuth === 'true',
      orderBy: ['created_at', 'updated_at', 'display_name', 'last_login'].includes(orderBy) ? orderBy : 'created_at',
      orderDirection: ['asc', 'desc'].includes(orderDirection) ? orderDirection : 'desc'
    }

    const result = await User.getAll(options)

    // Apply additional filtering if specified
    let filteredUsers = result.users
    if (filterBy && filterValue) {
      switch (filterBy) {
        case 'admin':
          filteredUsers = result.users.filter(user => 
            user.isAdmin === (filterValue === 'true')
          )
          break
        case 'verified':
          filteredUsers = result.users.filter(user => 
            user.emailVerified === (filterValue === 'true')
          )
          break
        case 'status':
          filteredUsers = result.users.filter(user => 
            user.accountStatus === filterValue
          )
          break
        case 'language':
          filteredUsers = result.users.filter(user => 
            user.language === filterValue
          )
          break
      }
    }

    // Add summary statistics
    const summary = {
      totalUsers: result.pagination.total,
      admins: result.users.filter(u => u.isAdmin).length,
      verified: result.users.filter(u => u.emailVerified).length,
      activeAccounts: result.users.filter(u => u.accountStatus === 'active').length
    }

    res.json({
      success: true,
      data: {
        users: filteredUsers,
        pagination: result.pagination,
        summary
      }
    })
  } catch (error) {
    console.error('Error fetching all users:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch users' 
    })
  }
}

/**
 * Verify admin status with enhanced user info
 */
export const verifyAdmin = async (req, res) => {
    try {
      // ENHANCED DEVELOPMENT CHECK
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Development mode: Auto-approving admin verification')
        return res.status(200).json({ 
          success: true, 
          isAdmin: true,
          user: {
            id: 'emulator-dev-user',
            email: 'dev@example.com',
            is_admin: true,
            display_name: 'Dev User'
          }
        })
      }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        isAdmin: false,
        message: 'No authenticated user found'
      })
    }

    // Get user profile with auth sync
    const userProfile = await User.getCurrentUser()
    
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        isAdmin: false,
        message: 'User profile not found'
      })
    }

    const isAdmin = userProfile.isAdmin === true

    return res.status(200).json({ 
      success: true, 
      isAdmin,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        is_admin: isAdmin,
        display_name: userProfile.displayName,
        account_status: userProfile.accountStatus
      }
    })
  } catch (error) {
    console.error('Error in verifyAdmin controller:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Server error verifying admin status' 
    })
  }
}

/**
 * Get user by ID (admin only) with auth correlation
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'User ID is required' 
      })
    }

    console.log(`Admin fetching user details for: ${userId}`)

    // Check if user exists in auth first
    const userExistsInAuth = await User.existsInAuth(userId)
    if (!userExistsInAuth) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: `User with ID ${userId} does not exist in authentication system` 
      })
    }

    // Get user profile with auth data
    const userProfile = await User.getById(userId, true)

    if (!userProfile) {
      // User exists in auth but no profile - create one
      console.log(`Creating missing profile for authenticated user: ${userId}`)
      const newProfile = await User.ensureProfile(userId)
      
      return res.json({
        success: true,
        data: newProfile,
        note: 'Profile was created automatically'
      })
    }

    const serializedUser = User.serialize(userProfile, userProfile.authData)

    res.json({
      success: true,
      data: serializedUser
    })
  } catch (error) {
    console.error('Error in getUserById:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch user' 
    })
  }
}

/**
 * Sync user profile with auth data (admin only)
 */
export const syncUserWithAuth = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: 'User ID is required' 
      })
    }

    console.log(`Syncing user profile with auth data: ${userId}`)

    const syncedUser = await User.syncWithAuth(userId)

    if (!syncedUser) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: `Could not sync user with ID ${userId}` 
      })
    }

    res.json({
      success: true,
      message: `User ${userId} synced successfully with auth data`,
      data: syncedUser
    })
  } catch (error) {
    console.error('Error syncing user with auth:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to sync user with auth data' 
    })
  }
}

/**
 * Get user analytics (admin only)
 */
export const getUserAnalytics = async (req, res) => {
  try {
    const { period = 'last_30_days' } = req.query

    console.log(`Fetching user analytics for period: ${period}`)

    // Validate period
    const validPeriods = ['last_7_days', 'last_30_days', 'last_90_days', 'all_time']
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        error: 'Validation error', 
        message: `Invalid period. Valid options are: ${validPeriods.join(', ')}` 
      })
    }

    // Fetch analytics data
    const analyticsData = await User.getAnalytics(period)

    if (!analyticsData) {
      return res.status(404).json({ 
        error: 'No analytics data found', 
        message: `No data available for period: ${period}` 
      })
    }

    res.json({
      success: true,
      data: analyticsData
    })
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to fetch user analytics' 
    })
  }
}