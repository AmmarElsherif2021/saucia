import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only accept WebSocket upgrades
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 400, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  
  if (!token) {
    return new Response('Missing token', { status: 401, headers: corsHeaders })
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Verify user
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return new Response('Invalid token', { status: 401, headers: corsHeaders })
  }

  // Determine room and role
  const isAdmin = user.app_metadata?.role === 'admin'
  const roomId = isAdmin ? url.searchParams.get('roomId') || user.id : user.id

  // Upgrade to WebSocket
  const { socket, response } = Deno.upgradeWebSocket(req)

  // Load message history
  socket.addEventListener('open', async () => {
    try {
      const { data: messages } = await supabase
        .from('user_messages')
        .select('*')
        .eq('user_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)

      socket.send(JSON.stringify({
        type: 'history',
        messages: messages || []
      }))
    } catch (err) {
      console.error('Error loading history:', err)
    }
  })

  // Handle incoming messages
  socket.addEventListener('message', async (event) => {
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'message' && data.content?.trim()) {
        // Save to database
        const { data: message, error } = await supabase
          .from('user_messages')
          .insert({
            user_id: roomId,
            admin_id: isAdmin ? user.id : null,
            content: data.content.trim(),
            sender_type: isAdmin ? 'admin' : 'user'
          })
          .select()
          .single()

        if (!error && message) {
          // Echo back to sender
          socket.send(JSON.stringify({
            type: 'message',
            message
          }))
        } else {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Failed to send message'
          }))
        }
      } 
      else if (data.type === 'read') {
        // Mark admin messages as read
        await supabase
          .from('user_messages')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('user_id', roomId)
          .eq('sender_type', 'admin')
          .eq('is_read', false)
      }
    } catch (err) {
      console.error('Message error:', err)
    }
  })

  socket.addEventListener('close', () => {
    console.log(`User ${user.id} disconnected from room ${roomId}`)
  })

  socket.addEventListener('error', (err) => {
    console.error('WebSocket error:', err)
  })

  return response
})