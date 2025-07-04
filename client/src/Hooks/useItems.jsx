import { useState, useEffect, useCallback } from 'react';
import { itemsAPI } from '../API/itemAPI';

/**
 * Custom hook for managing items according to Supabase schema
 * 
 * Item schema (from Supabase):
 * - id: number (SERIAL PRIMARY KEY)
 * - name: string
 * - name_arabic: string
 * - description: string
 * - description_arabic: string
 * - category: string ('sauce', 'side', 'drink', 'utensil')
 * - category_arabic: string
 * - price: number (NUMERIC(10,2))
 * - calories: number (INTEGER)
 * - protein_g: number (INTEGER)
 * - carbs_g: number (INTEGER)
 * - fat_g: number (INTEGER)
 * - max_free_per_meal: number (INTEGER)
 * - image_url: string
 * - is_available: boolean
 * - sort_order: number (INTEGER)
 * - created_at: string (TIMESTAMPTZ)
 * - updated_at: string (TIMESTAMPTZ)
 */

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate and normalize item data according to schema
  const validateItemData = (item) => {
    if (!item) return null;
    
    // Ensure required fields exist
    if (!item.name || typeof item.price !== 'number') {
      console.warn('Invalid item data - missing required fields:', item);
      return null;
    }

    // Normalize the item data to match schema
    return {
      id: item.id,
      name: item.name,
      name_arabic: item.name_arabic || null,
      description: item.description || null,
      description_arabic: item.description_arabic || null,
      category: item.category || 'side',
      category_arabic: item.category_arabic || null,
      price: Number(item.price) || 0,
      calories: Number(item.calories) || 0,
      protein_g: Number(item.protein_g) || 0,
      carbs_g: Number(item.carbs_g) || 0,
      fat_g: Number(item.fat_g) || 0,
      max_free_per_meal: Number(item.max_free_per_meal) || 0,
      image_url: item.image_url || null,
      is_available: Boolean(item.is_available ?? true),
      sort_order: Number(item.sort_order) || 0,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  };

  const fetchItems = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsAPI.listItems(queryParams);
      const validatedItems = data
        .map(validateItemData)
        .filter(Boolean)
        .sort((a, b) => a.sort_order - b.sort_order);
      
      setItems(validatedItems);
      return validatedItems;
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsAPI.getItemById(itemId);
      const validatedItem = validateItemData(data);
      return validatedItem;
    } catch (err) {
      console.error('Error fetching item:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (itemData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate data before sending
      const validatedData = validateItemData(itemData);
      if (!validatedData) {
        throw new Error('Invalid item data provided');
      }

      const newItem = await itemsAPI.createItem(validatedData);
      const normalizedItem = validateItemData(newItem);
      
      if (normalizedItem) {
        setItems(prev => [...prev, normalizedItem].sort((a, b) => a.sort_order - b.sort_order));
      }
      
      return normalizedItem;
    } catch (err) {
      console.error('Error creating item:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyItem = useCallback(async (itemId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await itemsAPI.updateItem(itemId, updates);
      const normalizedItem = validateItemData(updatedItem);
      
      if (normalizedItem) {
        setItems(prev => 
          prev.map(item => item.id === itemId ? normalizedItem : item)
            .sort((a, b) => a.sort_order - b.sort_order)
        );
      }
      
      return normalizedItem;
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      await itemsAPI.deleteItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fixed: Updated to use the correct API method name
  const fetchItemsByCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsAPI.getItemsByCategory(category);
      const validatedItems = data
        .map(validateItemData)
        .filter(Boolean)
        .sort((a, b) => a.sort_order - b.sort_order);
      
      setItems(validatedItems);
      return validatedItems;
    } catch (err) {
      console.error('Error fetching items by category:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleItemAvailability = useCallback(async (itemId, isAvailable) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItem = await itemsAPI.toggleItemAvailability(itemId, isAvailable);
      const normalizedItem = validateItemData(updatedItem);
      
      if (normalizedItem) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? normalizedItem : item
          )
        );
      }
      
      return normalizedItem;
    } catch (err) {
      console.error('Error toggling item availability:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateItems = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedItems = await itemsAPI.bulkUpdateItems(updates);
      const validatedItems = updatedItems
        .map(validateItemData)
        .filter(Boolean)
        .sort((a, b) => a.sort_order - b.sort_order);
      
      setItems(validatedItems);
      return validatedItems;
    } catch (err) {
      console.error('Error bulk updating items:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getItemAnalytics = useCallback(async (timeframe = '30d') => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await itemsAPI.getItemAnalytics(timeframe);
      return analytics;
    } catch (err) {
      console.error('Error fetching item analytics:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to get items by category from current state
  const getItemsByCategory = useCallback((category) => {
    return items.filter(item => item.category === category && item.is_available);
  }, [items]);

  // Helper function to get available items only
  const getAvailableItems = useCallback(() => {
    return items.filter(item => item.is_available);
  }, [items]);

  return {
    items,
    loading,
    error,
    fetchItems,
    fetchItem,
    addItem,
    modifyItem,
    removeItem,
    fetchItemsByCategory,
    toggleItemAvailability,
    bulkUpdateItems,
    getItemAnalytics,
    getItemsByCategory,
    getAvailableItems
  };
}