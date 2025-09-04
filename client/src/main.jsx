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
const PageLoader = ({ message = 'Loading...', showRetry = false, onRetry }) => (
  <Center maxWidth={'97vw'} h="100vh" flexDirection="column">
    <Spinner size="xl" color="brand.500" mb={4} />
    <Box color="gray.500" fontSize="sm" mb={2}>{message}</Box>
    {showRetry && (
      <Box 
        as="button" 
        onClick={onRetry}
        color="brand.500" 
        fontSize="sm" 
        textDecoration="underline"
        cursor="pointer"
      >
        Click to retry
      </Box>
    )}
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
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflowX:'hidden'
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
      refetchOnWindowFocus: false, // Reduce unnecessary refetches
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 408 && error?.status !== 429) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    },
    mutations: {
      retry: 1,
    }
  }
});
// Enhanced router with prefetching
const RouterWithPrefetch = ({ router, queryClient }) => {
  const [retryCount, setRetryCount] = React.useState(0)
  
  React.useEffect(() => {
    // Set up background sync
    let syncInterval
    let visibilityHandler
    
    try {
      syncInterval = backgroundSync.startPeriodicSync(queryClient)
      
      // Listen for visibility changes
      visibilityHandler = () => {
        backgroundSync.onVisibilityChange(queryClient)
      }
      
      document.addEventListener('visibilitychange', visibilityHandler)
      
      // Prefetch critical data immediately with retry
      if (networkAwarePrefetch.shouldPrefetch()) {
        import('./lib/prefetchQueries').then(({ smartPrefetch }) => {
          smartPrefetch.prefetchCritical(queryClient).catch(error => {
            console.error('Critical prefetch failed:', error)
            if (retryCount < 2) {
              setTimeout(() => {
                setRetryCount(prev => prev + 1)
                smartPrefetch.prefetchCritical(queryClient)
              }, 2000 * (retryCount + 1))
            }
          })
        })
      }
    } catch (error) {
      console.error('RouterWithPrefetch setup failed:', error)
    }
    
    return () => {
      if (syncInterval) clearInterval(syncInterval)
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler)
      }
    }
  }, [queryClient, retryCount])

  return <RouterProvider router={router} />
}

// Route configuration with prefetching hints
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Suspense 
          fallback={
            <Box textAlign="center" justifyContent={'center'} w={'99%'} h={'100vh'} display={'flex'} flexDirection={'column'}>
              <Spinner size="xl" color="brand.500" mb={4} />
              <Box fontSize="sm" color="gray.500">Loading Home...</Box>
            </Box>
          }
        >
          <HomePage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      try {
        if (networkAwarePrefetch.shouldPrefetch()) {
          await PREFETCH_STRATEGIES.home(queryClient)
        }
      } catch (error) {
        console.error('Home loader failed:', error)
        // Don't throw, let the component handle the error
      }
      return null
    }
  },
  {
    path: '/auth',
    element: (
      <div>
        <Suspense fallback={
          <Box textAlign="center" justifyContent={'center'} w={'99%'} h={'100vh'} display={'flex'} flexDirection={'column'}>
              <Spinner size="xl" color="brand.500" mb={4} />
            </Box>
        }>
          <OAuth />
        </Suspense>
      </div>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Suspense fallback={
          <Box textAlign="center" justifyContent={'center'} w={'99%'} h={'100vh'} display={'flex'} flexDirection={'column'}>
              <Spinner size="xl" color="brand.500" mb={4} />
          </Box>
        }>
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
        <Suspense fallback={
          <Box textAlign="center" justifyContent={'center'} w={'99%'} h={'100vh'} display={'flex'} flexDirection={'column'}>
              <Spinner size="xl" color="brand.500" mb={4} />
            </Box>
        }>
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
        <Suspense 
          fallback={
            <Box textAlign="center" justifyContent={'center'} w={'99%'} h={'100vh'} display={'flex'} flexDirection={'column'}>
              <Spinner size="xl" color="brand.500" mb={4} />
              <Box fontSize="sm" color="gray.500">Loading Menu...</Box>
            </Box>
          }
        >
          <MenuPage />
        </Suspense>
      </Layout>
    ),
    loader: async () => {
      try {
        if (networkAwarePrefetch.shouldPrefetch()) {
          // Use progressive loading for menu
          await import('./lib/prefetchQueries').then(({ smartPrefetch }) => 
            smartPrefetch.progressiveLoad(queryClient, 'menu')
          )
        }
      } catch (error) {
        console.error('Menu loader failed:', error)
        // Don't throw, let the component handle the error
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
    )
  },
  {
    path: '/checkout-plan',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader message="Loading plan checkout..." />}>
          <CheckoutPlan />
        </Suspense>
      </Layout>
    )
    // ,
  //   loader: async () => {
  //     // Prefetch plan checkout data
  //     if (networkAwarePrefetch.shouldPrefetch()) {
  //       await PREFETCH_STRATEGIES.checkoutPlan(queryClient)
  //     }
  //     return null
  //   }
  // 
  },
])

const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <I18nProvider>
      <DynamicThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ElementsProvider> {/* Single provider here */}
            <CartProvider>
              <ChosenPlanProvider>
              <AuthProvider>
                
                  <RouterWithPrefetch router={router} queryClient={queryClient} />
                  {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
                
              </AuthProvider>
              </ChosenPlanProvider>
            </CartProvider>
          </ElementsProvider>
        </QueryClientProvider>
      </DynamicThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
)