// useSupportChat.jsx - FIXED VERSION
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../../supabaseClient";

export function useSupportChat({ adminMode = false, targetUserId = null } = {}) {
  // ===================== STATE =====================
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // ===================== REFS =====================
  const channelRef = useRef(null);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const lastHeartbeatRef = useRef(Date.now());
  const connectionIdRef = useRef(0);
  const initializationRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const adminIdRef = useRef(null);
  const roomIdRef = useRef(null);
  const adminModeRef = useRef(adminMode);

  // ===================== CONSTANTS =====================
  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RETRY_DELAY = 2000;
  const HEARTBEAT_INTERVAL = 30000;
  const HEARTBEAT_TIMEOUT = 90000;
  const MESSAGE_LIMIT = 100;

  // ===================== HELPER FUNCTIONS =====================
  const getRetryDelay = (attempt) => {
    return Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt), 30000);
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      
      setTimeout(() => audioContext.close(), 300);
    } catch (error) {
      console.log('🔇 [Sound] Notification sound error:', error);
    }
  };

  // ===================== CORE FUNCTIONS =====================

  /** Loads message history for the room - FIXED: Clear previous messages first */
  const loadMessages = useCallback(async (roomId) => {
    if (!roomId || !mountedRef.current) {
      console.log('⚠️ [History] Skipping load - invalid state', { roomId, mounted: mountedRef.current });
      return;
    }
    
    try {
      console.log(`📜 [History] Loading messages for room: ${roomId}`);
      
      // Clear existing messages before loading new ones
      setMessages([]);
      
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .eq('user_id', roomId)  // Always use roomId (which is user_id in user mode, targetUserId in admin mode)
        .order('created_at', { ascending: true })
        .limit(MESSAGE_LIMIT);

      if (error) throw error;

      if (!mountedRef.current) {
        console.log('⚠️ [History] Component unmounted during load');
        return;
      }

      const messages = data || [];
      
      // Set messages
      setMessages(messages);
      
      // Calculate unread count based on the current mode
      let unread = 0;
      const targetSenderType = adminModeRef.current ? 'user' : 'admin';
      
      messages.forEach(msg => {
        if (msg.sender_type === targetSenderType && !msg.is_read) {
          unread++;
        }
      });
      
      if (messages.length > 0) {
        lastMessageIdRef.current = messages[messages.length - 1].id;
      }
      
      setUnreadCount(unread);
      setConnectionAttempts(0);
      
      console.log(`✅ [History] Loaded ${messages.length} messages, ${unread} unread for room ${roomId}`);
    } catch (error) {
      console.error('❌ [History] Load failed:', error);
      
      if (mountedRef.current && connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = getRetryDelay(connectionAttempts);
        console.log(`🔄 [History] Retrying in ${delay}ms (attempt ${connectionAttempts + 1})`);
        
        loadTimeoutRef.current = setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
          loadMessages(roomId);
        }, delay);
      }
    }
  }, [connectionAttempts]);

  /** Cleans up channel, timeouts, and intervals */
  const cleanupChannel = useCallback(() => {
    console.log('🧹 [Cleanup] Starting channel cleanup');
    
    if (channelRef.current) {
      console.log(`🧹 [Cleanup] Removing channel (connection #${connectionIdRef.current})`);
      try {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.warn('⚠️ [Cleanup] Error removing channel:', error);
      }
      channelRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      console.log('🧹 [Cleanup] Clearing reconnect timeout');
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      console.log('🧹 [Cleanup] Clearing heartbeat interval');
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    console.log('✅ [Cleanup] Channel cleanup complete');
  }, []);

  /** Checks if connection is stale based on last heartbeat */
  const checkConnectionHealth = useCallback(() => {
    const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
    
    if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT) {
      console.warn(`💔 [Health] Connection stale (${timeSinceLastHeartbeat}ms since last heartbeat)`);
      return false;
    }
    return true;
  }, []);

  // ===================== MESSAGE FUNCTIONS =====================

  /** Sends a new message to the room - FIXED: Always use current roomId */
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim() || !currentUser) {
      console.warn('⚠️ [Send] Invalid state', { 
        hasContent: !!content?.trim(), 
        hasUser: !!currentUser
      });
      return false;
    }

    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) {
      console.warn('⚠️ [Send] No room ID available');
      return false;
    }

    if (status !== 'connected') {
      console.warn(`⚠️ [Send] Not connected (status: ${status}), attempting to reconnect...`);
      return false;
    }

    try {
      console.log(`📤 [Send] Sending message to room: ${currentRoomId}, Admin Mode: ${adminModeRef.current}`);
      
      const messageData = {
        user_id: currentRoomId,  // This is the target user's ID in admin mode
        content: content.trim(),
        sender_type: adminModeRef.current ? 'admin' : 'user',
        is_read: false
      };
      
      // If admin mode, include admin_id
      if (adminModeRef.current) {
        messageData.admin_id = currentUser.id;
      }

      const { data, error } = await supabase
        .from('user_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      
      console.log(`✅ [Send] Message sent successfully to room ${currentRoomId}`);
      lastHeartbeatRef.current = Date.now();
      return true;
    } catch (error) {
      console.error('❌ [Send] Failed:', error);
      return false;
    }
  }, [currentUser, status]);

  /** Marks all unread messages as read */
  const markAsRead = useCallback(async () => {
    if (!currentUser) {
      console.warn('⚠️ [Read] Cannot mark as read', { hasUser: !!currentUser });
      return;
    }

    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) {
      console.warn('⚠️ [Read] No room ID available');
      return;
    }

    try {
      console.log('📖 [Read] Marking messages as read...');
      
      const targetSenderType = adminModeRef.current ? 'user' : 'admin';
      
      const { error } = await supabase
        .from('user_messages')
        .update({ is_read: true })
        .eq('user_id', currentRoomId)
        .eq('is_read', false)
        .eq('sender_type', targetSenderType);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.sender_type === targetSenderType && !msg.is_read
            ? { ...msg, is_read: true }
            : msg
        )
      );
      
      setUnreadCount(0);
      lastHeartbeatRef.current = Date.now();
      console.log('✅ [Read] Messages marked as read');
    } catch (error) {
      console.error('❌ [Read] Error:', error.message);
    }
  }, [currentUser]);

  // ===================== REAL-TIME FUNCTIONS =====================

  /** Sets up heartbeat interval for connection health monitoring */
  const setupHeartbeat = useCallback((channel, currentConnectionId) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    lastHeartbeatRef.current = Date.now();
    console.log(`💓 [Heartbeat] Starting heartbeat for connection #${currentConnectionId}`);
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (!mountedRef.current || connectionIdRef.current !== currentConnectionId) {
        console.log(`⚠️ [Heartbeat] Stopping stale heartbeat`);
        clearInterval(heartbeatIntervalRef.current);
        return;
      }

      if (!checkConnectionHealth()) {
        console.log('💔 [Heartbeat] Connection stale, triggering reconnect');
        return;
      }

      try {
        const currentRoomId = roomIdRef.current;
        const currentAdminMode = adminModeRef.current;
        
        if (!currentRoomId) {
          console.warn('⚠️ [Heartbeat] No room ID available, skipping heartbeat');
          return;
        }
        
        const role = currentAdminMode ? 'admin' : 'user';
        channel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { 
            timestamp: Date.now(),
            from: role,
            connection_id: currentConnectionId,
            room_id: currentRoomId
          }
        });
        console.log(`💓 [Heartbeat] Sent from ${role} for room #${currentRoomId}`);
      } catch (error) {
        console.warn(`💓 [Heartbeat] Failed:`, error);
      }
    }, HEARTBEAT_INTERVAL);
  }, [checkConnectionHealth]);

  /** Real-time message handler - FIXED: Simplified security check */
  const handleRealtimeMessage = useCallback((payload, currentConnectionId) => {
    if (!mountedRef.current || connectionIdRef.current !== currentConnectionId) {
      console.log(`⚠️ [Realtime] Ignoring event for stale connection`);
      return;
    }
    
    lastHeartbeatRef.current = Date.now();
    
    const messageUserId = payload.new?.user_id || payload.old?.user_id;
    const currentRoomId = roomIdRef.current;
    
    // IMPORTANT FIX: Only process messages for the current room
    if (messageUserId && messageUserId !== currentRoomId) {
      console.warn(`🚨 [Realtime] Rejecting message from different room! Message user_id: ${messageUserId}, Current room: ${currentRoomId}`);
      return;
    }
    
    console.log(`💬 [Realtime] #${currentConnectionId} Event: ${payload.eventType} for room ${currentRoomId}`);
    
    switch (payload.eventType) {
      case 'INSERT': {
        const newMsg = payload.new;
        
        if (lastMessageIdRef.current === newMsg.id) {
          console.log('⚠️ [Realtime] Duplicate message detected, skipping');
          return;
        }
        
        lastMessageIdRef.current = newMsg.id;
        
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) {
            console.log('⚠️ [Realtime] Message already exists in state');
            return prev;
          }
          console.log('✅ [Realtime] Adding new message');
          return [...prev, newMsg];
        });
        
        const isIncomingMessage = adminModeRef.current 
          ? newMsg.sender_type === 'user'   // Admin cares about user messages
          : newMsg.sender_type === 'admin'; // User cares about admin messages
        
        if (isIncomingMessage && !newMsg.is_read) {
          setUnreadCount(prev => prev + 1);
          playNotificationSound();
        }
        break;
      }
      
      case 'UPDATE': {
        const updatedMsg = payload.new;
        const oldMsg = payload.old;
        
        setMessages(prev => 
          prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg)
        );
        
        if (oldMsg?.is_read === false && updatedMsg.is_read === true) {
          const shouldDecrementCount = adminModeRef.current 
            ? updatedMsg.sender_type === 'user'
            : updatedMsg.sender_type === 'admin';
          
          if (shouldDecrementCount) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
        break;
      }
    }
  }, []);

  /** Sets up Supabase realtime subscription - FIXED: Simplified filter */
  const setupSubscription = useCallback((roomId) => {
    if (!roomId || !mountedRef.current) {
      console.log('⚠️ [Subscription] Skipping setup - invalid state');
      return;
    }

    connectionIdRef.current += 1;
    const currentConnectionId = connectionIdRef.current;

    cleanupChannel();

    console.log(`📡 [Subscription] Setting up connection #${currentConnectionId}`);
    console.log(`📡 [Subscription] Room ID: ${roomId}, Admin Mode: ${adminModeRef.current}`);
    
    setStatus("connecting");

    const channelName = `support_chat:${roomId}`;
    
    // SIMPLIFIED: Just listen to all changes for this user_id
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false, ack: false },
        presence: { key: `${adminModeRef.current ? 'admin' : 'user'}_${roomId}_${Date.now()}` },
        postgres_changes: [{
          event: '*',
          schema: 'public',
          table: 'user_messages',
          filter: `user_id=eq.${roomId}`
        }]
      }
    });

    // Presence tracking
    channel
      .on('presence', { event: 'sync' }, () => {
        if (connectionIdRef.current !== currentConnectionId) return;
        lastHeartbeatRef.current = Date.now();
      })
      .on('presence', { event: 'join' }, () => {
        if (connectionIdRef.current !== currentConnectionId) return;
        lastHeartbeatRef.current = Date.now();
      })
      .on('presence', { event: 'leave' }, () => {
        if (connectionIdRef.current !== currentConnectionId) return;
      });

    // Real-time message handling
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_messages',
        filter: `user_id=eq.${roomId}`
      },
      (payload) => handleRealtimeMessage(payload, currentConnectionId)
    );

    // Channel subscription callback
    channel.subscribe((status, err) => {
      if (!mountedRef.current || connectionIdRef.current !== currentConnectionId) {
        return;
      }
      
      console.log(`📡 [Subscription] #${currentConnectionId} Status: ${status}`);
      
      switch (status) {
        case 'SUBSCRIBED':
          setStatus('connected');
          setConnectionAttempts(0);
          lastHeartbeatRef.current = Date.now();
          console.log(`✅ [Subscription] #${currentConnectionId} Successfully connected to room ${roomId}`);
          
          channel.track({ 
            user_id: roomId, 
            online_at: new Date().toISOString(),
            role: adminModeRef.current ? 'admin' : 'user',
            connection_id: currentConnectionId
          });
          
          setupHeartbeat(channel, currentConnectionId);
          break;
          
        case 'CHANNEL_ERROR':
        case 'TIMED_OUT':
          setStatus('error');
          console.error(`❌ [Subscription] #${currentConnectionId} Connection error:`, err);
          
          if (connectionIdRef.current === currentConnectionId && 
              connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
            const delay = getRetryDelay(connectionAttempts);
            console.log(`🔄 [Subscription] Reconnecting in ${delay}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current && roomIdRef.current && connectionIdRef.current === currentConnectionId) {
                setConnectionAttempts(prev => prev + 1);
                setupSubscription(roomIdRef.current);
              }
            }, delay);
          } else {
            console.error(`❌ [Subscription] Max reconnection attempts reached`);
            setStatus('disconnected');
          }
          break;
          
        case 'CLOSED':
          if (connectionIdRef.current === currentConnectionId) {
            setStatus('disconnected');
            console.log(`🔌 [Subscription] #${currentConnectionId} Channel closed`);
          }
          break;
          
        default:
          if (connectionIdRef.current === currentConnectionId) {
            setStatus('connecting');
          }
      }
    });

    channelRef.current = channel;
  }, [cleanupChannel, setupHeartbeat, handleRealtimeMessage, connectionAttempts]);

  /** Reconnection handler */
  const reconnect = useCallback(async () => {
    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) {
      console.warn('⚠️ [Reconnect] No room ID available');
      return;
    }
    
    console.log(`🔄 [Reconnect] Manual reconnection initiated for room: ${currentRoomId}`);
    setStatus('connecting');
    setConnectionAttempts(0);
    
    cleanupChannel();
    
    await loadMessages(currentRoomId);
    setupSubscription(currentRoomId);
  }, [loadMessages, setupSubscription, cleanupChannel]);

  // ===================== INITIALIZATION =====================

  /** Initializes user, room, and connection - FIXED: Clear logic for room ID */
  const initUser = useCallback(async () => {
    try {
      console.log('👤 [Init] Starting initialization...');
      console.log('👤 [Init] Admin Mode:', adminMode, 'Target User ID:', targetUserId);
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (!user) {
        console.log('ℹ️ [Init] No authenticated user');
        setStatus("disconnected");
        return;
      }

      if (!mountedRef.current) {
        console.log('⚠️ [Init] Component unmounted during initialization');
        return;
      }

      let room;
      
      // CRITICAL FIX: Determine room ID based on mode
      if (adminMode && targetUserId) {
        // Admin mode: Room is the target user's ID
        room = targetUserId;
        adminIdRef.current = user.id;
      } else {
        // User mode: Room is the current user's ID
        room = user.id;
        adminIdRef.current = null;
      }
      
      const currentKey = `${user.id}_${room}_${adminMode}_${targetUserId || 'user'}`;
      
      if (initializationRef.current === currentKey) {
        console.log(`⭐️ [Init] Already initialized, skipping`);
        return;
      }
      
      console.log(`✅ [Init] User initialized - Room ID: ${room}, Admin Mode: ${adminMode}`);
      
      // Reset initialization state
      initializationRef.current = currentKey;
      currentUserIdRef.current = user.id;
      roomIdRef.current = room;
      setCurrentUser(user);
      setRoomId(room);
      
      // Clear messages before loading new ones
      setMessages([]);
      
      // Load messages for this room
      await loadMessages(room);
      
      if (mountedRef.current) {
        setupSubscription(room);
      }
    } catch (error) {
      console.error('❌ [Init] Initialization failed:', error);
      setStatus("error");
    }
  }, [adminMode, targetUserId, loadMessages, setupSubscription]);

  // ===================== EFFECTS =====================

  /** Sync refs with state */
  useEffect(() => {
    roomIdRef.current = roomId;
    adminModeRef.current = adminMode;
  }, [roomId, adminMode]);

  /** Main initialization effect - FIXED: Reset when targetUserId changes */
  useEffect(() => {
    console.log('🎯 [Effect] Initialization effect triggered', { adminMode, targetUserId });
    
    // Reset initialization when targetUserId changes (for admin mode)
    if (adminMode && targetUserId) {
      initializationRef.current = null;
    }
    
    if (!initializationRef.current) {
      initUser();
    }

    return () => {
      console.log('🧹 [Effect] Effect cleanup');
      cleanupChannel();
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [initUser, cleanupChannel, adminMode, targetUserId]);

  /** Auth state listener */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔐 [Auth] State changed: ${event}`);
        
        if (!mountedRef.current) {
          return;
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('🚪 [Auth] User signed out, cleaning up');
          cleanupChannel();
          setMessages([]);
          setStatus('disconnected');
          setUnreadCount(0);
          setCurrentUser(null);
          setRoomId(null);
          setConnectionAttempts(0);
          lastMessageIdRef.current = null;
          initializationRef.current = null;
          currentUserIdRef.current = null;
          adminIdRef.current = null;
          roomIdRef.current = null;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [cleanupChannel]);

  /** Component lifecycle */
  useEffect(() => {
    mountedRef.current = true;
    console.log('🎬 [Lifecycle] Component mounted');
    
    return () => {
      console.log('🎬 [Lifecycle] Component unmounting');
      mountedRef.current = false;
      cleanupChannel();
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      // Reset all refs
      initializationRef.current = null;
      currentUserIdRef.current = null;
      adminIdRef.current = null;
      roomIdRef.current = null;
    };
  }, [cleanupChannel]);

  // ===================== RETURN VALUES =====================
  return {
    messages,
    sendMessage,
    status,
    unreadCount,
    markAsRead,
    reconnect,
    roomId,
    currentUser,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    hasError: status === 'error',
    connectionAttempts
  };
}