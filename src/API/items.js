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

// In items.js update these functions:
export const listItems = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams);
  const url = `${import.meta.env.VITE_BASE_URL}/api/items?${searchParams}`;
  const response = await fetch(url);
  return await response.json(); // Add JSON parsing
};

export const getItemById = async (itemId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/items/${itemId}`;
  const response = await fetch(url);
  return await response.json(); // Add JSON parsing
};

export const getItemsBySection = async (section) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/items/section/${section}`;
  const response = await fetch(url);
  return await response.json(); 
};

// Create a new item
export const createItem = async (token, itemData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/items`;
  return await fetchWithAuth(
    url,
    {
      method: "POST",
      body: JSON.stringify(itemData),
    },
    token
  );
};

// Update an item by ID
export const updateItem = async (token, itemId, updates) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/items/${itemId}`;
  return await fetchWithAuth(
    url,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
    token
  );
};

// Delete an item by ID
export const deleteItem = async (token, itemId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/items/${itemId}`;
  return await fetchWithAuth(
    url,
    {
      method: "DELETE",
    },
    token
  );
};