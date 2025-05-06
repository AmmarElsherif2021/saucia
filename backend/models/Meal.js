import { db } from "../firebase.js";

export class Meal {
  static collection = db.collection("meals");

  // Helper function to serialize Firestore data
  static serialize(doc) {
  if (!doc.exists) return null;
  const data = doc.data();
  
  // Handle dates that could be either Firestore timestamps or ISO strings
  const createdAt = data.createdAt instanceof Object && typeof data.createdAt.toDate === 'function' 
    ? data.createdAt.toDate().toISOString() 
    : data.createdAt;
    
  const updatedAt = data.updatedAt instanceof Object && typeof data.updatedAt.toDate === 'function'
    ? data.updatedAt.toDate().toISOString()
    : data.updatedAt;
  
  return {
    id: doc.id,
    ...data,
    createdAt,
    updatedAt,
  };
}

  static async create(mealData) {
    const docRef = await this.collection.add({
      ...mealData,
      isPremium: Boolean(mealData.isPremium),
      createdAt: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return this.serialize(doc);
  }

  static async getByPlan(planId) {
    const snapshot = await this.collection.where("plan", "==", planId).get();
    return snapshot.docs.map(this.serialize);
  }

  static async getById(mealId) {
    const doc = await this.collection.doc(mealId).get();
    return this.serialize(doc);
  }

  static async getAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(this.serialize);
  }

  static async update(mealId, updatedData) {
    await this.collection.doc(mealId).update({
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
    const updatedDoc = await this.collection.doc(mealId).get();
    return this.serialize(updatedDoc);
  }

  static async delete(mealId) {
    await this.collection.doc(mealId).delete();
    return { success: true, id: mealId };
  }
}