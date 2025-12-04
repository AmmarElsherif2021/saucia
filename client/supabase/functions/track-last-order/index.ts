// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient, PostgrestError } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderFilters {
  user_id?: string;
  subscription_id?: string;
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
      subscription_id: url.searchParams.get('subscription_id') || undefined,
      filter_type: url.searchParams.get('filter_type') as any || 'user',
    };

    console.log('Request filters:', filters);

    // GET: Fetch last order
    if (req.method === 'GET') {
      // Check if user is admin
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      const isAdmin = userProfile?.is_admin === true;
      console.log('Is admin:', isAdmin);

      // Determine which user's last order to fetch
      let targetUserId: string;

      switch (filters.filter_type) {
        case 'admin':
          // Admin can see any user's last order
          if (!isAdmin) {
            throw new Error('Unauthorized: Admin access required');
          }
          if (!filters.user_id) {
            throw new Error('user_id is required for admin filter_type');
          }
          targetUserId = filters.user_id;
          break;

        case 'filtered':
          // Filtered view - admin can specify user, otherwise own orders
          if (filters.user_id && isAdmin) {
            targetUserId = filters.user_id;
          } else {
            targetUserId = userId;
          }
          break;

        case 'user':
        default:
          // Regular user can only see their own last order
          targetUserId = userId;
          break;
      }

      console.log('Fetching last order for user:', targetUserId);

      // Query for the most recent order
      const { data: lastOrder, error } = await supabaseAdmin
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
        .eq('user_id', targetUserId)
        .eq('subscription_id', filters.subscription_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // If no orders found, return empty result instead of error
        if (error.code === 'PGRST116') {
          console.log('No orders found for user:', targetUserId);
          return new Response(
            JSON.stringify({ 
              success: false, 
              orders: [],
              meta: {
                total: 0,
                filters: filters,
                user_id: targetUserId,
                message: `Some error occured fetching last order for user ${targetUserId} ${error.message}`
              }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
            //JSON.stringify(error)
          );
        }
        
        console.error('Query error:', error);
        throw error;
      }

      console.log('Last order found:', lastOrder?.id);

      // Process order to include delivery address
      if (lastOrder.delivery_address_id && !lastOrder.delivery_address) {
        const { data: addressData } = await supabaseAdmin
          .from('user_addresses')
          .select('*')
          .eq('id', lastOrder.delivery_address_id)
          .single();
        
        if (addressData) {
          lastOrder.delivery_address = addressData;
        }
      }
      
      // Determine order type
      if (lastOrder.subscription_id) {
        lastOrder.order_type = 'subscription';
      } else if (lastOrder.user_id) {
        lastOrder.order_type = 'user';
      } else {
        lastOrder.order_type = 'instant';
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          orders: [lastOrder], // Return as array for consistency with your hook
          meta: {
            total: 1,
            filters: filters,
            user_id: targetUserId
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    throw new Error(`Method ${req.method} not allowed`);

  } catch (error: any) {
    console.error('Error in track-last-order:', error);
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