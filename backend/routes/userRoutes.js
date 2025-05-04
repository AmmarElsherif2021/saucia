// routes/userRoutes.js
import express from "express";
import { createUser, getUser, updateUser } from "../controllers/users.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post("/", createUser);
router.get("/:uid", getUser);
router.put("/:uid", updateUser);

export default router;