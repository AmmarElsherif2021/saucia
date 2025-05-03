import { db } from "../firebase.js"; // Import Firestore instance
import { setAdminClaim } from "../firebase.js";

// Create user
export const createUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userData = {
      email: req.user.email,
      displayName: req.body.displayName || req.user.displayName,
    };
    await db.collection("users").doc(uid).set(userData); // Firestore operation
    res.status(201).json({ uid, ...userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get(); // Firestore operation
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single user
export const getUser = async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.params.uid).get(); // Firestore operation
    if (!doc.exists) return res.status(404).json({ error: "User not found" });

    res.json({ uid: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const uid = req.params.uid;
    await db.collection("users").doc(uid).update(req.body); // Firestore operation
    const updatedDoc = await db.collection("users").doc(uid).get();
    res.json({ uid: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};