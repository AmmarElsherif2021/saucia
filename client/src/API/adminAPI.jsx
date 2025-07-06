import { supabase } from "../../supabaseClient";

// Helper functions for common operations
const fetchSingle = async (table, query) => {
  const { data, error } = await supabase
    .from(table)
    .select(query?.select || '*')
    .eq(query?.field, query?.value)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const fetchList = async (table, query = {}) => {
  let request = supabase
    .from(table)
    .select(query?.select || '*');

  if (query?.field && query?.value) {
    request = request.eq(query.field, query.value);
  }

  if (query?.filters) {
    query.filters.forEach(filter => {
      request = request.eq(filter.field, filter.value);
    });
  }

  if (query?.orderBy) {
    request = request.order(query.orderBy, { ascending: query.ascending || false });
  }

  if (query?.limit) {
    request = request.limit(query.limit);
  }

  const { data, error } = await request;
  if (error) throw error;
  return data || [];
};

const createRecord = async (table, recordData) => {
  const { data, error } = await supabase
    .from(table)
    .insert([recordData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateRecord = async (table, id, updateData) => {
  const { data, error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteRecord = async (table, id) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

export const adminAPI = {
  // ===== USER MANAGEMENT =====
  
  // Get all users with pagination and filtering
  async getAllUsers(options = {}) {
    const query = {
      select: `
        id,
        display_name,
        email,
        phone_number,
        is_admin,
        loyalty_points,
        language,
        account_status,
        email_verified,
        phone_verified,
        created_at,
        updated_at,
        last_login
      `,
      orderBy: options.orderBy || 'created_at',
      ascending: options.ascending || false,
      limit: options.limit || 50
    };

    if (options.status) {
      query.filters = [{ field: 'account_status', value: options.status }];
    }

    return fetchList('user_profiles', query);
  },

  // Get user details with all related data
  async getUserDetails(userId) {
    const [profile, health, addresses, subscriptions, orders] = await Promise.all([
      fetchSingle('user_profiles', { field: 'id', value: userId }),
      fetchSingle('user_health_profiles', { field: 'user_id', value: userId }),
      fetchList('user_addresses', { field: 'user_id', value: userId }),
      fetchList('user_subscriptions', { 
        field: 'user_id', 
        value: userId,
        select: `*, plans(id, title, title_arabic)`
      }),
      fetchList('orders', { 
        field: 'user_id', 
        value: userId,
        orderBy: 'created_at',
        limit: 10
      })
    ]);

    return { profile, health, addresses, subscriptions, orders };
  },

  // Update user profile
  async updateUserProfile(userId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return updateRecord('user_profiles', userId, dataToUpdate);
  },

  // Set admin status
  async setAdminStatus(userId, isAdmin) {
    return updateRecord('user_profiles', userId, {
      is_admin: isAdmin,
      updated_at: new Date().toISOString()
    });
  },

  // Update loyalty points
  async updateLoyaltyPoints(userId, points) {
    return updateRecord('user_profiles', userId, {
      loyalty_points: points,
      updated_at: new Date().toISOString()
    });
  },

  // Update account status
  async updateAccountStatus(userId, status) {
    return updateRecord('user_profiles', userId, {
      account_status: status,
      updated_at: new Date().toISOString()
    });
  },

  // ===== MEAL MANAGEMENT =====

  // Get all meals with filtering and pagination
  async getAllMeals(options = {}) {
    const query = {
      orderBy: options.orderBy || 'created_at',
      ascending: options.ascending || false,
      limit: options.limit || 50
    };

    if (options.section) {
      query.filters = [{ field: 'section', value: options.section }];
    }

    if (options.available !== undefined) {
      query.filters = query.filters || [];
      query.filters.push({ field: 'is_available', value: options.available });
    }

    return fetchList('meals', query);
  },

  // Get meal details with relationships
  async getMealDetails(mealId) {
    const [meal, items, allergies, reviews] = await Promise.all([
      fetchSingle('meals', { field: 'id', value: mealId }),
      fetchList('meal_items', { 
        field: 'meal_id', 
        value: mealId,
        select: `*, items(id, name, name_arabic, category, price)`
      }),
      fetchList('meal_allergies', { 
        field: 'meal_id', 
        value: mealId,
        select: `*, allergies(id, name, name_arabic, severity_level)`
      }),
      fetchList('meal_reviews', { 
        field: 'meal_id', 
        value: mealId,
        select: `*, user_profiles(id, display_name)`,
        orderBy: 'created_at',
        limit: 10
      })
    ]);

    return { meal, items, allergies, reviews };
  },

  // Create new meal
  async createMeal(mealData) {
    const newMeal = {
      ...mealData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return createRecord('meals', newMeal);
  },

  // Update meal
  async updateMeal(mealId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return updateRecord('meals', mealId, dataToUpdate);
  },

  // Delete meal
  async deleteMeal(mealId) {
    return deleteRecord('meals', mealId);
  },

  // Update meal availability
  async updateMealAvailability(mealId, isAvailable) {
    return updateRecord('meals', mealId, {
      is_available: isAvailable,
      updated_at: new Date().toISOString()
    });
  },









  
  // ===== ITEM MANAGEMENT =====

  // Get all items
  async getAllItems(options = {}) {
    const query = {
      orderBy: options.orderBy || 'sort_order',
      ascending: options.ascending || true,
      limit: options.limit || 100
    };

    if (options.category) {
      query.filters = [{ field: 'category', value: options.category }];
    }

    return fetchList('items', query);
  },

  // Create new item
  async createItem(itemData) {
    const newItem = {
      ...itemData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return createRecord('items', newItem);
  },

  // Update item
  async updateItem(itemId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return updateRecord('items', itemId, dataToUpdate);
  },

  // Delete item
  async deleteItem(itemId) {
    return deleteRecord('items', itemId);
  },

  // Update item availability
  async updateItemAvailability(itemId, isAvailable) {
    return updateRecord('items', itemId, {
      is_available: isAvailable,
      updated_at: new Date().toISOString()
    });
  },
  
 

  // ===== PLAN MANAGEMENT =====

  // Get all plans
  async getAllPlans(options = {}) {
    const query = {
      orderBy: options.orderBy || 'sort_order',
      ascending: options.ascending || true
    };

    if (options.active !== undefined) {
      query.filters = [{ field: 'is_active', value: options.active }];
    }

    return fetchList('plans', query);
  },

  // Get plan details with meals
  async getPlanDetails(planId) {
    const [plan, meals, subscriptions] = await Promise.all([
      fetchSingle('plans', { field: 'id', value: planId }),
      fetchList('plan_meals', { 
        field: 'plan_id', 
        value: planId,
        select: `*, meals(id, name, name_arabic, image_url, calories, protein_g)`,
        orderBy: 'week_number'
      }),
      fetchList('user_subscriptions', { 
        field: 'plan_id', 
        value: planId,
        select: `id, user_id, status, start_date, end_date, user_profiles(id, display_name)`,
        limit: 10
      })
    ]);

    return { plan, meals, subscriptions };
  },

  // Create new plan
  async createPlan(planData) {
    const newPlan = {
      ...planData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return createRecord('plans', newPlan);
  },

  // Update plan
  async updatePlan(planId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return updateRecord('plans', planId, dataToUpdate);
  },

  // Delete plan
  async deletePlan(planId) {
    return deleteRecord('plans', planId);
  },

  // Update plan status
  async updatePlanStatus(planId, isActive) {
    return updateRecord('plans', planId, {
      is_active: isActive,
      updated_at: new Date().toISOString()
    });
  },

  // Add meal to plan
  async addMealToPlan(planId, mealId, weekNumber, dayOfWeek) {
    return createRecord('plan_meals', {
      plan_id: planId,
      meal_id: mealId,
      week_number: weekNumber,
      day_of_week: dayOfWeek,
      created_at: new Date().toISOString()
    });
  },

  // Remove meal from plan
  async removeMealFromPlan(planId, mealId, weekNumber, dayOfWeek) {
    const { error } = await supabase
      .from('plan_meals')
      .delete()
      .eq('plan_id', planId)
      .eq('meal_id', mealId)
      .eq('week_number', weekNumber)
      .eq('day_of_week', dayOfWeek);

    if (error) throw error;
    return { success: true };
  },

  // ===== SUBSCRIPTION MANAGEMENT =====

  // Get all subscriptions
  async getAllSubscriptions(options = {}) {
    const query = {
      select: `
        *,
        user_profiles(id, display_name, email),
        plans(id, title, title_arabic)
      `,
      orderBy: options.orderBy || 'created_at',
      ascending: options.ascending || false,
      limit: options.limit || 50
    };

    if (options.status) {
      query.filters = [{ field: 'status', value: options.status }];
    }

    return fetchList('user_subscriptions', query);
  },

  // Update subscription status
  async updateSubscriptionStatus(subscriptionId, status) {
    return updateRecord('user_subscriptions', subscriptionId, {
      status: status,
      updated_at: new Date().toISOString()
    });
  },

  // Update subscription
  async updateSubscription(subscriptionId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return updateRecord('user_subscriptions', subscriptionId, dataToUpdate);
  },

  // ===== ORDER MANAGEMENT =====

  // Get all orders
  async getAllOrders(options = {}) {
    const query = {
      select: `
        *,
        user_profiles(id, display_name, email),
        order_meals(id, meal_id, name, quantity, unit_price, total_price),
        order_items(id, item_id, name, quantity, unit_price, total_price)
      `,
      orderBy: options.orderBy || 'created_at',
      ascending: options.ascending || false,
      limit: options.limit || 50
    };

    if (options.status) {
      query.filters = [{ field: 'status', value: options.status }];
    }

    return fetchList('orders', query);
  },

  // Update order status
  async updateOrderStatus(orderId, status) {
    return updateRecord('orders', orderId, {
      status: status,
      updated_at: new Date().toISOString()
    });
  },

  // Update order
  async updateOrder(orderId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return updateRecord('orders', orderId, dataToUpdate);
  },

  // ===== ANALYTICS & REPORTING =====

  // Get dashboard statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalMeals,
      totalOrders,
      activeSubscriptions,
      totalRevenue
    ] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact' }),
      supabase.from('meals').select('id', { count: 'exact' }),
      supabase.from('orders').select('id', { count: 'exact' }),
      supabase.from('user_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid')
    ]);

    const revenue = totalRevenue.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    return {
      totalUsers: totalUsers.count || 0,
      totalMeals: totalMeals.count || 0,
      totalOrders: totalOrders.count || 0,
      activeSubscriptions: activeSubscriptions.count || 0,
      totalRevenue: revenue
    };
  },

  // Get recent activity
  async getRecentActivity(limit = 20) {
    const [recentOrders, recentUsers, recentReviews] = await Promise.all([
      fetchList('orders', {
        select: `id, order_number, status, total_amount, created_at, user_profiles(display_name)`,
        orderBy: 'created_at',
        limit: limit / 3
      }),
      fetchList('user_profiles', {
        select: `id, display_name, email, created_at`,
        orderBy: 'created_at',
        limit: limit / 3
      }),
      fetchList('meal_reviews', {
        select: `id, rating, review_text, created_at, user_profiles(display_name), meals(name)`,
        orderBy: 'created_at',
        limit: limit / 3
      })
    ]);

    return {
      recentOrders,
      recentUsers,
      recentReviews
    };
  },

  // ============== BULK OPERATIONS ===============

  // Bulk update meals
  async bulkUpdateMeals(mealIds, updateData) {
    const { error } = await supabase
      .from('meals')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .in('id', mealIds);

    if (error) throw error;
    return { success: true, updatedCount: mealIds.length };
  },
  // Bulk update meal availability
  async bulkUpdateMealAvailability(mealIds, isAvailable) {
    const { error } = await supabase
      .from('meals')
      .update({ 
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .in('id', mealIds);

    if (error) throw error;
    return { success: true, updatedCount: mealIds.length };
  },
  // Bulk update items
  async bulkUpdateItems(itemIds, updateData) {
    const { error } = await supabase
      .from('items')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .in('id', itemIds);

    if (error) throw error;
    return { success: true, updatedCount: itemIds.length };
  },

  // Bulk update users
  async bulkUpdateUsers(userIds, updateData) {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds);

    if (error) throw error;
    return { success: true, updatedCount: userIds.length };
  },

  // ===== ALLERGIES AND DIETRIES MANAGEMENT =====

  // Get all allergies
  async getAllAllergies() {
    return fetchList('allergies', { orderBy: 'name' });
  },

  // Create allergy
  async createAllergy(allergyData) {
    return createRecord('allergies', {
      ...allergyData,
      created_at: new Date().toISOString()
    });
  },

  // Update allergy
  async updateAllergy(allergyId, updateData) {
    return updateRecord('allergies', allergyId, updateData);
  },

  // Delete allergy
  async deleteAllergy(allergyId) {
    return deleteRecord('allergies', allergyId);
  },

  // Get all dietary preferences
  async getAllDietaryPreferences() {
    return fetchList('dietary_preferences', { orderBy: 'name' });
  },

  // Create dietary preference
  async createDietaryPreference(preferenceData) {
    return createRecord('dietary_preferences', {
      ...preferenceData,
      created_at: new Date().toISOString()
    });
  },

  // Update dietary preference
  async updateDietaryPreference(preferenceId, updateData) {
    return updateRecord('dietary_preferences', preferenceId, updateData);
  },

  // Delete dietary preference
  async deleteDietaryPreference(preferenceId) {
    return deleteRecord('dietary_preferences', preferenceId);
  }
};