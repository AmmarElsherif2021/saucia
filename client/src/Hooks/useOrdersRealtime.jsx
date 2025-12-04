// useOrderRealtime.jsx - Custom hook for real-time order updates
import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../../supabaseClient';

export function useOrderRealtime(orderId, onOrderUpdate) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      console.warn('No order ID provided for real-time subscription');
      return;
    }

    console.log('Setting up real-time subscription for order:', orderId);

    // Create a channel for this specific order
    const channel = supabase
      .channel(`order-${orderId}-status-changes`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Order updated:', payload);
          
          // Call the callback with the new data
          if (onOrderUpdate) {
            onOrderUpdate(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Failed to subscribe to order updates');
          setIsSubscribed(false);
        }
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscription for order:', orderId);
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [orderId, onOrderUpdate]);

  return { isSubscribed, error };
}

// useUserOrdersRealtime.jsx - Listen to ALL orders for a user
export function useUserOrdersRealtime(userId, onOrdersUpdate) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.warn('No user ID provided for real-time subscription');
      return;
    }

    console.log('Setting up real-time subscription for user orders:', userId);

    const channel = supabase
      .channel(`user-${userId}-orders-changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('User orders changed:', payload);
          
          if (onOrdersUpdate) {
            onOrdersUpdate({
              event: payload.eventType, // 'INSERT', 'UPDATE', or 'DELETE'
              order: payload.new || payload.old,
              old: payload.old,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Failed to subscribe to user orders');
          setIsSubscribed(false);
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription for user:', userId);
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [userId, onOrdersUpdate]);

  return { isSubscribed, error };
}

// EXAMPLE USAGE IN COMPONENT:

// Example 1: Track a single order status
/*
import { useOrderRealtime } from './hooks/useOrderRealtime';

function OrderTracking({ orderId }) {
  const [order, setOrder] = useState(null);

  // Set up real-time listener
  const { isSubscribed } = useOrderRealtime(orderId, (updatedOrder) => {
    console.log('Order status changed:', updatedOrder.status);
    setOrder(updatedOrder);
    
    // Show notification
    if (updatedOrder.status === 'delivered') {
      toast.success('Your order has been delivered!');
    }
  });

  return (
    <div>
      {isSubscribed && <Badge>🟢 Live</Badge>}
      <p>Status: {order?.status}</p>
    </div>
  );
}
*/

// Example 2: Track all user orders
/*
import { useUserOrdersRealtime } from './hooks/useOrderRealtime';

function MyOrders() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState([]);

  const { isSubscribed } = useUserOrdersRealtime(user?.id, ({ event, order }) => {
    if (event === 'INSERT') {
      setOrders(prev => [order, ...prev]);
      toast.success('New order created!');
    } else if (event === 'UPDATE') {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
      toast.info(`Order ${order.order_number} updated`);
    } else if (event === 'DELETE') {
      setOrders(prev => prev.filter(o => o.id !== order.id));
    }
  });

  return (
    <div>
      {isSubscribed && <StatusBadge>Live Updates Active</StatusBadge>}
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </div>
  );
}
*/

// Example 3: Integrated with useOrders hook
/*
function OrdersPage() {
  const { user } = useAuthContext();
  const { orders, setOrders, fetchUserOrders } = useOrders();
  
  // Initial fetch
  useEffect(() => {
    fetchUserOrders(user.id);
  }, [user.id]);

  // Real-time updates
  useUserOrdersRealtime(user.id, ({ event, order }) => {
    if (event === 'UPDATE') {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    }
  });

  return <OrdersList orders={orders} />;
}
*/