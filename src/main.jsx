
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

import React from "react";
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import theme from './Components/theme';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
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

