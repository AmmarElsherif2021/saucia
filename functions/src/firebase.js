/* eslint-disable */
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import dotenv from 'dotenv'

dotenv.config()
// Get debug info about the environment variables
console.log('Environment variables loaded:', {
  projectId: process.env.FIREBASE_PROJECT_ID ? '✓ Present' : '✗ Missing',
  privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID ? '✓ Present' : '✗ Missing',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? '✓ Present' : '✗ Missing',
  clientId: process.env.FIREBASE_CLIENT_ID ? '✓ Present' : '✗ Missing',
  emulator: process.env.FUNCTIONS_EMULATOR,
})

// private key format - improved handling
let privateKey
try {
  // Handle double-escaped newlines from various environments
  privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (privateKey) {
    // Replace \\n with \n first (for double-escaped newlines)
    privateKey = privateKey.replace(/\\\\n/g, '\\n')
    // Then replace \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
    // Remove any quotes that might be part of the string
    privateKey = privateKey.replace(/^["']|["']$/g, '')
  }
} catch (error) {
  console.error('Error processing private key:', error)
}

if (!privateKey) {
  console.error('FIREBASE_PRIVATE_KEY is missing or invalid')
  // When running in emulator, we can use mock credentials
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    console.log('Running in emulator mode, using mock credentials')
    privateKey = '-----BEGIN PRIVATE KEY-----\nMOCK_KEY_FOR_EMULATOR\n-----END PRIVATE KEY-----\n'
  } else {
    process.exit(1)
  }
}

const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID || 'saucia-6c18c',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
}

// Validate required fields
if (
  !serviceAccount.project_id ||
  !serviceAccount.private_key_id ||
  !serviceAccount.client_email ||
  !serviceAccount.client_id
) {
  console.error('Missing required Firebase service account fields:', {
    project_id: !!serviceAccount.project_id,
    private_key_id: !!serviceAccount.private_key_id,
    client_email: !!serviceAccount.client_email,
    client_id: !!serviceAccount.client_id,
  })

  // When running in emulator, we can continue with mock data
  if (process.env.FUNCTIONS_EMULATOR === 'true') {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
  }
}

// Initialize Firebase Admin SDK
let firebaseApp
try {
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  })
  console.log('Firebase Admin SDK initialized successfully')
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error)
  process.exit(1)
}

// Initialize services
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

// Admin claims function
export const setAdminClaim = async (uid, isAdmin) => {
  try {
    // Set custom claims for the user
    await auth.setCustomUserClaims(uid, { admin: isAdmin })
    console.log(`Admin claim set for user ${uid}: ${isAdmin}`)

    // Update the user document in Firestore as well
    await db.collection('users').doc(uid).update({
      isAdmin: isAdmin,
      updatedAt: new Date(),
    })

    return true
  } catch (error) {
    console.error('Error setting admin claim:', error)
    throw error
  }
}

// Firestore settings
db.settings({ ignoreUndefinedProperties: true })
