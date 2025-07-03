// index.js - Clean server setup for Supabase
import express from 'express'
import passport from './passport-config.js'
import cors from 'cors'
import dotenv from 'dotenv'
import { completeUserProfile } from './controllers/users.js'
import { authenticate, requireCompleteProfile } from './middlewares/authMiddleware.js'
// Import routes
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoute.js'
import mealRoutes from './routes/mealRoutes.js'
import planRoutes from './routes/planRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import itemRoutes from './routes/itemRoutes.js'
import authRoutes from './routes/authRoutes.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://knkdolmwerudrbwmamgp.supabase.co'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With'
  ],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    console.log('Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header')
    if (req.headers.authorization) {
      console.log('Auth header:', req.headers.authorization.substring(0, 20) + '...')
    }
    next()
  })
}

// Passport.js initialization
app.use(passport.initialize());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Auth routes (includes OAuth)
app.use('/api/auth', authRoutes)

// Special profile completion route (authenticate only, no profile completion check)
app.post('/api/auth/complete-profile', authenticate, completeUserProfile);

// Protected routes with profile completion requirement
app.use('/api/users', authenticate, requireCompleteProfile, userRoutes)
app.use('/api/admin', authenticate, adminRoutes)
app.use('/api/orders', authenticate, requireCompleteProfile, orderRoutes) 
app.use('/api/meals', mealRoutes) 
app.use('/api/plans', planRoutes) 
app.use('/api/items', itemRoutes) 

// Catch-all route for unmatched API paths
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /api/health',
      'POST /api/users/...',
      'GET /api/admin/...',
      'GET /api/meals/...',
      'GET /api/plans/...',
      'GET /api/orders/...',
      'GET /api/items/...'
    ]
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    })
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Handle 404 for non-API routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  })
})

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`${signal} received: closing HTTP server`)
  process.exit(0)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health check: http://localhost:${PORT}/api/health
📚 API base URL: http://localhost:${PORT}/api
  `)
})