/* eslint-disable */
import { db } from '../firebase.js'

export class User {
  static collection = db.collection('users')

  static fieldTypes = {
    string: [
      'email',
      'displayName',
      'firstName',
      'lastName',
      'phoneNumber',
      'photoURL',
      'defaultAddress',
      'defaultPaymentMethod',
      'notes',
      'language',
      'gender',
    ],
    array: ['addresses', 'favoriteItems', 'favoriteMeals', 'paymentMethods'],
    boolean: ['isAdmin'],
    number: ['loyaltyPoints', 'age'],
    healthProfile: {
      string: ['fitnessGoal', 'activityLevel'],
      number: ['height', 'weight'],
      array: ['dietaryPreferences', 'allergies'],
    },
    subscription: {
      string: [
        'paymentMethod',
        'planId',
        'planName',
        'startDate',
        'endDate',
        'status',
        'deliveryAddress',
        'deliveryTime',
        'pausedAt',
        'resumedAt',
        'nextMealDate',
        'mealSchedule', // JSON string for complex scheduling
      ],
      number: ['price', 'mealsCount', 'consumedMeals'],
      boolean: ['autoRenewal', 'deliveryPaused'],
    },
  }

  static defaultValues = {
    // Base user defaults
    isAdmin: false,
    addresses: [],
    defaultAddress: '',
    favoriteItems: [],
    favoriteMeals: [],
    paymentMethods: [],
    defaultPaymentMethod: '',
    loyaltyPoints: 0,
    notes: '',
    language: 'en',
    age: 0,
    gender: 'male',
    // Enhanced subscription defaults
    subscription: {
      price: 0,
      endDate: null,
      paymentMethod: '',
      planId: '',
      planName: '',
      startDate: null,
      status: 'inactive', // 'active', 'paused', 'expired', 'cancelled'
      mealsCount: 0,
      consumedMeals: 0,
      deliveryAddress: '', // Selected delivery address
      deliveryTime: '12:00', // Preferred delivery time (24h format)
      autoRenewal: false,
      deliveryPaused: false,
      pausedAt: null, // When plan was paused
      resumedAt: null, // When plan was resumed
      nextMealDate: null, // Next scheduled meal delivery
      mealSchedule: '{}', // JSON string for meal scheduling data
    },
    // Default notification preferences
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
      mealReminders: true,
      deliveryUpdates: true,
      planUpdates: true,
    },
    // Default health profile
    healthProfile: {
      fitnessGoal: '',
      height: null,
      weight: null,
      dietaryPreferences: [],
      allergies: [],
      activityLevel: '',
    },
  }

  // Helper function to serialize Firestore data
  static serialize(doc) {
    if (!doc.exists) return null
    const data = doc.data()

    // Handle Firestore timestamps
    const createdAt = data.createdAt?.toDate?.().toISOString() || data.createdAt
    const updatedAt = data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    const lastLogin = data.lastLogin?.toDate?.().toISOString() || data.lastLogin

    // Build user object with correct types
    const result = {
      id: doc.id,
      uid: doc.id,
      email: data.email || '',
      displayName: data.displayName || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phoneNumber: data.phoneNumber || '',
      photoURL: data.photoURL || '',
      isAdmin: Boolean(data.isAdmin || this.defaultValues.isAdmin),
      addresses: Array.isArray(data.addresses) ? data.addresses : this.defaultValues.addresses,
      defaultAddress: data.defaultAddress || this.defaultValues.defaultAddress,
      favoriteItems: Array.isArray(data.favoriteItems)
        ? data.favoriteItems
        : this.defaultValues.favoriteItems,
      favoriteMeals: Array.isArray(data.favoriteMeals)
        ? data.favoriteMeals
        : this.defaultValues.favoriteMeals,
      paymentMethods: Array.isArray(data.paymentMethods)
        ? data.paymentMethods
        : this.defaultValues.paymentMethods,
      defaultPaymentMethod: data.defaultPaymentMethod || this.defaultValues.defaultPaymentMethod,
      loyaltyPoints: Number(data.loyaltyPoints) || this.defaultValues.loyaltyPoints,
      notes: data.notes || this.defaultValues.notes,
      language: data.language || this.defaultValues.language,
      age: data.age || this.defaultValues.age,
      gender: data.gender || this.defaultValues.gender,
      createdAt,
      updatedAt,
      lastLogin,
    }

    // Process subscription with enhanced fields
    result.subscription = this._processSubscription(data.subscription)

    // Process health profile
    result.healthProfile = this._processHealthProfile(data.healthProfile)

    // Process enhanced notification preferences
    result.notificationPreferences = this._processNotificationPreferences(
      data.notificationPreferences,
    )

    return result
  }

  static _processSubscription(subscriptionData) {
    const defaults = this.defaultValues.subscription

    if (!subscriptionData) return { ...defaults }

    return {
      price: Number(subscriptionData.price) || defaults.price,
      endDate: subscriptionData.endDate || defaults.endDate,
      paymentMethod: String(subscriptionData.paymentMethod || defaults.paymentMethod),
      planId: String(subscriptionData.planId || defaults.planId),
      planName: String(subscriptionData.planName || defaults.planName),
      startDate: subscriptionData.startDate || defaults.startDate,
      status: String(subscriptionData.status || defaults.status),
      mealsCount: Number(subscriptionData.mealsCount) || defaults.mealsCount,
      consumedMeals: Number(subscriptionData.consumedMeals) || defaults.consumedMeals,
      // Enhanced subscription fields
      deliveryAddress: String(subscriptionData.deliveryAddress || defaults.deliveryAddress),
      deliveryTime: String(subscriptionData.deliveryTime || defaults.deliveryTime),
      autoRenewal: Boolean(subscriptionData.autoRenewal ?? defaults.autoRenewal),
      deliveryPaused: Boolean(subscriptionData.deliveryPaused ?? defaults.deliveryPaused),
      pausedAt: subscriptionData.pausedAt || defaults.pausedAt,
      resumedAt: subscriptionData.resumedAt || defaults.resumedAt,
      nextMealDate: subscriptionData.nextMealDate || defaults.nextMealDate,
      mealSchedule: String(subscriptionData.mealSchedule || defaults.mealSchedule),
    }
  }

  static _processHealthProfile(profileData) {
    const defaults = this.defaultValues.healthProfile

    if (!profileData) return { ...defaults }

    return {
      fitnessGoal: String(profileData.fitnessGoal || defaults.fitnessGoal),
      height: Number(profileData.height) || defaults.height,
      weight: Number(profileData.weight) || defaults.weight,
      dietaryPreferences: Array.isArray(profileData.dietaryPreferences)
        ? profileData.dietaryPreferences
        : defaults.dietaryPreferences,
      allergies: Array.isArray(profileData.allergies) ? profileData.allergies : defaults.allergies,
      activityLevel: String(profileData.activityLevel || defaults.activityLevel),
    }
  }

  static _processNotificationPreferences(notificationData) {
    const defaults = this.defaultValues.notificationPreferences

    if (!notificationData) return { ...defaults }

    return {
      email: Boolean(notificationData.email ?? defaults.email),
      sms: Boolean(notificationData.sms ?? defaults.sms),
      push: Boolean(notificationData.push ?? defaults.push),
      mealReminders: Boolean(notificationData.mealReminders ?? defaults.mealReminders),
      deliveryUpdates: Boolean(notificationData.deliveryUpdates ?? defaults.deliveryUpdates),
      planUpdates: Boolean(notificationData.planUpdates ?? defaults.planUpdates),
    }
  }

  static _processFieldsByType(data, parentField = null) {
    const processedData = {}
    const fieldTypesToUse = parentField ? this.fieldTypes[parentField] : this.fieldTypes

    // Process string fields
    fieldTypesToUse.string?.forEach((field) => {
      if (data[field] !== undefined) {
        processedData[field] = String(data[field])
      }
    })

    // Process array fields
    fieldTypesToUse.array?.forEach((field) => {
      if (data[field] !== undefined) {
        processedData[field] = Array.isArray(data[field]) ? data[field] : []
      }
    })

    // Process boolean fields
    fieldTypesToUse.boolean?.forEach((field) => {
      if (data[field] !== undefined) {
        processedData[field] = Boolean(data[field])
      }
    })

    // Process number fields
    fieldTypesToUse.number?.forEach((field) => {
      if (data[field] !== undefined) {
        processedData[field] = Number(data[field]) || 0
      }
    })

    return processedData
  }

  // Enhanced subscription management methods
  static async updateSubscriptionStatus(uid, status, additionalData = {}) {
    try {
      const updateData = {
        'subscription.status': status,
        'subscription.updatedAt': new Date().toISOString(),
        ...additionalData,
      }

      if (status === 'paused') {
        updateData['subscription.pausedAt'] = new Date().toISOString()
        updateData['subscription.deliveryPaused'] = true
      } else if (status === 'active') {
        updateData['subscription.resumedAt'] = new Date().toISOString()
        updateData['subscription.deliveryPaused'] = false
      }

      await this.collection.doc(uid).update(updateData)
      return await this.getById(uid)
    } catch (error) {
      console.error('Error updating subscription status:', error)
      throw error
    }
  }

  static async updateDeliverySettings(uid, deliveryAddress, deliveryTime) {
    try {
      const updateData = {
        'subscription.deliveryAddress': deliveryAddress,
        'subscription.deliveryTime': deliveryTime,
        updatedAt: new Date().toISOString(),
      }

      await this.collection.doc(uid).update(updateData)
      return await this.getById(uid)
    } catch (error) {
      console.error('Error updating delivery settings:', error)
      throw error
    }
  }

  static async incrementConsumedMeals(uid, increment = 1) {
    try {
      const userDoc = await this.getById(uid)
      if (!userDoc) throw new Error('User not found')

      const newConsumedMeals = (userDoc.subscription.consumedMeals || 0) + increment
      const updateData = {
        'subscription.consumedMeals': newConsumedMeals,
        updatedAt: new Date().toISOString(),
      }

      // Check if plan should be completed
      if (newConsumedMeals >= userDoc.subscription.mealsCount) {
        updateData['subscription.status'] = 'completed'
        updateData['subscription.completedAt'] = new Date().toISOString()
      }

      await this.collection.doc(uid).update(updateData)
      return await this.getById(uid)
    } catch (error) {
      console.error('Error incrementing consumed meals:', error)
      throw error
    }
  }

  static async scheduleNextMeal(uid, nextMealDate, mealScheduleData = {}) {
    try {
      const updateData = {
        'subscription.nextMealDate': nextMealDate,
        'subscription.mealSchedule': JSON.stringify(mealScheduleData),
        updatedAt: new Date().toISOString(),
      }

      await this.collection.doc(uid).update(updateData)
      return await this.getById(uid)
    } catch (error) {
      console.error('Error scheduling next meal:', error)
      throw error
    }
  }

  // Existing methods remain the same...
  static async create(uid, userData) {
    try {
      const defaultUserData = {
        ...this.defaultValues,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
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
      let processedData = this._processFieldsByType(safeUpdateData)

      // Handle health profile updates
      if (safeUpdateData.healthProfile) {
        processedData.healthProfile = this._processFieldsByType(
          safeUpdateData.healthProfile,
          'healthProfile',
        )
      }

      // Handle subscription updates
      if (safeUpdateData.subscription) {
        processedData.subscription = this._processFieldsByType(
          safeUpdateData.subscription,
          'subscription',
        )
      }

      // Handle notification preferences
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
