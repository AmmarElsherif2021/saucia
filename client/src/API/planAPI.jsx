import { supabase } from "../../supabaseClient";

export const plansAPI = {
  // Public endpoints - no authentication required
  async listPlans(queryParams = {}) {
  // Create a safe query by only allowing specific, known parameters
  const safeParams = {};
  const allowedParams = ['is_active', 'is_featured', 'sort_order'];
  
  // Filter queryParams to only include allowed parameters
  Object.keys(queryParams).forEach(key => {
    if (allowedParams.includes(key)) {
      safeParams[key] = queryParams[key];
    }
  });

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .match(safeParams); // Use filtered params
  
  if (error) throw error;
  return data;
},

  async getPlanById(planId) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getFeaturedPlans() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },
// get plan meals
  async getPlanMeals(planId) {
    const { data, error } = await supabase
      .from('plan_meals')
      .select(`
        id,
        meal_id,
        is_substitutable,
        meals (id, name, name_arabic, description, image_url)
      `)
      .eq('plan_id', planId);

    if (error) throw error;
    return data;
  },

  // User endpoints - require user authentication
  async getUserSubscriptions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data;
  },

  async subscribeToPlan(planId, subscriptionData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('price_per_meal, meals_per_week')
      .eq('id', planId)
      .single();
    
    if (planError) throw planError;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        ...subscriptionData,
        user_id: user.id,
        plan_id: planId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        price_per_meal: plan.price_per_meal,
        meals_per_week: plan.meals_per_week,
        status: 'active',
        meals: subscriptionData.meals || [],
        additives: subscriptionData.additives || [] 
      });
    
    if (error) throw error;
    return data;
  },

  async updateSubscription(subscriptionId, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data;
  },

  async cancelSubscription(subscriptionId, reason = '') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'cancelled',
        end_date: new Date().toISOString(),
        pause_reason: reason 
      })
      .eq('id', subscriptionId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data;
  },

  async pauseSubscription(subscriptionId, pauseData) {
    return this.updateSubscription(subscriptionId, {
      is_paused: true,
      paused_at: new Date().toISOString(),
      ...pauseData
    });
  },

  async resumeSubscription(subscriptionId) {
    return this.updateSubscription(subscriptionId, {
      is_paused: false,
      resume_date: null,
      paused_at: null,
      pause_reason: null
    });
  },

  async getSubscriptionHistory(subscriptionId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // In a real implementation, you would query an audit table
    // Here we're just returning the current subscription state
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return [data]; // Return as array for consistency
  },

  async calculatePlanCost(planId, options = {}) {
    const { data: plan, error } = await supabase
      .from('plans')
      .select('price_per_meal, meals_per_week')
      .eq('id', planId)
      .single();
    
    if (error) throw error;
    
    // Simple calculation - extend with your business logic
    const weeks = options.durationWeeks || 4;
    return {
      subtotal: plan.price_per_meal * plan.meals_per_week * weeks,
      tax: 0,
      total: plan.price_per_meal * plan.meals_per_week * weeks
    };
  },

  // Admin endpoints - require admin authentication
  async createPlan(planData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Verify admin status
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_admin) throw new Error('Admin access required');

    const { data, error } = await supabase
      .from('plans')
      .insert(planData);
    
    if (error) throw error;
    return data;
  },

  async updatePlan(planId, updates) {
    await this.verifyAdmin();

    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', planId);
    
    if (error) throw error;
    return data;
  },

  async deletePlan(planId) {
    await this.verifyAdmin();

    const { data, error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId);
    
    if (error) throw error;
    return data;
  },

  async togglePlanStatus(planId, isActive) {
    await this.verifyAdmin();

    const { data, error } = await supabase
      .from('plans')
      .update({ is_active: isActive })
      .eq('id', planId);
    
    if (error) throw error;
    return data;
  },

  async getPlanAnalytics(timeframe = '30d') {
    await this.verifyAdmin();

    // In a real implementation, you would use a Postgres function
    const { data, error } = await supabase.rpc('get_plan_analytics', {
      timeframe
    });
    
    if (error) throw error;
    return data;
  },

  async getAllSubscriptions(queryParams = {}) {
    await this.verifyAdmin();

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .match(queryParams);
    
    if (error) throw error;
    return data;
  },

    async getSubscriptionById(subscriptionId) {
    await this.verifyAdmin();

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        meals:meals (id, name, name_arabic),
        additives:additives (id, name, name_arabic)
      `)
      .eq('id', subscriptionId)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async updateSubscriptionStatus(subscriptionId, status, notes = '') {
    await this.verifyAdmin();

    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({ status, notes })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    return data;
  },

  async bulkUpdateSubscriptions(updates) {
    await this.verifyAdmin();

    // This would need a custom function in a real implementation
    const results = [];
    for (const update of updates) {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(update.changes)
        .eq('id', update.id);
      
      if (error) throw error;
      results.push(data);
    }
    return results;
  },

  async exportSubscriptions(filters = {}) {
    await this.verifyAdmin();

    // In a real implementation, use a Postgres function
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .match(filters);
    
    if (error) throw error;
    return data; // Return as JSON, convert to CSV/Excel on client
  },

  
  async setPlanFeatured(planId, isFeatured) {
    await this.verifyAdmin();

    const { data, error } = await supabase
      .from('plans')
      .update({ is_featured: isFeatured })
      .eq('id', planId);
    
    if (error) throw error;
    return data;
  },

  async duplicatePlan(planId, newPlanData = {}) {
    await this.verifyAdmin();

    // Get existing plan
    const { data: existingPlan, error: fetchError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (fetchError) throw fetchError;

    // Create new plan with modified data
    const newPlan = {
      ...existingPlan,
      ...newPlanData,
      id: undefined, // Let DB generate new ID
      created_at: undefined,
      updated_at: undefined
    };

    const { data, error } = await supabase
      .from('plans')
      .insert(newPlan);
    
    if (error) throw error;
    return data;
  },

  // Helper method to verify admin status
  async verifyAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_admin) throw new Error('Admin access required');
  }
};