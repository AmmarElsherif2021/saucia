import { db } from '../firebase.js'

export class Meal {
  static collection = db.collection('meals')

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

    const offerLimit =
      data.offerLimit instanceof Object && typeof data.offerLimit.toDate === 'function'
        ? data.offerLimit.toDate().toISOString()
        : data.offerLimit

    return {
      id: doc.id,
      name: data.name || '',
      name_arabic: data.name_arabic || '',
      section: data.section || '',
      section_arabic: data.section_arabic || '',
      price: Number(data.price) || 0,
      kcal: Number(data.kcal) || 0,
      protein: Number(data.protein) || 0,
      carb: Number(data.carb) || 0,
      policy: data.policy || '',
      ingredients: data.ingredients || '',
      ingredients_arabic: data.ingredients_arabic || '',
      items: Array.isArray(data.items) ? data.items : [],
      image: data.image || '',
      isPremium: Boolean(data.isPremium),
      plan: data.plan || '',
      rate: Number(data.rate) || 4.5,
      featured: Boolean(data.featured),
      offerRatio: Number(data.offerRatio) || 1,
      offerLimit,
      description: data.description || '',
      createdAt,
      updatedAt,
    }
  }

  static async create(mealData) {
    // Ensure proper data typing
    const processedData = {
      name: String(mealData.name || ''),
      name_arabic: String(mealData.name_arabic || ''),
      section: String(mealData.section || ''),
      section_arabic: String(mealData.section_arabic || ''),
      price: Number(mealData.price) || 0,
      kcal: Number(mealData.kcal) || 0,
      protein: Number(mealData.protein) || 0,
      carb: Number(mealData.carb) || 0,
      policy: String(mealData.policy || ''),
      ingredients: String(mealData.ingredients || ''),
      ingredients_arabic: String(mealData.ingredients_arabic || ''),
      items: Array.isArray(mealData.items) ? mealData.items : [],
      image: String(mealData.image || ''),
      isPremium: Boolean(mealData.isPremium),
      plan: String(mealData.plan || ''),
      rate: Number(mealData.rate) || 4.5,
      featured: Boolean(mealData.featured),
      offerRatio: Number(mealData.offerRatio) || 1,
      offerLimit: mealData.offerLimit || '',
      description: String(mealData.description || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await this.collection.add(processedData)
    const doc = await docRef.get()
    return this.serialize(doc)
  }

  static async getByPlan(planId) {
    const snapshot = await this.collection.where('plan', '==', planId).get()
    return snapshot.docs.map(this.serialize)
  }

  static async getFeatured() {
    const snapshot = await this.collection.where('featured', '==', true).get()
    return snapshot.docs.map(this.serialize)
  }

  static async getById(mealId) {
    const doc = await this.collection.doc(mealId).get()
    return this.serialize(doc)
  }

  static async getAll() {
    const snapshot = await this.collection.get()
    return snapshot.docs.map(this.serialize)
  }

  static async update(mealId, updatedData) {
    // Ensure proper data typing
    const processedData = {}

    if (updatedData.name !== undefined) processedData.name = String(updatedData.name)
    if (updatedData.name_arabic !== undefined)
      processedData.name_arabic = String(updatedData.name_arabic)
    if (updatedData.section !== undefined) processedData.section = String(updatedData.section)
    if (updatedData.section_arabic !== undefined)
      processedData.section_arabic = String(updatedData.section_arabic)
    if (updatedData.price !== undefined) processedData.price = Number(updatedData.price)
    if (updatedData.kcal !== undefined) processedData.kcal = Number(updatedData.kcal)
    if (updatedData.protein !== undefined) processedData.protein = Number(updatedData.protein)
    if (updatedData.carb !== undefined) processedData.carb = Number(updatedData.carb)
    if (updatedData.policy !== undefined) processedData.policy = String(updatedData.policy)
    if (updatedData.ingredients !== undefined)
      processedData.ingredients = String(updatedData.ingredients)
    if (updatedData.ingredients_arabic !== undefined)
      processedData.ingredients_arabic = String(updatedData.ingredients_arabic)
    if (updatedData.items !== undefined)
      processedData.items = Array.isArray(updatedData.items) ? updatedData.items : []
    if (updatedData.image !== undefined) processedData.image = String(updatedData.image)
    if (updatedData.isPremium !== undefined)
      processedData.isPremium = Boolean(updatedData.isPremium)
    if (updatedData.plan !== undefined) processedData.plan = String(updatedData.plan)
    if (updatedData.rate !== undefined) processedData.rate = Number(updatedData.rate)
    if (updatedData.featured !== undefined) processedData.featured = Boolean(updatedData.featured)
    if (updatedData.offerRatio !== undefined)
      processedData.offerRatio = Number(updatedData.offerRatio)
    if (updatedData.offerLimit !== undefined) processedData.offerLimit = updatedData.offerLimit
    if (updatedData.description !== undefined)
      processedData.description = String(updatedData.description)

    processedData.updatedAt = new Date().toISOString()

    await this.collection.doc(mealId).update(processedData)
    const updatedDoc = await this.collection.doc(mealId).get()
    return this.serialize(updatedDoc)
  }

  static async delete(mealId) {
    await this.collection.doc(mealId).delete()
    return { success: true, id: mealId }
  }
}
