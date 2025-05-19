/* eslint-disable */
import { db } from '../firebase.js'

export class User {
  static collection = db.collection('users')

  // Helper function to serialize Firestore data
  static serialize(doc) {
    if (!doc.exists) return null
    const data = doc.data()

    // Handle Firestore timestamps
    const createdAt = data.createdAt?.toDate?.().toISOString() || data.createdAt
    const updatedAt = data.updatedAt?.toDate?.().toISOString() || data.updatedAt

    return {
      id: doc.id,
      uid: doc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneNumber: data.phoneNumber || '',
      photoURL: data.photoURL || '',
      isAdmin: Boolean(data.isAdmin || false),
      dietaryPreferences: Array.isArray(data.dietaryPreferences) ? data.dietaryPreferences : [], //Plan
      allergies: Array.isArray(data.allergies) ? data.allergies : [], // Plan
      addresses: Array.isArray(data.addresses) ? data.addresses : [],
      defaultAddress: data.defaultAddress || '',  
      favoriteItems: Array.isArray(data.favoriteItems) ? data.favoriteItems : [],
      favoriteMeals: Array.isArray(data.favoriteMeals) ? data.favoriteMeals : [],
      subscribedPlan: data.subscribedPlan || '',  //Plan
      subscriptionEndDate: data.subscriptionEndDate || null, //Plan
      paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [], 
      defaultPaymentMethod: data.defaultPaymentMethod || '', 
      loyaltyPoints: Number(data.loyaltyPoints) || 0,
      notes: data.notes || '', //Plan
      language: data.language || 'en',
      notificationPreferences: data.notificationPreferences || {
        email: true,
        sms: false,
        push: true,
      },
      createdAt,
      updatedAt,
    }
  }

  static async getAll() {
    const snapshot = await this.collection.get()
    return snapshot.docs.map(this.serialize)
  }

  static async getById(uid) {
    try {
      const doc = await this.collection.doc(uid).get()
      return this.serialize(doc)
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  }

  static async getByEmail(email) {
    try {
      const snapshot = await this.collection.where('email', '==', email).limit(1).get()
      return snapshot.empty ? null : this.serialize(snapshot.docs[0])
    } catch (error) {
      console.error('Error fetching user by email:', error)
      throw error
    }
  }

  static async getAdmins() {
    try {
      const snapshot = await this.collection.where('isAdmin', '==', true).get()
      return snapshot.docs.map(this.serialize)
    } catch (error) {
      console.error('Error fetching admin users:', error)
      throw error
    }
  }

  static async create(uid, userData) {
    try {
      const defaultUserData = {
        createdAt: new Date(),
        updatedAt: new Date(),
        isAdmin: false,
        dietaryPreferences: [],
        allergies: [],
        addresses: [],
        defaultAddress: '',
        favoriteItems: [],
        favoriteMeals: [],
        subscribedPlan: '',
        subscriptionEndDate: null,
        paymentMethods: [],
        defaultPaymentMethod: '',
        loyaltyPoints: 0,
        notes: '',
        language: 'en',
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
        },
      }

      const newUserData = { ...defaultUserData, ...userData }
      await this.collection.doc(uid).set(newUserData)
      return await this.getById(uid)
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  static async update(uid, updateData) {
    try {
      const { email, emailVerified, ...safeUpdateData } = updateData
      const processedData = {}

      // Field processing (maintains data integrity)
      const stringFields = [
        'displayName',
        'firstName',
        'lastName',
        'phoneNumber',
        'photoURL',
        'defaultAddress',
        'subscribedPlan',
        'defaultPaymentMethod',
        'notes',
        'language',
      ]
      stringFields.forEach((field) => {
        if (safeUpdateData[field] !== undefined) {
          processedData[field] = String(safeUpdateData[field])
        }
      })

      const arrayFields = [
        'dietaryPreferences',
        'allergies',
        'addresses',
        'favoriteItems',
        'favoriteMeals',
        'paymentMethods',
      ]
      arrayFields.forEach((field) => {
        if (safeUpdateData[field] !== undefined) {
          processedData[field] = Array.isArray(safeUpdateData[field]) ? safeUpdateData[field] : []
        }
      })

      if (safeUpdateData.isAdmin !== undefined) {
        processedData.isAdmin = Boolean(safeUpdateData.isAdmin)
      }

      if (safeUpdateData.loyaltyPoints !== undefined) {
        processedData.loyaltyPoints = Number(safeUpdateData.loyaltyPoints) || 0
      }

      if (safeUpdateData.notificationPreferences) {
        processedData.notificationPreferences = {
          email: Boolean(safeUpdateData.notificationPreferences.email ?? true),
          sms: Boolean(safeUpdateData.notificationPreferences.sms ?? false),
          push: Boolean(safeUpdateData.notificationPreferences.push ?? true),
        }
      }

      processedData.updatedAt = new Date().toISOString()

      await this.collection.doc(uid).update(processedData)
      return await this.getById(uid)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  static async delete(uid) {
    try {
      await this.collection.doc(uid).delete()
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
}
