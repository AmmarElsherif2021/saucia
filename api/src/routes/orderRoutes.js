import express from 'express'
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrder,
  deleteOrder,
} from '../controllers/orders.js'
import { authenticate } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Routes for orders
router.post('/', authenticate, createOrder) // Create a new order
router.get('/', authenticate, getAllOrders) // Get all orders
router.get('/:uid', authenticate, getUserOrders) // Get orders for the authenticated user
router.put('/:id', authenticate, updateOrder) // Update an order by ID
router.delete('/:id', authenticate, deleteOrder) // Delete an order by ID

export default router
