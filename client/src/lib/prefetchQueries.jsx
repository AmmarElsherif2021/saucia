import { itemsAPI } from '../API/itemAPI';
import { mealsAPI } from '../API/mealAPI';
import { plansAPI } from '../API/planAPI';
import { elementsKeys } from '../Hooks/useElementsQuery';

// Enhanced prefetch strategies with better error handling and performance
export const PREFETCH_STRATEGIES = {
  critical: async (queryClient) => {
    try {
      const promises = [
        queryClient.prefetchQuery({
          queryKey: elementsKeys.featured('meals'),
          queryFn: () => mealsAPI.getMeals({ is_featured: true }),
          staleTime: 10 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: elementsKeys.categories(),
          queryFn: async () => {
            const items = await itemsAPI.listItems();
            return [...new Set(items.map(item => item.category))];
          },
          staleTime: 60 * 60 * 1000,
        }),
      ];
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Critical prefetch failed:', error);
    }
  },

  home: async (queryClient) => {
    try {
      const promises = [
        queryClient.prefetchQuery({
          queryKey: elementsKeys.featured('meals'),
          queryFn: () => mealsAPI.getMeals({ is_featured: true }),
          staleTime: 10 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: elementsKeys.categories(),
          queryFn: async () => {
            const items = await itemsAPI.listItems();
            return [...new Set(items.map(item => item.category))];
          },
          staleTime: 60 * 60 * 1000,
        }),
      ];
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Home prefetch failed:', error);
    }
  },

  // Enhanced menu prefetch with progressive loading
  menu: async (queryClient) => {
    try {
      // First priority: Core menu data
      const corePromises = [
        queryClient.prefetchQuery({
          queryKey: elementsKeys.meals(),
          queryFn: () => mealsAPI.getMeals(),
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: elementsKeys.items(),
          queryFn: itemsAPI.listItems,
          staleTime: 15 * 60 * 1000,
        }),
      ];

      // Wait for core data first
      await Promise.allSettled(corePromises);

      // Second priority: Enhanced menu data
      const enhancedPromises = [
        queryClient.prefetchQuery({
          queryKey: elementsKeys.featured('meals'),
          queryFn: () => mealsAPI.getMeals({ is_featured: true }),
          staleTime: 10 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: elementsKeys.categories(),
          queryFn: async () => {
            const items = await itemsAPI.listItems();
            return [...new Set(items.map(item => item.category))];
          },
          staleTime: 60 * 60 * 1000,
        }),
      ];

      // Don't block on enhanced data
      Promise.allSettled(enhancedPromises).catch(console.error);
    } catch (error) {
      console.error('Menu prefetch failed:', error);
    }
  },

  premium: async (queryClient) => {
    try {
      const promises = [
        queryClient.prefetchQuery({
          queryKey: elementsKeys.plans(),
          queryFn: plansAPI.listPlans,
          staleTime: 30 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: elementsKeys.featured('plans'),
          queryFn: () => plansAPI.getFeaturedPlans?.() || Promise.resolve([]),
          staleTime: 30 * 60 * 1000,
        }),
      ];
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Premium prefetch failed:', error);
    }
  },

  checkout: async (queryClient) => {
    try {
      const promises = [
        queryClient.prefetchQuery({
          queryKey: elementsKeys.items(),
          queryFn: itemsAPI.listItems,
          staleTime: 15 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: elementsKeys.meals(),
          queryFn: () => mealsAPI.getMeals(),
          staleTime: 5 * 60 * 1000,
        }),
      ];
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Checkout prefetch failed:', error);
    }
  },

  cart: async (queryClient) => {
    try {
      // Prefetch data that might be needed for cart operations
      const promises = [
        queryClient.prefetchQuery({
          queryKey: elementsKeys.items(),
          queryFn: itemsAPI.listItems,
          staleTime: 15 * 60 * 1000,
        }),
      ];
      
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Cart prefetch failed:', error);
    }
  },

  account: async (queryClient) => {
    try {
      // Only prefetch if we can get user info
      if (typeof window !== 'undefined' && window.supabase) {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (user) {
          const promises = [
            queryClient.prefetchQuery({
              queryKey: ['user', user.id, 'subscriptions'],
              queryFn: () => plansAPI.getUserSubscriptions?.() || Promise.resolve([]),
              staleTime: 5 * 60 * 1000,
            }),
            queryClient.prefetchQuery({
              queryKey: ['user', user.id, 'favorites'],
              queryFn: () => mealsAPI.getFavMealsOfClient?.(user.id) || Promise.resolve([]),
              staleTime: 5 * 60 * 1000,
            }),
          ];
          
          await Promise.allSettled(promises);
        }
      }
    } catch (error) {
      console.error('Account prefetch failed:', error);
    }
  },
};

// Enhanced network-aware prefetching
export const networkAwarePrefetch = {
  shouldPrefetch: () => {
    if (typeof navigator === 'undefined') return true;
    
    // Check connection
    if (navigator.connection) {
      const connection = navigator.connection;
      const slowConnections = ['slow-2g', '2g'];
      
      if (slowConnections.includes(connection.effectiveType)) {
        return false;
      }
      
      if (connection.saveData) {
        return false;
      }
      
      // Check effective bandwidth
      if (connection.downlink && connection.downlink < 1) {
        return false;
      }
    }
    
    // Check device performance
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      // Limit prefetching on lower-end devices
      return Math.random() < 0.7; // 70% chance to prefetch
    }
    
    return true;
  },

  getConnectionType: () => {
    if (typeof navigator === 'undefined' || !navigator.connection) {
      return 'unknown';
    }
    
    return navigator.connection.effectiveType || 'unknown';
  },

  getPrefetchPriority: () => {
    const connectionType = networkAwarePrefetch.getConnectionType();
    
    switch (connectionType) {
      case '4g':
        return 'high';
      case '3g':
        return 'medium';
      case '2g':
      case 'slow-2g':
        return 'low';
      default:
        return 'medium';
    }
  },
};

// Enhanced smart prefetch utilities
export const smartPrefetch = {
  shouldPrefetch: () => networkAwarePrefetch.shouldPrefetch(),

  prefetchCritical: async (queryClient) => {
    if (!smartPrefetch.shouldPrefetch()) {
      //console.log('Skipping critical prefetch due to connection constraints');
      return;
    }
    
    try {
      await PREFETCH_STRATEGIES.critical(queryClient);
    } catch (error) {
      console.error('Critical prefetch failed:', error);
    }
  },

  onRouteChange: async (route, queryClient) => {
    if (!smartPrefetch.shouldPrefetch()) {
      //console.log('Skipping route prefetch due to connection constraints');
      return;
    }
    
    const routeMap = {
      '/': 'home',
      '/menu': 'menu',
      '/premium': 'premium',
      '/checkout': 'checkout',
      '/cart': 'cart',
      '/account': 'account',
    };
    
    const strategy = PREFETCH_STRATEGIES[routeMap[route]];
    if (strategy) {
      try {
        await strategy(queryClient);
      } catch (error) {
        console.error(`Prefetch failed for route ${route}:`, error);
      }
    }
  },

  predictivePrefetch: async (currentRoute, queryClient) => {
    const priority = networkAwarePrefetch.getPrefetchPriority();
    
    if (priority === 'low') {
      //console.log('Skipping predictive prefetch due to low connection priority');
      return;
    }
    
    const prefetchMap = {
      '/': ['menu', 'premium'],
      '/menu': ['checkout', 'cart'],
      '/premium': ['checkout'],
      '/cart': ['checkout'],
      '/checkout': ['account'],
    };
    
    const nextRoutes = prefetchMap[currentRoute] || [];
    const maxRoutes = priority === 'high' ? nextRoutes.length : Math.min(1, nextRoutes.length);
    
    const routesToPrefetch = nextRoutes.slice(0, maxRoutes);
    
    for (const route of routesToPrefetch) {
      const routeMap = {
        'menu': 'menu',
        'premium': 'premium',
        'checkout': 'checkout',
        'cart': 'cart',
        'account': 'account',
      };
      
      const strategy = PREFETCH_STRATEGIES[routeMap[route]];
      if (strategy) {
        const prefetchFn = () => strategy(queryClient).catch(console.error);
        
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(prefetchFn, { timeout: 5000 });
        } else {
          setTimeout(prefetchFn, priority === 'high' ? 100 : 500);
        }
      }
    }
  },

  // Progressive loading for heavy pages
  progressiveLoad: async (queryClient, dataType) => {
    const priority = networkAwarePrefetch.getPrefetchPriority();
    
    switch (dataType) {
      case 'menu':
        // Load in phases based on connection quality
        if (priority === 'high') {
          await PREFETCH_STRATEGIES.menu(queryClient);
        } else {
          // Load critical data first, then background load the rest
          const criticalPromise = queryClient.prefetchQuery({
            queryKey: elementsKeys.meals(),
            queryFn: () => mealsAPI.getMeals(),
            staleTime: 5 * 60 * 1000,
          });
          
          await criticalPromise;
          
          // Background load remaining data
          setTimeout(() => {
            PREFETCH_STRATEGIES.menu(queryClient).catch(console.error);
          }, 1000);
        }
        break;
        
      default:
        console.warn(`Progressive loading not implemented for ${dataType}`);
    }
  },
};

// Enhanced background sync with better performance
export const backgroundSync = {
  onVisibilityChange: (queryClient) => {
    if (!document.hidden && navigator.onLine) {
      const priority = networkAwarePrefetch.getPrefetchPriority();
      
      // Only invalidate if connection is good enough
      if (priority !== 'low') {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const now = Date.now();
            const queryTime = query.state.dataUpdatedAt || 0;
            const staleTime = query.options.staleTime || 0;
            return (now - queryTime) > (staleTime * 1.5);
          },
        });
      }
    }
  },

  startPeriodicSync: (queryClient) => {
    const priority = networkAwarePrefetch.getPrefetchPriority();
    const syncInterval = priority === 'high' ? 5 * 60 * 1000 : 15 * 60 * 1000; // 5min for fast, 15min for slow
    
    return setInterval(() => {
      if (!document.hidden && navigator.onLine && priority !== 'low') {
        queryClient.invalidateQueries({
          queryKey: elementsKeys.featured('meals'),
          refetchType: 'active',
        });
      }
    }, syncInterval);
  },

  // Adaptive sync based on user activity
  adaptiveSync: (queryClient) => {
    let lastActivity = Date.now();
    let syncInterval = null;
    
    const updateActivity = () => {
      lastActivity = Date.now();
    };
    
    const startAdaptiveSync = () => {
      if (syncInterval) clearInterval(syncInterval);
      
      syncInterval = setInterval(() => {
        const timeSinceActivity = Date.now() - lastActivity;
        const isActive = timeSinceActivity < 30000; // 30 seconds
        
        if (isActive && !document.hidden && navigator.onLine) {
          const priority = networkAwarePrefetch.getPrefetchPriority();
          if (priority !== 'low') {
            queryClient.invalidateQueries({
              queryKey: elementsKeys.all,
              refetchType: 'active',
            });
          }
        }
      }, 60000); // Check every minute
    };
    
    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    startAdaptiveSync();
    
    return () => {
      if (syncInterval) clearInterval(syncInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  },
};