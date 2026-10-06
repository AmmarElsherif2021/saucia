// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderUpdate {
  status?: string
  payment_status?: string
  payment_method?: string
  special_instructions?: string
  delivery_instructions?: string
  scheduled_delivery_date?: string
  actual_delivery_date?: string
  delivery_driver_id?: string
  skipAuth?: boolean
  [key: string]: any
}

serve(async (req: Request) => {
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

    const url = new URL(req.url)
    const orderId = url.searchParams.get('order_id')

    if (!orderId) {
      throw new Error('order_id is required')
    }

    // GET: Fetch single order
    if (req.method === 'GET') {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data: order, error } = await supabaseClient
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error

      // Fetch address separately if needed
      if (order && order.delivery_address_id) {
        const { data: addressData } = await supabaseClient
          .from('addresses')
          .select('*')
          .eq('id', order.delivery_address_id)
          .single()

        if (addressData) {
          order.delivery_address = addressData
        }
      }

      return new Response(
        JSON.stringify({ success: true, order }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // PATCH: Update order
    if (req.method === 'PATCH') {
      const updates: OrderUpdate = await req.json()

      let query = supabaseClient
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      // Apply user filter unless skipAuth is specified
      if (!updates.skipAuth && user) {
        query = query.eq('user_id', user.id)
      }

      // Remove skipAuth before updating
      if (updates.skipAuth) {
        delete updates.skipAuth
      }

      const { data: order, error } = await query.select().single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, order }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // DELETE: Delete order
    if (req.method === 'DELETE') {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabaseClient
        .from('orders')
        .delete()
        .eq('id', orderId)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Order deleted successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    throw new Error(`Method ${req.method} not allowed`)

  } catch (error: any) {
    console.error('Error in manage-order:', error)
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