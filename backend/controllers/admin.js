// controllers/admin.js
import { auth, db } from "../firebase.js";

// Set or remove admin status for a user
export const setUserAdminStatus = async (req, res) => {
  try {
    const { uid, isAdmin } = req.body;
    
    if (!uid) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: "isAdmin must be a boolean value" });
    }
    
    try {
      // Update Firebase Auth custom claims
      await auth.setCustomUserClaims(uid, { admin: isAdmin });
      
      // Also update the user document in Firestore
      await db.collection("users").doc(uid).update({
        isAdmin: isAdmin,
        updatedAt: new Date()
      });
      
      res.json({ 
        success: true, 
        message: `Admin status for user ${uid} ${isAdmin ? 'granted' : 'revoked'} successfully` 
      });
    } catch (error) {
      console.error("Error setting admin status:", error);
      res.status(400).json({ error: `Failed to update user: ${error.message}` });
    }
  } catch (error) {
    console.error("Error in setUserAdminStatus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get admin dashboard data
export const getDashboardData = async (req, res) => {
  try {
    // Get user count
    const usersSnapshot = await db.collection("users").count().get();
    const totalUsers = usersSnapshot.data().count;
    
    // Get admin count
    const adminsSnapshot = await db.collection("users").where("isAdmin", "==", true).count().get();
    const totalAdmins = adminsSnapshot.data().count;
    
    // Get recent users
    const recentUsersSnapshot = await db.collection("users")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();
    
    const recentUsers = recentUsersSnapshot.docs.map(doc => ({
      uid: doc.id,
      email: doc.data().email,
      displayName: doc.data().displayName,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
    
    res.json({
      totalUsers,
      totalAdmins,
      recentUsers
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ 
      uid: doc.id, 
      ...doc.data(),
      // Convert timestamps to ISO strings for JSON serialization
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
      lastLogin: doc.data().lastLogin?.toDate?.() || doc.data().lastLogin
    }));
    
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};