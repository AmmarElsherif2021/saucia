// Fixed users.js API client
import { getAuth } from "firebase/auth";

export const login = async ({ username, password }) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) throw new Error('failed to login');
  return await res.json();
}

export const getUserInfo = async (uid) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken(true) : null;

    if (!idToken) throw new Error("No authenticated user");

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("User not found");
      }
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to get user: ${res.status}`);
    }

    const data = await res.json();
    console.log(`Get user info ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.error("Error getting user info:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken(true) : null;
    
    if (!idToken) throw new Error('No authenticated user');
    
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error('Failed to create user');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export const updateUserProfile = async (uid, userData) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken(true) : null;
    
    if (!idToken) throw new Error('No authenticated user');
    
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${uid}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error('Failed to update user');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export const getAllUsers = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken(true) : null;
    
    if (!idToken) throw new Error('No authenticated user');
    
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error('Failed to fetch users');
    }
    
    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data.users && Array.isArray(data.users)) {
      return data.users;
    } else if (
      typeof data === 'object' &&
      Object.values(data).every((item) => item?.username)
    ) {
      return Object.values(data);
    }

    console.error('Unexpected users data format:', data);
    return [];
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}