import { db } from "../firebase.js";

export class Item {
  static collection = db.collection("items");

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
  static async create(itemData) {
    const docRef = await this.collection.add({
      ...itemData,
      createdAt: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return this.serialize(doc);
  }

  static async getById(id) {
    const doc = await this.collection.doc(id).get();
    return this.serialize(doc);
  }

  static async getBySection(section) {
    const snapshot = await this.collection.where("section", "==", section).get();
    return snapshot.docs.map(this.serialize);
  }

  static async getAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(this.serialize);
  }

// models/Item.js
static async update(id, updatedData) {
  try {
    await this.collection.doc(id).update({
      ...updatedData,
      updatedAt: new Date().toISOString(),
    });
    const updatedDoc = await this.collection.doc(id).get();
    return this.serialize(updatedDoc);
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Failed to update item");
  }
}

  static async delete(id) {
    await this.collection.doc(id).delete();
    return { success: true, id };
  }
}