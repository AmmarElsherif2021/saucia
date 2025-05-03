// models/User.js
import { db } from "../firebase.js";

const userCollection = db.collection('users');

export class User {

    static async getAll() {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => new User({ uid: doc.id, ...doc.data() }));
}
  /**
   * Get user by ID
   * @param {string} uid - Firebase user ID
   * @returns {Promise<Object|null>} User data or null if not found
   */
  static async getById(uid) {
    try {
      const doc = await userCollection.doc(uid).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  /**
   * Update user data
   * @param {string} uid - Firebase user ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user data
   */
  static async update(uid, updateData) {
    try {
      // Remove any fields that shouldn't be directly updated by users
      const { email, emailVerified, ...safeUpdateData } = updateData;
      
      await userCollection.doc(uid).update(safeUpdateData);
      
      // Return the updated user object
      return await this.getById(uid);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Create a new user record
   * @param {string} uid - Firebase user ID
   * @param {Object} userData - User data to save
   * @returns {Promise<Object>} Created user data
   */
  static async create(uid, userData) {
    try {
      // Set default values and merge with provided data
      const defaultUserData = {
        createdAt: new Date(),
        isAdmin: false,
        dietaryPreferences: [],
        allergies: []
      };
      
      const newUserData = { ...defaultUserData, ...userData };
      
      await userCollection.doc(uid).set(newUserData);
      
      return await this.getById(uid);
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {string} uid - Firebase user ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(uid) {
    try {
      await userCollection.doc(uid).delete();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

