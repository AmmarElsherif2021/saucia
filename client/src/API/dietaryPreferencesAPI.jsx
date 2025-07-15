import { supabase } from "../../supabaseClient";

export const dietaryPreferencesAPI = {
  // Public endpoints - no authentication required
  async listDietaryPreferences(queryParams = {}) {
    const { data, error } = await supabase
      .from('dietary_preferences')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getDietaryPreferenceById(id) {
    const { data, error } = await supabase
      .from('dietary_preferences')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // User-specific endpoints
  async getUserDietaryPreferences(userId) {
    const { data, error } = await supabase
      .from('user_dietary_preferences')
      .select(`
        *,
        preference:dietary_preferences(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async addUserDietaryPreference(userId, preferenceData) {
    const { data, error } = await supabase
      .from('user_dietary_preferences')
      .insert({
        user_id: userId,
        preference_id: preferenceData.preference_id
      })
      .select(`
        *,
        preference:dietary_preferences(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeUserDietaryPreference(userId, preferenceId) {
    const { data, error } = await supabase
      .from('user_dietary_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('preference_id', preferenceId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Cross-table operations
  async getMealsForPreferences(preferenceIds) {
    // This would depend on how preferences are linked to meals
    // Assuming meals have boolean flags for dietary preferences
    let query = supabase
      .from('meals')
      .select('*')
      .eq('is_available', true);

    // Apply preference filters based on common dietary preferences
    preferenceIds.forEach(id => {
      // This is a simplified example - you'd need to map preference IDs to meal columns
      if (id === 1) query = query.eq('is_vegetarian', true);
      if (id === 2) query = query.eq('is_vegan', true);
      if (id === 3) query = query.eq('is_gluten_free', true);
      if (id === 4) query = query.eq('is_dairy_free', true);
    });

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getUserCompatibleMeals(userId) {
    // Get user's dietary preferences
    const { data: userPreferences, error: prefError } = await supabase
      .from('user_dietary_preferences')
      .select('preference_id')
      .eq('user_id', userId);
    
    if (prefError) throw prefError;
    
    if (!userPreferences.length) {
      // If no preferences, return all available meals
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('is_available', true);
      
      if (error) throw error;
      return data;
    }
    
    const preferenceIds = userPreferences.map(up => up.preference_id);
    
    // Get meals that match user's preferences
    let query = supabase
      .from('meals')
      .select('*')
      .eq('is_available', true);

    // Apply preference filters
    preferenceIds.forEach(id => {
      if (id === 1) query = query.eq('is_vegetarian', true);
      if (id === 2) query = query.eq('is_vegan', true);
      if (id === 3) query = query.eq('is_gluten_free', true);
      if (id === 4) query = query.eq('is_dairy_free', true);
    });

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getFilteredMenuForUser(userId, filters = {}) {
    // Get user's allergies and preferences
    const [userAllergies, userPreferences] = await Promise.all([
      supabase
        .from('user_allergies')
        .select('allergy_id')
        .eq('user_id', userId),
      supabase
        .from('user_dietary_preferences')
        .select('preference_id')
        .eq('user_id', userId)
    ]);

    if (userAllergies.error) throw userAllergies.error;
    if (userPreferences.error) throw userPreferences.error;

    // Get unsafe meals (containing user's allergies)
    let unsafeMealIds = [];
    if (userAllergies.data.length > 0) {
      const allergyIds = userAllergies.data.map(ua => ua.allergy_id);
      const { data: mealsWithAllergies, error: mealsError } = await supabase
        .from('meal_allergies')
        .select('meal_id')
        .in('allergy_id', allergyIds);
      
      if (mealsError) throw mealsError;
      unsafeMealIds = mealsWithAllergies.map(ma => ma.meal_id);
    }

    // Get unsafe items (containing user's allergies)
    let unsafeItemIds = [];
    if (userAllergies.data.length > 0) {
      const allergyIds = userAllergies.data.map(ua => ua.allergy_id);
      const { data: itemsWithAllergies, error: itemsError } = await supabase
        .from('item_allergies')
        .select('item_id')
        .in('allergy_id', allergyIds);
      
      if (itemsError) throw itemsError;
      unsafeItemIds = itemsWithAllergies.map(ia => ia.item_id);
    }

    // Build meals query
    let mealsQuery = supabase
      .from('meals')
      .select('*')
      .eq('is_available', true);

    // Exclude unsafe meals
    if (unsafeMealIds.length > 0) {
      mealsQuery = mealsQuery.not('id', 'in', `(${unsafeMealIds.join(',')})`);
    }

    // Apply dietary preference filters
    if (userPreferences.data.length > 0) {
      const preferenceIds = userPreferences.data.map(up => up.preference_id);
      preferenceIds.forEach(id => {
        if (id === 1) mealsQuery = mealsQuery.eq('is_vegetarian', true);
        if (id === 2) mealsQuery = mealsQuery.eq('is_vegan', true);
        if (id === 3) mealsQuery = mealsQuery.eq('is_gluten_free', true);
        if (id === 4) mealsQuery = mealsQuery.eq('is_dairy_free', true);
      });
    }

    // Apply additional filters
    if (filters.spice_level) {
      mealsQuery = mealsQuery.lte('spice_level', filters.spice_level);
    }
    if (filters.max_calories) {
      mealsQuery = mealsQuery.lte('calories', filters.max_calories);
    }
    if (filters.is_premium !== undefined) {
      mealsQuery = mealsQuery.eq('is_premium', filters.is_premium);
    }

    // Build items query
    let itemsQuery = supabase
      .from('items')
      .select('*')
      .eq('is_available', true);

    // Exclude unsafe items
    if (unsafeItemIds.length > 0) {
      itemsQuery = itemsQuery.not('id', 'in', `(${unsafeItemIds.join(',')})`);
    }

    // Apply additional item filters
    if (filters.category) {
      itemsQuery = itemsQuery.eq('category', filters.category);
    }
    if (filters.max_price) {
      itemsQuery = itemsQuery.lte('price', filters.max_price);
    }

    // Execute queries
    const [mealsResult, itemsResult] = await Promise.all([
      mealsQuery,
      itemsQuery
    ]);

    if (mealsResult.error) throw mealsResult.error;
    if (itemsResult.error) throw itemsResult.error;

    return {
      meals: mealsResult.data,
      items: itemsResult.data
    };
  },

  // Bulk operations
  async updateUserDietaryPreferencesBulk(userId, preferencesData) {
    // First, delete existing preferences
    const { error: deleteError } = await supabase
      .from('user_dietary_preferences')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) throw deleteError;
    
    // Then insert new preferences
    if (preferencesData.length > 0) {
      const { data, error } = await supabase
        .from('user_dietary_preferences')
        .insert(
          preferencesData.map(preference => ({
            user_id: userId,
            preference_id: preference.preference_id
          }))
        )
        .select(`
          *,
          preference:dietary_preferences(*)
        `);
      
      if (error) throw error;
      return data;
    }
    
    return [];
  }
};