import { supabase,handleSupabaseError } from "../../supabaseClient";

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

  async createOrder(orderData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  async updateOrder(orderId, updates) {
    try {
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
    } catch (error) {
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
  }
};