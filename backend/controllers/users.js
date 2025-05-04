// controllers/users.js
import { db } from "../firebase.js";

// Create user
export const createUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userData = {
      email: req.user.email,
      displayName: req.body.displayName || req.user.displayName,
      createdAt: new Date(),
      isAdmin: req.user.isAdmin || false // Store admin status in Firestore
    };
    
    // Check if user already exists (idempotent)
    const userDoc = await db.collection("users").doc(uid).get();
    
    if (userDoc.exists) {
      return res.status(200).json({ 
        uid, 
        ...userDoc.data(),
        message: "User already exists"
      });
    }
    
    // Create new user
    await db.collection("users").doc(uid).set(userData);
    res.status(201).json({ uid, ...userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single user
export const getUser = async (req, res) => {
  try {
    const requestedUid = req.params.uid;
    const currentUserUid = req.user.uid;
    const isAdmin = req.user.isAdmin;
    
    // Users can only access their own data unless they're an admin
    if (requestedUid !== currentUserUid && !isAdmin) {
      return res.status(403).json({ error: "Forbidden - You can only access your own user data" });
    }
    
    const doc = await db.collection("users").doc(requestedUid).get();
    if (!doc.exists) return res.status(404).json({ error: "User not found" });

    res.json({ uid: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const requestedUid = req.params.uid;
    const currentUserUid = req.user.uid;
    const isAdmin = req.user.isAdmin;
    
    // Users can only update their own data unless they're an admin
    if (requestedUid !== currentUserUid && !isAdmin) {
      return res.status(403).json({ error: "Forbidden - You can only update your own user data" });
    }
    
    // Don't allow updating admin status via this endpoint
    if (req.body.isAdmin !== undefined && !isAdmin) {
      delete req.body.isAdmin;
    }
    
    const updatedData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    await db.collection("users").doc(requestedUid).update(updatedData);
    const updatedDoc = await db.collection("users").doc(requestedUid).get();
    res.json({ uid: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};