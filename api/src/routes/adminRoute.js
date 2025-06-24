import express from 'express'
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js'
import {
  setUserAdminStatus,
  getDashboardData,
  getAllUsers,
  verifyAdmin,
  getUserById
} from '../controllers/admin.js'

const router = express.Router()

// Apply authentication middleware to all admin routes
router.use(authenticate)

// Admin verification endpoint
router.get('/verify', (req, res, next) => {
  // DEVELOPMENT MODE BYPASS
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: Bypassing admin verification')
    return res.json({ 
      isAdmin: true,
      user: {
        id: 'emulator-dev-user',
        email: 'dev@example.com'
      }
    })
  }
  next()
}, verifyAdmin)

// Admin-only routes
router.use(requireAdmin)

// Dashboard data
router.get('/dashboard', getDashboardData)

// User management
router.get('/users', getAllUsers)
router.get('/users/:userId', getUserById)
router.post('/users/admin-status', setUserAdminStatus)


// Health check for admin routes
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Admin routes are working',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      is_admin: req.user?.is_admin
    }
  })
})

export default router