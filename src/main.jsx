import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DynamicThemeProvider from "./Contexts/ThemeProvider.jsx";
import { I18nProvider } from "./Contexts/I18nContext.jsx";
import { Navbar } from "./Components/Navbar/Navbar.jsx";
import "./index.css";
import { Spinner } from "@chakra-ui/react";

// Modified lazy imports with proper export handling
const HomePage = React.lazy(() => 
  import("./Pages/Home/HomePage.jsx").then(module => ({
    default: module.HomePage || module.default
  }))
);

const MenuPage = React.lazy(() => 
  import("./Pages/Menu/MenuPage.jsx").then(module => ({
    default: module.MenuPage || module.default
  }))
);

const UserAccountPage = React.lazy(() => 
  import("./Pages/UserAccountPage.jsx").then(module => ({
    default: module.UserAccountPage || module.default
  }))
);

const CartPage = React.lazy(() => 
  import("./Pages/Cart/CartPage.jsx").then(module => ({
    default: module.CartPage || module.default
  }))
);

const CheckoutPage = React.lazy(() => 
  import("./Pages/Checkout/CheckoutPage.jsx").then(module => ({
    default: module.CheckoutPage || module.default
  }))
);

const InfoPage = React.lazy(() => 
  import("./Pages/InfoPage.jsx").then(module => ({
    default: module.InfoPage || module.default
  }))
);

const AboutPage = React.lazy(() => 
  import("./Pages/About/AboutPage.jsx").then(module => ({
    default: module.AboutPage || module.default
  }))
);

const PremiumPage = React.lazy(() => 
  import("./Pages/Premium/PremiumPage.jsx").then(module => ({
    default: module.PremiumPage || module.default
  }))
);

const Auth = React.lazy(() => 
  import("./Pages/Auth/Auth.jsx").then(module => ({
    default: module.Auth || module.default
  }))
);

const JoinPlanPage = React.lazy(() => 
  import("./Pages/Premium/JoinPlan/JoinPlanPage.jsx").then(module => ({
    default: module.JoinPlanPage || module.default
  }))
);

// Rest of the file remains unchanged
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spinner/>
  </div>
);

const Layout = ({ children }) => {
  return (
    <div style={{ backgroundColor: "white", width: "100%", minWidth: "320px", height: "fit-content", paddingX: "0", marginX: "0", position: "absolute", top: "0", left: "0", right: "0", bottom: "0" }}>
      <Navbar />
      <main style={{ marginTop: "70px" }}>{children}</main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/auth",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Auth />
      </Suspense>
    ),
  },
  {
    path: "/menu",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <MenuPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/account",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <UserAccountPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "/cart",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <CartPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: "checkout",
    element: (
      <Layout>
        <CheckoutPage />
      </Layout>
    ),
  },
  {
    path: "/info",
    element: (
      <Layout>
        <InfoPage />
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout>
        <AboutPage/>
      </Layout>
    ),
  },
  {
    path: "/premium",
    element: (
      <Layout>
        <PremiumPage/>
      </Layout>
    ),
  },
  {
    path: "/premium/join",
    element: (
      <Layout>
        <JoinPlanPage/>
      </Layout>
    ),
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <I18nProvider>
      <DynamicThemeProvider>
        <RouterProvider router={router} />
      </DynamicThemeProvider>
    </I18nProvider>
  </React.StrictMode>
);