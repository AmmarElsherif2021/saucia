import { createClient } from 'jsr:@supabase/supabase-js@2'

// Enhanced CORS headers for WebSocket
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

/**
 * Support Chat WebSocket Handler
 * 
 * IMPORTANT: Ensure your Supabase project has WebSocket support enabled
 * in the Edge Functions settings.
 */
Deno.serve(async (req) => {
  console.log('[Request] Method:', req.method, 'URL:', req.url)
  
  const url = new URL(req.url)
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Preflight request')
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  // Log all headers for debugging
  console.log('[Headers] Upgrade:', req.headers.get('upgrade'))
  console.log('[Headers] Connection:', req.headers.get('connection'))
  
  // Verify WebSocket upgrade request
  const upgrade = req.headers.get('upgrade') || ''
  const connection = req.headers.get('connection') || ''
  
  if (upgrade.toLowerCase() !== 'websocket') {
    console.error('[Error] Not a WebSocket request. Upgrade:', upgrade)
    return new Response(
      JSON.stringify({ 
        error: 'Expected WebSocket connection',
        received_upgrade: upgrade,
        help: 'Ensure client is sending Upgrade: websocket header'
      }), 
      { 
        status: 426,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Upgrade': 'websocket',
          'Connection': 'Upgrade'
        }
      }
    )
  }

  try {
    // Extract token
    const token = url.searchParams.get('token')
    
    if (!token) {
      console.error('[Auth] Missing token')
      return new Response(
        JSON.stringify({ error: 'Missing authentication token' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Auth] Token received, validating...')

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[Error] Missing environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('[Auth] Validation failed:', authError?.message)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid authentication token',
          details: authError?.message 
        }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('[Auth] ✓ User authenticated:', user.id)

    // Determine room and role
    const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.is_admin === true
    const roomId = isAdmin ? (url.searchParams.get('roomId') || user.id) : user.id

    console.log('[Chat] Room:', roomId, 'Role:', isAdmin ? 'Admin' : 'User')

    // Upgrade to WebSocket
    let socket: WebSocket
    let response: Response
    
    try {
      const upgrade = Deno.upgradeWebSocket(req)
      socket = upgrade.socket
      response = upgrade.response
      console.log('[WebSocket] ✓ Upgrade successful')
    } catch (upgradeError) {
      console.error('[WebSocket] Upgrade failed:', upgradeError)
      return new Response(
        JSON.stringify({ 
          error: 'WebSocket upgrade failed',
          details: (upgradeError as Error)?.message 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Connection opened
    socket.onopen = async () => {
      console.log('[WebSocket] ✓ Connected - User:', user.id, 'Room:', roomId)
      
      try {
        // Load message history
        const { data: messages, error: loadError } = await supabase
          .from('user_messages')
          .select('*')
          .eq('user_id', roomId)
          .order('created_at', { ascending: true })
          .limit(100)

        if (loadError) {
          console.error('[DB] Load error:', loadError.message)
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Failed to load message history'
          }))
        } else {
          console.log(`[Chat] ✓ Loaded ${messages?.length || 0} messages`)
          socket.send(JSON.stringify({
            type: 'history',
            messages: messages || []
          }))
        }
      } catch (err) {
        console.error('[Error] onopen exception:', err)
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to initialize chat'
        }))
      }
    }

    // Incoming messages
    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[Message] Type:', data.type, 'From:', isAdmin ? 'admin' : 'user')
        
        if (data.type === 'message' && data.content?.trim()) {
          const { data: message, error: insertError } = await supabase
            .from('user_messages')
            .insert({
              user_id: roomId,
              admin_id: isAdmin ? user.id : null,
              content: data.content.trim(),
              sender_type: isAdmin ? 'admin' : 'user'
            })
            .select()
            .single()

          if (insertError) {
            console.error('[DB] Insert error:', insertError.message)
            socket.send(JSON.stringify({
              type: 'error',
              message: 'Failed to send message'
            }))
          } else {
            console.log('[Chat] ✓ Message saved:', message.id)
            socket.send(JSON.stringify({
              type: 'message',
              message
            }))
          }
        } 
        else if (data.type === 'read') {
          const { error: updateError } = await supabase
            .from('user_messages')
            .update({ 
              is_read: true, 
              read_at: new Date().toISOString() 
            })
            .eq('user_id', roomId)
            .eq('sender_type', 'admin')
            .is('is_read', false)

          if (updateError) {
            console.error('[DB] Mark read error:', updateError.message)
          } else {
            console.log('[Chat] ✓ Messages marked as read')
          }
        }
        else if (data.type === 'ping') {
          // Heartbeat
          socket.send(JSON.stringify({ type: 'pong' }))
        }
      } catch (err) {
        console.error('[Error] Message processing:', err)
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }))
      }
    }

    socket.onclose = (event) => {
      console.log('[WebSocket] ✗ Closed - Code:', event.code, 'Reason:', event.reason || '(none)')
    }

    socket.onerror = (err) => {
      console.error('[WebSocket] ✗ Error:', err)
    }

    return response

  } catch (err) {
    console.error('[Fatal] Connection failed:', err)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: (err as Error)?.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})