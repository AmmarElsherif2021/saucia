import express from "express";
import {
  createMeal,
  getAllMeals,
  getMealsByPlan,
  updateMeal,
  deleteMeal,
  getMealById,
} from "../controllers/meals.js";
import {authenticate, requireAdmin} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for meals
router.post("/", authenticate, requireAdmin, createMeal); // Create a new meal
router.get("/:id", getMealById); // Get a meal by ID
router.get("/", getAllMeals); // Get all meals
router.get("/plan/:planId",authenticate, requireAdmin, getMealsByPlan); // Get meals by plan ID
router.put("/:id",authenticate, requireAdmin, updateMeal); // Update a meal by ID
router.delete("/:id",authenticate, requireAdmin, deleteMeal); // Delete a meal by ID

export default router;