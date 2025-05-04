// controllers/plans.js
import { Plan } from "../models/Plan.js";

// Create a new plan
export const createPlan = async (req, res) => {
  try {
    const newPlan = await Plan.create(req.body);
    res.status(201).json(newPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all plans
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.getAll();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a plan by ID
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPlan = await Plan.update(id, req.body);
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a plan by ID
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await Plan.delete(id);
    res.json(deletedPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};