/* eslint-disable */
import { Plan } from '../models/Plan.js'

// Create a new plan
export const createPlan = async (req, res) => {
  try {
    const newPlan = await Plan.create(req.body)
    res.status(201).json(newPlan)
  } catch (error) {
    console.error('Error creating plan:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get all plans
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.getAll()
    res.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    res.status(500).json({ error: error.message })
  }
}

// Get a plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params
    const plan = await Plan.getById(id)
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' })
    }
    res.json(plan)
  } catch (error) {
    console.error('Error fetching plan by ID:', error)
    res.status(500).json({ error: error.message })
  }
}

// Update a plan by ID
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params
    const updatedPlan = await Plan.update(id, req.body)
    res.json(updatedPlan)
  } catch (error) {
    console.error('Error updating plan:', error)
    res.status(500).json({ error: error.message })
  }
}

// Delete a plan by ID
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params
    const deletedPlan = await Plan.delete(id)
    res.json(deletedPlan)
  } catch (error) {
    console.error('Error deleting plan:', error)
    res.status(500).json({ error: error.message })
  }
}
