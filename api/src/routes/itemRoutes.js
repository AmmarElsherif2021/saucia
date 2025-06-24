import express from 'express'
import {
  createItem,
  getItemById,
  getAllItems,
  getItemsBySection,
  updateItem,
  deleteItem,
} from '../controllers/items.js'
import { requireAdmin, authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Routes for items
router.post('/', authenticate, requireAdmin, createItem) // Create a new item
router.get('/', getAllItems) // Get all items
router.get('/section/:section', getItemsBySection) // Changed from :sectionName to :section
router.get('/:id', getItemById) // Changed from :itemId to :id
router.put('/:id', authenticate, requireAdmin, updateItem) // Changed from :itemId to :id
router.delete('/:id', authenticate, requireAdmin, deleteItem) // Changed from :itemId to :id

export default router