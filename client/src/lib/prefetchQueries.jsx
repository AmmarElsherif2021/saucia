import { itemsAPI } from '../API/itemAPI';
import { mealsAPI } from '../API/mealAPI';
import { plansAPI } from '../API/planAPI';

// Route-specific prefetch strategies
export const PREFETCH_STRATEGIES = {
  home: async (queryClient) => {
    // Home page needs featured meals and basic items
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['featuredMeals'],
        queryFn: () => mealsAPI.getMeals({ is_featured: true }),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['categories'],
        queryFn: async () => {
          const items = await itemsAPI.listItems();
          return [...new Set(items.map(item => item.category))];
        },
        staleTime: 60 * 60 * 1000,
      }),
    ]);
  },

  menu: async (queryClient) => {
    // Menu page needs all items and meals
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['menuItems'],
        queryFn: () => itemsAPI.listItems(),
        staleTime: 15 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['menuMeals'],
        queryFn: () => mealsAPI.getMeals(),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },

  premium: async (queryClient) => {
    // Premium page needs plans data
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['plans'],
        queryFn: () => plansAPI.listPlans(),
        staleTime: 30 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['featuredPlans'],
        queryFn: () => plansAPI.getFeaturedPlans(),
        staleTime: 30 * 60 * 1000,
      }),
    ]);
  },

  checkout: async (queryClient) => {
    // Checkout needs all relevant data
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['checkoutItems'],
        queryFn: () => itemsAPI.listItems(),
        staleTime: 15 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['checkoutMeals'],
        queryFn: () => mealsAPI.getMeals(),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },

  account: async (queryClient) => {
    // Account page needs user-specific data
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ['userSubscriptions'],
            queryFn: () => plansAPI.getUserSubscriptions(),
            staleTime: 5 * 60 * 1000,
          }),
          queryClient.prefetchQuery({
            queryKey: ['userFavorites'],
            queryFn: () => mealsAPI.getFavMealsOfClient(user.id),
            staleTime: 5 * 60 * 1000,
          }),
        ]);
      }
    } catch (error) {
      console.error('Prefetch error:', error);
    }
  },
};

// Smart prefetching based on user behavior
export const smartPrefetch = {
  onNavigationHover: (route, queryClient) => {
    const strategy = PREFETCH_STRATEGIES[route];
    if (strategy) {
      setTimeout(() => strategy(queryClient), 100);
    }
  },

  predictivePrefetch: async (currentRoute, queryClient) => {
    const prefetchMap = {
      '/': ['menu', 'premium'],
      '/menu': ['checkout', 'account'],
      '/premium': ['checkout', 'account'],
      '/cart': ['checkout'],
      '/checkout': ['account'],
    };

    const nextRoutes = prefetchMap[currentRoute] || [];
    
    for (const route of nextRoutes) {
      const strategy = PREFETCH_STRATEGIES[route];
      if (strategy) {
        requestIdleCallback(() => strategy(queryClient));
      }
    }
  },

  prefetchCritical: async (queryClient) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['criticalMeals'],
        queryFn: () => mealsAPI.getMeals({ is_featured: true }),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['criticalPlans'],
        queryFn: () => plansAPI.getFeaturedPlans(),
        staleTime: 30 * 60 * 1000,
      }),
    ]);
  },
};

// Background sync utilities
export const backgroundSync = {
  onVisibilityChange: (queryClient) => {
    if (!document.hidden) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const now = Date.now();
          const queryTime = query.state.dataUpdatedAt;
          const staleTime = query.options.staleTime || 0;
          return (now - queryTime) > (staleTime * 2 || 10 * 60 * 1000);
        },
      });
    }
  },

  startPeriodicSync: (queryClient) => {
    const syncInterval = 15 * 60 * 1000;
    
    return setInterval(() => {
      if (!document.hidden && navigator.onLine) {
        queryClient.invalidateQueries({
          queryKey: ['criticalMeals'],
          refetchType: 'active',
        });
      }
    }, syncInterval);
  },
};

// Network-aware prefetching
export const networkAwarePrefetch = {
  shouldPrefetch: () => {
    if (!navigator.connection) return true;
    
    const connection = navigator.connection;
    const slowConnections = ['slow-2g', '2g', '3g'];
    
    if (slowConnections.includes(connection.effectiveType)) {
      return false;
    }
    
    if (connection.saveData) {
      return false;
    }
    
    return true;
  },

  adaptivePrefetch: async (route, queryClient) => {
    if (!networkAwarePrefetch.shouldPrefetch()) {
      console.log('Skipping prefetch due to connection constraints');
      return;
    }

    const strategy = PREFETCH_STRATEGIES[route];
    if (strategy) {
      await strategy(queryClient);
    }
  },
};