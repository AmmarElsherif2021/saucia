/* eslint-disable */
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import DynamicThemeProvider from './Contexts/ThemeProvider.jsx'
import { I18nProvider } from './Contexts/I18nContext.jsx'
import { UserProvider } from './Contexts/UserContext.jsx'
import { AuthProvider } from './Contexts/AuthContext.jsx'
import { ElementsProvider } from './Contexts/ElementsContext.jsx'
import { Navbar } from './Components/Navbar/Navbar.jsx'
import './index.css'
import { Spinner } from '@chakra-ui/react'
import { CartProvider } from './Contexts/CartContext.jsx'

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
const Auth = React.lazy(() => import('./Pages/Auth/Auth.jsx'))
const Admin = React.lazy(() => import('./Pages/Auth/Admin.jsx'))
const JoinPlanPage = React.lazy(() => import('./Pages/Premium/JoinPlan/JoinPlanPage.jsx'))

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
          position: 'absolute',
          top: '4rem',
          width: '100%',
        }}
      >
        {children}
      </main>
    </div>
  )
}

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
          <Auth />
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
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <UserAccountPage />
        </Suspense>
      </Layout>
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
        <ElementsProvider>
          <CartProvider>
            <UserProvider>
              <AuthProvider>
                <RouterProvider router={router} />
              </AuthProvider>
            </UserProvider>
          </CartProvider>
        </ElementsProvider>
      </DynamicThemeProvider>
    </I18nProvider>
  </React.StrictMode>,
)
