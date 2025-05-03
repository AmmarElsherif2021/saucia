// Get Items
export const listItems = async (queryParams) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/items?` +
        new URLSearchParams(queryParams),
    )
    if (!res.ok) {
      throw new Error(`Error fetching Items: ${res.statusText}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Error listing Items:', error)
    throw error
  }
}
//Get specific Items by Id
export const getItemsById = async (itemsId) => {
  try {
    const res = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/items/${itemsId}`,
    )
    if (!res.ok) {
      throw new Error(
        `Error retrieving Items with id ${itemsId}: ${res.statusText}`,
      )
    }
    return await res.json()
  } catch (err) {
    console.error(`Error retrieving Items with id ${itemsId}: ${err}`)
    throw err
  }
}
// Create new Item
export const createItem = async (token, sectionId, item) => {
  console.log(`Items from api ${JSON.stringify(item)}`)
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      },
    )
    if (!res.ok) {
      throw new Error(`Error creating Items: ${res.statusText}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Error creating Items:', error)
    throw error
  }
}

//update Items
export const updateItem = async (token,itemsId,updates) => {
  try {
    const res = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/items/${itemsId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      },
    )
    if (!res.ok) {
      throw new Error(`Error updating Items: ${res.statusText}`)
    }
    return await res.json()
  } catch (error) {
    console.error('Error updating Items:', error)
    throw error
  }
}


// Delete a post
export const deleteItems = async (token, itemsId) => {
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/items/${itemsId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error('Failed to delete post')
  }

  return res
}
