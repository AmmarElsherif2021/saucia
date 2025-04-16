import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./Components/theme.jsx";
import { Navbar } from "./Components/Navbar/Navbar.jsx";

// Imported page components
import { HomePage } from "./Pages/Home/HomePage.jsx";
import { MenuPage } from "./Pages/Menu/MenuPage.jsx";
import { UserAccountPage } from "./Pages/UserAccountPage.jsx";
import { CartPage } from "./Pages/Cart/CartPage.jsx";
import { CheckoutPage } from "./Pages/Checkout/CheckoutPage.jsx";
import { InfoPage } from "./Pages/InfoPage.jsx";
import { AboutPage } from "./Pages/About/AboutPage.jsx";

// Layout component to include Navbar
const Layout = ({ children }) => (
  <div style={{ backgroundColor: "white", width: "100%", minWidth: "320px", height: "fit-content", paddingX: "0", marginX: "0", position: "absolute", top: "0", left: "0", right: "0", bottom: "0" }}>
    <Navbar />
    <main style={{ marginTop: "70px" }}>{children}</main>
  </div>
);

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
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ChakraProvider theme={theme} resetCSS={false}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);