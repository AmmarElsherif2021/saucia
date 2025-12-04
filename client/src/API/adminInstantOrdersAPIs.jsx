import { supabase } from "../../supabaseClient";

/**
 * Dedicated API module for Instant Orders Management
 * Handles all CRUD operations and real-time subscriptions for orders without subscription_id
 */

// ===== REALTIME SUBSCRIPTION CHANNEL =====

/**
 * Subscribe to real-time changes on orders table
 * @param {Function} callback - Called when orders change
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToInstantOrders = (callback) => {
  console.log('🔴 [Realtime] Setting up instant orders subscription');

  const channel = supabase
    .channel('instant-orders-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'orders',
        filter: 'subscription_id=is.null' // Only instant orders
      },
      (payload) => {
        console.log('📡 [Realtime] Order change detected:', payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      console.log('🔴 [Realtime] Subscription status:', status);
    });

  return {
    unsubscribe: () => {
      console.log('🔴 [Realtime] Unsubscribing from instant orders');
      supabase.removeChannel(channel);
    }
  };
};

// ===== QUERY OPERATIONS =====

/**
 * Get all instant orders with comprehensive filtering
 * @param {Object} options - Query options
 */
export const getAllInstantOrders = async (options = {}) => {
  console.log('📡 [API] Fetching instant orders with options:', options);
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      user_profiles!orders_user_id_fkey(
        id, 
        display_name, 
        email, 
        phone_number
      ),
      user_addresses!orders_delivery_address_id_fkey(
        id, 
        label,
        address_line1, 
        address_line2, 
        city,
        state,
        postal_code,
        country,
        delivery_instructions
      ),
      order_meals(
        id, 
        meal_id, 
        name, 
        name_arabic, 
        quantity, 
        unit_price, 
        total_price, 
        calories, 
        protein_g, 
        carbs_g, 
        fat_g, 
        customization_notes
      ),
      order_items(
        id, 
        item_id, 
        name, 
        name_arabic, 
        category, 
        quantity, 
        unit_price, 
        total_price
      )
    `)
    .is('subscription_id', null); // CRITICAL: Only instant orders

  // Apply filters
  if (options.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options.paymentStatus && options.paymentStatus !== 'all') {
    query = query.eq('payment_status', options.paymentStatus);
  }

  if (options.startDate && options.endDate) {
    query = query
      .gte('scheduled_delivery_date', options.startDate)
      .lte('scheduled_delivery_date', options.endDate);
  }

  // Search functionality - order number or phone
  if (options.searchQuery) {
    const searchTerm = options.searchQuery.trim();
    // If numeric, search order number
    if (!isNaN(searchTerm)) {
      query = query.eq('order_number', parseInt(searchTerm));
    } else {
      // Otherwise search phone
      query = query.ilike('contact_phone', `%${searchTerm}%`);
    }
  }

  // Sorting
  query = query.order(
    options.orderBy || 'scheduled_delivery_date', 
    { ascending: options.ascending !== undefined ? options.ascending : true }
  );

  // Limit
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('❌ [API] Error fetching instant orders:', error);
    throw error;
  }

  console.log('✅ [API] Fetched', data?.length, 'instant orders');
  return data || [];
};

/**
 * Get single instant order details
 */
export const getInstantOrderDetails = async (orderId) => {
  console.log('🔍 [API] Fetching order details:', orderId);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      user_profiles!orders_user_id_fkey(
        id, 
        display_name, 
        email, 
        phone_number
      ),
      user_addresses!orders_delivery_address_id_fkey(
        id, 
        label,
        address_line1, 
        address_line2, 
        city,
        state,
        postal_code,
        country,
        delivery_instructions
      ),
      order_meals(
        id, 
        meal_id, 
        name, 
        name_arabic, 
        quantity, 
        unit_price, 
        total_price, 
        calories, 
        protein_g, 
        carbs_g, 
        fat_g, 
        customization_notes
      ),
      order_items(
        id, 
        item_id, 
        name, 
        name_arabic, 
        category, 
        quantity, 
        unit_price, 
        total_price
      )
    `)
    .eq('id', orderId)
    .is('subscription_id', null)
    .single();

  if (error) {
    console.error('❌ [API] Error fetching order details:', error);
    throw error;
  }

  console.log('✅ [API] Order details fetched');
  return data;
};

/**
 * Get instant order statistics
 */
export const getInstantOrderStats = async () => {
  console.log('📊 [API] Fetching instant order statistics');

  try {
    // Parallel queries for all stats
    const [
      totalResult,
      pendingResult,
      confirmedResult,
      preparingResult,
      outForDeliveryResult,
      deliveredResult,
      cancelledResult,
      revenueResult,
      pendingRevenueResult
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .is('subscription_id', null),
      
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .is('subscription_id', null)
        .eq('status', 'pending'),
      
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .is('subscription_id', null)
        .eq('status', 'confirmed'),
      
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .is('subscription_id', null)
        .eq('status', 'preparing'),
      
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .is('subscription_id', null)
        .eq('status', 'out_for_delivery'),
      
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .is('subscription_id', null)
        .eq('status', 'delivered'),
      
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .is('subscription_id', null)
        .eq('status', 'cancelled'),
      
      supabase
        .from('orders')
        .select('total_amount')
        .is('subscription_id', null)
        .eq('payment_status', 'paid'),
      
      supabase
        .from('orders')
        .select('total_amount')
        .is('subscription_id', null)
        .eq('payment_status', 'pending')
    ]);

    // Calculate revenue totals
    const totalRevenue = revenueResult.data?.reduce(
      (sum, order) => sum + parseFloat(order.total_amount || 0), 
      0
    ) || 0;

    const pendingRevenue = pendingRevenueResult.data?.reduce(
      (sum, order) => sum + parseFloat(order.total_amount || 0), 
      0
    ) || 0;

    const stats = {
      total: totalResult.count || 0,
      pending: pendingResult.count || 0,
      confirmed: confirmedResult.count || 0,
      preparing: preparingResult.count || 0,
      out_for_delivery: outForDeliveryResult.count || 0,
      delivered: deliveredResult.count || 0,
      cancelled: cancelledResult.count || 0,
      totalRevenue,
      pendingRevenue
    };

    console.log('✅ [API] Stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('❌ [API] Error fetching stats:', error);
    throw error;
  }
};

// ===== MUTATION OPERATIONS =====

/**
 * Update instant order status
 */
export const updateInstantOrderStatus = async (orderId, newStatus, notes = '') => {
  console.log(`🔄 [API] Updating order ${orderId} status to:`, newStatus);

  const updateData = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  // Add cancellation/special notes
  if (notes) {
    updateData.special_instructions = notes;
  }

//   // Add status-specific timestamps
//   const now = new Date().toISOString();
//   switch (newStatus) {
//     case 'confirmed':
//       updateData.confirmed_at = now;
//       break;
//     case 'preparing':
//       updateData.preparing_at = now;
//       break;
//     case 'out_for_delivery':
//       updateData.dispatched_at = now;
//       break;
//     case 'delivered':
//       updateData.delivered_at = now;
//       break;
//     case 'cancelled':
//       updateData.cancelled_at = now;
//       break;
//   }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .is('subscription_id', null)
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error updating order status:', error);
    throw error;
  }

  console.log('✅ [API] Order status updated');
  return data;
};

/**
 * Update instant order delivery date
 */
export const updateInstantOrderDeliveryDate = async (orderId, newDate) => {
  console.log(`📅 [API] Updating delivery date for order ${orderId}`);

  const { data, error } = await supabase
    .from('orders')
    .update({
      scheduled_delivery_date: newDate,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .is('subscription_id', null)
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error updating delivery date:', error);
    throw error;
  }

  console.log('✅ [API] Delivery date updated');
  return data;
};

/**
 * Update instant order payment status
 */
export const updateInstantOrderPaymentStatus = async (orderId, paymentStatus) => {
  console.log(`💳 [API] Updating payment status for order ${orderId}`);

  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .is('subscription_id', null)
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error updating payment status:', error);
    throw error;
  }

  console.log('✅ [API] Payment status updated');
  return data;
};

/**
 * Bulk update instant order statuses
 */
export const bulkUpdateInstantOrderStatus = async (orderIds, newStatus) => {
  console.log('📦 [API] Bulk updating orders:', orderIds.length);

  const updateData = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  // Add status-specific timestamp for bulk updates
  const now = new Date().toISOString();
//   switch (newStatus) {
//     case 'confirmed':
//       updateData.confirmed_at = now;
//       break;
//     case 'preparing':
//       updateData.preparing_at = now;
//       break;
//     case 'out_for_delivery':
//       updateData.dispatched_at = now;
//       break;
//     case 'delivered':
//       updateData.delivered_at = now;
//       break;
//     case 'cancelled':
//       updateData.cancelled_at = now;
//       break;
//   }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .in('id', orderIds)
    .is('subscription_id', null)
    .select();

  if (error) {
    console.error('❌ [API] Bulk update error:', error);
    throw error;
  }

  console.log('✅ [API] Bulk update completed:', data?.length);
  return { success: true, updatedCount: data?.length || 0, data };
};

/**
 * Delete/Cancel instant order
 */
export const deleteInstantOrder = async (orderId) => {
  console.log(`🗑️ [API] Deleting order ${orderId}`);

  // Don't actually delete, just mark as cancelled
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .is('subscription_id', null)
    .select()
    .single();

  if (error) {
    console.error('❌ [API] Error deleting order:', error);
    throw error;
  }

  console.log('✅ [API] Order marked as cancelled');
  return data;
};