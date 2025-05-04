import { getAuth } from "firebase/auth";

const fetchWithAuth = async (url, options = {}) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("No authenticated user");
  }

  const idToken = await currentUser.getIdToken(true);
  console.log("Firebase ID Token:", idToken);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });

  console.log(`Response status: ${response.status}`);

  let responseBody;
  try {
    responseBody = await response.json();
    console.log(`Response body: ${JSON.stringify(responseBody)}`);
  } catch (error) {
    console.error("Error parsing response body:", error);
    throw new Error("Failed to parse JSON response");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  };
  return responseBody;
};
// Verify if the current user has admin privileges
export const verifyAdmin = async () => {
  try {
    const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/api/admin/verify`);
    console.log(`From verifyAdmin response: ${JSON.stringify(response)}`)
    return response.isAdmin || false;
  } catch (error) {
    console.error("Error verifying admin status:", error);
    return false;
  }
};

// Get admin dashboard data
export const getAdminDashboard = async () => {
  return fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/api/admin/dashboard`);
};

// Get all users (admin only endpoint)
export const getAllUsers = async () => {
  return fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`);
};

// Set or remove admin status for a user
export const setAdminStatus = async (uid, isAdmin) => {
  return fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL}/api/admin/set-admin`, {
    method: "POST",
    body: JSON.stringify({ uid, isAdmin }),
  });
};