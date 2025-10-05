import { supabase } from "../../supabaseClient";

export const realtimeAPI = {
  // Connection management
  async checkConnection() {
    try {
      const channel = supabase.channel('connection-test');
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          channel.unsubscribe();
          resolve({ connected: false, error: 'Timeout' });
        }, 3000);

        channel
          .on('system', { event: 'connected' }, () => {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve({ connected: true });
          })
          .on('system', { event: 'disconnected' }, () => {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve({ connected: false });
          })
          .subscribe();
      });
    } catch (error) {
      return { connected: false, error: error.message };
    }
  },

  // Subscribe to multiple tables
  subscribeToMultiple(tables, callback) {
    const channel = supabase.channel('multiple-table-changes');
    
    tables.forEach(tableConfig => {
      channel.on(
        'postgres_changes',
        {
          event: tableConfig.events || '*',
          schema: 'public',
          table: tableConfig.table,
          filter: tableConfig.filter
        },
        (payload) => callback(payload, tableConfig.table)
      );
    });

    return channel.subscribe();
  },

  // Subscribe to delivery status changes
  subscribeToDeliveryStatus(callback) {
    return supabase
      .channel('delivery-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'status=in.(preparing,out_for_delivery,delivered)'
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to payment status changes
  subscribeToPaymentStatus(callback) {
    return supabase
      .channel('payment-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'payment_status=in.(paid,failed,refunded)'
        },
        callback
      )
      .subscribe();
  },

  // Cleanup all subscriptions for a user
  cleanupUserSubscriptions(userId) {
    const channels = [
      `user-${userId}-profile-changes`,
      `user-${userId}-subscriptions-changes`,
      `user-${userId}-addresses-changes`,
      `user-${userId}-health-changes`,
      `user-${userId}-orders-changes`
    ];

    channels.forEach(channelName => {
      try {
        supabase.removeChannel(channelName);
      } catch (error) {
        console.warn(`Failed to remove channel ${channelName}:`, error);
      }
    });
  }
};