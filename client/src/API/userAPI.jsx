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
      .select()
      .single();

    if (error) throw error;
    return data;
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

  // User Subscriptions Management
  async getUserActiveSubscription(userId) {
    return fetchSingle('user_subscriptions', {
    field: 'user_id',
    value: userId,
    select: `*,
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
      )`,
    orderBy: 'created_at' 
  });
  },

  async createUserSubscription(userId, subscriptionData) {
    const newSubscription = {
      user_id: userId,
      ...subscriptionData,
      status: subscriptionData.status || 'pending',
      preferred_delivery_time: subscriptionData.preferred_delivery_time || '12:00',
      delivery_days: subscriptionData.delivery_days || [1, 2, 3, 4, 5],
      auto_renewal: subscriptionData.auto_renewal || false,
      consumed_meals: subscriptionData.consumed_meals || 0,
      
    };

    return createRecord('user_subscriptions', newSubscription);
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

  async pauseUserSubscription(subscriptionId, pauseReason) {
    return updateRecord('user_subscriptions', subscriptionId, {
      is_paused: true,
      paused_at: new Date().toISOString(),
      pause_reason: pauseReason,
      updated_at: new Date().toISOString(),
    });
  },

  async resumeUserSubscription(subscriptionId, resumeDate) {
    return updateRecord('user_subscriptions', subscriptionId, {
      is_paused: false,
      paused_at: null,
      pause_reason: null,
      resume_date: resumeDate,
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
        //console.log('Created new user profile for:', userId);
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
          //console.log('Updated user profile for:', userId);
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
      };
    } catch (error) {
      console.error('Error fetching complete user data:', error);
      throw error;
    }
  }
};
// user_allergies.created_at