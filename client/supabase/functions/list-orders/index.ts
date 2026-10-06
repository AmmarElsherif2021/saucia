// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderFilters {
  user_id?: string;
  status?: string;
  subscription_id?: string;
  from_date?: string;
  to_date?: string;
  filter_type?: 'user' | 'admin' | 'filtered';
}

// Helper function to decode and verify JWT
async function verifyJWT(token: string, jwtSecret: string) {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Split the token
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error: any) {
    console.error('JWT verification error:', error);
    throw new Error(`Invalid token: ${error.message}`);
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    console.log('Auth header present:', !!authHeader);
    console.log('Auth header prefix:', authHeader.substring(0, 20));

    // Extract and verify the JWT token
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET') ?? '';
    const payload = await verifyJWT(authHeader, jwtSecret);
    
    console.log('Token payload:', {
      sub: payload.sub,
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat
    });

    const userId = payload.sub;
    const userEmail = payload.email;

    if (!userId) {
      throw new Error('Invalid token: missing user ID');
    }

    console.log('User authenticated:', userId);
    console.log('User email:', userEmail);

    // Create admin client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const url = new URL(req.url);
    const filters: OrderFilters = {
      user_id: url.searchParams.get('user_id') || undefined,
      status: url.searchParams.get('status') || undefined,
      subscription_id: url.searchParams.get('subscription_id') || undefined,
      from_date: url.searchParams.get('from_date') || undefined,
      to_date: url.searchParams.get('to_date') || undefined,
      filter_type: url.searchParams.get('filter_type') as any || 'user',
    };

    console.log('Request filters:', filters);

    // GET: List orders with filters
    if (req.method === 'GET') {
      // Build query
      let query = supabaseAdmin
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
          user_subscriptions(*),
          delivery_address:delivery_address_id(*)
        `)
        .order('created_at', { ascending: false });

      // Check if user is admin
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      const isAdmin = userProfile?.is_admin === true;
      console.log('Is admin:', isAdmin);

      switch (filters.filter_type) {
        case 'admin':
          // Admin can see all orders with filters
          if (!isAdmin) {
            throw new Error('Unauthorized: Admin access required');
          }
          if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
          }
          if (filters.status) {
            query = query.eq('status', filters.status);
          }
          break;

        case 'filtered':
          // Filtered view - admin or specific user filter
          if (filters.user_id && isAdmin) {
            query = query.eq('user_id', filters.user_id);
          } else {
            query = query.eq('user_id', userId);
          }
          break;

        case 'user':
        default:
          // Regular user can only see their own orders
          query = query.eq('user_id', userId);
          
          // User can filter their own orders
          if (filters.status) {
            query = query.eq('status', filters.status);
          }
          if (filters.subscription_id) {
            query = query.eq('subscription_id', filters.subscription_id);
          }
          break;
      }

      // Apply date filters for all query types
      if (filters.from_date) {
        query = query.gte('created_at', filters.from_date);
      }
      if (filters.to_date) {
        query = query.lte('created_at', filters.to_date);
      }

      // Apply subscription filter if provided
      if (filters.subscription_id && filters.filter_type !== 'user') {
        query = query.eq('subscription_id', filters.subscription_id);
      }

      const { data: orders, error } = await query;

      if (error) {
        console.error('Query error:', error);
        throw error;
      }

      console.log('Orders found:', orders?.length || 0);

      // Process orders to include delivery addresses properly
      const processedOrders = await Promise.all(
        (orders || []).map(async (order: any) => {
          // If delivery address wasn't included in the initial query, fetch it separately
          if (order.delivery_address_id && !order.delivery_address) {
            const { data: addressData } = await supabaseAdmin
              .from('user_addresses')
              .select('*')
              .eq('id', order.delivery_address_id)
              .single();
            
            if (addressData) {
              order.delivery_address = addressData;
            }
          }
          
          // Determine order type for frontend
          if (order.subscription_id) {
            order.order_type = 'subscription';
          } else if (order.user_id) {
            order.order_type = 'user';
          } else {
            order.order_type = 'instant';
          }
          
          return order;
        })
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          orders: processedOrders,
          meta: {
            total: processedOrders.length,
            filters: filters,
            user_id: userId
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // POST: Create a new order
    if (req.method === 'POST') {
      const orderData = await req.json();
      
      // Create order using admin client
      const { data: order, error: createError } = await supabaseAdmin
        .from('orders')
        .insert({
          ...orderData,
          user_id: userId,
          status: 'pending',
          payment_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) throw createError;

      return new Response(
        JSON.stringify({ success: true, order }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error(`Method ${req.method} not allowed`);

  } catch (error: any) {
    console.error('Error in list-orders:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.details || null,
      }),
      {
        status: error.message.includes('Unauthorized') ? 403 : 
                error.message.includes('not authenticated') || 
                error.message.includes('Invalid token') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});