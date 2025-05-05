// Get all meals
export const getMeals = async (token, queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams);

  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/meals?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Meals");
  }

  return await res.json();
};

// Get meals for a specific plan
export const getPlanMeals = async (token, planId, queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams);

  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/meals/plan/${planId}?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Plan Meals");
  }

  return await res.json();
};

// Get a specific meal by ID
export const getMealById = async (token, mealId) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/meals/${mealId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch meal");
  }

  return await res.json();
};

// Create a new meal
export const createMeal = async (token, mealData) => {
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/meals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(mealData),
  });

  if (!res.ok) {
    throw new Error("Failed to create meal");
  }

  return await res.json();
};

// Update a meal
export const updateMeal = async (token, mealId, mealData) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/meals/${mealId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealData),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update meal");
  }

  return await res.json();
};

// Delete a meal
export const deleteMeal = async (token, mealId) => {
  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/meals/${mealId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to delete meal");
  }

  return { success: true, id: mealId };
};

// Get favorite meals of a client
export const getFavMealsOfClient = async (token, userId) => {
  const searchParams = new URLSearchParams({
    uid: userId,
    sortBy: "createdAt",
    sortOrder: "descending",
  });

  const res = await fetch(
    `${import.meta.env.VITE_BASE_URL}/users/${userId}/meals?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch favorite meals");
  }

  return await res.json();
};