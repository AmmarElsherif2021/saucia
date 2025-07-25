import { supabase,handleSupabaseError } from "../../supabaseClient"

export const mealsAPI = {
  // Public endpoints - no authentication required
  async getMeals(queryParams = {}) {
    try {
      let query = supabase
        .from('meals')
        .select(`
          *,
          meal_items(
            items(*)
          ),
          meal_allergies(
            allergies(*)
          )
        `)
        .eq('is_available', true)

      // Apply filters from queryParams
      if (queryParams.section) {
        query = query.eq('section', queryParams.section)
      }
      if (queryParams.is_vegetarian) {
        query = query.eq('is_vegetarian', true)
      }
      if (queryParams.is_vegan) {
        query = query.eq('is_vegan', true)
      }
      if (queryParams.is_gluten_free) {
        query = query.eq('is_gluten_free', true)
      }
      if (queryParams.is_featured) {
        query = query.eq('is_featured', true)
      }
      if (queryParams.search) {
        query = query.or(`name.ilike.%${queryParams.search}%,description.ilike.%${queryParams.search}%`)
      }
      if (queryParams.min_calories) {
        query = query.gte('calories', queryParams.min_calories)
      }
      if (queryParams.max_calories) {
        query = query.lte('calories', queryParams.max_calories)
      }

      // Sorting
      if (queryParams.sortBy) {
        const order = queryParams.sortOrder === 'descending' ? false : true
        query = query.order(queryParams.sortBy, { ascending: order })
      } else {
        query = query.order('rating', { ascending: false })
      }

      const { data, error } = await query;
    
    if (error) throw error;
    
    // Return empty array 
    return data || [];
  } catch (error) {
    console.error('Failed to fetch meals:', error);
    handleSupabaseError(error);
    return []; 
  }
},

  async getMealById(mealId) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_items(
            items(*)
          ),
          meal_allergies(
            allergies(*)
          ),
          meal_reviews(
            *,
            user_profiles(display_name, avatar_url)
          )
        `)
        .eq('id', mealId)
        .eq('is_available', true)
        .single()


    
    if (error) throw error;
    return data || null; // Return null if no data
  } catch (error) {
    handleSupabaseError(error);
    return null; // Return null on error
  }
},

  async getMealsBySection(section) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('section', section)
        .eq('is_available', true)
        .order('rating', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Authenticated endpoints - require user authentication
  async getPlanMeals(planId) {
    try {
      const { data, error } = await supabase
        .from('plan_meals')
        .select(`
          *,
          meals(*)
        `)
        .eq('plan_id', planId)
        .order('week_number', { ascending: true })
        .order('day_of_week', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async getFavMealsOfClient(userId) {
    try {
      const { data, error } = await supabase
        .from('user_favorite_meals')
        .select(`
          *,
          meals(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(item => item.meals)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async addToFavorites(mealId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_favorite_meals')
        .insert([{
          user_id: user.id,
          meal_id: mealId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async removeFromFavorites(mealId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('user_favorite_meals')
        .delete()
        .eq('user_id', user.id)
        .eq('meal_id', mealId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async rateMeal(mealId, rating) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('meal_reviews')
        .upsert([{
          user_id: user.id,
          meal_id: mealId,
          rating: rating,
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

  // Admin endpoints - require admin authentication
  async createMeal(mealData) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert([{
          ...mealData,
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

  async updateMeal(mealId, mealData) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update({
          ...mealData,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async deleteMeal(mealId) {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async toggleMealAvailability(mealId, isAvailable) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async getMealAnalytics(timeframe = '30d') {
    try {
      const { data, error } = await supabase
        .rpc('get_meal_analytics', { timeframe_param: timeframe })

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },
    // Get allergies for a specific meal
    async getMealAllergies(mealId) {
      try {
        const { data, error } = await supabase
          .from('meal_allergies')
          .select(`allergies(*)`)
          .eq('meal_id', mealId);
  
        if (error) throw error;
        return data.map(item => item.allergies);
      } catch (error) {
        handleSupabaseError(error);
      }
    },
  
    // Get items for a specific meal
    async getMealItems(mealId) {
      try {
        const { data, error } = await supabase
          .from('meal_items')
          .select(`items(*)`)
          .eq('meal_id', mealId);
  
        if (error) throw error;
        return data.map(item => item.items);
      } catch (error) {
        handleSupabaseError(error);
      }
    },
    
  async bulkUpdateMeals(updates) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .upsert(updates.map(meal => ({
          ...meal,
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