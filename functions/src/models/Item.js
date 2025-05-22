import { db } from '../firebase.js'

export class Item {
  static collection = db.collection('items')

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
      planId: data.planId || '',
      name: data.name || '',
      name_arabic: data.name_arabic || '',
      section: data.section || '',
      section_arabic: data.section_arabic || '',
      addon_price: Number(data.addon_price) || 0,
      free_count: Number(data.free_count) || 0,
      item_kcal: Number(data.item_kcal) || 0,
      item_protein: Number(data.item_protein) || 0,
      image: data.image || '',
      createdAt,
      updatedAt,
    }
  }

  static async create(itemData) {
    // Ensure proper data typing
    const processedData = {
      planId: String(itemData.planId || ''),
      name: String(itemData.name || ''),
      name_arabic: String(itemData.name_arabic || ''),
      section: String(itemData.section || ''),
      section_arabic: String(itemData.section_arabic || ''),
      addon_price: Number(itemData.addon_price) || 0,
      free_count: Number(itemData.free_count) || 0,
      item_kcal: Number(itemData.item_kcal) || 0,
      item_protein: Number(itemData.item_protein) || 0,
      image: String(itemData.image || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await this.collection.add(processedData)
    const doc = await docRef.get()
    return this.serialize(doc)
  }

  static async getById(id) {
    const doc = await this.collection.doc(id).get()
    return this.serialize(doc)
  }

  static async getBySection(section) {
    const snapshot = await this.collection.where('section', '==', section).get()
    return snapshot.docs.map(this.serialize)
  }

  static async getAll() {
    const snapshot = await this.collection.get()
    return snapshot.docs.map(this.serialize)
  }

  static async update(id, updatedData) {
    try {
      // Ensure proper data typing
      const processedData = {}

      if (updatedData.name !== undefined) processedData.name = String(updatedData.name)
      if (updatedData.name_arabic !== undefined)
        processedData.name_arabic = String(updatedData.name_arabic)
      if (updatedData.planId !== undefined) processedData.planId = String(updatedData.planId)
      if (updatedData.section !== undefined) processedData.section = String(updatedData.section)
      if (updatedData.section_arabic !== undefined)
        processedData.section_arabic = String(updatedData.section_arabic)
      if (updatedData.addon_price !== undefined)
        processedData.addon_price = Number(updatedData.addon_price)
      if (updatedData.free_count !== undefined)
        processedData.free_count = Number(updatedData.free_count)
      if (updatedData.item_kcal !== undefined)
        processedData.item_kcal = Number(updatedData.item_kcal)
      if (updatedData.item_protein !== undefined)
        processedData.item_protein = Number(updatedData.item_protein)
      if (updatedData.image !== undefined) processedData.image = String(updatedData.image)

      processedData.updatedAt = new Date().toISOString()

      await this.collection.doc(id).update(processedData)
      const updatedDoc = await this.collection.doc(id).get()
      return this.serialize(updatedDoc)
    } catch (error) {
      console.error('Error updating item:', error)
      throw new Error('Failed to update item')
    }
  }

  static async delete(id) {
    await this.collection.doc(id).delete()
    return { success: true, id }
  }
}
