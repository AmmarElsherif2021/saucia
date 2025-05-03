export const getMeals = async (token, queryParams = {}) => {
  const searchParams = new URLSearchParams(queryParams)

  const res = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/meals?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error('Failed to fetch Meals')
  }
  //console.log(`API ------------------------ ${JSON.stringify(res)}`)
  return await res.json()
}

// Get Meals for a specific Plan
export const getPlanMeals = async (
  token,
  planId,
  queryParams = {},
) => {
  const searchParams = new URLSearchParams(queryParams)
  const res = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/plans/${planId}/meals?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error('Failed to fetch Plan Meals')
  }

  return await res.json()
}

// Get a specific meal by ID
export const getMealById = async (token,mealId) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/meals/${mealId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error('Failed to fetch meal')
  }

  return await res.json()
}

// Create a project-level meal
export const createMeal = async (token, projectId, mealData) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/projects/${projectId}/meals`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealData),
    },
  )

  if (!res.ok) {
    throw new Error('Failed to create meal')
  }

  return await res.json()
}

// Create a Plan-level meal
export const createPlanMeal = async (token, planId, PlanId, mealData) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/plans/${planId}/meals/${PlanId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealData),
    },
  )

  if (!res.ok) {
    throw new Error('Failed to create Plan meal')
  }

  return await res.json()
}

// Update a meal
export const updateMeal = async (token, mealId, mealData) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/meals/${mealId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mealData),
    },
  )

  if (!res.ok) {
    throw new Error('Failed to update meal')
  }

  return await res.json()
}

// Delete a meal
export const deleteMeal = async (token, mealId) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/meals/${mealId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error('Failed to delete meal')
  }

  return res
}

//Get fav meal by author
export const getFavMealsOfClient = async (token, userId) => {
  const searchParams = new URLSearchParams({
    uid: userId,
    sortBy: 'createdAt',
    sortOrder: 'descending',
  })

  const res = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/users/${userId}/meals?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error('Failed to fetch latest meal')
  }

  const meals = await res.json()
  console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`, meals)
  return meals || null
}
