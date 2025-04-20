import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import DynamicThemeProvider from "./ThemeProvider.jsx";
import theme from "./theme.jsx";
import './i18n';
import { Navbar } from "./Components/Navbar/Navbar.jsx";
import { useEffect } from "react";
import { useTranslation } from "react-i18next"; 
import "./index.css";
// Imported page components
import { HomePage } from "./Pages/Home/HomePage.jsx";
import { MenuPage } from "./Pages/Menu/MenuPage.jsx";
import { UserAccountPage } from "./Pages/UserAccountPage.jsx";
import { CartPage } from "./Pages/Cart/CartPage.jsx";
import { CheckoutPage } from "./Pages/Checkout/CheckoutPage.jsx";
import { InfoPage } from "./Pages/InfoPage.jsx";
import { AboutPage } from "./Pages/About/AboutPage.jsx";
import {PremiumPage} from "./Pages/Premium/PremiumPage.jsx";
import JoinPlanPage from "./Pages/Premium/JoinPlan/JoinPlanPage.jsx";

// Layout component to include Navbar
const Layout = ({ children }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

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
        <HomePage />
      </Layout>
    ),
  },
  {
    path: "/menu",
    element: (
      <Layout>
        <MenuPage />
      </Layout>
    ),
  },
  {
    path: "/account",
    element: (
      <Layout>
        <UserAccountPage />
      </Layout>
    ),
  },
  {
    path: "/cart",
    element: (
      <Layout>
        <CartPage />
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
    <DynamicThemeProvider>
      <RouterProvider router={router} />
    </DynamicThemeProvider>
  </React.StrictMode>
);