import express from 'express'
import {
  createMeal,
  getAllMeals,
  getMealsByPlan, 
  getMealById,
  updateMeal,
  deleteMeal,
} from '../controllers/meals.js'
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js'

const router = express.Router()

//router.post('/', authenticate, requireAdmin, createMeal)
router.post('/', createMeal)
router.get('/', getAllMeals)
router.get('/plan/:planId', authenticate, requireAdmin, getMealsByPlan) 
router.get('/:id', getMealById) 
router.put('/:id', authenticate, requireAdmin, updateMeal) // Changed from :mealId to :id
router.delete('/:id', authenticate, requireAdmin, deleteMeal) // Changed from :mealId to :id

export default router
