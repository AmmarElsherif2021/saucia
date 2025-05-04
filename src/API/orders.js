// Get all orders
export const listOrders = async (token, queryParams = {}) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders?` +
        new URLSearchParams(queryParams),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error fetching Orders: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error listing Orders:", error);
    throw error;
  }
};

// Get orders for the authenticated user
export const getUserOrders = async (token) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error fetching user orders: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

// Create a new order
export const createOrder = async (token, orderData) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error creating Order: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error creating Order:", error);
    throw error;
  }
};

// Get an order by ID
export const getOrderById = async (token, orderId) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error fetching Order: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching Order:", error);
    throw error;
  }
};

// Update an order by ID
export const updateOrder = async (token, orderId, orderData) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error updating Order: ${errorText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error updating Order:", error);
    throw error;
  }
};

// Delete an order by ID
export const deleteOrder = async (token, orderId) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error deleting Order: ${errorText}`);
    }
    return { success: true, id: orderId };
  } catch (error) {
    console.error("Error deleting Order:", error);
    throw error;
  }
};