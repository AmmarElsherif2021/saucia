import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./Components/theme";
import { Navbar } from "./Components/Navbar";

// Imported page components
import { HomePage } from "./Pages/Home/HomePage";
import { MenuPage } from "./Pages/MenuPage";
import { UserAccountPage } from "./Pages/UserAccountPage";
import { CartPage } from "./Pages/CartPage";
import { CheckoutPage } from "./Pages/CheckoutPage";
import { InfoPage } from "./Pages/InfoPage";
import { AboutPage } from "./Pages/AboutPage";

// Layout component to include Navbar
const Layout = ({ children }) => (
  <div style={{ maxWidth: "100vw", margin: "0", position:"absolute", top:"0", left:"0", right:"0", bottom:"0" }}>
    <Navbar />
    <main style={{ marginTop: "64px" }}>{children}</main>
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
    path: "/checkout",
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