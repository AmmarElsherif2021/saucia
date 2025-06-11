/* eslint-disable */

// server/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoute.js'
import mealRoutes from './routes/mealRoutes.js'
import planRoutes from './routes/planRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import itemRoutes from './routes/itemRoutes.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',')
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Middleware
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' })
})

// Routes - Note the /api prefix to match frontend expectations
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/meals', mealRoutes)
app.use('/api/plans', planRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/items', itemRoutes)

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
/*
// Firebase Functions entry point
import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoute.js';
import mealRoutes from './routes/mealRoutes.js';
import planRoutes from './routes/planRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

const app = express();

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration
const corsOptions = {
  origin: isProduction 
    ? functions.config().allowed?.origins?.split(',') 
    : 'http://localhost:5173', // Match Vite's default port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Required if using cookies/auth
};

// Handle preflight requests
app.options('*', cors(corsOptions)); 
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/items", itemRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'An unexpected error occurred',
    message: !isProduction ? err.message : undefined
  });
});

// Export as Firebase Function
export const api = functions.https.onRequest(app);
*/ 