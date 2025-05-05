// Fixed users.js API client
import { getAuth } from "firebase/auth";

export const setAdminStatus = async (uid, isAdmin) => {
  try {
    const auth = getAuth();
    const idToken = await auth.currentUser.getIdToken(true);

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/set-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ uid, isAdmin }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update admin status: ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error setting admin status:", error);
    throw error;
  }
};
export const login = async ({ username, password }) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to login: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};


export const getUserInfo = async (uid) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken(true) : null;
    
    if (!idToken) throw new Error('No authenticated user');
    
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/${uid}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('User not found');
      }
      
      // Check if response is HTML (error page) instead of JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const errorText = await res.text();
        console.error("Non-JSON response:", errorText.substring(0, 100) + "...");
        throw new Error(`Invalid response format: ${res.status}`);
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
    
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      // Check if response is HTML instead of JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const errorText = await res.text();
        console.error("Non-JSON response:", errorText.substring(0, 100) + "...");
        throw new Error(`Invalid response format: ${res.status}`);
      }
      
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error('Failed to create user');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken(true) : null;
    
    if (!idToken) throw new Error('No authenticated user');
    
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/${uid}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!res.ok) {
      // Check if response is HTML instead of JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const errorText = await res.text();
        console.error("Non-JSON response:", errorText.substring(0, 100) + "...");
        throw new Error(`Invalid response format: ${res.status}`);
      }
      
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error('Failed to update user');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken(true) : null;
    
    if (!idToken) throw new Error('No authenticated user');
    
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
    });
    
    if (!res.ok) {
      // Check if response is HTML instead of JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        const errorText = await res.text();
        console.error("Non-JSON response:", errorText.substring(0, 100) + "...");
        throw new Error(`Invalid response format: ${res.status}`);
      }
      
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
};