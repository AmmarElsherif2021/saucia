import { supabase } from "../../supabaseClient";
import { userAPI } from "./userAPI";
import { mealsAPI } from "./mealAPI";
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
      }),
      userAPI.getUserAllergies(userId),
      userAPI.getUserDietaryPreferences(userId)
    ]);

    return { 
      profile, 
      health, 
      addresses, 
      subscriptions, 
      orders,
      allergies,
      dietaryPreferences
    };
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
      limit: options.limit || 50,
      select: `*, meal_allergies(allergies(id, name))`, 
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
      }),
      mealsAPI.getMealAllergies(mealId),
      mealsAPI.getMealItems(mealId)
    ]);

    return { ...meal, items, allergies, reviews };
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

  async updateMealComplete(mealId, updateData) {
    // Extract allergy_ids
    const { allergy_ids, ...mealData } = updateData;
    
    try {
      // Update meal base data
      const updatedMeal = await this.updateMeal(mealId, mealData);
      
      // Update allergies junction table
      if (allergy_ids !== undefined) {
        await this.updateMealAllergies(mealId, allergy_ids);
      }
      
      return updatedMeal;
    } catch (error) {
      console.error('Error updating meal complete:', error);
      throw error;
    }
  },
  
  
  async updateMealDietaryPreferences(mealId, dietaryPreferenceIds) {
    // Delete existing relationships
    await supabase
      .from('meal_dietary_preferences')
      .delete()
      .eq('meal_id', mealId);
    
    // If no preferences, exit early
    if (!dietaryPreferenceIds || dietaryPreferenceIds.length === 0) {
      return { success: true };
    }
    
    // Create new relationships
    const newRelations = dietaryPreferenceIds.map(prefId => ({
      meal_id: mealId,
      dietary_preference_id: prefId
    }));
    
    const { error } = await supabase
      .from('meal_dietary_preferences')
      .insert(newRelations);
    
    if (error) throw error;
    return { success: true };
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
      select: `*, item_allergies:item_allergies(allergies(*))`, // Add allergies
      orderBy: options.orderBy || 'sort_order',
      ascending: options.ascending || true,
      limit: options.limit || 100
    };

    if (options.category) {
      query.filters = [{ field: 'category', value: options.category }];
    }

    return fetchList('items', query);
  },

  // Get item details with allergies
  async getItemDetails(itemId) {
    const [item, allergies] = await Promise.all([
      fetchSingle('items', { field: 'id', value: itemId }),
      this.getItemAllergies(itemId) // Get allergies separately
    ]);

    return { ...item, allergies };
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
  // Get item details with allergies
  async updateItemComplete(itemId, updateData) {
  // Clean up updateData before processing
  const cleanUpdateData = {...updateData};
  delete cleanUpdateData.item_allergies;
  delete cleanUpdateData.allergies;

  // Extract allergy_ids from cleaned data
  const { allergy_ids, ...itemData } = cleanUpdateData;
  
  try {
    // Update base item data
    const updatedItem = await this.updateItem(itemId, itemData);
    
    // Update allergies junction table
    if (allergy_ids !== undefined) {
      await this.updateItemAllergies(itemId, allergy_ids);
    }
    
    return updatedItem;
  } catch (error) {
    console.error('Error updating item complete:', error);
    throw error;
  }
},
  
  async createItemComplete(itemData) {
    // Extract allergy_ids first
    const { allergy_ids, ...createData } = itemData;
    
    // Create the item
    const newItem = await this.createItem(createData);
    
    // Update allergies separately
    if (allergy_ids && allergy_ids.length > 0) {
      await this.updateItemAllergies(newItem.id, allergy_ids);
    }
    
    return newItem;
  },
  // Update item-allergies relationships
  async updateItemAllergies(itemId, allergyIds) {
    // Delete existing relationships
    await supabase
      .from('item_allergies')
      .delete()
      .eq('item_id', itemId);
    
    // Insert new relationships
    const newRelations = allergyIds.map(allergyId => ({
      item_id: itemId,
      allergy_id: allergyId
    }));
    
    const { error } = await supabase
      .from('item_allergies')
      .insert(newRelations);
    
    if (error) throw error;
    return { success: true };
  },
  
  // Get item allergies
  async getItemAllergies(itemId) {
    const { data, error } = await supabase
      .from('item_allergies')
      .select(`allergies(*)`)
      .eq('item_id', itemId);

    if (error) throw error;
    return data.map(item => item.allergies);
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

  // Create plan with meals and additives
    async createPlanComplete(planData) {
      const { meals = [], additives = [], ...baseData } = planData;
      
      // Create plan
      const { data: plan, error } = await supabase
        .from('plans')
        .insert([{ ...baseData, additives }])
        .select()
        .single();

      if (error) throw error;

      // Create plan_meals relationships
      const planMeals = meals.map(mealId => ({
        plan_id: plan.id,
        meal_id: mealId,
        is_substitutable: false
      }));

      if (planMeals.length) {
        const { error: mealError } = await supabase
          .from('plan_meals')
          .insert(planMeals);
        
        if (mealError) throw mealError;
      }

      return plan;
    },

    // NEW: Update plan with meals and additives
    async updatePlanComplete(planId, updateData) {
      const { meals = [], additives = [], ...baseData } = updateData;
      
      // Update plan base data
      const plan = await this.updatePlan(planId, {
        ...baseData,
        additives
      });
      
      // Update meals separately in junction table
      await this.updatePlanMeals(planId, meals);
      
      return plan;
    },

  async getPlanDetails(planId) {
    const [plan, planMeals] = await Promise.all([
      fetchSingle('plans', { field: 'id', value: planId }),
      fetchList('plan_meals', { 
        field: 'plan_id', 
        value: planId,
        select: `meal_id` // Make sure to select meal_id
      })
    ]);

    return {
      ...plan,
      meals: planMeals.map(pm => pm.meal_id), // Return array of IDs
      additives: plan.additives || []
    };
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
    async getPlanMeals(planId) {
    return fetchList('plan_meals', {
      field: 'plan_id',
      value: planId,
      select: 'meal_id, is_substitutable'
    });
  },

  // Update plan meals in junction table
  async updatePlanMeals(planId, meals) {
    // Delete existing relationships
    await supabase
      .from('plan_meals')
      .delete()
      .eq('plan_id', planId);

    // Insert new relationships
    const newRelations = meals.map(mealId => ({
      plan_id: planId,
      meal_id: mealId,
      is_substitutable: false // Default value
    }));

    const { error } = await supabase
      .from('plan_meals')
      .insert(newRelations);
    
    if (error) throw error;
    return { success: true };
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
  //create subscription
  async createSubscription(subscriptionData) {
    return createRecord('user_subscriptions', {
      ...subscriptionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
   });
 },
 //Get subscription details
 async getSubscriptionDetails(subscriptionId) {
  const subscription = await fetchSingle('user_subscriptions', {
    field: 'id',
    value: subscriptionId,
    select: `*,
             user_profiles(id, display_name, email),
             plans(id, title, title_arabic)`
  });

  // Fetch meal details
  const mealsDetails = await Promise.all(
    (subscription.meals || []).map(mealId =>
      fetchSingle('meals', { field: 'id', value: mealId })
    )
  );

  // Fetch additive details
  const additivesDetails = await Promise.all(
    (subscription.additives || []).map(itemId =>
      fetchSingle('items', { field: 'id', value: itemId })
    )
  );

  return {
    ...subscription,
    mealsDetails,
    additivesDetails
  };
}
,
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
    return updateRecord('user_subscriptions', subscriptionId, {
      ...updateData,
      updated_at: new Date().toISOString()
    });
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
  },

    // ===== JUNCTION TABLE OPERATIONS =====
  
  // Update meal-allergies relationships
  async updateMealAllergies(mealId, allergyIds) {
    // Delete existing relationships
    await supabase
      .from('meal_allergies')
      .delete()
      .eq('meal_id', mealId);
    
    // Insert new relationships
    const newRelations = allergyIds.map(allergyId => ({
      meal_id: mealId,
      allergy_id: allergyId
    }));
    
    const { error } = await supabase
      .from('meal_allergies')
      .insert(newRelations);
    
    if (error) throw error;
    return { success: true };
  },

  // Update meal-items relationships
  async updateMealItems(mealId, itemsData) {
    // Delete existing relationships
    await supabase
      .from('meal_items')
      .delete()
      .eq('meal_id', mealId);
    
    // Insert new relationships
    const newRelations = itemsData.map(item => ({
      meal_id: mealId,
      item_id: item.id,
      is_included: item.is_included,
      max_quantity: item.max_quantity
    }));
    
    const { error } = await supabase
      .from('meal_items')
      .insert(newRelations);
    
    if (error) throw error;
    return { success: true };
  },

  // Update user-allergies relationships
  async updateUserAllergies(userId, allergyIds) {
    // Delete existing relationships
    await supabase
      .from('user_allergies')
      .delete()
      .eq('user_id', userId);
    
    // Insert new relationships
    const newRelations = allergyIds.map(allergyId => ({
      user_id: userId,
      allergy_id: allergyId
    }));
    
    const { error } = await supabase
      .from('user_allergies')
      .insert(newRelations);
    
    if (error) throw error;
    return { success: true };
  },

  // Update user-dietary_preferences relationships
  async updateUserDietaryPreferences(userId, preferenceIds) {
    // Delete existing relationships
    await supabase
      .from('user_dietary_preferences')
      .delete()
      .eq('user_id', userId);
    
    // Insert new relationships
    const newRelations = preferenceIds.map(preferenceId => ({
      user_id: userId,
      preference_id: preferenceId
    }));
    
    const { error } = await supabase
      .from('user_dietary_preferences')
      .insert(newRelations);
    
    if (error) throw error;
    return { success: true };
  },

  // ===== MINOR TABLES =====
  

  // User Favorites
  async getUserFavoriteMeals(userId) {
    return fetchList('user_favorite_meals', {
      field: 'user_id',
      value: userId,
      select: `meal_id, meals(id, name, name_arabic)`
    });
  },

  // Payment Methods
  async getUserPaymentMethods(userId) {
    return fetchList('user_payment_methods', {
      field: 'user_id',
      value: userId
    });
  },
};