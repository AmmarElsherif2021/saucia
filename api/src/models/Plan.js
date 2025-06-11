import { db } from '../firebase.js'

export class Plan {
  static collection = db.collection('plans')

  // Helper function to serialize Firestore data
  static serialize(doc) {
    if (!doc.exists) return null
    const data = doc.data()

    // Handle dates that could be either Firestore timestamps or ISO strings
    const createdAt =
      data.createdAt instanceof Object && typeof data.createdAt.toDate === 'function'
        ? data.createdAt.toDate().toISOString()
        : data.createdAt

    const updatedAt =
      data.updatedAt instanceof Object && typeof data.updatedAt.toDate === 'function'
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt

    return {
      id: doc.id,
      title: data.title || '',
      title_arabic: data.title_arabic || '',
      periods: Array.isArray(data.periods) ? data.periods : [],
      carb: Number(data.carb) || 0,
      protein: Number(data.protein) || 0,
      kcal: Number(data.kcal) || 0,
      members: Array.isArray(data.members) ? data.members : [],
      avatar: data.avatar || '',
      carbMeals: Array.isArray(data.carbMeals) ? data.carbMeals : [],
      proteinMeals: Array.isArray(data.proteinMeals) ? data.proteinMeals : [],
      soaps: Array.isArray(data.soaps) ? data.soaps : [],
      snacks: Array.isArray(data.snacks) ? data.snacks : [],
      createdAt,
      updatedAt,
    }
  }

  static async create(planData) {
    // Ensure proper data typing
    const processedData = {
      title: String(planData.title || ''),
      title_arabic: String(planData.title_arabic || ''),
      periods: Array.isArray(planData.periods) ? planData.periods.filter((m) => m.trim()) : [],
      carb: Number(planData.carb) || 0,
      protein: Number(planData.protein) || 0,
      kcal: Number(planData.kcal) || 0,
      members: Array.isArray(planData.members) ? planData.members.filter((m) => m.trim()) : [],
      avatar: String(planData.avatar || ''),
      carbMeals: Array.isArray(planData.carbMeals)
        ? planData.carbMeals.filter((m) => m.trim())
        : [],
      proteinMeals: Array.isArray(planData.proteinMeals)
        ? planData.proteinMeals.filter((m) => m.trim())
        : [],
      soaps: Array.isArray(planData.soaps) ? planData.soaps.filter((m) => m.trim()) : [],
      snacks: Array.isArray(planData.snacks) ? planData.snacks.filter((m) => m.trim()) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await this.collection.add(processedData)
    const doc = await docRef.get()
    return this.serialize(doc)
  }

  static async getAll() {
    const snapshot = await this.collection.get()
    return snapshot.docs.map(this.serialize)
  }

  static async getById(id) {
    const doc = await this.collection.doc(id).get()
    return this.serialize(doc)
  }

  static async update(id, updatedData) {
    try {
      const processedData = {}
      if (updatedData.title !== undefined) processedData.title = String(updatedData.title)
      if (updatedData.title_arabic !== undefined)
        processedData.title_arabic = String(updatedData.title_arabic)
      if (updatedData.periods !== undefined)
        processedData.periods = Array.isArray(updatedData.periods)
          ? updatedData.periods.map(Number).filter((m) => m.trim())
          : []
      if (updatedData.carb !== undefined) processedData.carb = Number(updatedData.carb)
      if (updatedData.protein !== undefined) processedData.protein = Number(updatedData.protein)
      if (updatedData.kcal !== undefined) processedData.kcal = Number(updatedData.kcal)
      if (updatedData.members !== undefined)
        processedData.members = Array.isArray(updatedData.members)
          ? updatedData.members.filter((m) => m.trim())
          : []
      if (updatedData.carbMeals !== undefined)
        processedData.carbMeals = Array.isArray(updatedData.carbMeals)
          ? updatedData.carbMeals.filter((m) => m.trim())
          : []
      if (updatedData.proteinMeals !== undefined)
        processedData.proteinMeals = Array.isArray(updatedData.proteinMeals)
          ? updatedData.proteinMeals.filter((m) => m.trim())
          : []
      if (updatedData.soaps !== undefined)
        processedData.soaps = Array.isArray(updatedData.soaps)
          ? updatedData.soaps.filter((m) => m.trim())
          : []
      if (updatedData.snacks !== undefined)
        processedData.snacks = Array.isArray(updatedData.snacks)
          ? updatedData.snacks.filter((m) => m.trim())
          : []
      if (updatedData.avatar !== undefined) processedData.avatar = String(updatedData.avatar)
      processedData.updatedAt = new Date().toISOString()
      await this.collection.doc(id).update(processedData)
      const updatedDoc = await this.collection.doc(id).get()
      return this.serialize(updatedDoc)
    } catch (error) {
      console.error('Error updating plan:', error)
      throw new Error('Failed to update plan')
    }
  }

  static async delete(id) {
    await this.collection.doc(id).delete()
    return { success: true, id }
  }
}
