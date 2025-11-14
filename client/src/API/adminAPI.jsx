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
  ////console.log(`Table ${table} data ${data}`)
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

// Common update function with timestamp
const updateWithTimestamp = async (table, id, updateData) => {
  return updateRecord(table, id, {
    ...updateData,
    updated_at: new Date().toISOString()
  });
};

export const adminAPI = {
  // ===== USER MANAGEMENT =====
  async getAllUsers(options = {}) {
    const query = {
      select: `id, display_name, email, phone_number, is_admin, loyalty_points, language, account_status, email_verified, phone_verified, created_at, updated_at, last_login`,
      orderBy: options.orderBy || 'created_at',
      ascending: options.ascending || false,
      limit: options.limit || 50
    };

    if (options.status) {
      query.filters = [{ field: 'account_status', value: options.status }];
    }

    return fetchList('user_profiles', query);
  },

  async getUserDetails(userId) {
    const [profile, health, addresses, subscriptions, orders, allergies, dietaryPreferences] = await Promise.all([
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
      this.getUserAllergies(userId),
      this.getUserDietaryPreferences(userId)
    ]);

    return { profile, health, addresses, subscriptions, orders, allergies, dietaryPreferences };
  },

  async updateUserProfile(userId, updateData) {
    return updateWithTimestamp('user_profiles', userId, updateData);
  },

  async setAdminStatus(userId, isAdmin) {
    return updateWithTimestamp('user_profiles', userId, { is_admin: isAdmin });
  },

  async updateLoyaltyPoints(userId, points) {
    return updateWithTimestamp('user_profiles', userId, { loyalty_points: points });
  },

  async updateAccountStatus(userId, status) {
    return updateWithTimestamp('user_profiles', userId, { account_status: status });
  },

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

// ===== MEAL MANAGEMENT =====
// ============================================
// ADMIN API - MEAL OPERATIONS
// ============================================

// GET ALL MEALS
async getAllMeals(options = {}) {
  //console.log('=== adminAPI.getAllMeals called ===');
  //console.log('Options:', options);
  
  const query = {
    select: options.select || `
      *, 
      meal_allergies(allergy_id, allergies(id, name, name_arabic, severity_level)),
      meal_items(items)
    `,
    orderBy: options.orderBy || 'created_at',
    ascending: options.ascending || false,
    limit: options.limit || 100,
  };

  //console.log('Query being executed:', query);

  if (options.section) {
    query.filters = [{ field: 'section', value: options.section }];
  }

  if (options.available !== undefined) {
    query.filters = query.filters || [];
    query.filters.push({ field: 'is_available', value: options.available });
  }
  
  const data = await fetchList('meals', query);
  
  //console.log('=== adminAPI.getAllMeals result sample===');
  //console.log('Total meals returned:', data?.length);
  
  // Transform the data to flatten the structure
  const transformedData = data?.map(meal => {
    // Extract allergies from junction table
    const allergies = meal.meal_allergies?.map(ma => ma.allergies) || [];
    const allergy_ids = meal.meal_allergies?.map(ma => ma.allergy_id) || [];
    
    // Extract items array from meal_items table
    const items = meal.meal_items?.[0]?.items || [];
    
    // Remove junction table data and add flattened versions
    const { meal_allergies, meal_items, ...mealData } = meal;
    
    return {
      ...mealData,
      allergies,
      allergy_ids,
      item_ids: items
    };
  });
  
  //console.log('Sample transformed meal:', transformedData?.[0]);
  
  return transformedData;
},

// GET MEAL ITEMS
async getMealItems(mealId) {
  //console.log(`=== adminAPI.getMealItems called for meal ${mealId} ===`);
  
  const { data, error } = await supabase
    .from('meal_items')
    .select('items')
    .eq('meal_id', mealId)
    .single();

  //console.log('Result:', { data, error });

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching meal items:', error);
    throw error;
  }
  
  const items = data?.items || [];
  //console.log(`Returning ${items?.length || 0} items for meal ${mealId}`);
  
  return items;
},

// GET MEAL DETAILS
async getMealDetails(mealId) {
  //console.log(`=== adminAPI.getMealDetails called for meal ${mealId} ===`);
  
  // Fetch meal with its relations
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .select(`
      *,
      meal_allergies(allergy_id, allergies(id, name, name_arabic, severity_level)),
      meal_items(items)
    `)
    .eq('id', mealId)
    .single();

  if (mealError) {
    console.error('Error fetching meal details:', mealError);
    throw mealError;
  }

  // Transform the data
  const allergies = meal.meal_allergies?.map(ma => ma.allergies) || [];
  const allergy_ids = meal.meal_allergies?.map(ma => ma.allergy_id) || [];
  const items = meal.meal_items?.[0]?.items || [];
  
  const { meal_allergies, meal_items, ...mealData } = meal;

  const result = {
    ...mealData,
    allergies,
    allergy_ids,
    item_ids: items
  };


  //console.log('Meal details result from adminAPI:', JSON.stringify(result));

  return result;
},

// CREATE MEAL
async createMeal(mealData) {
  //console.log('=== adminAPI.createMeal called ===');
  //console.log('Input data:', mealData);
  
  // Separate related data from base meal data
  const { allergy_ids, item_ids, ...baseMealData } = mealData;
  
  // Prepare base meal data
  const newMeal = {
    ...baseMealData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  //console.log('Creating meal with base data:', newMeal);

  // Create the meal record
  const meal = await createRecord('meals', newMeal);
  
  //console.log('Meal created with ID:', meal.id);

  // Handle allergies junction table
  if (allergy_ids && allergy_ids.length > 0) {
    //console.log('Creating meal allergies for IDs:', allergy_ids);
    await this.updateMealAllergies(meal.id, allergy_ids);
  }
  
  // Handle items if this is a selective meal
  if (meal.is_selective && item_ids && item_ids.length > 0) {
    //console.log('Creating meal items for selective meal:', item_ids);
    await this.updateMealItems(meal.id, item_ids);
  }
  
  //console.log('Meal creation complete');
  
  return meal;
},

// UPDATE MEAL
async updateMeal(mealId, updateData) {
  //console.log('=== adminAPI.updateMeal called ===');
  //console.log('Meal ID:', mealId);
  //console.log('Update data:', updateData);
  
  // Separate related data from base meal data
  const { allergy_ids, item_ids, ...baseMealData } = updateData;
  
  //console.log('Base meal data to update:', baseMealData);
  //console.log('Allergy IDs:', allergy_ids);
  //console.log('Item IDs:', item_ids);
  
  // Update base meal record
  const meal = await updateWithTimestamp('meals', mealId, baseMealData);
  
  //console.log('Base meal updated');

  // Update allergies junction table if provided
  if (allergy_ids !== undefined) {
    //console.log('Updating meal allergies');
    await this.updateMealAllergies(mealId, allergy_ids);
  }

  // Update meal_items table if provided
  if (item_ids !== undefined) {
    //console.log('Updating meal items');
    await this.updateMealItems(mealId, item_ids);
  }

  //console.log('Meal update complete');
  
  return meal;
},

// UPDATE MEAL ALLERGIES (Junction Table)
async updateMealAllergies(mealId, allergyIds) {
  //console.log(`=== adminAPI.updateMealAllergies for meal ${mealId} ===`);
  //console.log('Allergy IDs:', allergyIds);
  
  // Delete existing meal_allergies
  const { error: deleteError } = await supabase
    .from('meal_allergies')
    .delete()
    .eq('meal_id', mealId);

  if (deleteError) {
    console.error('Error deleting meal allergies:', deleteError);
    throw deleteError;
  }

  if (!allergyIds || allergyIds.length === 0) {
    //console.log('No allergies to insert');
    return { success: true };
  }

  // Insert new meal_allergies
  const allergyRecords = allergyIds.map(allergyId => ({
    meal_id: mealId,
    allergy_id: allergyId
  }));

  const { error: insertError } = await supabase
    .from('meal_allergies')
    .insert(allergyRecords);

  if (insertError) {
    console.error('Error inserting meal allergies:', insertError);
    throw insertError;
  }

  //console.log('Meal allergies updated successfully');
  return { success: true };
},

// UPDATE MEAL ITEMS (Separate Table with Array)
async updateMealItems(mealId, itemIds) {
  //console.log(`=== adminAPI.updateMealItems for meal ${mealId} ===`);
  //console.log('Item IDs:', itemIds);
  
  // Delete existing meal_items record
  const { error: deleteError } = await supabase
    .from('meal_items')
    .delete()
    .eq('meal_id', mealId);

  if (deleteError) {
    console.error('Error deleting meal items:', deleteError);
    throw deleteError;
  }

  if (!itemIds || itemIds.length === 0) {
    //console.log('No items to insert');
    return { success: true };
  }

  // Insert new meal_items record (single row with array)
  const { error: insertError } = await supabase
    .from('meal_items')
    .insert([{ 
      meal_id: mealId, 
      items: itemIds 
    }]);

  if (insertError) {
    console.error('Error inserting meal items:', insertError);
    throw insertError;
  }

  //console.log('Meal items updated successfully');
  return { success: true };
},

// DELETE MEAL
async deleteMeal(mealId) {
  //console.log(`=== adminAPI.deleteMeal for meal ${mealId} ===`);
  
  // The foreign keys have CASCADE delete, so related records will be deleted automatically
  const result = await deleteRecord('meals', mealId);
  
  //console.log('Meal deleted successfully');
  return result;
},

// UPDATE MEAL AVAILABILITY
async updateMealAvailability(mealId, isAvailable) {
  //console.log(`=== adminAPI.updateMealAvailability for meal ${mealId} ===`);
  //console.log('Is available:', isAvailable);
  
  return updateWithTimestamp('meals', mealId, { is_available: isAvailable });
},

// BULK UPDATE MEALS
async bulkUpdateMeals(mealIds, updateData) {
  //console.log('=== adminAPI.bulkUpdateMeals ===');
  //console.log('Meal IDs:', mealIds);
  //console.log('Update data:', updateData);
  
  const { error } = await supabase
    .from('meals')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .in('id', mealIds);

  if (error) {
    console.error('Error bulk updating meals:', error);
    throw error;
  }

  //console.log('Bulk update successful');
  return { success: true, updatedCount: mealIds.length };
},

// BULK UPDATE MEAL AVAILABILITY
async bulkUpdateMealAvailability(mealIds, isAvailable) {
  //console.log('=== adminAPI.bulkUpdateMealAvailability ===');
  return this.bulkUpdateMeals(mealIds, { is_available: isAvailable });
},
  // ===== ITEM MANAGEMENT =====
  async getAllItems(options = {}) {
    const query = {
      select: `*, item_allergies:item_allergies(allergies(*))`,
      orderBy: options.orderBy || 'sort_order',
      ascending: options.ascending || true,
      limit: options.limit || 300
    };

    if (options.category) {
      query.filters = [{ field: 'category', value: options.category }];
    }

    return fetchList('items', query);
  },

  async getItemDetails(itemId) {
    const [item, allergies] = await Promise.all([
      fetchSingle('items', { field: 'id', value: itemId }),
      this.getItemAllergies(itemId)
    ]);

    return { ...item, allergies };
  },

  async createItem(itemData) {
  // Separate allergy_ids from item data
  const { allergy_ids, ...baseItemData } = itemData;
  
  const newItem = {
    ...baseItemData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const item = await createRecord('items', newItem);
  
  // If allergy_ids provided, create junction table entries
  if (allergy_ids && allergy_ids.length > 0) {
    await this.updateItemAllergies(item.id, allergy_ids);
  }
  
  return item;
},

async updateItem(itemId, updateData) {
  // Separate allergy_ids from item data
  const { allergy_ids, ...baseItemData } = updateData;
  
  const item = await updateWithTimestamp('items', itemId, baseItemData);
  
  // If allergy_ids provided, update junction table entries
  if (allergy_ids !== undefined) {
    await this.updateItemAllergies(itemId, allergy_ids);
  }
  
  return item;
},

  async deleteItem(itemId) {
    return deleteRecord('items', itemId);
  },

  async updateItemAvailability(itemId, isAvailable) {
    return updateWithTimestamp('items', itemId, { is_available: isAvailable });
  },

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

  // ===== PLAN MANAGEMENT =====
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

 async getPlanDetails(planId) {
  const [plan, planMeals] = await Promise.all([
    fetchSingle('plans', { field: 'id', value: planId }),
    this.getPlanMealsWithDetails(planId)
  ]);

  return {
    ...plan,
    meals: planMeals.map(pm => ({
      id: pm.meal_id,
      is_substitutable: pm.is_substitutable,
      ...pm.meals
    })),
    meal_ids: planMeals.map(pm => pm.meal_id),
    additives: plan.additives || []
  };
},

  async createPlan(planData) {
    const newPlan = {
      ...planData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return createRecord('plans', newPlan);
  },

  async updatePlan(planId, updateData) {
    return updateWithTimestamp('plans', planId, updateData);
  },

  async deletePlan(planId) {
    return deleteRecord('plans', planId);
  },

  async updatePlanStatus(planId, isActive) {
    return updateWithTimestamp('plans', planId, { is_active: isActive });
  },

  async getPlanMeals(planId) {
    return fetchList('plan_meals', {
      field: 'plan_id',
      value: planId,
      select: 'meal_id, is_substitutable'
    });
  },

// PLAN MEALS with better logging and error handling
async updatePlanMeals(planId, meals) {
  console.log(`🔄 updatePlanMeals called for plan ${planId}:`, meals);
  
  try {
    // Delete existing plan_meals
    const { error: deleteError } = await supabase
      .from('plan_meals')
      .delete()
      .eq('plan_id', planId);

    if (deleteError) {
      console.error('❌ Error deleting plan_meals:', deleteError);
      throw deleteError;
    }

    console.log('✅ Existing plan_meals deleted');

    if (!meals || meals.length === 0) {
      console.log('ℹ️ No meals to insert, returning early');
      return { success: true };
    }

    // Handle both array of IDs and array of objects with is_substitutable
    const newRelations = meals.map(meal => {
      if (typeof meal === 'object' && meal.meal_id !== undefined) {
        return {
          plan_id: planId,
          meal_id: meal.meal_id,
          is_substitutable: meal.is_substitutable ?? false
        };
      } else if (typeof meal === 'object' && meal.id !== undefined) {
        return {
          plan_id: planId,
          meal_id: meal.id,
          is_substitutable: meal.is_substitutable ?? false
        };
      }
      return {
        plan_id: planId,
        meal_id: meal,
        is_substitutable: false
      };
    });

    console.log('📝 Inserting plan_meals relations:', newRelations);

    const { data, error } = await supabase
      .from('plan_meals')
      .insert(newRelations)
      .select();

    if (error) {
      console.error('❌ Error inserting plan_meals:', error);
      throw error;
    }

    console.log('✅ Plan meals inserted successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('💥 updatePlanMeals failed:', error);
    throw error;
  }
},
// ===== PLAN_MEALS JUNCTION TABLE OPERATIONS =====

// Get plan meals with meal details
async getPlanMealsWithDetails(planId) {
  const { data, error } = await supabase
    .from('plan_meals')
    .select(`
      id,
      meal_id,
      is_substitutable,
      meals(id, name, name_arabic, base_price, calories, image_url)
    `)
    .eq('plan_id', planId);

  if (error) throw error;
  return data || [];
},


// Add a single meal to plan
async addMealToPlan(planId, mealId, isSubstitutable = false) {
  const { data, error } = await supabase
    .from('plan_meals')
    .insert({
      plan_id: planId,
      meal_id: mealId,
      is_substitutable: isSubstitutable
    })
    .select()
    .single();

  if (error) throw error;
  return data;
},

// Remove a single meal from plan
async removeMealFromPlan(planId, mealId) {
  const { error } = await supabase
    .from('plan_meals')
    .delete()
    .eq('plan_id', planId)
    .eq('meal_id', mealId);

  if (error) throw error;
  return { success: true };
},

// Update meal substitutability in plan
async updatePlanMealSubstitutability(planId, mealId, isSubstitutable) {
  const { data, error } = await supabase
    .from('plan_meals')
    .update({ is_substitutable: isSubstitutable })
    .eq('plan_id', planId)
    .eq('meal_id', mealId)
    .select()
    .single();

  if (error) throw error;
  return data;
},

  // ===== ORDER MANAGEMENT =====
  async getAllOrders(options = {}) {
    const query = {
      select: `*, user_profiles(id, display_name, email), order_meals(id, meal_id, name, quantity, unit_price, total_price), order_items(id, item_id, name, quantity, unit_price, total_price)`,
      orderBy: options.orderBy || 'created_at',
      ascending: options.ascending || false,
      limit: options.limit || 50
    };

    if (options.status) {
      query.filters = [{ field: 'status', value: options.status }];
    }

    return fetchList('orders', query);
  },

  async updateOrderStatus(orderId, status) {
    return updateWithTimestamp('orders', orderId, { status });
  },

  async updateOrder(orderId, updateData) {
    return updateWithTimestamp('orders', orderId, updateData);
  },

  // ===== ANALYTICS & REPORTING =====
  async getDashboardStats() {
    const [users,admins, meals, orders, activeSubs, revenue] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact' }),
      supabase.from('user_profiles').select('id', { count: 'exact' }).eq('is_admin', 'true'),
      supabase.from('meals').select('id', { count: 'exact' }).eq('is_available', 'true'),
      supabase.from('orders').select('id', { count: 'exact' }),
      supabase.from('user_subscriptions').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid')
    ]);

    const totalRevenue = revenue.data?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;

    return {
      totalUsers: users.count || 0,
      totalAdmins: admins.count|| 0,
      totalMeals: meals.count || 0,
      totalOrders: orders.count || 0,
      activeSubscriptions: activeSubs.count || 0,
      totalRevenue: totalRevenue
    };
  },

  async getRecentActivity(limit = 20) {
    const [recentOrders, recentUsers, recentReviews] = await Promise.all([
      fetchList('orders', {
        select: `id, order_number, status, total_amount, created_at, user_profiles(display_name)`,
        orderBy: 'created_at',
        limit: Math.floor(limit / 3)
      }),
      fetchList('user_profiles', {
        select: `id, display_name, email, created_at`,
        orderBy: 'created_at',
        limit: Math.floor(limit / 3)
      }),
      fetchList('meal_reviews', {
        select: `id, rating, review_text, created_at, user_profiles(display_name), meals(name)`,
        orderBy: 'created_at',
        limit: Math.floor(limit / 3)
      })
    ]);

    return { recentOrders, recentUsers, recentReviews };
  },

  // ===== ALLERGIES & DIETARY PREFERENCES =====
  async getAllAllergies() {
    return fetchList('allergies', { orderBy: 'name' });
  },

  async createAllergy(allergyData) {
    return createRecord('allergies', {
      ...allergyData,
      created_at: new Date().toISOString()
    });
  },

  async updateAllergy(allergyId, updateData) {
    return updateRecord('allergies', allergyId, updateData);
  },

  async deleteAllergy(allergyId) {
    return deleteRecord('allergies', allergyId);
  },

  async getAllDietaryPreferences() {
    return fetchList('dietary_preferences', { orderBy: 'name' });
  },

  async createDietaryPreference(preferenceData) {
    return createRecord('dietary_preferences', {
      ...preferenceData,
      created_at: new Date().toISOString()
    });
  },

  async updateDietaryPreference(preferenceId, updateData) {
    return updateRecord('dietary_preferences', preferenceId, updateData);
  },

  async deleteDietaryPreference(preferenceId) {
    return deleteRecord('dietary_preferences', preferenceId);
  },

  // ===== JUNCTION TABLE OPERATIONS =====
  // async updateMealAllergies(mealId, allergyIds) {
  //   await supabase
  //     .from('meal_allergies')
  //     .delete()
  //     .eq('meal_id', mealId);
    
  //   if (!allergyIds || allergyIds.length === 0) return { success: true };
    
  //   const newRelations = allergyIds.map(allergyId => ({
  //     meal_id: mealId,
  //     allergy_id: allergyId
  //   }));
    
  //   const { error } = await supabase
  //     .from('meal_allergies')
  //     .insert(newRelations);
    
  //   if (error) throw error;
  //   return { success: true };
  // },

  async updateItemAllergies(itemId, allergyIds) {
    await supabase
      .from('item_allergies')
      .delete()
      .eq('item_id', itemId);
    
    if (!allergyIds || allergyIds.length === 0) return { success: true };
    
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

  async updateUserAllergies(userId, allergyIds) {
    await supabase
      .from('user_allergies')
      .delete()
      .eq('user_id', userId);
    
    if (!allergyIds || allergyIds.length === 0) return { success: true };
    
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

  async updateUserDietaryPreferences(userId, preferenceIds) {
    await supabase
      .from('user_dietary_preferences')
      .delete()
      .eq('user_id', userId);
    
    if (!preferenceIds || preferenceIds.length === 0) return { success: true };
    
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

  // ===== GETTERS FOR JUNCTION TABLES =====
  async getUserAllergies(userId) {
    const { data, error } = await supabase
      .from('user_allergies')
      .select(`allergies(*)`)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.allergies);
  },

  async getUserDietaryPreferences(userId) {
    const { data, error } = await supabase
      .from('user_dietary_preferences')
      .select(`dietary_preferences(*)`)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => item.dietary_preferences);
  },

  async getItemAllergies(itemId) {
    const { data, error } = await supabase
      .from('item_allergies')
      .select(`allergies(*)`)
      .eq('item_id', itemId);

    if (error) throw error;
    return data.map(item => item.allergies);
  }
}