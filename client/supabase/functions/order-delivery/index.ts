// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeliveryRequest {
  order_id: string;
  action: 'assign' | 'update_status';
  driver_id?: string;
  status?: string;
  location?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'PATCH') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

    const deliveryData: DeliveryRequest = await req.json();

    if (!deliveryData.order_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'order_id is required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign driver to delivery
    if (deliveryData.action === 'assign') {
      if (!deliveryData.driver_id) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'driver_id is required for assignment'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: updatedOrder, error } = await supabaseClient
        .from('orders')
        .update({
          delivery_driver_id: deliveryData.driver_id,
          status: 'out_for_delivery'
        })
        .eq('id', deliveryData.order_id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Order not found'
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          order: updatedOrder,
          message: 'Driver assigned successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update delivery status
    if (deliveryData.action === 'update_status') {
      if (!deliveryData.status) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'status is required for status update'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updates: any = {
        status: deliveryData.status
      };

      // Note: actual_delivery_date is set by trigger_order_delivery when status = 'delivered'
      // No need to set it here - avoid duplication

      const { data: updatedOrder, error } = await supabaseClient
        .from('orders')
        .update(updates)
        .eq('id', deliveryData.order_id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Order not found'
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          order: updatedOrder,
          message: 'Delivery status updated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid action. Must be "assign" or "update_status"'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error:any) {
    console.error('Error managing delivery:', error);
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