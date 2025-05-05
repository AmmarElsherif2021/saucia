// routes/adminRoute.js
import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';
import { getDashboardData, setUserAdminStatus, getAllUsers } from '../controllers/admin.js';
import { verifyAdmin } from '../controllers/verifyAdmin.js';

const router = express.Router();

// Verify if user is admin - only requires authentication
router.get('/verify', authenticate, verifyAdmin);

// Routes that require both authentication and admin permissions
router.get('/dashboard', authenticate, requireAdmin, getDashboardData);
router.get('/users', authenticate, requireAdmin, getAllUsers);
router.post('/set-admin', authenticate, requireAdmin, setUserAdminStatus);

export default router;