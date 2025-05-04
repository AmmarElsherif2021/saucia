import { db } from "../firebase.js";

export class Plan {
    static collection = db.collection('plans');

    static async create(planData) {
        const docRef = await this.collection.add({
            ...planData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...planData };
    }

    static async getAll() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(id, updatedData) {
        await this.collection.doc(id).update({
            ...updatedData,
            updatedAt: new Date().toISOString()
        });
        return { id, ...updatedData };
    }

    static async delete(id) {
        await this.collection.doc(id).delete();
        return { id, deleted: true };
    }
}