import express from "express";
import {
  createItem,
  getItemById,
  getAllItems,
  getItemsBySection,
  updateItem,
  deleteItem,
} from "../controllers/items.js";
import { requireAdmin, authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes for items
router.post("/", authenticate, requireAdmin, createItem); // Create a new item
router.get("/", getAllItems); // Get all items
router.get("/:id", getItemById); // Get an item by ID
router.get("/section/:section", getItemsBySection); // Get items by section
router.put("/:id", authenticate, requireAdmin, updateItem);
router.delete("/:id", authenticate, requireAdmin, deleteItem); // Delete an item by ID

export default router;