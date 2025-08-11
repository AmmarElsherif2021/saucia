/* eslint-disable */
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import DynamicThemeProvider from './Contexts/ThemeProvider.jsx'
import { I18nProvider } from './Contexts/I18nContext.jsx'
import { AuthProvider, useAuthContext } from './Contexts/AuthContext.jsx'
import { ElementsProvider } from './Contexts/ElementsContext.jsx'
import { ChosenPlanProvider } from './Contexts/ChosenPlanContext.jsx'
import { Navbar } from './Components/Navbar/Navbar.jsx'
import './index.css'
import { Spinner, Center, Box } from '@chakra-ui/react'
import { CartProvider } from './Contexts/CartContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Import prefetch utilities
import { PREFETCH_STRATEGIES, networkAwarePrefetch, backgroundSync } from './lib/prefetchQueries'

// Lazy-loaded pages with better error boundaries
const HomePage = React.lazy(() => 
  import('./Pages/Home/HomePage.jsx').catch(err => {
    console.error('Failed to load HomePage:', err)
    return { default: () => <div>Error loading Home page</div> }
  })
)
const MenuPage = React.lazy(() => 
  import('./Pages/Menu/MenuPage.jsx').catch(err => {
    console.error('Failed to load MenuPage:', err)
    return { default: () => <div>Error loading Menu page</div> }
  })
)
const UserAccountPage = React.lazy(() => 
  import('./Pages/Dashboard/UserAccountPage.jsx').catch(err => {
    console.error('Failed to load UserAccountPage:', err)
    return { default: () => <div>Error loading Account page</div> }
  })
)
const CartPage = React.lazy(() => 
  import('./Pages/Cart/CartPage.jsx').catch(err => {
    console.error('Failed to load CartPage:', err)
    return { default: () => <div>Error loading Cart page</div> }
  })
)
const CheckoutPage = React.lazy(() => 
  import('./Pages/Checkout/CheckoutPage.jsx').catch(err => {
    console.error('Failed to load CheckoutPage:', err)
    return { default: () => <div>Error loading Checkout page</div> }
  })
)
const CheckoutPlan = React.lazy(() => 
  import('./Pages/Checkout/CheckoutPlan.jsx').catch(err => {
    console.error('Failed to load CheckoutPlan:', err)
    return { default: () => <div>Error loading Checkout Plan page</div> }
  })
)
const InfoPage = React.lazy(() => 
  import('./Pages/InfoPage.jsx').catch(err => {
    console.error('Failed to load InfoPage:', err)
    return { default: () => <div>Error loading Info page</div> }
  })
)
const AboutPage = React.lazy(() => 
  import('./Pages/About/AboutPage.jsx').catch(err => {
    console.error('Failed to load AboutPage:', err)
    return { default: () => <div>Error loading About page</div> }
  })
)
const PremiumPage = React.lazy(() => 
  import('./Pages/Premium/PremiumPage.jsx').catch(err => {
    console.error('Failed to load PremiumPage:', err)
    return { default: () => <div>Error loading Premium page</div> }
  })
)
const OAuth = React.lazy(() => 
  import('./Pages/Auth/Auth.jsx').catch(err => {
    console.error('Failed to load OAuth:', err)
    return { default: () => <div>Error loading Auth page</div> }
  })
)
const Admin = React.lazy(() => 
  import('./Pages/Auth/Admin.jsx').catch(err => {
    console.error('Failed to load Admin:', err)
    return { default: () => <div>Error loading Admin page</div> }
  })
)
const JoinPlanPage = React.lazy(() => 
  import('./Pages/Premium/JoinPlan/JoinPlanPage.jsx').catch(err => {
    console.error('Failed to load JoinPlanPage:', err)
    return { default: () => <div>Error loading Join Plan page</div> }
  })
)
const AuthCallback = React.lazy(() => 
  import('./Pages/Auth/AuthCallback.jsx').catch(err => {
    console.error('Failed to load AuthCallback:', err)
    return { default: () => <div>Error loading Auth Callback</div> }
  })
)
const AuthCompleteProfile = React.lazy(() => 
  import('./Pages/Auth/CompleteProfile.jsx').catch(err => {
    console.error('Failed to load AuthCompleteProfile:', err)
    return { default: () => <div>Error loading Complete Profile</div> }
  })
)

// Enhanced page loader with better UX
const PageLoader = ({ message = 'Loading...' }) => (
  <Center h="100vh" flexDirection="column">
    <Spinner size="xl" color="brand.500" mb={4} />
    <Box color="gray.500" fontSize="sm">{message}</Box>
  </Center>
)

const RouteGuard = ({ children }) => {
  const { user, requiresProfileCompletion } = useAuthContext();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requiresProfileCompletion()) {
    return <Navigate to="/auth/complete-profile" replace />;
  }
  
  return children;
};

const Layout = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: 'none',
        width: '100vw',
        minWidth: '220px !important',
        height: 'fit-content',
        paddingX: '0',
        marginX: '0',
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
      }}
    >
      <Navbar />
      <main
        style={{
          position: 'relative',
          marginTop: '4rem', 
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </main>
    </div>
  )
}

// Enhanced QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true
    }
  }
});

// Enhanced router with prefetching
const RouterWithPrefetch = ({ router, queryClient }) => {
  React.useEffect(() => {
    // Set up background sync
    const syncInterval = backgroundSync.startPeriodicSync(queryClient)
    
    // Listen for visibility changes
    const handleVisibilityChange = () => {
      backgroundSync.onVisibilityChange(queryClient)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Prefetch critical data immediately
    if (networkAwarePrefetch.shouldPrefetch()) {
      import('./lib/prefetchQueries').then(({ smartPrefetch }) => {
        smartPrefetch.prefetchCritical(queryClient)
      })
    }
    
    return () => {
      clearInterval(syncInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [queryClient])

  return <RouterProvider router={router} />
}

// Route configuration with prefetching hints
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading home page..." />}>
          <HomePage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      // Prefetch home page data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.home(queryClient)
      }
      return null
    }
  },
  {
    path: '/auth',
    element: (
      <div>
        <Suspense fallback={<PageLoader message="Loading authentication..." />}>
          <OAuth />
        </Suspense>
      </div>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Suspense fallback={<PageLoader message="Processing authentication..." />}>
          <AuthCallback />
        </Suspense>
      </div>
    ),
  },
  {
    path: '/auth/complete-profile',
    element: (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Suspense fallback={<PageLoader message="Loading profile setup..." />}>
          <AuthCompleteProfile />
        </Suspense>
      </div>
    ),
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<PageLoader message="Loading admin panel..." />}>
        <Admin />
      </Suspense>
    ),
  },
  {
    path: '/menu',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading menu..." />}>
          <MenuPage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      // Prefetch menu data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.menu(queryClient)
      }
      return null
    }
  },
  {
    path: '/account',
    element: (
      <RouteGuard>
        <Layout>
          <Suspense fallback={<PageLoader message="Loading account..." />}>
            <UserAccountPage />
          </Suspense>
        </Layout>
      </RouteGuard>
    ),
    loader: async () => {
      // Prefetch user account data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.account(queryClient)
      }
      return null
    }
  },
  {
    path: '/cart',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading cart..." />}>
          <CartPage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      // Prefetch cart data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.cart(queryClient)
      }
      return null
    }
  },
  {
    path: '/checkout',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading checkout..." />}>
          <CheckoutPage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      // Prefetch checkout data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.checkout(queryClient)
      }
      return null
    }
  },
  {
    path: '/info',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading info..." />}>
          <InfoPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/about',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading about..." />}>
          <AboutPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/premium',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading premium..." />}>
          <PremiumPage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      // Prefetch premium plans data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.premium(queryClient)
      }
      return null
    }
  },
  {
    path: '/premium/join',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading join plan..." />}>
          <JoinPlanPage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      // Prefetch join plan data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.joinPlan(queryClient)
      }
      return null
    }
  },
  {
    path: '/checkout-plan',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading plan checkout..." />}>
          <CheckoutPlan />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      // Prefetch plan checkout data
      if (networkAwarePrefetch.shouldPrefetch()) {
        await PREFETCH_STRATEGIES.checkoutPlan(queryClient)
      }
      return null
    }
  },
])

const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <I18nProvider>
      <DynamicThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ElementsProvider>
            <CartProvider>
              <AuthProvider>
                <ChosenPlanProvider>
                  <RouterWithPrefetch router={router} queryClient={queryClient} />
                  {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                </ChosenPlanProvider>
              </AuthProvider>
            </CartProvider>
          </ElementsProvider>
        </QueryClientProvider>
      </DynamicThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
)