import { supabase } from '../supabase.js'

export class Item {
  static tableName = 'items'

  // Helper function to serialize PostgreSQL data
  static serialize(row) {
    if (!row) return null

    return {
      id: row.id,
      name: row.name || '',
      name_arabic: row.name_arabic || '',
      description: row.description || '',
      description_arabic: row.description_arabic || '',
      category: row.category || '',
      category_arabic: row.category_arabic || '',
      price: Number(row.price) || 0,
      calories: Number(row.calories) || 0,
      protein_g: Number(row.protein_g) || 0,
      carbs_g: Number(row.carbs_g) || 0,
      fat_g: Number(row.fat_g) || 0,
      max_free_per_meal: Number(row.max_free_per_meal) || 0,
      image_url: row.image_url || '',
      is_available: Boolean(row.is_available),
      sort_order: Number(row.sort_order) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }

  static async create(itemData) {
    try {
      // Ensure proper data typing for PostgreSQL
      const processedData = {
        name: String(itemData.name || ''),
        name_arabic: String(itemData.name_arabic || ''),
        description: String(itemData.description || ''),
        description_arabic: String(itemData.description_arabic || ''),
        category: String(itemData.category || 'side'),
        category_arabic: String(itemData.category_arabic || ''),
        price: Number(itemData.price) || 0,
        calories: Number(itemData.calories || itemData.item_kcal) || 0, // Handle legacy field
        protein_g: Number(itemData.protein_g || itemData.item_protein) || 0, // Handle legacy field
        carbs_g: Number(itemData.carbs_g) || 0,
        fat_g: Number(itemData.fat_g) || 0,
        max_free_per_meal: Number(itemData.max_free_per_meal || itemData.free_count) || 0, // Handle legacy field
        image_url: String(itemData.image_url || itemData.image || ''), // Handle legacy field
        is_available: itemData.is_available !== undefined ? Boolean(itemData.is_available) : true,
        sort_order: Number(itemData.sort_order) || 0,
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([processedData])
        .select()
        .single()

      if (error) {
        console.error('Error creating item:', error)
        throw new Error(`Failed to create item: ${error.message}`)
      }

      return this.serialize(data)
    } catch (error) {
      console.error('Error in Item.create:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching item:', error)
        throw new Error(`Failed to fetch item: ${error.message}`)
      }

      return this.serialize(data)
    } catch (error) {
      console.error('Error in Item.getById:', error)
      throw error
    }
  }

  static async getByCategory(category) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('is_available', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching items by category:', error)
        throw new Error(`Failed to fetch items: ${error.message}`)
      }

      return data ? data.map(this.serialize) : []
    } catch (error) {
      console.error('Error in Item.getByCategory:', error)
      throw error
    }
  }

  // Legacy method for backward compatibility
  static async getBySection(section) {
    return this.getByCategory(section)
  }

  static async getAll(availableOnly = false) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')

      if (availableOnly) {
        query = query.eq('is_available', true)
      }

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching all items:', error)
        throw new Error(`Failed to fetch items: ${error.message}`)
      }

      return data ? data.map(this.serialize) : []
    } catch (error) {
      console.error('Error in Item.getAll:', error)
      throw error
    }
  }

  static async getAvailable() {
    return this.getAll(true)
  }

  static async update(id, updatedData) {
    try {
      // Ensure proper data typing
      const processedData = {}

      if (updatedData.name !== undefined) processedData.name = String(updatedData.name)
      if (updatedData.name_arabic !== undefined)
        processedData.name_arabic = String(updatedData.name_arabic)
      if (updatedData.description !== undefined)
        processedData.description = String(updatedData.description)
      if (updatedData.description_arabic !== undefined)
        processedData.description_arabic = String(updatedData.description_arabic)
      if (updatedData.category !== undefined)
        processedData.category = String(updatedData.category)
      if (updatedData.category_arabic !== undefined)
        processedData.category_arabic = String(updatedData.category_arabic)
      if (updatedData.price !== undefined)
        processedData.price = Number(updatedData.price)
      if (updatedData.calories !== undefined || updatedData.item_kcal !== undefined)
        processedData.calories = Number(updatedData.calories || updatedData.item_kcal)
      if (updatedData.protein_g !== undefined || updatedData.item_protein !== undefined)
        processedData.protein_g = Number(updatedData.protein_g || updatedData.item_protein)
      if (updatedData.carbs_g !== undefined)
        processedData.carbs_g = Number(updatedData.carbs_g)
      if (updatedData.fat_g !== undefined)
        processedData.fat_g = Number(updatedData.fat_g)
      if (updatedData.max_free_per_meal !== undefined || updatedData.free_count !== undefined)
        processedData.max_free_per_meal = Number(updatedData.max_free_per_meal || updatedData.free_count)
      if (updatedData.image_url !== undefined || updatedData.image !== undefined)
        processedData.image_url = String(updatedData.image_url || updatedData.image)
      if (updatedData.is_available !== undefined)
        processedData.is_available = Boolean(updatedData.is_available)
      if (updatedData.sort_order !== undefined)
        processedData.sort_order = Number(updatedData.sort_order)

      const { data, error } = await supabase
        .from(this.tableName)
        .update(processedData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating item:', error)
        throw new Error(`Failed to update item: ${error.message}`)
      }

      return this.serialize(data)
    } catch (error) {
      console.error('Error in Item.update:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting item:', error)
        throw new Error(`Failed to delete item: ${error.message}`)
      }

      return { success: true, id }
    } catch (error) {
      console.error('Error in Item.delete:', error)
      throw error
    }
  }

  // Utility methods for business logic
  static async toggleAvailability(id) {
    try {
      // First get current availability status
      const item = await this.getById(id)
      if (!item) {
        throw new Error('Item not found')
      }

      // Toggle the availability
      return await this.update(id, { is_available: !item.is_available })
    } catch (error) {
      console.error('Error toggling item availability:', error)
      throw error
    }
  }

  static async bulkUpdateAvailability(ids, isAvailable) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ is_available: Boolean(isAvailable) })
        .in('id', ids)
        .select()

      if (error) {
        console.error('Error bulk updating availability:', error)
        throw new Error(`Failed to update items: ${error.message}`)
      }

      return data ? data.map(this.serialize) : []
    } catch (error) {
      console.error('Error in Item.bulkUpdateAvailability:', error)
      throw error
    }
  }

  // Search functionality
  static async search(searchTerm, options = {}) {
    try {
      const { category, availableOnly = true } = options
      
      let query = supabase
        .from(this.tableName)
        .select('*')

      if (availableOnly) {
        query = query.eq('is_available', true)
      }

      if (category) {
        query = query.eq('category', category)
      }

      // Search in name and description (both English and Arabic)
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,name_arabic.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,description_arabic.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error searching items:', error)
        throw new Error(`Failed to search items: ${error.message}`)
      }

      return data ? data.map(this.serialize) : []
    } catch (error) {
      console.error('Error in Item.search:', error)
      throw error
    }
  }
}