/* eslint-disable */
import { Meal } from '../models/Meal.js'

// Create a new meal
export const createMeal = async (req, res) => {
  try {
    const newMeal = await Meal.create(req.body)
    res.status(201).json(newMeal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get a meal by ID
export const getMealById = async (req, res) => {
  try {
    const { id } = req.params
    const meal = await Meal.getById(id)
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' })
    }
    res.json(meal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all meals
export const getAllMeals = async (req, res) => {
  try {
    const meals = await Meal.getAll()
    res.json(meals)
    console.log(`meals queries ${meals}`)
  } catch (error) {
    console.error('Error fetching meals:', error)
    res.status(500).json({ error: 'Failed to fetch meals' })
  }
}

// Get meals by plan ID
export const getMealsByPlan = async (req, res) => {
  try {
    const { planId } = req.params
    const meals = await Meal.getByPlan(planId)
    res.json(meals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update a meal by ID
export const updateMeal = async (req, res) => {
  try {
    const { id } = req.params
    const updatedMeal = await Meal.update(id, req.body)
    res.json(updatedMeal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Delete a meal by ID
export const deleteMeal = async (req, res) => {
  try {
    const { id } = req.params
    const result = await Meal.delete(id)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
