// models/Item.js
import { db } from "../firebase.js";

export class Item {
    static collection = db.collection('items');

    static async create(itemData) {
        const docRef = await this.collection.add({
            ...itemData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...itemData };
    }
    static async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
    }
    static async getBySection(section) {
        const snapshot = await this.collection.where('section', '==', section).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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