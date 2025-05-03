// routes/adminRoutes.js
import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';
import { User } from '../models/User.js';

const router = express.Router();

// Verify admin status endpoint - no need for requireAdmin here
router.get('/verify-admin', authenticate, async (req, res) => {
  try {
    // The user data is already in req.user from the authenticate middleware
    const { uid, isAdmin } = req.user;
    
    // Get the user from the database to double-check admin status
    const user = await User.getById(uid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Respond with the admin status
    res.json({ 
      isAdmin: isAdmin || user.isAdmin === true,
      uid
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin-only routes
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    // Get basic stats
    const users = await User.getAll();
    
    res.json({
      totalUsers: users.length,
      // Add other stats as needed
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;