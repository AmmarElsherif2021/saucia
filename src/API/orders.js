// Helper function to handle API requests
const fetchWithAuth = async (url, options = {}, token) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const res = await fetch(url, { ...options, headers });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `API request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error in API request to ${url}:`, error);
    throw error;
  }
};

// Create a new order
export const createOrder = async (token, orderData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/orders`;
  return await fetchWithAuth(
    url,
    {
      method: "POST",
      body: JSON.stringify(orderData),
    },
    token
  );
};

// Get all orders (admin only)
export const getAllOrders = async (token) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/orders`;
  return await fetchWithAuth(url, {}, token);
};

// Get orders for the authenticated user
export const getUserOrders = async (token) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/orders/user`;
  return await fetchWithAuth(url, {}, token);
};

// Update an order by ID
export const updateOrder = async (token, orderId, updates) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/orders/${orderId}`;
  return await fetchWithAuth(
    url,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
    token
  );
};

// Delete an order by ID
export const deleteOrder = async (token, orderId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/orders/${orderId}`;
  return await fetchWithAuth(
    url,
    {
      method: "DELETE",
    },
    token
  );
};