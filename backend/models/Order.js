// models/Order.js
import { db } from "../firebase.js";

export class Order {
    static collection = db.collection('orders');

    static async create(orderData) {
        const docRef = await this.collection.add({
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...orderData };
    }

    static async getByUser(userId) {
        const snapshot = await this.collection.where('userId', '==', userId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async getAll() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(orderId, updateData) {
        await this.collection.doc(orderId).update({
            ...updateData,
            updatedAt: new Date().toISOString()
        });
        const updatedDoc = await this.collection.doc(orderId).get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }

    static async delete(orderId) {
        await this.collection.doc(orderId).delete();
        return { success: true, id: orderId };
    }
}