// models/Order.js
import { supabase, supabaseAdmin } from '../supabase.js'

export class Order {
  static tableName = 'orders'

  static serialize(orderData) {
    if (!orderData) return null
    
    return {
      id: orderData.id,
      userId: orderData.user_id || null,
      subscriptionId: orderData.subscription_id || null,
      orderNumber: orderData.order_number || '',
      subtotal: Number(orderData.subtotal) || 0,
      tax: Number(orderData.tax_amount) || 0,
      discount: Number(orderData.discount_amount) || 0,
      deliveryFee: Number(orderData.delivery_fee) || 0,
      totalPrice: Number(orderData.total_amount) || 0,
      status: orderData.status || 'pending',
      paymentStatus: orderData.payment_status || 'pending',
      paymentMethod: orderData.payment_method || null,
      paymentId: orderData.payment_reference || '',
      paymentDate: orderData.paid_at || null,
      deliveryAddressId: orderData.delivery_address_id || null,
      deliveryInstructions: orderData.delivery_instructions || '',
      deliveryDate: orderData.scheduled_delivery_date || null,
      contactPhone: orderData.contact_phone || '',
      notes: orderData.special_instructions || '',
      couponCode: orderData.coupon_code || '',
      loyaltyPointsUsed: Number(orderData.loyalty_points_used) || 0,
      loyaltyPointsEarned: Number(orderData.loyalty_points_earned) || 0,
      createdAt: orderData.created_at,
      updatedAt: orderData.updated_at,
    }
  }

  static async create(orderData) {
    try {
      const newOrder = {
        user_id: orderData.userId || null,
        subscription_id: orderData.subscriptionId || null,
        subtotal: Number(orderData.subtotal) || 0,
        tax_amount: Number(orderData.tax) || 0,
        discount_amount: Number(orderData.discount) || 0,
        delivery_fee: Number(orderData.deliveryFee) || 0,
        total_amount: Number(orderData.totalPrice) || 0,
        status: orderData.status || 'pending',
        payment_status: orderData.paymentStatus || 'pending',
        payment_method: orderData.paymentMethod || null,
        payment_reference: orderData.paymentId || '',
        paid_at: orderData.paymentDate || null,
        delivery_address_id: orderData.deliveryAddressId || null,
        delivery_instructions: orderData.deliveryInstructions || '',
        scheduled_delivery_date: orderData.deliveryDate || null,
        contact_phone: orderData.contactPhone || '',
        special_instructions: orderData.notes || '',
        coupon_code: orderData.couponCode || '',
        loyalty_points_used: Number(orderData.loyaltyPointsUsed) || 0,
        loyalty_points_earned: Number(orderData.loyaltyPointsEarned) || 0,
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .insert(newOrder)
        .select('*')
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }
  // Add these methods to the Order class

static async getAll() {
  try {
    const { data, error } = await supabaseAdmin
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(this.serialize) : [];
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
}

static async delete(id) {
  try {
    const { error } = await supabaseAdmin
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, id };
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}
  static async getByUser(userId) {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data.map(this.serialize)
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  static async getById(orderId) {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) return null
      return this.serialize(data)
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  static async update(orderId, updateData) {
    try {
      const dbData = {
        status: updateData.status,
        payment_status: updateData.paymentStatus,
        payment_method: updateData.paymentMethod,
        payment_reference: updateData.paymentId,
        paid_at: updateData.paymentDate,
        delivery_address_id: updateData.deliveryAddressId,
        delivery_instructions: updateData.deliveryInstructions,
        scheduled_delivery_date: updateData.deliveryDate,
        contact_phone: updateData.contactPhone,
        special_instructions: updateData.notes,
      }

      const { data, error } = await supabaseAdmin
        .from(this.tableName)
        .update(dbData)
        .eq('id', orderId)
        .select('*')
        .single()

      if (error) throw error
      return this.serialize(data)
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }
}