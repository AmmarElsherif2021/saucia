import { supabase } from '../supabase.js'

export class Meal {
  static tableName = 'meals'

  // Helper function to serialize Supabase data
  static serialize(data) {
    if (!data) return null

    return {
      id: data.id,
      name: data.name || '',
      nameArabic: data.name_arabic || '',
      description: data.description || '',
      descriptionArabic: data.description_arabic || '',
      section: data.section || '',
      sectionArabic: data.section_arabic || '',
      basePrice: Number(data.base_price) || 0,
      calories: Number(data.calories) || 0,
      proteinG: Number(data.protein_g) || 0,
      carbsG: Number(data.carbs_g) || 0,
      fatG: Number(data.fat_g) || 0,
      fiberG: Number(data.fiber_g) || 0,
      sugarG: Number(data.sugar_g) || 0,
      sodiumMg: Number(data.sodium_mg) || 0,
      ingredients: data.ingredients || '',
      ingredientsArabic: data.ingredients_arabic || '',
      preparationInstructions: data.preparation_instructions || '',
      imageUrl: data.image_url || '',
      thumbnailUrl: data.thumbnail_url || '',
      isPremium: Boolean(data.is_premium),
      isVegetarian: Boolean(data.is_vegetarian),
      isVegan: Boolean(data.is_vegan),
      isGlutenFree: Boolean(data.is_gluten_free),
      isDairyFree: Boolean(data.is_dairy_free),
      spiceLevel: Number(data.spice_level) || 0,
      prepTimeMinutes: Number(data.prep_time_minutes) || 0,
      rating: Number(data.rating) || 0,
      ratingCount: Number(data.rating_count) || 0,
      isFeatured: Boolean(data.is_featured),
      discountPercentage: Number(data.discount_percentage) || 0,
      discountValidUntil: data.discount_valid_until,
      isAvailable: Boolean(data.is_available),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  // Convert JS object to database format
  static toDatabase(mealData) {
    const dbData = {}
    
    if (mealData.name !== undefined) dbData.name = String(mealData.name || '')
    if (mealData.nameArabic !== undefined) dbData.name_arabic = String(mealData.nameArabic || '')
    if (mealData.description !== undefined) dbData.description = String(mealData.description || '')
    if (mealData.descriptionArabic !== undefined) dbData.description_arabic = String(mealData.descriptionArabic || '')
    if (mealData.section !== undefined) dbData.section = String(mealData.section || '')
    if (mealData.sectionArabic !== undefined) dbData.section_arabic = String(mealData.sectionArabic || '')
    if (mealData.basePrice !== undefined) dbData.base_price = Number(mealData.basePrice) || 0
    if (mealData.calories !== undefined) dbData.calories = Number(mealData.calories) || 0
    if (mealData.proteinG !== undefined) dbData.protein_g = Number(mealData.proteinG) || 0
    if (mealData.carbsG !== undefined) dbData.carbs_g = Number(mealData.carbsG) || 0
    if (mealData.fatG !== undefined) dbData.fat_g = Number(mealData.fatG) || 0
    if (mealData.fiberG !== undefined) dbData.fiber_g = Number(mealData.fiberG) || 0
    if (mealData.sugarG !== undefined) dbData.sugar_g = Number(mealData.sugarG) || 0
    if (mealData.sodiumMg !== undefined) dbData.sodium_mg = Number(mealData.sodiumMg) || 0
    if (mealData.ingredients !== undefined) dbData.ingredients = String(mealData.ingredients || '')
    if (mealData.ingredientsArabic !== undefined) dbData.ingredients_arabic = String(mealData.ingredientsArabic || '')
    if (mealData.preparationInstructions !== undefined) dbData.preparation_instructions = String(mealData.preparationInstructions || '')
    if (mealData.imageUrl !== undefined) dbData.image_url = String(mealData.imageUrl || '')
    if (mealData.thumbnailUrl !== undefined) dbData.thumbnail_url = String(mealData.thumbnailUrl || '')
    if (mealData.isPremium !== undefined) dbData.is_premium = Boolean(mealData.isPremium)
    if (mealData.isVegetarian !== undefined) dbData.is_vegetarian = Boolean(mealData.isVegetarian)
    if (mealData.isVegan !== undefined) dbData.is_vegan = Boolean(mealData.isVegan)
    if (mealData.isGlutenFree !== undefined) dbData.is_gluten_free = Boolean(mealData.isGlutenFree)
    if (mealData.isDairyFree !== undefined) dbData.is_dairy_free = Boolean(mealData.isDairyFree)
    if (mealData.spiceLevel !== undefined) dbData.spice_level = Number(mealData.spiceLevel) || 0
    if (mealData.prepTimeMinutes !== undefined) dbData.prep_time_minutes = Number(mealData.prepTimeMinutes) || 0
    if (mealData.isFeatured !== undefined) dbData.is_featured = Boolean(mealData.isFeatured)
    if (mealData.discountPercentage !== undefined) dbData.discount_percentage = Number(mealData.discountPercentage) || 0
    if (mealData.discountValidUntil !== undefined) dbData.discount_valid_until = mealData.discountValidUntil
    if (mealData.isAvailable !== undefined) dbData.is_available = Boolean(mealData.isAvailable)

    return dbData
  }

  static async create(mealData) {
    try {
      const dbData = this.toDatabase(mealData)
      dbData.created_at = new Date().toISOString()
      dbData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(dbData)
        .select()
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error creating meal:', error)
      throw new Error(`Failed to create meal: ${error.message}`)
    }
  }

  static async getAll(options = {}) {
    try {
      let query = supabase.from(this.tableName).select('*')

      // Add filters
      if (options.available !== undefined) {
        query = query.eq('is_available', options.available)
      }
      if (options.featured !== undefined) {
        query = query.eq('is_featured', options.featured)
      }
      if (options.vegetarian !== undefined) {
        query = query.eq('is_vegetarian', options.vegetarian)
      }
      if (options.vegan !== undefined) {
        query = query.eq('is_vegan', options.vegan)
      }
      if (options.glutenFree !== undefined) {
        query = query.eq('is_gluten_free', options.glutenFree)
      }
      if (options.section) {
        query = query.eq('section', options.section)
      }

      // Add ordering
      if (options.orderBy) {
        const direction = options.orderDirection || 'asc'
        query = query.order(options.orderBy, { ascending: direction === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Add pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) throw error
      return data.map(this.serialize)
    } catch (error) {
      console.error('Error fetching meals:', error)
      throw new Error(`Failed to fetch meals: ${error.message}`)
    }
  }

  static async getById(mealId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', mealId)
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error fetching meal by ID:', error)
      throw new Error(`Failed to fetch meal: ${error.message}`)
    }
  }

  static async getFeatured() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_featured', true)
        .eq('is_available', true)
        .order('rating', { ascending: false })

      if (error) throw error
      return data.map(this.serialize)
    } catch (error) {
      console.error('Error fetching featured meals:', error)
      throw new Error(`Failed to fetch featured meals: ${error.message}`)
    }
  }

  static async getBySection(section) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('section', section)
        .eq('is_available', true)
        .order('name')

      if (error) throw error
      return data.map(this.serialize)
    } catch (error) {
      console.error('Error fetching meals by section:', error)
      throw new Error(`Failed to fetch meals by section: ${error.message}`)
    }
  }

  static async searchMeals(query, options = {}) {
    try {
      let supabaseQuery = supabase
        .from(this.tableName)
        .select('*')

      // Text search across name and description
      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,ingredients.ilike.%${query}%`)
      }

      // Apply filters
      if (options.available !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_available', options.available)
      }

      // Dietary filters
      if (options.vegetarian) {
        supabaseQuery = supabaseQuery.eq('is_vegetarian', true)
      }
      if (options.vegan) {
        supabaseQuery = supabaseQuery.eq('is_vegan', true)
      }
      if (options.glutenFree) {
        supabaseQuery = supabaseQuery.eq('is_gluten_free', true)
      }

      // Price range
      if (options.minPrice !== undefined) {
        supabaseQuery = supabaseQuery.gte('base_price', options.minPrice)
      }
      if (options.maxPrice !== undefined) {
        supabaseQuery = supabaseQuery.lte('base_price', options.maxPrice)
      }

      // Calorie range
      if (options.minCalories !== undefined) {
        supabaseQuery = supabaseQuery.gte('calories', options.minCalories)
      }
      if (options.maxCalories !== undefined) {
        supabaseQuery = supabaseQuery.lte('calories', options.maxCalories)
      }

      // Spice level
      if (options.maxSpiceLevel !== undefined) {
        supabaseQuery = supabaseQuery.lte('spice_level', options.maxSpiceLevel)
      }

      // Ordering
      const orderBy = options.orderBy || 'rating'
      const orderDirection = options.orderDirection || 'desc'
      supabaseQuery = supabaseQuery.order(orderBy, { ascending: orderDirection === 'asc' })

      // Pagination
      if (options.limit) {
        supabaseQuery = supabaseQuery.limit(options.limit)
      }

      const { data, error } = await supabaseQuery

      if (error) throw error
      return data.map(this.serialize)
    } catch (error) {
      console.error('Error searching meals:', error)
      throw new Error(`Failed to search meals: ${error.message}`)
    }
  }

  static async update(mealId, updateData) {
    try {
      const dbData = this.toDatabase(updateData)
      dbData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbData)
        .eq('id', mealId)
        .select()
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error updating meal:', error)
      throw new Error(`Failed to update meal: ${error.message}`)
    }
  }

  static async delete(mealId) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', mealId)

      if (error) throw error
      return { success: true, id: mealId }
    } catch (error) {
      console.error('Error deleting meal:', error)
      throw new Error(`Failed to delete meal: ${error.message}`)
    }
  }

  static async updateRating(mealId, newRating, reviewCount) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          rating: newRating,
          rating_count: reviewCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId)
        .select()
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error updating meal rating:', error)
      throw new Error(`Failed to update meal rating: ${error.message}`)
    }
  }

  static async toggleAvailability(mealId) {
    try {
      // First get current availability
      const { data: currentData, error: fetchError } = await supabase
        .from(this.tableName)
        .select('is_available')
        .eq('id', mealId)
        .single()

      if (fetchError) throw fetchError

      // Toggle availability
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_available: !currentData.is_available,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId)
        .select()
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error toggling meal availability:', error)
      throw new Error(`Failed to toggle meal availability: ${error.message}`)
    }
  }

  static async applyDiscount(mealId, discountPercentage, validUntil) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          discount_percentage: discountPercentage,
          discount_valid_until: validUntil,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId)
        .select()
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error applying discount:', error)
      throw new Error(`Failed to apply discount: ${error.message}`)
    }
  }

  static async removeDiscount(mealId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          discount_percentage: 0,
          discount_valid_until: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealId)
        .select()
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error removing discount:', error)
      throw new Error(`Failed to remove discount: ${error.message}`)
    }
  }

  // Get meals with active discounts
  static async getDiscountedMeals() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .gt('discount_percentage', 0)
        .or('discount_valid_until.is.null,discount_valid_until.gt.' + new Date().toISOString())
        .eq('is_available', true)
        .order('discount_percentage', { ascending: false })

      if (error) throw error
      return data.map(this.serialize)
    } catch (error) {
      console.error('Error fetching discounted meals:', error)
      throw new Error(`Failed to fetch discounted meals: ${error.message}`)
    }
  }
}