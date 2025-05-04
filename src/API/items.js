// Get all items
export const listItems = async (queryParams = {}) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/items?` +
        new URLSearchParams(queryParams)
    );

    if (!res.ok) {
      throw new Error(`Error fetching Items: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error listing Items:", error);
    throw error;
  }
};

// Get an item by ID
export const getItemById = async (itemId) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/items/${itemId}`
    );

    if (!res.ok) {
      throw new Error(
        `Error retrieving Item with ID ${itemId}: ${res.statusText}`
      );
    }
    return await res.json();
  } catch (error) {
    console.error(`Error retrieving Item with ID ${itemId}:`, error);
    throw error;
  }
};

// Get items by section
export const getItemsBySection = async (section) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/items/section/${section}`
    );

    if (!res.ok) {
      throw new Error(
        `Error retrieving Items for section ${section}: ${res.statusText}`
      );
    }
    return await res.json();
  } catch (error) {
    console.error(`Error retrieving Items for section ${section}:`, error);
    throw error;
  }
};

// Create a new item
export const createItem = async (token, itemData) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    });

    if (!res.ok) {
      throw new Error(`Error creating Item: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error creating Item:", error);
    throw error;
  }
};

// Update an item by ID
export const updateItem = async (token, itemId, updates) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/items/${itemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!res.ok) {
      throw new Error(`Error updating Item: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error updating Item:", error);
    throw error;
  }
};

// Delete an item by ID
export const deleteItem = async (token, itemId) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/items/${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Error deleting Item: ${res.statusText}`);
    }
    return { success: true, id: itemId };
  } catch (error) {
    console.error("Error deleting Item:", error);
    throw error;
  }
};