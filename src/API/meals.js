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
      throw new Error(error.message || "API request failed");
    }

    return await res.json();
  } catch (error) {
    console.error(`Error in API request to ${url}:`, error);
    throw error;
  }
};

// Get all meals
export const getMeals = async (token, queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams);
  const url = `${import.meta.env.VITE_BASE_URL}/api/meals?${searchParams}`;
  return await fetchWithAuth(url, {}, token);
};

// Get meals for a specific plan
export const getPlanMeals = async (token, planId, queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams);
  const url = `${import.meta.env.VITE_BASE_URL}/api/meals/plan/${planId}?${searchParams}`;
  return await fetchWithAuth(url, {}, token);
};

// Get a specific meal by ID
export const getMealById = async (token, mealId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/meals/${mealId}`;
  return await fetchWithAuth(url, {}, token);
};

// Create a new meal
export const createMeal = async (token, mealData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/meals`;
  return await fetchWithAuth(
    url,
    {
      method: "POST",
      body: JSON.stringify(mealData),
    },
    token
  );
};

// Update a meal
export const updateMeal = async (token, mealId, mealData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/meals/${mealId}`;
  return await fetchWithAuth(
    url,
    {
      method: "PUT",
      body: JSON.stringify(mealData),
    },
    token
  );
};

// Delete a meal
export const deleteMeal = async (token, mealId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/meals/${mealId}`;
  return await fetchWithAuth(
    url,
    {
      method: "DELETE",
    },
    token
  );
};

// Get favorite meals of a client
export const getFavMealsOfClient = async (token, userId) => {
  const searchParams = new URLSearchParams({
    uid: userId,
    sortBy: "createdAt",
    sortOrder: "descending",
  });
  const url = `${import.meta.env.VITE_BASE_URL}/api/users/${userId}/meals?${searchParams}`;
  return await fetchWithAuth(url, {}, token);
};