import { supabase, handleSupabaseError } from '../../supabaseClient'

export const itemsAPI = {
  // Public endpoints - no authentication required
  async listItems(queryParams = {}) {
    try {
      let query = supabase
        .from('items')
        .select('*')
        .eq('is_available', true)

      // Apply filters from queryParams
      if (queryParams.category) {
        query = query.eq('category', queryParams.category)
      }
      if (queryParams.search) {
        query = query.or(`name.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%`)
      }
      if (queryParams.sort) {
        const [field, order] = queryParams.sort.split(':')
        query = query.order(field, { ascending: order === 'asc' })
      } else {
        query = query.order('sort_order', { ascending: true })
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async getItemById(itemId) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .eq('is_available', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async getItemsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category', category)
        .eq('is_available', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Authenticated endpoints - require admin/user authentication
  async createItem(itemData) {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async updateItem(itemId, updates) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async deleteItem(itemId) {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async toggleItemAvailability(itemId, isAvailable) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Analytics would typically be handled by database functions
  async getItemAnalytics(timeframe = '30d') {
    try {
      const { data, error } = await supabase
        .rpc('get_item_analytics', { timeframe_param: timeframe })

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async bulkUpdateItems(updates) {
    try {
      const { data, error } = await supabase
        .from('items')
        .upsert(updates.map(item => ({
          ...item,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
