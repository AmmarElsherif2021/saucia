import { db } from '../firebase.js'

export class Order {
  static collection = db.collection('orders')

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

    const deliveryDate =
      data.deliveryDate instanceof Object && typeof data.deliveryDate.toDate === 'function'
        ? data.deliveryDate.toDate().toISOString()
        : data.deliveryDate

    const paymentDate =
      data.paymentDate instanceof Object && typeof data.paymentDate.toDate === 'function'
        ? data.paymentDate.toDate().toISOString()
        : data.paymentDate

    return {
      id: doc.id,
      userId: data.userId || '',
      user: data.user || null,
      items: Array.isArray(data.items) ? data.items : [],
      meals: Array.isArray(data.meals) ? data.meals : [],
      totalPrice: Number(data.totalPrice) || 0,
      subtotal: Number(data.subtotal) || 0,
      tax: Number(data.tax) || 0,
      discount: Number(data.discount) || 0,
      deliveryFee: Number(data.deliveryFee) || 0,
      status: data.status || 'pending',
      isPaid: Boolean(data.isPaid),
      paymentMethod: data.paymentMethod || 'cash',
      paymentId: data.paymentId || '',
      paymentDate,
      deliveryAddress: data.deliveryAddress || '',
      deliveryInstructions: data.deliveryInstructions || '',
      deliveryDate,
      contactPhone: data.contactPhone || '',
      notes: data.notes || '',
      couponCode: data.couponCode || '',
      createdAt,
      updatedAt,
    }
  }

  static async create(orderData) {
    // Ensure proper data typing
    const processedData = {
      userId: String(orderData.userId || ''),
      user: orderData.user || null,
      items: Array.isArray(orderData.items) ? orderData.items : [],
      meals: Array.isArray(orderData.meals) ? orderData.meals : [],
      totalPrice: Number(orderData.totalPrice) || 0,
      subtotal: Number(orderData.subtotal) || 0,
      tax: Number(orderData.tax) || 0,
      discount: Number(orderData.discount) || 0,
      deliveryFee: Number(orderData.deliveryFee) || 0,
      status: String(orderData.status || 'pending'),
      isPaid: Boolean(orderData.isPaid || false),
      paymentMethod: String(orderData.paymentMethod || 'cash'),
      paymentId: String(orderData.paymentId || ''),
      paymentDate: orderData.paymentDate || null,
      deliveryAddress: String(orderData.deliveryAddress || ''),
      deliveryInstructions: String(orderData.deliveryInstructions || ''),
      deliveryDate: orderData.deliveryDate || null,
      contactPhone: String(orderData.contactPhone || ''),
      notes: String(orderData.notes || ''),
      couponCode: String(orderData.couponCode || ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await this.collection.add(processedData)
    const doc = await docRef.get()
    return this.serialize(doc)
  }

  static async getByUser(userId) {
    const snapshot = await this.collection.where('userId', '==', userId).get()
    return snapshot.docs.map(this.serialize)
  }

  static async getByStatus(status) {
    const snapshot = await this.collection.where('status', '==', status).get()
    return snapshot.docs.map(this.serialize)
  }

  static async getByPaymentStatus(isPaid) {
    const snapshot = await this.collection.where('isPaid', '==', Boolean(isPaid)).get()
    return snapshot.docs.map(this.serialize)
  }

  static async getAll() {
    const snapshot = await this.collection.get()
    return snapshot.docs.map(this.serialize)
  }

  static async getById(orderId) {
    const doc = await this.collection.doc(orderId).get()
    return this.serialize(doc)
  }

  static async update(orderId, updateData) {
    try {
      // Ensure proper data typing
      const processedData = {}

      if (updateData.userId !== undefined) processedData.userId = String(updateData.userId)
      if (updateData.user !== undefined) processedData.user = updateData.user
      if (updateData.items !== undefined)
        processedData.items = Array.isArray(updateData.items) ? updateData.items : []
      if (updateData.meals !== undefined)
        processedData.meals = Array.isArray(updateData.meals) ? updateData.meals : []
      if (updateData.totalPrice !== undefined)
        processedData.totalPrice = Number(updateData.totalPrice)
      if (updateData.subtotal !== undefined) processedData.subtotal = Number(updateData.subtotal)
      if (updateData.tax !== undefined) processedData.tax = Number(updateData.tax)
      if (updateData.discount !== undefined) processedData.discount = Number(updateData.discount)
      if (updateData.deliveryFee !== undefined)
        processedData.deliveryFee = Number(updateData.deliveryFee)
      if (updateData.status !== undefined) processedData.status = String(updateData.status)
      if (updateData.isPaid !== undefined) processedData.isPaid = Boolean(updateData.isPaid)
      if (updateData.paymentMethod !== undefined)
        processedData.paymentMethod = String(updateData.paymentMethod)
      if (updateData.paymentId !== undefined) processedData.paymentId = String(updateData.paymentId)
      if (updateData.paymentDate !== undefined) processedData.paymentDate = updateData.paymentDate
      if (updateData.deliveryAddress !== undefined)
        processedData.deliveryAddress = String(updateData.deliveryAddress)
      if (updateData.deliveryInstructions !== undefined)
        processedData.deliveryInstructions = String(updateData.deliveryInstructions)
      if (updateData.deliveryDate !== undefined)
        processedData.deliveryDate = updateData.deliveryDate
      if (updateData.contactPhone !== undefined)
        processedData.contactPhone = String(updateData.contactPhone)
      if (updateData.notes !== undefined) processedData.notes = String(updateData.notes)
      if (updateData.couponCode !== undefined)
        processedData.couponCode = String(updateData.couponCode)

      processedData.updatedAt = new Date().toISOString()

      await this.collection.doc(orderId).update(processedData)
      const updatedDoc = await this.collection.doc(orderId).get()
      return this.serialize(updatedDoc)
    } catch (error) {
      console.error('Error updating order:', error)
      throw new Error('Failed to update order')
    }
  }

  static async delete(orderId) {
    await this.collection.doc(orderId).delete()
    return { success: true, id: orderId }
  }
}
