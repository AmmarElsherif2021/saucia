import express from "express";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";
import { verifyAdmin } from "../controllers/verifyAdmin.js";
import { getAllUsers } from "../controllers/users.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Verify admin status
router.get("/verify", verifyAdmin);

// Admin-only routes
router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    res.json({
      totalUsers: 100, // Replace with actual logic
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", requireAdmin, getAllUsers);

export default router;