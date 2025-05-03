// Get Orders
export const listOrders = async (token,queryParams = {}) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/?` +
        new URLSearchParams(queryParams),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Error fetching Orders: ${errorText}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Error listing Orders:', error)
    throw error
  }
}
// Get client orders history
export const getOrdersHistoryOfClient = async (token, userId) => {
  const searchParams = new URLSearchParams({
    uid: userId,
    sortBy: 'createdAt',
    sortOrder: 'descending',
  })

  const res = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/users/${userId}/orders?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error('Failed to fetch latest meal')
  }

  const orders = await res.json()
  console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`, orders)
  return orders || null
};


// Create new Order
export const createOrder = async (token, orderData) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    })
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Error creating Order: ${errorText}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Error creating Order:', error)
    throw error
  }
}

// Get Order by ID
export const getOrderById = async (token,orderId) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Error fetching Order: ${errorText}`)
    }
    console.log(`API retrieve Order`)
    return await res.json()
  } catch (error) {
    console.error('Error fetching Order:', error)
    throw error
  }
}

// Update Order
export const updateOrder = async (orderId, token, orderData) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      },
    )
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Error updating Order: ${errorText}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Error updating Order:', error)
    throw error
  }
}

// Delete Order
export const deleteOrder = async (orderId, token) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/orders/${orderId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Error deleting Order: ${errorText}`)
    }
    return null
  } catch (error) {
    console.error('Error deleting Order:', error)
    throw error
  }
}
