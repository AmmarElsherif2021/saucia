import { supabase } from "../../supabaseClient";

// Helper functions for common operations
const fetchSingle = async (table, query) => {
  const { data, error } = await supabase
    .from(table)
    .select(query?.select || '*')
    .eq(query?.field, query?.value);
  
  if (error && error.code !== 'PGRST116') throw error;
  return data?.[0] || null;
};

const fetchList = async (table, query) => {
  let request = supabase
    .from(table)
    .select(query?.select || '*')
    .eq(query?.field, query?.value);

  if (query?.orderBy) {
    request = request.order(query.orderBy, { ascending: false });
  }

  const { data, error } = await request;
  if (error) throw error;
  return data || [];
};

const createRecord = async (table, recordData) => {
  const { data, error } = await supabase
    .from(table)
    .insert([recordData])
    .select();

  if (error) throw error;
  return data?.[0] || null;
};

const updateRecord = async (table, id, updateData) => {
  const { data, error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0] || null;
};

const deleteRecord = async (table, id) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

export const userAPI = {
  // User Profile Management
  async getUserProfile(userId) {
    return fetchSingle('user_profiles', { field: 'id', value: userId });
  },

  async createUserProfile(userData) {
    const profileData = {
      id: userData.id,
      email: userData.email,
      display_name: userData.displayName || userData.display_name,
      google_id: userData.google_id,
      profile_completed: userData.profile_completed || false,
      email_verified: userData.email_verified || false,
      phone_verified: userData.phone_verified || false,
      is_admin: userData.is_admin || false,
      loyalty_points: userData.loyalty_points || 0,
      language: userData.language || 'en',
      timezone: userData.timezone || 'Asia/Riyadh',
      account_status: userData.account_status || 'active',
      last_login: new Date().toISOString(),
    };

    return createRecord('user_profiles', profileData);
  },

  async updateUserProfile(userId, updateData) {
    const dataToUpdate = {
      display_name: updateData.display_name || updateData.displayName,
      phone_number: updateData.phone_number,
      age: updateData.age,
      gender: updateData.gender,
      language: updateData.language,
      timezone: updateData.timezone,
      avatar_url: updateData.avatar_url,
      notes: updateData.notes,
      is_admin: updateData.is_admin,
      loyalty_points: updateData.loyalty_points,
      account_status: updateData.account_status,
      email_verified: updateData.email_verified,
      phone_verified: updateData.phone_verified,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === undefined) {
        delete dataToUpdate[key];
      }
    });

    return updateRecord('user_profiles', userId, dataToUpdate);
  },

  async completeUserProfile(userId, profileData) {
    const updatedProfileData = {
      display_name: profileData.display_name || profileData.displayName,
      phone_number: profileData.phone_number,
      age: profileData.age,
      gender: profileData.gender,
      language: profileData.language || 'en',
      timezone: profileData.timezone || 'Asia/Riyadh',
      profile_completed: true,
      updated_at: new Date().toISOString(),
    };

    return updateRecord('user_profiles', userId, updatedProfileData);
  },

  // User Health Profile Management
  async getUserHealthProfile(userId) {
    return fetchSingle('user_health_profiles', { field: 'user_id', value: userId });
  },

  async createOrUpdateHealthProfile(userId, healthData) {
  // First ensure user profile exists
  const existingProfile = await this.getUserProfile(userId);
  if (!existingProfile) {
    // Create basic user profile first
    await this.createUserProfile({
      id: userId,
      email: '', // Will be updated later
      display_name: '',
      profile_completed: false
    });
  }

  const healthProfileData = {
    user_id: userId,
    fitness_goal: healthData.fitness_goal,
    height_cm: healthData.height_cm,
    weight_kg: healthData.weight_kg,
    activity_level: healthData.activity_level || 'moderately_active',
    target_calories: healthData.target_calories,
    target_protein: healthData.target_protein,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_health_profiles')
    .upsert(healthProfileData, { onConflict: 'user_id' })
    .select();

  if (error) throw error;
  return data?.[0] || null;
},

  // User Addresses Management
  async getUserAddresses(userId) {
    return fetchList('user_addresses', { field: 'user_id', value: userId });
  },

  async createUserAddress(userId, addressData) {
    const newAddress = {
      user_id: userId,
      label: addressData.label,
      address_line1: addressData.address_line1,
      address_line2: addressData.address_line2,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postal_code,
      country: addressData.country || 'SA',
      is_default: addressData.is_default || false,
      delivery_instructions: addressData.delivery_instructions,
    };

    return createRecord('user_addresses', newAddress);
  },

  async updateUserAddress(addressId, addressData) {
    const updatedAddress = {
      ...addressData,
      updated_at: new Date().toISOString(),
    };

    return updateRecord('user_addresses', addressId, updatedAddress);
  },

  async deleteUserAddress(addressId) {
    return deleteRecord('user_addresses', addressId);
  },

  // User Payment Methods Management
  async getUserPaymentMethods(userId) {
    return fetchList('user_payment_methods', { field: 'user_id', value: userId });
  },

  async createUserPaymentMethod(userId, paymentData) {
    const newPaymentMethod = {
      user_id: userId,
      ...paymentData,
      is_default: paymentData.is_default || false,
      is_verified: paymentData.is_verified || false,
    };

    return createRecord('user_payment_methods', newPaymentMethod);
  },

  async updateUserPaymentMethod(paymentMethodId, paymentData) {
    const updatedPaymentMethod = {
      ...paymentData,
      updated_at: new Date().toISOString(),
    };

    return updateRecord('user_payment_methods', paymentMethodId, updatedPaymentMethod);
  },

  async deleteUserPaymentMethod(paymentMethodId) {
    return deleteRecord('user_payment_methods', paymentMethodId);
  },

 // subscription fetch to use the view
async getUserActiveSubscription(userId) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plans (
        id,
        title,
        title_arabic,
        description,
        description_arabic,
        price_per_meal,
        duration_days,
        kcal,
        protein,
        carb,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
},

  async createUserSubscription(userId, subscriptionData) {
    console.log('Creating subscription for user:', userId, subscriptionData);
    const newSubscription = {
      user_id: userId,
      ...subscriptionData,
      status: subscriptionData.status || 'pending',
      preferred_delivery_time: subscriptionData.preferred_delivery_time || '12:00',
      //delivery_days: subscriptionData.delivery_days || [1, 2, 3, 4, 5],
      auto_renewal: subscriptionData.auto_renewal || false,
      consumed_meals: subscriptionData.consumed_meals || 0,
    };

    return createRecord('user_subscriptions', newSubscription);
  },
  async getSubscriptionOrders(subscriptionId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_meals (
        id,
        meal_id,
        name,
        name_arabic,
        quantity,
        unit_price,
        total_price,
        meals (
          id,
          name,
          name_arabic,
          description,
          description_arabic,
          image_url,
          thumbnail_url,
          calories,
          protein_g,
          carbs_g,
          fat_g
        )
      ),
      order_items (
        id,
        item_id,
        name,
        name_arabic,
        category,
        quantity,
        unit_price,
        total_price
      ),
      user_addresses!delivery_address_id (
        id,
        label,
        address_line1,
        city,
        state
      )
    `)
    .eq('subscription_id', subscriptionId)
    .order('scheduled_delivery_date', { ascending: true });

  if (error) throw error;
  return data || [];
},
async getNextScheduledMeal(subscriptionId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_meals (
        id,
        meal_id,
        name,
        name_arabic,
        quantity,
        unit_price,
        total_price,
        meals (
          id,
          name,
          name_arabic,
          image_url,
          thumbnail_url
        )
      )
    `)
    .eq('subscription_id', subscriptionId)
    .in('status', ['pending', 'confirmed'])
    .order('scheduled_delivery_date', { ascending: true })
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
},
async updateOrder(orderId, orderData) {
  const updatedOrder = {
    ...orderData,
    updated_at: new Date().toISOString(),
  };

  // Remove undefined values
  Object.keys(updatedOrder).forEach(key => {
    if (updatedOrder[key] === undefined) {
      delete updatedOrder[key];
    }
  });

  return updateRecord('orders', orderId, updatedOrder);
},
  async updateUserSubscription(subscriptionId, subscriptionData) {
    const updatedSubscription = {
      ...subscriptionData,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updatedSubscription).forEach(key => {
      if (updatedSubscription[key] === undefined) {
        delete updatedSubscription[key];
      }
    });

    return updateRecord('user_subscriptions', subscriptionId, updatedSubscription);
  },
  async activateOrder(orderId, orderData) {
  const activatedOrder = {
    status: 'confirmed',
    scheduled_delivery_date: orderData.scheduled_delivery_date,
    delivery_time: orderData.delivery_time,
    updated_at: new Date().toISOString(),
  };

  return updateRecord('orders', orderId, activatedOrder);
},

async getOrderItems(orderId) {
  return fetchList('order_items', {
    field: 'order_id',
    value: orderId,
    select: `*,
      items (
        id,
        name,
        name_arabic,
        description,
        category,
        price,
        image_url
      )`
  });
},

async updateOrderItem(orderItemId, itemData) {
  const updatedItem = {
    ...itemData,
    total_price: itemData.unit_price * itemData.quantity, // Ensure total is calculated
  };

  return updateRecord('order_items', orderItemId, updatedItem);
},

// Enhanced subscription methods
async getSubscriptionStats(subscriptionId) {
  // Get total meals count
  const { data: totalMealsData, error: totalError } = await supabase
    .from('orders')
    .select('id')
    .eq('subscription_id', subscriptionId);

  if (totalError) throw totalError;

  // Get consumed meals count
  const { data: consumedMealsData, error: consumedError } = await supabase
    .from('orders')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .eq('status', 'delivered');

  if (consumedError) throw consumedError;

  // Get pending meals
  const { data: pendingMealsData, error: pendingError } = await supabase
    .from('orders')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .in('status', ['pending', 'confirmed', 'preparing', 'out_for_delivery']);

  if (pendingError) throw pendingError;

  return {
    totalMeals: totalMealsData?.length || 0,
    consumedMeals: consumedMealsData?.length || 0,
    pendingMeals: pendingMealsData?.length || 0,
    remainingMeals: (totalMealsData?.length || 0) - (consumedMealsData?.length || 0)
  };
},

async updateDeliverySettings(subscriptionId, deliveryData) {
  // Update subscription delivery preferences
  const subscriptionUpdate = {};
  if (deliveryData.preferred_delivery_time) {
    subscriptionUpdate.preferred_delivery_time = deliveryData.preferred_delivery_time;
  }
  if (deliveryData.delivery_address_id) {
    subscriptionUpdate.delivery_address_id = deliveryData.delivery_address_id;
  }

  if (Object.keys(subscriptionUpdate).length > 0) {
    await this.updateUserSubscription(subscriptionId, subscriptionUpdate);
  }

  // Update pending orders with new delivery settings
  if (deliveryData.updatePendingOrders) {
    const { error } = await supabase
      .from('orders')
      .update({
        delivery_address_id: deliveryData.delivery_address_id,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscriptionId)
      .eq('status', 'pending');

    if (error) throw error;
  }

  return { success: true };
},
async pauseUserSubscription(subscriptionId, pauseReason) {
  return updateRecord('user_subscriptions', subscriptionId, {
    status: 'paused',
    updated_at: new Date().toISOString(),
  });
},

async resumeUserSubscription(subscriptionId) {
  return updateRecord('user_subscriptions', subscriptionId, {
    status: 'active',
    updated_at: new Date().toISOString(),
  });
},
  // User Allergies Management
  async getUserAllergies(userId) {
    return fetchList('user_allergies', {
      field: 'user_id',
      value: userId,
      select: `*,
        allergies (
          id,
          name,
          name_arabic,
          severity_level
        )`
    });
  },

  async addUserAllergy(userId, allergyId, severityLevel) {
    return createRecord('user_allergies', {
      user_id: userId,
      allergy_id: allergyId,
      severity_level: severityLevel,
      created_at: new Date().toISOString(),
    });
  },

  async removeUserAllergy(userId, allergyId) {
    const { error } = await supabase
      .from('user_allergies')
      .delete()
      .eq('user_id', userId)
      .eq('allergy_id', allergyId);

    if (error) throw error;
    return { success: true };
  },

  // User Dietary Preferences Management
  async getUserDietaryPreferences(userId) {
    return fetchList('user_dietary_preferences', {
      field: 'user_id',
      value: userId,
      select: `*,
        dietary_preferences (
          id,
          name,
          name_arabic,
          description
        )`
    });
  },

  async addUserDietaryPreference(userId, preferenceId) {
    return createRecord('user_dietary_preferences', {
      user_id: userId,
      preference_id: preferenceId,
      created_at: new Date().toISOString(),
    });
  },

  async removeUserDietaryPreference(userId, preferenceId) {
    const { error } = await supabase
      .from('user_dietary_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('preference_id', preferenceId);

    if (error) throw error;
    return { success: true };
  },

  // User Favorite Meals Management
  async getUserFavoriteMeals(userId) {
    return fetchList('user_favorite_meals', {
      field: 'user_id',
      value: userId,
      select: `*,
        meals (
          id,
          name,
          name_arabic,
          description,
          description_arabic,
          base_price,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          image_url,
          thumbnail_url,
          rating,
          rating_count,
          is_available
        )`
    });
  },

  async addUserFavoriteMeal(userId, mealId) {
    return createRecord('user_favorite_meals', {
      user_id: userId,
      meal_id: mealId,
      created_at: new Date().toISOString(),
    });
  },

  async removeUserFavoriteMeal(userId, mealId) {
    const { error } = await supabase
      .from('user_favorite_meals')
      .delete()
      .eq('user_id', userId)
      .eq('meal_id', mealId);

    if (error) throw error;
    return { success: true };
  },

  // User Favorite Items Management
  async getUserFavoriteItems(userId) {
    return fetchList('user_favorite_items', {
      field: 'user_id',
      value: userId,
      select: `*,
        items (
          id,
          name,
          name_arabic,
          description,
          description_arabic,
          category,
          price,
          calories,
          protein_g,
          carbs_g,
          fat_g,
          image_url,
          is_available
        )`
    });
  },

  async addUserFavoriteItem(userId, itemId) {
    return createRecord('user_favorite_items', {
      user_id: userId,
      item_id: itemId,
      created_at: new Date().toISOString(),
    });
  },

  async removeUserFavoriteItem(userId, itemId) {
    const { error } = await supabase
      .from('user_favorite_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId);

    if (error) throw error;
    return { success: true };
  },

  // User Reviews Management
  async getUserReviews(userId) {
    return fetchList('meal_reviews', {
      field: 'user_id',
      value: userId,
      select: `*,
        meals (
          id,
          name,
          name_arabic,
          image_url,
          thumbnail_url
        )`
    });
  },

  async createUserReview(userId, reviewData) {
    const newReview = {
      user_id: userId,
      meal_id: reviewData.meal_id,
      order_id: reviewData.order_id,
      rating: reviewData.rating,
      review_text: reviewData.review_text,
      is_published: reviewData.is_published !== false,
    };

    return createRecord('meal_reviews', newReview);
  },

  async updateUserReview(reviewId, reviewData) {
    const updatedReview = {
      rating: reviewData.rating,
      review_text: reviewData.review_text,
      is_published: reviewData.is_published,
      updated_at: new Date().toISOString(),
    };

    return updateRecord('meal_reviews', reviewId, updatedReview);
  },

  async deleteUserReview(reviewId) {
    return deleteRecord('meal_reviews', reviewId);
  },

  // User Orders Management
  async getUserOrders(userId) {
    return fetchList('orders', {
      field: 'user_id',
      value: userId,
      select: `*,
        order_meals (
          id,
          meal_id,
          name,
          quantity,
          unit_price,
          total_price,
          meals (
            id,
            name,
            name_arabic,
            image_url,
            thumbnail_url
          )
        ),
        order_items (
          id,
          item_id,
          name,
          quantity,
          unit_price,
          total_price,
          items (
            id,
            name,
            name_arabic,
            category
          )
        )`
    });
  },

  // Utility Functions
  async ensureUserProfile(supabaseUser) {
    try {
      const userId = supabaseUser.id;
      const email = supabaseUser.email;
      const displayName = supabaseUser.user_metadata?.full_name;
      const googleId = supabaseUser.user_metadata?.provider_id;
      
      // Check if user profile exists
      const existingProfile = await this.getUserProfile(userId);
      
      if (!existingProfile) {
        // Create new profile
        const newProfileData = {
          id: userId,
          email: email,
          displayName: displayName,
          google_id: googleId,
          profile_completed: false,
          email_verified: supabaseUser.email_confirmed_at ? true : false,
          last_login: new Date().toISOString(),
        };
        
        const createdProfile = await this.createUserProfile(newProfileData);
        return createdProfile;
      } else {
        // Update existing profile if needed
        const updates = {};
        if (existingProfile.email !== email) updates.email = email;
        if (existingProfile.display_name !== displayName) updates.display_name = displayName;
        if (existingProfile.google_id !== googleId) updates.google_id = googleId;
        
        // Always update last_login
        updates.last_login = new Date().toISOString();
        
        if (Object.keys(updates).length > 0) {
          const updatedProfile = await this.updateUserProfile(userId, updates);
          return updatedProfile;
        }
        
        return existingProfile;
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      throw error;
    }
  },

  // Admin Functions
  async setAdminStatus(userId, isAdmin) {
    return updateRecord('user_profiles', userId, {
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
    });
  },

  async updateLoyaltyPoints(userId, points) {
    return updateRecord('user_profiles', userId, {
      loyalty_points: points,
      updated_at: new Date().toISOString(),
    });
  },

  // Unified User Data Fetching
  async getCompleteUserData(userId) {
    try {
      const [
        profile,
        health,
        addresses,
        paymentMethods,
        subscriptions,
        allergies,
        dietaryPreferences,
        favoriteMeals,
        favoriteItems,
        reviews,
        orders
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserHealthProfile(userId),
        this.getUserAddresses(userId),
        this.getUserPaymentMethods(userId),
        this.getUserActiveSubscription(userId),
        this.getUserAllergies(userId),
        this.getUserDietaryPreferences(userId),
        this.getUserFavoriteMeals(userId),
        this.getUserFavoriteItems(userId),
        this.getUserReviews(userId),
        this.getUserOrders(userId)
      ]);

      return {
        profile: profile || null,
        health: health || null,
        addresses: addresses || [],
        paymentMethods: paymentMethods || [],
        subscriptions: subscriptions || null,
        allergies: allergies || [],
        dietaryPreferences: dietaryPreferences || [],
        favoriteMeals: favoriteMeals || [],
        favoriteItems: favoriteItems || [],
        reviews: reviews || [],
        orders: orders || []
      };
    } catch (error) {
      console.error('Error fetching complete user data:', error);
      throw error;
    }
  }
};