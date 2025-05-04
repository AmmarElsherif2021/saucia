import { Item } from "../models/Item.js";

// Create a new item
export const createItem = async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an item by ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.getById(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all items
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.getAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get items by section
export const getItemsBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const items = await Item.getBySection(section);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an item by ID
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Item.update(id, req.body);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an item by ID
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Item.delete(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};