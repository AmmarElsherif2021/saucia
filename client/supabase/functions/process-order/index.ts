// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderMeal {
  meal_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  name: string;
  name_arabic?: string;
  description?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  customization_notes?: string;
}

interface OrderItem {
  item_id: number;
  meal_id?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  name: string;
  name_arabic?: string;
  category?: string;
}

interface ProcessOrderRequest {
  user_id?: string | null;
  subscription_id?: string | null;
  subscription_meal_index?: number | null;
  delivery_address_id: string;
  contact_phone: string;
  subtotal: number;
  tax_amount: number;
  delivery_fee: number;
  discount_amount?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  status?: string;
  delivery_instructions?: string;
  special_instructions?: string;
  coupon_code?: string;
  loyalty_points_used?: number;
  loyalty_points_earned?: number;
  scheduled_delivery_date?: string;
  order_meals?: OrderMeal[];
  order_items?: OrderItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const orderData: ProcessOrderRequest = await req.json();

    // Validate order type
    const isInstantOrder = !orderData.user_id && !orderData.subscription_id;
    const isSubscriptionOrder = orderData.subscription_id !== null;

    // Validation
    if (isInstantOrder && !orderData.contact_phone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Contact phone is required for instant orders'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (isSubscriptionOrder && orderData.subscription_meal_index === null) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Subscription meal index required for subscription orders'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((!orderData.order_meals || orderData.order_meals.length === 0) && 
        (!orderData.order_items || orderData.order_items.length === 0)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Order must contain at least one meal or item'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Create main order
    const orderPayload = {
      user_id: orderData.user_id || null,
      subscription_id: orderData.subscription_id || null,
      subscription_meal_index: orderData.subscription_meal_index || null,
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
      created_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (orderError) throw orderError;

    // Step 2: Create order_meals
    let createdOrderMeals = [];
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
      }));

      const { data: meals, error: mealsError } = await supabaseClient
        .from('order_meals')
        .insert(orderMealsData)
        .select();

      if (mealsError) {
        await supabaseClient.from('orders').delete().eq('id', order.id);
        throw mealsError;
      }
      createdOrderMeals = meals;
    }

    // Step 3: Create order_items
    let createdOrderItems = [];
    if (orderData.order_items && orderData.order_items.length > 0) {
      const orderItemsData = orderData.order_items.map(item => {
        let order_meal_id = null;
        if (item.meal_id) {
          const orderMeal = createdOrderMeals.find((om: any) => om.meal_id === item.meal_id);
          if (orderMeal) order_meal_id = orderMeal.id;
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
        };
      });

      const { data: items, error: itemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItemsData)
        .select();

      if (itemsError) {
        if (createdOrderMeals.length > 0) {
          await supabaseClient.from('order_meals').delete().eq('order_id', order.id);
        }
        await supabaseClient.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }
      createdOrderItems = items;
    }

    // Step 4: Fetch complete order with relations
    const { data: completeOrder, error: fetchError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_meals(*),
        order_items(*)
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) throw fetchError;

    return new Response(
      JSON.stringify({
        success: true,
        order: completeOrder,
        message: `Order ${completeOrder.order_number} created successfully`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error:any) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});