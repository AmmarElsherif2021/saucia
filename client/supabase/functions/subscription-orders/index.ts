// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req:Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const url = new URL(req.url)
    const subscriptionId = url.searchParams.get('subscription_id')
    const action = url.searchParams.get('action')

    if (!subscriptionId) {
      throw new Error('subscription_id is required')
    }

    // GET: Fetch subscription orders or next meal
    if (req.method === 'GET') {
      if (action === 'next_meal') {
        // getNextScheduledMeal
        const { data: nextMeal, error } = await supabaseClient
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
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return new Response(
          JSON.stringify({ success: true, next_meal: nextMeal || null }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Default: getSubscriptionOrders (including pending)
      const { data: orders, error } = await supabaseClient
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
        .order('subscription_meal_index', { ascending: true })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, orders: orders || [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // PATCH: Activate order or activate next
    if (req.method === 'PATCH') {
      const body = await req.json()

      // Activate next subscription order
      if (body.activate_next) {
        // Get subscription preferred delivery time
        const { data: subscription, error: subError } = await supabaseClient
          .from('user_subscriptions')
          .select('preferred_delivery_time')
          .eq('id', subscriptionId)
          .single()

        if (subError) throw subError

        // Find next pending order
        const { data: nextOrder, error: orderError } = await supabaseClient
          .from('orders')
          .select('id, subscription_meal_index')
          .eq('subscription_id', subscriptionId)
          .eq('status', 'pending')
          .order('subscription_meal_index', { ascending: true })
          .limit(1)
          .single()

        if (orderError && orderError.code !== 'PGRST116') throw orderError
        if (!nextOrder) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              order: null, 
              message: 'No pending orders to activate' 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Calculate next delivery date
        const preferredTime = subscription.preferred_delivery_time || '12:00:00'
        const [hours, minutes] = preferredTime.split(':')
        const nextDeliveryDate = new Date()
        nextDeliveryDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        if (nextDeliveryDate < new Date()) {
          nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 1)
        }

        // Activate the order
        const { data: activatedOrder, error: activateError } = await supabaseClient
          .from('orders')
          .update({
            status: 'active',
            scheduled_delivery_date: nextDeliveryDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', nextOrder.id)
          .select()
          .single()

        if (activateError) throw activateError

        return new Response(
          JSON.stringify({ success: true, order: activatedOrder }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Activate specific order
      if (body.order_id && body.scheduled_delivery_date) {
        const { data: order, error } = await supabaseClient
          .from('orders')
          .update({
            status: 'active',
            scheduled_delivery_date: body.scheduled_delivery_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.order_id)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, order }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      throw new Error('Invalid PATCH request body')
    }

    throw new Error(`Method ${req.method} not allowed`)

  } catch (error:any) {
    console.error('Error in subscription-orders:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})