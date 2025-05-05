// API/admin.js
import { getAuth } from "firebase/auth";

const fetchWithAuth = async (url, options = {}) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("No authenticated user");
  }

  try {
    // Get a fresh token each time
    const idToken = await currentUser.getIdToken(true);
    
    console.log("Fetching:", url);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    console.log(`Response status: ${response.status}`);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType) {
      return { success: true }; // No content response
    }

    // For non-JSON responses, return text
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `Request failed with status ${response.status}`);
      }
      return { success: true, message: text };
    }

    // Parse JSON responses
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (error) {
      console.error("Error parsing response body:", error);
      throw new Error("Failed to parse JSON response");
    }

    if (!response.ok) {
      const errorMessage = responseBody.error || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseBody;
  } catch (error) {
    console.error("Error in fetchWithAuth:", error);
    
    // Check if token expired and user needs to re-authenticate
    if (error.code === 'auth/id-token-expired' || 
        error.code === 'auth/user-token-expired' ||
        error.message?.includes('token')) {
      // Force re-authentication
      auth.signOut().then(() => {
        window.location.href = '/login?session=expired';
      });
    }
    
    throw error;
  }
};

// Verify if the current user has admin privileges
export const verifyAdmin = async () => {
  try {
    const response = await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/api/admin/verify`);
    console.log("Admin verification response:", response);
    return { isAdmin: response?.isAdmin === true };
  } catch (error) {
    console.error("Error verifying admin status:", error);
    return { isAdmin: false, error: error.message };
  }
};

// Get admin dashboard data
export const getAdminDashboard = async () => {
  try {
    return await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/api/admin/dashboard`);
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    throw error;
  }
};

// Get all users (admin only endpoint)
export const getAllUsers = async () => {
  try {
    return await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/api/admin/users`);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Set or remove admin status for a user
export const setAdminStatus = async (uid, isAdmin) => {
  try {
    return await fetchWithAuth(`${import.meta.env.VITE_BASE_URL}/api/admin/set-admin`, {
      method: "POST",
      body: JSON.stringify({ uid, isAdmin }),
    });
  } catch (error) {
    console.error("Error setting admin status:", error);
    throw error;
  }
};