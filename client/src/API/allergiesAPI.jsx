import { supabase } from "../../supabaseClient";

export const allergiesAPI = {
  // Public endpoints - no authentication required
  async listAllergies(queryParams = {}) {
    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .order('name');
    console.log(`Allergies fetched from Supabase: ${data?.length} allergies`);
    if (error) throw error;
    return data;
  },

  async getAllergyById(id) {
    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // User-specific endpoints
  async getUserAllergies(userId) {
    const { data, error } = await supabase
      .from('user_allergies')
      .select(`
        *,
        allergy:allergies(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async addUserAllergy(userId, allergyData) {
    const { data, error } = await supabase
      .from('user_allergies')
      .insert({
        user_id: userId,
        allergy_id: allergyData.allergy_id,
        severity_override: allergyData.severity_override
      })
      .select(`
        *,
        allergy:allergies(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserAllergy(userId, allergyId, severityData) {
    const { data, error } = await supabase
      .from('user_allergies')
      .update({
        severity_override: severityData.severity_override
      })
      .eq('user_id', userId)
      .eq('allergy_id', allergyId)
      .select(`
        *,
        allergy:allergies(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeUserAllergy(userId, allergyId) {
    const { data, error } = await supabase
      .from('user_allergies')
      .delete()
      .eq('user_id', userId)
      .eq('allergy_id', allergyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Cross-table operations
  async getMealsWithAllergies(allergyIds) {
    const { data, error } = await supabase
      .from('meal_allergies')
      .select(`
        meal:meals(*)
      `)
      .in('allergy_id', allergyIds);
    
    if (error) throw error;
    return data.map(item => item.meal);
  },

  async getItemsWithAllergies(allergyIds) {
    const { data, error } = await supabase
      .from('item_allergies')
      .select(`
        item:items(*)
      `)
      .in('allergy_id', allergyIds);
    
    if (error) throw error;
    return data.map(item => item.item);
  },

  async getUserSafeMeals(userId) {
    // Get user's allergy IDs
    const { data: userAllergies, error: userError } = await supabase
      .from('user_allergies')
      .select('allergy_id')
      .eq('user_id', userId);
    
    if (userError) throw userError;
    
    if (!userAllergies.length) {
      // If no allergies, return all available meals
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('is_available', true);
      
      if (error) throw error;
      return data;
    }
    
    const allergyIds = userAllergies.map(ua => ua.allergy_id);
    
    // Get meals that don't contain user's allergies
    const { data: mealsWithAllergies, error: mealsError } = await supabase
      .from('meal_allergies')
      .select('meal_id')
      .in('allergy_id', allergyIds);
    
    if (mealsError) throw mealsError;
    
    const unsafeMealIds = mealsWithAllergies.map(ma => ma.meal_id);
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('is_available', true)
      .not('id', 'in', `(${unsafeMealIds.join(',')})`);
    
    if (error) throw error;
    return data;
  },

  async getUserSafeItems(userId) {
    // Get user's allergy IDs
    const { data: userAllergies, error: userError } = await supabase
      .from('user_allergies')
      .select('allergy_id')
      .eq('user_id', userId);
    
    if (userError) throw userError;
    
    if (!userAllergies.length) {
      // If no allergies, return all available items
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_available', true);
      
      if (error) throw error;
      return data;
    }
    
    const allergyIds = userAllergies.map(ua => ua.allergy_id);
    
    // Get items that don't contain user's allergies
    const { data: itemsWithAllergies, error: itemsError } = await supabase
      .from('item_allergies')
      .select('item_id')
      .in('allergy_id', allergyIds);
    
    if (itemsError) throw itemsError;
    
    const unsafeItemIds = itemsWithAllergies.map(ia => ia.item_id);
    
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('is_available', true)
      .not('id', 'in', `(${unsafeItemIds.join(',')})`);
    
    if (error) throw error;
    return data;
  },

  // Bulk operations
  async updateUserAllergiesBulk(userId, allergiesData) {
    // First, delete existing allergies
    const { error: deleteError } = await supabase
      .from('user_allergies')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) throw deleteError;
    
    // Then insert new allergies
    if (allergiesData.length > 0) {
      const { data, error } = await supabase
        .from('user_allergies')
        .insert(
          allergiesData.map(allergy => ({
            user_id: userId,
            allergy_id: allergy.allergy_id,
            severity_override: allergy.severity_override
          }))
        )
        .select(`
          *,
          allergy:allergies(*)
        `);
      
      if (error) throw error;
      return data;
    }
    
    return [];
  }
};