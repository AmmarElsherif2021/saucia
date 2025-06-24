import { supabase } from '../supabase.js'

export class Plan {
  static tableName = 'plans'

  // Helper function to serialize Supabase data
  static serialize(data) {
    if (!data) return null

    return {
      id: data.id,
      title: data.title || '',
      titleArabic: data.title_arabic || '',
      description: data.description || '',
      descriptionArabic: data.description_arabic || '',
      pricePerMeal: Number(data.price_per_meal) || 0,
      short_term_meals: Number(data.short_term_meals) || 0,
      medium_term_meals: Number(data.medium_term_meals) || 0,
      durationDays: Number(data.duration_days) || 0,
      targetCaloriesPerMeal: Number(data.target_calories_per_meal) || 0,
      targetProteinPerMeal: Number(data.target_protein_per_meal) || 0,
      targetCarbsPerMeal: Number(data.target_carbs_per_meal) || 0,
      avatarUrl: data.avatar_url || '',
      isActive: Boolean(data.is_active),
      sortOrder: Number(data.sort_order) || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  static async create(planData) {
    try {
      // Validate required fields
      if (!planData.title) {
        throw new Error('Plan title is required')
      }
      if (!planData.pricePerMeal || planData.pricePerMeal < 0) {
        throw new Error('Valid price per meal is required')
      }
      if (!planData.short_term_meals || planData.short_term_meals <= 0) {
        throw new Error('Minimum meals per week must be greater than 0')
      }
      if (!planData.medium_term_meals || planData.medium_term_meals < planData.short_term_meals) {
        throw new Error('Maximum meals per week must be greater than or equal to minimum')
      }
      if (!planData.durationDays || planData.durationDays <= 0) {
        throw new Error('Duration in days must be greater than 0')
      }

      const processedData = {
        title: String(planData.title).trim(),
        title_arabic: planData.titleArabic ? String(planData.titleArabic).trim() : null,
        description: planData.description ? String(planData.description).trim() : null,
        description_arabic: planData.descriptionArabic ? String(planData.descriptionArabic).trim() : null,
        price_per_meal: Number(planData.pricePerMeal),
        short_term_meals: Number(planData.short_term_meals),
        medium_term_meals: Number(planData.medium_term_meals),
        duration_days: Number(planData.durationDays),
        target_calories_per_meal: planData.targetCaloriesPerMeal ? Number(planData.targetCaloriesPerMeal) : null,
        target_protein_per_meal: planData.targetProteinPerMeal ? Number(planData.targetProteinPerMeal) : null,
        target_carbs_per_meal: planData.targetCarbsPerMeal ? Number(planData.targetCarbsPerMeal) : null,
        avatar_url: planData.avatarUrl ? String(planData.avatarUrl).trim() : null,
        is_active: Boolean(planData.isActive ?? true),
        sort_order: Number(planData.sortOrder) || 0,
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([processedData])
        .select()
        .single()

      if (error) {
        console.error('Error creating plan:', error)
        throw new Error(`Failed to create plan: ${error.message}`)
      }

      return this.serialize(data)
    } catch (error) {
      console.error('Error in Plan.create:', error)
      throw error
    }
  }

  static async getAll(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*')

      // Apply filters
      if (options.activeOnly) {
        query = query.eq('is_active', true)
      }

      // Apply sorting
      const sortBy = options.sortBy || 'sort_order'
      const sortOrder = options.sortOrder || 'asc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching plans:', error)
        throw new Error(`Failed to fetch plans: ${error.message}`)
      }

      return data ? data.map(this.serialize) : []
    } catch (error) {
      console.error('Error in Plan.getAll:', error)
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

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        console.error('Error fetching plan:', error)
        throw new Error(`Failed to fetch plan: ${error.message}`)
      }

      return this.serialize(data)
    } catch (error) {
      console.error('Error in Plan.getById:', error)
      throw error
    }
  }

  static async getActive() {
    return this.getAll({ activeOnly: true })
  }

  static async getByPriceRange(minPrice, maxPrice) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .gte('price_per_meal', minPrice)
        .lte('price_per_meal', maxPrice)
        .eq('is_active', true)
        .order('price_per_meal', { ascending: true })

      if (error) {
        console.error('Error fetching plans by price range:', error)
        throw new Error(`Failed to fetch plans by price range: ${error.message}`)
      }

      return data ? data.map(this.serialize) : []
    } catch (error) {
      console.error('Error in Plan.getByPriceRange:', error)
      throw error
    }
  }

  static async update(id, updateData) {
    try {
      if (!id) {
        throw new Error('Plan ID is required for update')
      }

      const processedData = {}

      // Process each field with validation
      if (updateData.title !== undefined) {
        if (!updateData.title.trim()) {
          throw new Error('Plan title cannot be empty')
        }
        processedData.title = String(updateData.title).trim()
      }
      
      if (updateData.titleArabic !== undefined) {
        processedData.title_arabic = updateData.titleArabic ? String(updateData.titleArabic).trim() : null
      }
      
      if (updateData.description !== undefined) {
        processedData.description = updateData.description ? String(updateData.description).trim() : null
      }
      
      if (updateData.descriptionArabic !== undefined) {
        processedData.description_arabic = updateData.descriptionArabic ? String(updateData.descriptionArabic).trim() : null
      }
      
      if (updateData.pricePerMeal !== undefined) {
        const price = Number(updateData.pricePerMeal)
        if (price < 0) {
          throw new Error('Price per meal cannot be negative')
        }
        processedData.price_per_meal = price
      }
      
      if (updateData.short_term_meals !== undefined) {
        const minMeals = Number(updateData.short_term_meals)
        if (minMeals <= 0) {
          throw new Error('Minimum meals per week must be greater than 0')
        }
        processedData.short_term_meals = minMeals
      }
      
      if (updateData.medium_term_meals !== undefined) {
        const maxMeals = Number(updateData.medium_term_meals)
        if (maxMeals <= 0) {
          throw new Error('Maximum meals per week must be greater than 0')
        }
        processedData.medium_term_meals = maxMeals
      }
      
      if (updateData.durationDays !== undefined) {
        const duration = Number(updateData.durationDays)
        if (duration <= 0) {
          throw new Error('Duration in days must be greater than 0')
        }
        processedData.duration_days = duration
      }
      
      if (updateData.targetCaloriesPerMeal !== undefined) {
        processedData.target_calories_per_meal = updateData.targetCaloriesPerMeal ? Number(updateData.targetCaloriesPerMeal) : null
      }
      
      if (updateData.targetProteinPerMeal !== undefined) {
        processedData.target_protein_per_meal = updateData.targetProteinPerMeal ? Number(updateData.targetProteinPerMeal) : null
      }
      
      if (updateData.targetCarbsPerMeal !== undefined) {
        processedData.target_carbs_per_meal = updateData.targetCarbsPerMeal ? Number(updateData.targetCarbsPerMeal) : null
      }
      
      if (updateData.avatarUrl !== undefined) {
        processedData.avatar_url = updateData.avatarUrl ? String(updateData.avatarUrl).trim() : null
      }
      
      if (updateData.isActive !== undefined) {
        processedData.is_active = Boolean(updateData.isActive)
      }
      
      if (updateData.sortOrder !== undefined) {
        processedData.sort_order = Number(updateData.sortOrder) || 0
      }

      // updated_at is handled by the database trigger

      const { data, error } = await supabase
        .from(this.tableName)
        .update(processedData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating plan:', error)
        throw new Error(`Failed to update plan: ${error.message}`)
      }

      return this.serialize(data)
    } catch (error) {
      console.error('Error in Plan.update:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      if (!id) {
        throw new Error('Plan ID is required for deletion')
      }

      // Check if plan has active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('plan_id', id)
        .eq('status', 'active')
        .limit(1)

      if (subError) {
        console.error('Error checking subscriptions:', subError)
        throw new Error('Failed to check plan dependencies')
      }

      if (subscriptions && subscriptions.length > 0) {
        throw new Error('Cannot delete plan with active subscriptions. Please deactivate the plan instead.')
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting plan:', error)
        throw new Error(`Failed to delete plan: ${error.message}`)
      }

      return { success: true, id }
    } catch (error) {
      console.error('Error in Plan.delete:', error)
      throw error
    }
  }

  static async deactivate(id) {
    return this.update(id, { isActive: false })
  }

  static async activate(id) {
    return this.update(id, { isActive: true })
  }

  // Get plans with their associated meals (requires additional queries or joins)
  static async getWithMeals(id) {
    try {
      const plan = await this.getById(id)
      if (!plan) return null

      // Get associated meals through plan_meals junction table
      const { data: planMeals, error } = await supabase
        .from('plan_meals')
        .select(`
          meal_id,
          meals (
            id,
            name,
            name_arabic,
            description,
            description_arabic,
            calories,
            protein_g,
            carbs_g,
            fat_g,
            image_url,
            is_available
          )
        `)
        .eq('plan_id', id)

      if (error) {
        console.error('Error fetching plan meals:', error)
        throw new Error(`Failed to fetch plan meals: ${error.message}`)
      }

      return {
        ...plan,
        meals: planMeals ? planMeals.map(pm => pm.meals) : []
      }
    } catch (error) {
      console.error('Error in Plan.getWithMeals:', error)
      throw error
    }
  }
}