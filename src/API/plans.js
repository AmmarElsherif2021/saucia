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

// Get all plans
export const listPlans = async (queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams);
  const url = `${import.meta.env.VITE_BASE_URL}/api/plans?${searchParams}`;
  return await fetchWithAuth(url);
};

// Get a plan by ID
export const getPlanById = async (planId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/plans/${planId}`;
  return await fetchWithAuth(url);
};

// Create a new plan
export const createPlan = async (token, planData) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/plans`;
  return await fetchWithAuth(
    url,
    {
      method: "POST",
      body: JSON.stringify(planData),
    },
    token
  );
};

// Update a plan by ID
export const updatePlan = async (token, planId, updates) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/plans/${planId}`;
  return await fetchWithAuth(
    url,
    {
      method: "PUT",
      body: JSON.stringify(updates),
    },
    token
  );
};

// Delete a plan by ID
export const deletePlan = async (token, planId) => {
  const url = `${import.meta.env.VITE_BASE_URL}/api/plans/${planId}`;
  return await fetchWithAuth(
    url,
    {
      method: "DELETE",
    },
    token
  );
};