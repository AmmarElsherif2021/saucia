import { supabase } from "../../supabaseClient";
import { userAPI } from "./userAPI";

// ===== GENERIC DB HELPERS =====
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

  if (query?.field && query?.value !== undefined) {
    request = request.eq(query.field, query.value);
  }

  if (query?.filters) {
    query.filters.forEach(filter => {
      if (filter.value !== undefined) {
        request = request.eq(filter.field, filter.value);
      }
    });
  }

  if (query?.orderBy) {
    request = request.order(query.orderBy, { ascending: query.ascending !== false });
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

// ===== MAIN ADMIN SUBSCRIPTION API =====
export const adminSubscriptionAPI = {
  // ===== SUBSCRIPTION MANAGEMENT =====
  
  // Get all subscriptions with enhanced filtering
  async getAllSubscriptions(options = {}) {
    try {
      const query = {
        select: `
          id,
          user_id,
          plan_id,
          status,
          start_date,
          end_date,
          price_per_meal,
          total_meals,
          consumed_meals,
          delivery_address_id,
          preferred_delivery_time,
          auto_renewal,
          payment_method_id,
          meals,
          created_at,
          updated_at,
          user_profiles!inner(id, display_name, email),
          plans!inner(id, title, title_arabic)
        `,
        orderBy: options.orderBy || 'created_at',
        ascending: options.ascending || false,
        limit: options.limit || 50
      };

      // Apply filters
      if (options.status) {
        query.filters = [{ field: 'status', value: options.status }];
      }

      if (options.user_id) {
        if (query.filters) {
          query.filters.push({ field: 'user_id', value: options.user_id });
        } else {
          query.filters = [{ field: 'user_id', value: options.user_id }];
        }
      }

      return await fetchList('user_subscriptions', query);
    } catch (error) {
      console.error('Failed to get all subscriptions:', error);
      throw error;
    }
  },

  // Get subscription details with all related data including orders
  async getSubscriptionDetails(subscriptionId) {
    try {
      const subscription = await fetchSingle('user_subscriptions', {
        field: 'id',
        value: subscriptionId,
        select: `
          *,
          user_profiles!inner(id, display_name, email, phone_number),
          plans!inner(id, title, title_arabic, description),
          user_addresses!delivery_address_id(*)
        `
      });

      if (!subscription) return null;

      // Get meal details from the meals jsonb array
      let mealsDetails = [];
      if (subscription.meals && Array.isArray(subscription.meals)) {
        const { data: meals, error } = await supabase
          .from('meals')
          .select('id, name, name_arabic, image_url, calories, protein, price')
          .in('id', subscription.meals);
        
        if (!error) {
          mealsDetails = meals;
        }
      }

      // Get ALL related orders (both pending and completed)
      const orders = await fetchList('orders', {
        field: 'subscription_id',
        value: subscriptionId,
        select: `
          id, order_number, status, payment_status, total_amount, 
          scheduled_delivery_date, actual_delivery_date, 
          subscription_meal_index, delivery_instructions,
          special_instructions, created_at
        `,
        orderBy: 'subscription_meal_index',
        ascending: true
      });

      // Separate pending and completed orders
      const pendingOrders = orders.filter(order => 
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      );
      const completedOrders = orders.filter(order => 
        ['delivered', 'completed'].includes(order.status)
      );
      const failedOrders = orders.filter(order => 
        ['failed', 'cancelled'].includes(order.status)
      );

      return {
        ...subscription,
        mealsDetails,
        orders,
        pendingOrders,
        completedOrders,
        failedOrders,
        remainingMeals: subscription.total_meals - subscription.consumed_meals,
        progressPercentage: Math.round((subscription.consumed_meals / subscription.total_meals) * 100),
        nextDeliveryOrder: pendingOrders.length > 0 ? pendingOrders[0] : null
      };
    } catch (error) {
      console.error('Failed to get subscription details:', error);
      throw error;
    }
  },
  // Add this method to userAPI.jsx

async getSubscriptionSummary(subscriptionId) {
  try {
    console.log('📊 Fetching subscription summary for:', subscriptionId);
    
    // Fetch subscription with plan details
    const { data: subscription, error: subError } = await supabase
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
      .eq('id', subscriptionId)
      .single();

    if (subError) {
      console.error('❌ Error fetching subscription:', subError);
      throw subError;
    }

    if (!subscription) {
      console.log('⚠️ No subscription found with ID:', subscriptionId);
      return null;
    }

    console.log('✅ Subscription fetched:', {
      id: subscription.id,
      status: subscription.status,
      hasMeals: !!subscription.meals,
      mealsType: typeof subscription.meals,
      mealsIsArray: Array.isArray(subscription.meals),
      mealsLength: subscription.meals?.length
    });

    // Get subscription stats
    const stats = await userAPI.getSubscriptionStats(subscriptionId);
    
    console.log('✅ Subscription stats:', stats);

    // Get next order
    const { data: nextOrder, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status, scheduled_delivery_date, subscription_meal_index')
      .eq('subscription_id', subscriptionId)
      .in('status', ['pending', 'active', 'confirmed'])
      .order('subscription_meal_index', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (orderError) {
      console.error('❌ Error fetching next order:', orderError);
    }

    console.log('📦 Next order:', nextOrder);

    return {
      subscription,
      stats,
      nextOrder: nextOrder || null
    };
  } catch (error) {
    console.error('❌ getSubscriptionSummary error:', error);
    throw error;
  }
},
  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      // Validate required fields
      const requiredFields = ['user_id', 'plan_id', 'start_date', 'price_per_meal', 'total_meals', 'meals'];
      for (const field of requiredFields) {
        if (!subscriptionData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate meals array
      if (!Array.isArray(subscriptionData.meals) || subscriptionData.meals.length === 0) {
        throw new Error('Meals must be a non-empty array');
      }

      if (subscriptionData.meals.length !== subscriptionData.total_meals) {
        throw new Error('Number of meals must match total_meals count');
      }

      const newSubscription = {
        ...subscriptionData,
        consumed_meals: 0,
        status: subscriptionData.status || 'pending',
        auto_renewal: subscriptionData.auto_renewal || false,
        preferred_delivery_time: subscriptionData.preferred_delivery_time || '12:00:00',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return await createRecord('user_subscriptions', newSubscription);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId, updateData) {
    try {
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      return await updateRecord('user_subscriptions', subscriptionId, dataToUpdate);
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  },

  // Update subscription status with validation
  async updateSubscriptionStatus(subscriptionId, status) {
    try {
      const validStatuses = ['pending', 'active', 'paused', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const updateData = {
        status: status,
        updated_at: new Date().toISOString()
      };

      // Handle status-specific logic
      if (status === 'completed' || status === 'cancelled') {
        updateData.end_date = new Date().toISOString().split('T')[0];
      }

      return await updateRecord('user_subscriptions', subscriptionId, updateData);
    } catch (error) {
      console.error('Failed to update subscription status:', error);
      throw error;
    }
  },

  // Get subscription analytics with corrected queries
  async getSubscriptionAnalytics() {
    try {
      const [
        totalResult,
        activeResult,
        completedResult,
        cancelledResult,
        pendingResult,
        pausedResult
      ] = await Promise.all([
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'paused')
      ]);

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        completed: completedResult.count || 0,
        cancelled: cancelledResult.count || 0,
        pending: pendingResult.count || 0,
        paused: pausedResult.count || 0
      };
    } catch (error) {
      console.error('Failed to get subscription analytics:', error);
      throw error;
    }
  },

  // Get upcoming deliveries with corrected syntax
  async getUpcomingDeliveries(daysAhead = 7) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, status, scheduled_delivery_date,
          total_amount, delivery_instructions, subscription_meal_index,
          user_subscriptions!inner(
            id, user_id,
            user_profiles!inner(id, display_name, email, phone_number),
            addresses!delivery_address_id(
              id, address_line1, address_line2, city
            )
          )
        `)
        .not('subscription_id', 'is', null)
        .not('scheduled_delivery_date', 'is', null)
        .lte('scheduled_delivery_date', endDate.toISOString())
        .gte('scheduled_delivery_date', new Date().toISOString())
        .in('status', ['pending', 'confirmed', 'preparing'])
        .order('scheduled_delivery_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get upcoming deliveries:', error);
      // Return empty array instead of throwing to prevent component crashes
      return [];
    }
  },

  // Get delivery statistics with corrected queries
  async getDeliveryStats() {
    try {
      const [
        totalResult,
        completedResult,
        failedResult,
        cancelledResult,
        pendingResult
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).not('subscription_id', 'is', null),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'delivered').not('subscription_id', 'is', null),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'failed').not('subscription_id', 'is', null),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'cancelled').not('subscription_id', 'is', null),
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']).not('subscription_id', 'is', null)
      ]);

      const total = totalResult.count || 0;
      const completed = completedResult.count || 0;
      const failed = failedResult.count || 0;
      const cancelled = cancelledResult.count || 0;
      const pending = pendingResult.count || 0;

      return {
        total,
        completed,
        failed,
        cancelled,
        pending,
        successRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '0.00',
        failureRate: total > 0 ? ((failed / total) * 100).toFixed(2) : '0.00'
      };
    } catch (error) {
      console.error('Failed to get delivery stats:', error);
      // Return default stats instead of throwing
      return {
        total: 0,
        completed: 0,
        failed: 0,
        cancelled: 0,
        pending: 0,
        successRate: '0.00',
        failureRate: '0.00'
      };
    }
  },

  // Get subscriptions requiring attention
  async getSubscriptionsNeedingAttention(threshold = 2) {
    try {
      // Get subscriptions with low remaining meals
      const { data: lowMealSubs, error: lowMealError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          user_profiles!inner(id, display_name, email),
          plans!inner(id, title, title_arabic)
        `)
        .eq('status', 'active')
        .lt('total_meals', `consumed_meals + ${threshold}`)
        .order('total_meals', { ascending: true });

      if (lowMealError) throw lowMealError;

      // Get pending subscriptions awaiting activation
      const { data: pendingSubs, error: pendingError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          user_profiles!inner(id, display_name, email),
          plans!inner(id, title, title_arabic)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (pendingError) throw pendingError;

      return {
        lowRemainingMeals: lowMealSubs || [],
        pendingActivation: pendingSubs || [],
        total: (lowMealSubs?.length || 0) + (pendingSubs?.length || 0)
      };
    } catch (error) {
      console.error('Failed to get subscriptions needing attention:', error);
      return {
        lowRemainingMeals: [],
        pendingActivation: [],
        total: 0
      };
    }
  },

  // Simple order status update
  async updateOrderStatus(orderId, status) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  },
  // Add this function to the adminSubscriptionAPI object
// Get all orders from subscriptions
// Get all orders from subscriptions with order items
async getSubscriptionOrders(options = {}) {
  try {
    let request = supabase
      .from('orders')
      .select(`
        id, order_number, status, payment_status, total_amount, 
        scheduled_delivery_date, actual_delivery_date, 
        subscription_meal_index, delivery_instructions,
        special_instructions, created_at,
        order_items (*),
        user_subscriptions!inner(
          id, user_id,
          user_profiles!inner(id, display_name, email, phone_number),
          addresses!inner(
            id, address_line1, address_line2, city
          )
        )
      `)
      .not('subscription_id', 'is', null);

    if (options.status) {
      request = request.eq('status', options.status);
    }

    if (options.orderBy) {
      request = request.order(options.orderBy, { ascending: options.ascending !== false });
    }

    if (options.limit) {
      request = request.limit(options.limit);
    }

    const { data, error } = await request;
    if (error) throw error;
    
    // Debugging: Log order items
    //console.log('Subscription orders with items:', data?.map(order => ({
    //   id: order.id,
    //   order_number: order.order_number,
    //   items_count: order.order_items?.length || 0
    // })));
    
    return data || [];
  } catch (error) {
    console.error('Failed to get subscription orders:', error);
    return [];
  }
},
 subscribeToSubscriptions(callback) {
    return supabase
      .channel('admin-subscriptions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions'
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to specific subscription changes
  subscribeToSubscription(subscriptionId, callback) {
    return supabase
      .channel(`subscription-${subscriptionId}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `id=eq.${subscriptionId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to subscription orders changes
  subscribeToSubscriptionOrders(subscriptionId, callback) {
    return supabase
      .channel(`subscription-orders-${subscriptionId}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `subscription_id=eq.${subscriptionId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to all orders changes (admin view)
  subscribeToAllOrders(callback) {
    return supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to upcoming deliveries
  subscribeToUpcomingDeliveries(callback) {
    return supabase
      .channel('upcoming-deliveries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: 'status=in.(pending,confirmed,preparing)'
        },
        callback
      )
      .subscribe();
  },

  // Get real-time connection status
  async getRealtimeStatus() {
    try {
      const channel = supabase.channel('status-check');
      return new Promise((resolve) => {
        channel
          .on('system', { event: 'connected' }, () => resolve({ connected: true }))
          .on('system', { event: 'disconnected' }, () => resolve({ connected: false }))
          .subscribe();
        
        // Cleanup after check
        setTimeout(() => channel.unsubscribe(), 1000);
      });
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

};