import express from 'express'
import { createPlan, getPlans, updatePlan, deletePlan, getPlanById } from '../controllers/plans.js'
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js'
const router = express.Router()

// Routes for plans
router.post('/', authenticate, requireAdmin, createPlan) // Create a new plan
router.get('/', getPlans) // Get all plans
router.get('/:id', getPlanById) // Get a plan by ID
router.put('/:id', authenticate, requireAdmin, updatePlan) // Update a plan by ID
router.delete('/:id', authenticate, requireAdmin, deletePlan) // Delete a plan by ID

export default router
