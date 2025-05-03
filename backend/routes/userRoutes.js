// routes/userRoutes.js
import express from "express";
import { createUser, getAllUsers, getUser, updateUser } from "../controllers/users.js";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Regular routes
router.post("/users", createUser);
router.get("/users/:uid", getUser);
router.put("/users/:uid", updateUser);

// Admin-only routes
router.get("/", requireAdmin, getAllUsers);

export default router;