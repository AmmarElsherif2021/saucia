import { supabase, handleSupabaseError } from "../../supabaseClient";

export const ordersAPI = {
  // User endpoints - require user authentication
  async getUserOrders(queryParams = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_meals(
            *,
            meals(name, image_url)
          ),
          order_items(
            *,
            items(name, image_url)
          ),
          user_addresses(*)
        `)
        .eq('user_id', user.id)

      // Apply filters
      if (queryParams.status) {
        query = query.eq('status', queryParams.status)
      }
      if (queryParams.from_date) {
        query = query.gte('created_at', queryParams.from_date)
      }
      if (queryParams.to_date) {
        query = query.lte('created_at', queryParams.to_date)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // New filtered orders function - excludes pending subscription orders
  async getUserOrdersFiltered(userId = null) {
    try {
      let currentUserId = userId;
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')
        currentUserId = user.id;
      }

      console.log('📡 [ordersAPI] Fetching filtered orders for user:', currentUserId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          subtotal,
          tax_amount,
          delivery_fee,
          discount_amount,
          subscription_id,
          subscription_meal_index,
          scheduled_delivery_date,
          actual_delivery_date,
          created_at,
          updated_at,
          order_meals (
            id,
            meal_id,
            quantity,
            unit_price,
            total_price,
            name,
            name_arabic,
            description,
            calories,
            protein_g,
            carbs_g,
            fat_g,
            customization_notes
          ),
          order_items (
            id,
            item_id,
            quantity,
            unit_price,
            total_price,
            name,
            name_arabic,
            category
          )
        `)
        .eq('user_id', currentUserId)
        .or('subscription_id.is.null,and(subscription_id.not.is.null,status.neq.pending)')
        .order('scheduled_delivery_date', { ascending: true });

      if (error) {
        console.error('❌ [ordersAPI] Error fetching filtered orders:', error);
        throw error;
      }

      console.log('✅ [ordersAPI] Filtered orders fetched successfully:', data?.length);
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] getUserOrdersFiltered error:', error);
      handleSupabaseError(error);
    }
  },

  // Get subscription orders (including pending)
  async getSubscriptionOrders(subscriptionId) {
    try {
      console.log('📡 [ordersAPI] Fetching subscription orders for:', subscriptionId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          total_amount,
          subtotal,
          tax_amount,
          delivery_fee,
          discount_amount,
          subscription_id,
          subscription_meal_index,
          scheduled_delivery_date,
          actual_delivery_date,
          created_at,
          updated_at,
          order_meals (
            id,
            meal_id,
            quantity,
            unit_price,
            total_price,
            name,
            name_arabic,
            description,
            calories,
            protein_g,
            carbs_g,
            fat_g
          ),
          order_items (
            id,
            item_id,
            quantity,
            unit_price,
            total_price,
            name,
            name_arabic,
            category
          )
        `)
        .eq('subscription_id', subscriptionId)
        .order('subscription_meal_index', { ascending: true });

      if (error) {
        console.error('❌ [ordersAPI] Error fetching subscription orders:', error);
        throw error;
      }

      console.log('✅ [ordersAPI] Subscription orders fetched successfully:', data?.length);
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] getSubscriptionOrders error:', error);
      handleSupabaseError(error);
    }
  },

  // Get next scheduled meal
  async getNextScheduledMeal(subscriptionId) {
    try {
      console.log('📡 [ordersAPI] Fetching next scheduled meal for subscription:', subscriptionId);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          subscription_meal_index,
          scheduled_delivery_date,
          actual_delivery_date,
          created_at
        `)
        .eq('subscription_id', subscriptionId)
        .in('status', ['active', 'confirmed', 'preparing'])
        .order('scheduled_delivery_date', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [ordersAPI] Error fetching next meal:', error);
        throw error;
      }

      console.log('✅ [ordersAPI] Next scheduled meal:', data);
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] getNextScheduledMeal error:', error);
      handleSupabaseError(error);
    }
  },

  // Activate an order
  async activateOrder(orderId, orderData) {
    try {
      console.log('📡 [ordersAPI] Activating order:', orderId, orderData);
      
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'active',
          scheduled_delivery_date: orderData.scheduled_delivery_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('❌ [ordersAPI] Error activating order:', error);
        throw error;
      }

      console.log('✅ [ordersAPI] Order activated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] activateOrder error:', error);
      handleSupabaseError(error);
    }
  },

  async getOrderById(orderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_meals(
            *,
            meals(name, image_url)
          ),
          order_items(
            *,
            items(name, image_url)
          ),
          user_addresses(*),
          user_subscriptions(*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },


/** ========================================================
 * Create a complete order with meals and items
 * Handles the correct insertion order due to FK constraints
 * 
 * @param {Object} orderData - Complete order data from cart
 * @returns {Object} Created order with all related data
 * ==========================================================
 */
async createCompleteOrder(orderData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    console.log('📦 [ordersAPI] Creating complete order:', orderData)

    // Step 1: Create the main order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: user.id,
        delivery_address_id: orderData.delivery_address_id,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        delivery_fee: orderData.delivery_fee,
        discount_amount: orderData.discount_amount || 0,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status || 'pending',
        status: orderData.status || 'pending',
        contact_phone: orderData.contact_phone,
        delivery_instructions: orderData.delivery_instructions,
        special_instructions: orderData.special_instructions,
        coupon_code: orderData.coupon_code,
        loyalty_points_used: orderData.loyalty_points_used || 0,
        loyalty_points_earned: orderData.loyalty_points_earned || 0,
        scheduled_delivery_date: orderData.scheduled_delivery_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (orderError) {
      console.error('❌ [ordersAPI] Order creation failed:', orderError)
      throw orderError
    }

    console.log('✅ [ordersAPI] Order created with ID:', order.id)

    // Step 2: Create order_meals if any
    let createdOrderMeals = []
    if (orderData.order_meals && orderData.order_meals.length > 0) {
      const orderMealsData = orderData.order_meals.map(meal => ({
        order_id: order.id,
        meal_id: meal.meal_id,
        quantity: meal.quantity,
        unit_price: meal.unit_price,
        total_price: meal.total_price,
        name: meal.name,
        name_arabic: meal.name_arabic,
        description: meal.description,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        customization_notes: meal.customization_notes,
        created_at: new Date().toISOString()
      }))

      console.log('🍽️ [ordersAPI] Inserting order_meals:', orderMealsData.length)

      const { data: meals, error: mealsError } = await supabase
        .from('order_meals')
        .insert(orderMealsData)
        .select()

      if (mealsError) {
        console.error('❌ [ordersAPI] Order meals creation failed:', mealsError)
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', order.id)
        throw mealsError
      }

      createdOrderMeals = meals
      console.log('✅ [ordersAPI] Created order_meals:', createdOrderMeals.length)
    }

    // Step 3: Create order_items if any
    let createdOrderItems = []
    if (orderData.order_items && orderData.order_items.length > 0) {
      // Map order_items to include order_meal_id where applicable
      const orderItemsData = orderData.order_items.map(item => {
        // If item has meal_id (it's an addon), find the corresponding order_meal_id
        let order_meal_id = null
        if (item.meal_id) {
          const orderMeal = createdOrderMeals.find(om => om.meal_id === item.meal_id)
          if (orderMeal) {
            order_meal_id = orderMeal.id
          }
        }

        return {
          order_id: order.id,
          order_meal_id: order_meal_id, // Will be null for standalone items
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          name: item.name,
          name_arabic: item.name_arabic,
          category: item.category,
          created_at: new Date().toISOString()
        }
      })

      console.log('🥗 [ordersAPI] Inserting order_items:', orderItemsData.length)

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)
        .select()

      if (itemsError) {
        console.error('❌ [ordersAPI] Order items creation failed:', itemsError)
        // Rollback: delete order_meals and order
        if (createdOrderMeals.length > 0) {
          await supabase.from('order_meals').delete().eq('order_id', order.id)
        }
        await supabase.from('orders').delete().eq('id', order.id)
        throw itemsError
      }

      createdOrderItems = items
      console.log('✅ [ordersAPI] Created order_items:', createdOrderItems.length)
    }

    // Step 4: Fetch the complete order with all relations
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_meals(*),
        order_items(*),
        user_addresses(*)
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      console.error('❌ [ordersAPI] Failed to fetch complete order:', fetchError)
      // Don't rollback here, order was created successfully
      throw fetchError
    }

    console.log('✅ [ordersAPI] Complete order created successfully:', completeOrder.id)
    return completeOrder

  } catch (error) {
    console.error('❌ [ordersAPI] createCompleteOrder error:', error)
    handleSupabaseError(error)
    throw error
  }
},

  async updateOrder(orderId, updates) {
    try {
      // Check if user authentication is needed (for user-specific updates)
      if (!updates.skipAuth) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')
        
        const { data, error } = await supabase
          .from('orders')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Admin or system update without user restriction
        console.log('📡 [ordersAPI] Updating order:', orderId, updates);
        
        const updateData = { ...updates };
        delete updateData.skipAuth; // Remove the skipAuth flag
        
        const { data, error } = await supabase
          .from('orders')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          console.error('❌ [ordersAPI] Error updating order:', error);
          throw error;
        }

        console.log('✅ [ordersAPI] Order updated successfully:', data);
        return data;
      }
    } catch (error) {
      console.error('❌ [ordersAPI] updateOrder error:', error);
      handleSupabaseError(error)
    }
  },

  async cancelOrder(orderId, reason = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          special_instructions: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async trackOrder(orderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .select('id, status, scheduled_delivery_date, actual_delivery_date, delivery_driver_id')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async reorderItems(orderId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Get original order details
      const { data: originalOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_meals(*),
          order_items(*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      // Create new order with same items
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          delivery_address_id: originalOrder.delivery_address_id,
          subtotal: originalOrder.subtotal,
          tax_amount: originalOrder.tax_amount,
          delivery_fee: originalOrder.delivery_fee,
          total_amount: originalOrder.total_amount,
          payment_method: originalOrder.payment_method,
          special_instructions: originalOrder.special_instructions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (createError) throw createError

      // Copy order meals
      if (originalOrder.order_meals?.length > 0) {
        const { error: mealsError } = await supabase
          .from('order_meals')
          .insert(originalOrder.order_meals.map(meal => ({
            order_id: newOrder.id,
            meal_id: meal.meal_id,
            name: meal.name,
            quantity: meal.quantity,
            unit_price: meal.unit_price,
            total_price: meal.total_price,
            special_instructions: meal.special_instructions,
            created_at: new Date().toISOString()
          })))

        if (mealsError) throw mealsError
      }

      // Copy order items
      if (originalOrder.order_items?.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(originalOrder.order_items.map(item => ({
            order_id: newOrder.id,
            item_id: item.item_id,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            created_at: new Date().toISOString()
          })))

        if (itemsError) throw itemsError
      }

      return newOrder
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Payment methods would typically integrate with external payment providers
  async processPayment(orderId, paymentData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_reference: paymentData.reference,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async refundOrder(orderId, refundData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'refunded',
          status: 'refunded',
          special_instructions: refundData.reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Admin endpoints - require admin authentication
  async getAllOrders(queryParams = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          user_profiles(display_name, email, phone_number),
          order_meals(
            *,
            meals(name)
          ),
          order_items(
            *,
            items(name)
          )
        `)

      // Apply filters
      if (queryParams.status) {
        query = query.eq('status', queryParams.status)
      }
      if (queryParams.user_id) {
        query = query.eq('user_id', queryParams.user_id)
      }
      if (queryParams.from_date) {
        query = query.gte('created_at', queryParams.from_date)
      }
      if (queryParams.to_date) {
        query = query.lte('created_at', queryParams.to_date)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: status,
          special_instructions: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async deleteOrder(orderId) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async getOrderAnalytics(timeframe = '30d') {
    try {
      const { data, error } = await supabase
        .rpc('get_order_analytics', { timeframe_param: timeframe })

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async exportOrders(filters = {}) {
    try {
      const { data, error } = await supabase
        .rpc('export_orders', { filters_param: filters })

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async bulkUpdateOrders(updates) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .upsert(updates.map(order => ({
          ...order,
          updated_at: new Date().toISOString()
        })))
        .select()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async getOrdersByUser(userId, queryParams = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_meals(
            *,
            meals(name)
          ),
          order_items(
            *,
            items(name)
          )
        `)
        .eq('user_id', userId)

      // Apply filters
      if (queryParams.status) {
        query = query.eq('status', queryParams.status)
      }
      if (queryParams.from_date) {
        query = query.gte('created_at', queryParams.from_date)
      }
      if (queryParams.to_date) {
        query = query.lte('created_at', queryParams.to_date)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Delivery management
  async assignDelivery(orderId, deliveryData) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          delivery_driver_id: deliveryData.driver_id,
          status: 'out_for_delivery',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async updateDeliveryStatus(orderId, status, location = null) {
    try {
      const updates = {
        status: status,
        updated_at: new Date().toISOString()
      }

      if (status === 'delivered') {
        updates.actual_delivery_date = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },
   // ===== REAL-TIME OPERATIONS =====
  
  // Subscribe to user orders changes
  subscribeToUserOrders(userId, callback) {
    return supabase
      .channel(`user-${userId}-orders-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to specific order changes
  subscribeToOrder(orderId, callback) {
    return supabase
      .channel(`order-${orderId}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to subscription orders for a user
  subscribeToUserSubscriptionOrders(userId, callback) {
    return supabase
      .channel(`user-${userId}-subscription-orders`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}.and.subscription_id.not.is.null`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to order status changes
  subscribeToOrderStatusChanges(statuses, callback) {
    const statusFilter = statuses.map(s => `status=eq.${s}`).join(',');
    return supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: statusFilter
        },
        callback
      )
      .subscribe();
  },

  // Bulk update orders with real-time notification
  async bulkUpdateOrdersWithRealtime(orderUpdates, options = {}) {
    try {
      console.log('📡 [ordersAPI] Bulk updating orders:', orderUpdates.length);
      
      const { data, error } = await supabase
        .from('orders')
        .upsert(orderUpdates.map(update => ({
          ...update,
          updated_at: new Date().toISOString()
        })))
        .select();

      if (error) {
        console.error('❌ [ordersAPI] Bulk update error:', error);
        throw error;
      }

      console.log('✅ [ordersAPI] Bulk update successful:', data?.length);
      
      // Notify real-time subscribers if enabled
      if (options.notifyRealtime && data?.length > 0) {
        data.forEach(order => {
          // This would trigger the postgres_changes event automatically
          console.log('🔔 [ordersAPI] Real-time update triggered for order:', order.id);
        });
      }

      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] bulkUpdateOrdersWithRealtime error:', error);
      throw error;
    }
  }
};