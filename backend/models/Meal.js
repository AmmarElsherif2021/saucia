import { db } from "../firebase.js";

export class Meal {
    static collection = db.collection('meals');

    static async create(mealData) {
        const docRef = await this.collection.add({
            ...mealData,
            isPremium: Boolean(mealData.isPremium),
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...mealData };
    }

    static async getByPlan(planId) {
        const snapshot = await this.collection.where('plan', '==', planId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async getAll() {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    static async update(mealId, updatedData) {
        await this.collection.doc(mealId).update({
            ...updatedData,
            updatedAt: new Date().toISOString()
        });
        const updatedDoc = await this.collection.doc(mealId).get();
        return { id: updatedDoc.id, ...updatedDoc.data() };
    }

    static async delete(mealId) {
        await this.collection.doc(mealId).delete();
        return { success: true, id: mealId };
    }
}