import { db } from "../firebase.js";

export class Order {
  static collection = db.collection("orders");

  // Helper function to serialize Firestore data
  static serialize(doc) {
    if (!doc.exists) return null;
    const data = doc.data();

    // Handle dates that could be either Firestore timestamps or ISO strings
    const createdAt =
      data.createdAt instanceof Object && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;

    const updatedAt =
      data.updatedAt instanceof Object && typeof data.updatedAt.toDate === "function"
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt;

    return {
      id: doc.id,
      ...data,
      createdAt,
      updatedAt,
    };
  }

  static async create(orderData) {
    const docRef = await this.collection.add({
      ...orderData,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return this.serialize(doc);
  }

  static async getByUser(userId) {
    const snapshot = await this.collection.where("userId", "==", userId).get();
    return snapshot.docs.map(this.serialize);
  }

  static async getAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(this.serialize);
  }

  static async getById(orderId) {
    const doc = await this.collection.doc(orderId).get();
    return this.serialize(doc);
  }

  static async update(orderId, updateData) {
    try {
      await this.collection.doc(orderId).update({
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
      const updatedDoc = await this.collection.doc(orderId).get();
      return this.serialize(updatedDoc);
    } catch (error) {
      console.error("Error updating order:", error);
      throw new Error("Failed to update order");
    }
  }

  static async delete(orderId) {
    await this.collection.doc(orderId).delete();
    return { success: true, id: orderId };
  }
}