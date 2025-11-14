import { supabase, handleSupabaseError } from "../../supabaseClient";

export const ordersAPI = {
  // New filtered orders function - excludes pending subscription orders
  async getUserOrdersFiltered(userId = null) {
    try {
      let currentUserId = userId;
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')
        currentUserId = user.id;
      }

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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] getUserOrdersFiltered error:', error);
      handleSupabaseError(error);
    }
  },

  // Get subscription orders (including pending)
  async getSubscriptionOrders(subscriptionId) {
    try {
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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] getSubscriptionOrders error:', error);
      handleSupabaseError(error);
    }
  },

  // Get next scheduled meal
  async getNextScheduledMeal(subscriptionId) {
    try {
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

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] getNextScheduledMeal error:', error);
      handleSupabaseError(error);
    }
  },

  // Activate an order
  async activateOrder(orderId, orderData) {
    try {
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

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] activateOrder error:', error);
      handleSupabaseError(error);
    }
  },
  // getUserOrders
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
        )
      `)
      .eq('user_id', user.id)

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

// getOrderById
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
        user_subscriptions(*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    
    // Optionally fetch address separately if needed
    if (data && data.delivery_address_id) {
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', data.delivery_address_id)
        .single()
      
      if (addressData) {
        data.delivery_address = addressData
      }
    }
    
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
},

async reorderItems(orderId) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

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
        contact_phone: originalOrder.contact_phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (createError) throw createError

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
          customization_notes: meal.customization_notes,
          created_at: new Date().toISOString()
        })))

      if (mealsError) throw mealsError
    }

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
}
,
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
    if (!user && orderData.user_id) throw new Error('User not authenticated')

    // Step 1: Create the main order
    // IMPORTANT: Do NOT include order_number - let the trigger set it
    const orderPayload = {
      user_id: orderData.user_id || null,
      subscription_id: orderData.subscription_id || null,
      delivery_address_id: orderData.delivery_address_id,
      subtotal: orderData.subtotal,
      tax_amount: orderData.tax_amount || 0,
      delivery_fee: orderData.delivery_fee || 0,
      discount_amount: orderData.discount_amount || 0,
      total_amount: orderData.total_amount,
      payment_method: orderData.payment_method || 'cash',
      payment_status: orderData.payment_status || 'pending',
      status: orderData.status || 'pending',
      contact_phone: orderData.contact_phone,
      delivery_instructions: orderData.delivery_instructions || null,
      special_instructions: orderData.special_instructions || null,
      coupon_code: orderData.coupon_code || null,
      loyalty_points_used: orderData.loyalty_points_used || 0,
      loyalty_points_earned: orderData.loyalty_points_earned || 0,
      scheduled_delivery_date: orderData.scheduled_delivery_date || null,
      subscription_meal_index: orderData.subscription_meal_index || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('📦 [ordersAPI] Creating order with payload:', orderPayload);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single()

    if (orderError) {
      console.error('❌ [ordersAPI] Order insert error:', orderError);
      throw orderError;
    }

    console.log('✅ [ordersAPI] Order created:', order.id, 'Order #', order.order_number);

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

      const { data: meals, error: mealsError } = await supabase
        .from('order_meals')
        .insert(orderMealsData)
        .select()

      if (mealsError) {
        console.error('❌ [ordersAPI] Order meals insert error:', mealsError);
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', order.id)
        throw mealsError
      }
      createdOrderMeals = meals
      console.log('✅ [ordersAPI] Order meals created:', createdOrderMeals.length);
    }

    // Step 3: Create order_items if any
    let createdOrderItems = []
    if (orderData.order_items && orderData.order_items.length > 0) {
      const orderItemsData = orderData.order_items.map(item => {
        let order_meal_id = null
        if (item.meal_id) {
          const orderMeal = createdOrderMeals.find(om => om.meal_id === item.meal_id)
          if (orderMeal) order_meal_id = orderMeal.id
        }

        return {
          order_id: order.id,
          order_meal_id: order_meal_id,
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

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData)
        .select()

      if (itemsError) {
        console.error('❌ [ordersAPI] Order items insert error:', itemsError);
        // Rollback: delete order meals and order
        if (createdOrderMeals.length > 0) {
          await supabase.from('order_meals').delete().eq('order_id', order.id)
        }
        await supabase.from('orders').delete().eq('id', order.id)
        throw itemsError
      }
      createdOrderItems = items
      console.log('✅ [ordersAPI] Order items created:', createdOrderItems.length);
    }

    // Step 4: Fetch the complete order with all relations
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_meals(*),
        order_items(*)
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      console.error('❌ [ordersAPI] Fetch complete order error:', fetchError);
      throw fetchError;
    }
    
    console.log('✅ [ordersAPI] Complete order fetched:', completeOrder.order_number);
    return completeOrder

  } catch (error) {
    console.error('❌ [ordersAPI] createCompleteOrder error:', error)
    handleSupabaseError(error)
    throw error
  }
},
  // Update order
  async updateOrder(orderId, updates) {
    try {
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
        const updateData = { ...updates }
        delete updateData.skipAuth
        
        const { data, error } = await supabase
          .from('orders')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('❌ [ordersAPI] updateOrder error:', error)
      handleSupabaseError(error)
    }
  },

  // Cancel order
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

  // Track order
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

  // Process payment
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

  // Refund order
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

  // Get all orders (admin)
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

      if (queryParams.status) query = query.eq('status', queryParams.status)
      if (queryParams.user_id) query = query.eq('user_id', queryParams.user_id)
      if (queryParams.from_date) query = query.gte('created_at', queryParams.from_date)
      if (queryParams.to_date) query = query.lte('created_at', queryParams.to_date)

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update order status (admin)
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

  // Get order items
  async getOrderItems(orderId) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          items (
            id,
            name,
            name_arabic,
            description,
            category,
            price,
            image_url
          )
        `)
        .eq('order_id', orderId)

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update order item
  async updateOrderItem(orderItemId, itemData) {
    try {
      const updatedItem = {
        ...itemData,
        total_price: itemData.unit_price * itemData.quantity,
      }

      const { data, error } = await supabase
        .from('order_items')
        .update(updatedItem)
        .eq('id', orderItemId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // ===== INSTANT ORDER OPERATIONS =====

  /**
   * Create instant order (no user_id, contact_phone required)
   * Used for guest checkout - properly handles junction tables
   */
  async createInstantOrder(orderData) {
    try {
      if (!orderData.contact_phone) {
        throw new Error('Contact phone is required for instant orders');
      }

      // if (orderData.user_id) {
      //   throw new Error('Instant orders cannot have user_id');
      // }

      if (orderData.subscription_id) {
        throw new Error('Instant orders cannot be linked to subscriptions');
      }

      // Validate that we have order_meals or order_items for instant orders
      if ((!orderData.order_meals || orderData.order_meals.length === 0) && 
          (!orderData.order_items || orderData.order_items.length === 0)) {
        throw new Error('Instant orders must contain at least one meal or item');
      }

      const instantOrderData = {
        ...orderData,
        user_id: null,
        subscription_id: null,
        subscription_meal_index: null,
        status: orderData.status || 'pending',
        payment_status: orderData.payment_status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🛒 [ordersAPI] Creating instant order with:', {
        meals: orderData.order_meals?.length || 0,
        items: orderData.order_items?.length || 0
      });

      return await this.createCompleteOrder(instantOrderData);
    } catch (error) {
      console.error('❌ [ordersAPI] createInstantOrder error:', error);
      handleSupabaseError(error);
      throw error;
    }
  },

  /**
   * Create user order (requires user_id, optional subscription)
   * Used for logged-in users
   */
  async createUserOrder(orderData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (orderData.subscription_id && !orderData.subscription_meal_index) {
        throw new Error('Subscription orders require subscription_meal_index');
      }

      const userOrderData = {
        ...orderData,
        user_id: user.id || null,
        contact_phone: orderData.contact_phone || user.phone_number,
        status: orderData.status || 'pending',
        payment_status: orderData.payment_status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return await this.createCompleteOrder(userOrderData);
    } catch (error) {
      console.error('❌ [ordersAPI] createUserOrder error:', error);
      handleSupabaseError(error);
      throw error;
    }
  },

  /**
   * Create order with plan meals integration
   * Fetches meals from plan_meals and creates proper order_meals records
   */
  async createOrderFromPlan(orderData, planId, selectedItems = []) {
    try {
      console.log('🎯 Creating order from plan:', { planId, orderData });

      // 1. Fetch plan meals
      const { data: planMeals, error: planMealsError } = await supabase
        .from('plan_meals')
        .select(`
          id,
          meal_id,
          is_substitutable,
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
            image_url
          )
        `)
        .eq('plan_id', planId);

      if (planMealsError) throw planMealsError;

      if (!planMeals || planMeals.length === 0) {
        throw new Error('No meals found for this plan');
      }

      console.log('📋 Plan meals fetched:', planMeals.length);

      // 2. Create main order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      console.log('✅ Order created:', order.id);

      // 3. Create order_meals from plan_meals
      const orderMealsData = planMeals.map(pm => ({
        order_id: order.id,
        meal_id: pm.meal_id,
        quantity: 1,
        unit_price: pm.meals.base_price,
        total_price: pm.meals.base_price,
        name: pm.meals.name,
        name_arabic: pm.meals.name_arabic,
        description: pm.meals.description,
        calories: pm.meals.calories,
        protein_g: pm.meals.protein_g,
        carbs_g: pm.meals.carbs_g,
        fat_g: pm.meals.fat_g,
        customization_notes: null
      }));

      const { data: createdOrderMeals, error: orderMealsError } = await supabase
        .from('order_meals')
        .insert(orderMealsData)
        .select();

      if (orderMealsError) {
        await supabase.from('orders').delete().eq('id', order.id);
        throw orderMealsError;
      }

      console.log('✅ Order meals created:', createdOrderMeals.length);

      // 4. Create order_items (if any selected items)
      let createdOrderItems = [];
      if (selectedItems && selectedItems.length > 0) {
        const orderItemsData = selectedItems.map(item => {
          const matchingOrderMeal = createdOrderMeals.find(om => 
            om.meal_id === item.meal_id
          );

          return {
            order_id: order.id,
            order_meal_id: matchingOrderMeal?.id || null,
            item_id: item.item_id || item.id,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || item.price || 0,
            total_price: (item.quantity || 1) * (item.unit_price || item.price || 0),
            name: item.name,
            name_arabic: item.name_arabic,
            category: item.category
          };
        });

        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsData)
          .select();

        if (itemsError) {
          await supabase.from('order_meals').delete().eq('order_id', order.id);
          await supabase.from('orders').delete().eq('id', order.id);
          throw itemsError;
        }

        createdOrderItems = items;
        console.log('✅ Order items created:', createdOrderItems.length);
      }

      // 5. Return complete order
      const completeOrder = {
        ...order,
        order_meals: createdOrderMeals,
        order_items: createdOrderItems
      };

      console.log('✅ Complete order created from plan:', completeOrder.id);
      return completeOrder;

    } catch (error) {
      console.error('❌ createOrderFromPlan error:', error);
      throw error;
    }
  },

  // ===== SUBSCRIPTION ORDER BATCH OPERATIONS =====

  /**
   * Create multiple orders for a subscription
   * Called when subscription is created/activated
   */
  async createSubscriptionOrders(subscriptionId, subscriptionData) {
    try {
      console.log('📦 [ordersAPI] Creating subscription orders:', {
        subscriptionId,
        totalMeals: subscriptionData.total_meals
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const orders = [];
      const mealsArray = subscriptionData.meals;

      for (let i = 0; i < mealsArray.length; i++) {
        const mealConfig = mealsArray[i];
        
        const mealItems = Object.entries(mealConfig).map(([itemId, quantity]) => ({
          item_id: parseInt(itemId),
          quantity: quantity
        }));

        // Fetch item details to calculate pricing
        const itemDetails = await Promise.all(
          mealItems.map(mi => this.getItemById(mi.item_id))
        );

        const subtotal = itemDetails.reduce((sum, item, idx) => {
          return sum + (item.price * mealItems[idx].quantity);
        }, 0);

        const tax_amount = subtotal * 0.15;
        const total_amount = subtotal + tax_amount + (subscriptionData.delivery_fee || 0);

        const orderData = {
          user_id: user.id,
          subscription_id: subscriptionId,
          subscription_meal_index: i,
          subtotal: subtotal,
          tax_amount: tax_amount,
          delivery_fee: subscriptionData.delivery_fee || 0,
          discount_amount: 0,
          total_amount: total_amount,
          payment_method: subscriptionData.payment_method || 'card',
          payment_status: 'pending',
          status: 'pending',
          delivery_address_id: subscriptionData.delivery_address_id,
          contact_phone: subscriptionData.contact_phone,
          scheduled_delivery_date: null,
          order_items: itemDetails.map((item, idx) => ({
            item_id: item.id,
            quantity: mealItems[idx].quantity,
            unit_price: item.price,
            total_price: item.price * mealItems[idx].quantity,
            name: item.name,
            name_arabic: item.name_arabic,
            category: item.category
          })),
          order_meals: []
        };

        const createdOrder = await this.createCompleteOrder(orderData);
        orders.push(createdOrder);
      }

      console.log('✅ [ordersAPI] Created subscription orders:', orders.length);
      return orders;
    } catch (error) {
      console.error('❌ [ordersAPI] createSubscriptionOrders error:', error);
      handleSupabaseError(error);
      throw error;
    }
  },

  /**
   * Activate next pending subscription order
   * Sets scheduled_delivery_date and changes status to active
   */
  async activateNextSubscriptionOrder(subscriptionId) {
    try {
      console.log('🔄 [ordersAPI] Activating next subscription order:', subscriptionId);

      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('preferred_delivery_time')
        .eq('id', subscriptionId)
        .single();

      if (subError) throw subError;

      const { data: nextOrder, error: orderError } = await supabase
        .from('orders')
        .select('id, subscription_meal_index')
        .eq('subscription_id', subscriptionId)
        .eq('status', 'pending')
        .order('subscription_meal_index', { ascending: true })
        .limit(1)
        .single();

      if (orderError && orderError.code !== 'PGRST116') throw orderError;
      if (!nextOrder) {
        console.log('ℹ️ No pending orders to activate');
        return null;
      }

      const preferredTime = subscription.preferred_delivery_time || '12:00:00';
      const nextDeliveryDate = new Date();
      const [hours, minutes] = preferredTime.split(':');
      nextDeliveryDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (nextDeliveryDate < new Date()) {
        nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1);
      }

      const activatedOrder = await this.activateOrder(nextOrder.id, {
        scheduled_delivery_date: nextDeliveryDate.toISOString()
      });

      console.log('✅ [ordersAPI] Activated order:', activatedOrder.id);
      return activatedOrder;
    } catch (error) {
      console.error('❌ [ordersAPI] activateNextSubscriptionOrder error:', error);
      handleSupabaseError(error);
      throw error;
    }
  },

  /**
   * Get order type and validate structure
   */
  getOrderType(order) {
    if (order.subscription_id) {
      return {
        type: 'subscription',
        isValid: order.subscription_meal_index !== null && order.user_id !== null
      };
    } else if (order.user_id) {
      return {
        type: 'user',
        isValid: true
      };
    } else {
      return {
        type: 'instant',
        isValid: order.contact_phone !== null
      };
    }
  },

  // Helper function to get item by ID
  async getItemById(itemId) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ [ordersAPI] getItemById error:', error);
      throw error;
    }
  },

  // ===== REAL-TIME SUBSCRIPTIONS =====

  subscribeToSubscriptionOrders(subscriptionId, callback) {
    return supabase
      .channel(`subscription-${subscriptionId}-orders-changes`)
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

  subscribeToOrderItems(orderId, callback) {
    return supabase
      .channel(`order-${orderId}-items-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToOrderMeals(orderId, callback) {
    return supabase
      .channel(`order-${orderId}-meals-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_meals',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe();
  },

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

  // ===== ADMIN & BULK OPERATIONS =====

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

      if (queryParams.status) query = query.eq('status', queryParams.status)
      if (queryParams.from_date) query = query.gte('created_at', queryParams.from_date)
      if (queryParams.to_date) query = query.lte('created_at', queryParams.to_date)

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

  // Bulk update orders with real-time notification
  async bulkUpdateOrdersWithRealtime(orderUpdates, options = {}) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .upsert(orderUpdates.map(update => ({
          ...update,
          updated_at: new Date().toISOString()
        })))
        .select();

      if (error) throw error;
      
      if (options.notifyRealtime && data?.length > 0) {
        data.forEach(order => {
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