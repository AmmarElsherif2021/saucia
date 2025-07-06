/* eslint-disable */
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import DynamicThemeProvider from './Contexts/ThemeProvider.jsx'
import { I18nProvider } from './Contexts/I18nContext.jsx'
import { AuthProvider, useAuthContext } from './Contexts/AuthContext.jsx'
import { ElementsProvider } from './Contexts/ElementsContext.jsx'
import { Navbar } from './Components/Navbar/Navbar.jsx'
import './index.css'
import { Spinner } from '@chakra-ui/react'
import { CartProvider } from './Contexts/CartContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Lazy-loaded pages
const HomePage = React.lazy(() => import('./Pages/Home/HomePage.jsx'))
const MenuPage = React.lazy(() => import('./Pages/Menu/MenuPage.jsx'))
const UserAccountPage = React.lazy(() => import('./Pages/Dashboard/UserAccountPage.jsx'))
const CartPage = React.lazy(() => import('./Pages/Cart/CartPage.jsx'))
const CheckoutPage = React.lazy(() => import('./Pages/Checkout/CheckoutPage.jsx'))
const CheckoutPlan = React.lazy(() => import('./Pages/Checkout/CheckoutPlan.jsx'))
const InfoPage = React.lazy(() => import('./Pages/InfoPage.jsx'))
const AboutPage = React.lazy(() => import('./Pages/About/AboutPage.jsx'))
const PremiumPage = React.lazy(() => import('./Pages/Premium/PremiumPage.jsx'))
const OAuth = React.lazy(() => import('./Pages/Auth/Auth.jsx'))
const Admin = React.lazy(() => import('./Pages/Auth/Admin.jsx'))
const JoinPlanPage = React.lazy(() => import('./Pages/Premium/JoinPlan/JoinPlanPage.jsx'))
const AuthCallback = React.lazy(() => import('./Pages/Auth/AuthCallback.jsx'))
const AuthCompleteProfile = React.lazy(() => import('./Pages/Auth/CompleteProfile.jsx'))

const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    }}
  >
    <Spinner />
  </div>
)

const RouteGuard = ({ children }) => {
  const { user, requiresCompletion } = useAuthContext();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requiresCompletion) {
    return <Navigate to="/auth/complete-profile" replace />;
  }
  
  return children;
};

const Layout = ({ children }) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        width: '100%',
        minWidth: '320px',
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
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/auth',
    element: (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <Suspense fallback={<PageLoader />}>
          <OAuth />
        </Suspense>
      </div>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Suspense fallback={<PageLoader />}>
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
        <Suspense fallback={<PageLoader />}>
          <AuthCompleteProfile />
        </Suspense>
      </div>
    ),
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Admin />
      </Suspense>
    ),
  },
  {
    path: '/menu',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <MenuPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/account',
    element: (
      <RouteGuard>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <UserAccountPage />
          </Suspense>
        </Layout>
      </RouteGuard>
    ),
  },
  {
    path: '/cart',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <CartPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/checkout',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <CheckoutPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/info',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <InfoPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/about',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <AboutPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/premium',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <PremiumPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/premium/join',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <JoinPlanPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/checkout-plan',
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <CheckoutPlan />
        </Suspense>
      </Layout>
    ),
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
                <RouterProvider router={router} />
              </AuthProvider>
          </CartProvider>
        </ElementsProvider>
      </QueryClientProvider>
      </DynamicThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
)