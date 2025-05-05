import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

// Fix for the private key format
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

if (!privateKey) {
  console.error("FIREBASE_PRIVATE_KEY is missing or invalid");
  process.exit(1);
}

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "saucia-6c18c",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Validate required fields
if (!serviceAccount.project_id || !serviceAccount.private_key_id || 
    !serviceAccount.client_email || !serviceAccount.client_id) {
  console.error("Missing required Firebase service account fields");
  process.exit(1);
}

// Initialize Firebase Admin SDK
let firebaseApp;
try {
  firebaseApp = initializeApp({ 
    credential: cert(serviceAccount) 
  });
  console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
  process.exit(1);
}

// Initialize services
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

// Admin claims function
export const setAdminClaim = async (uid, isAdmin) => {
  try {
    // Set custom claims for the user
    await auth.setCustomUserClaims(uid, { admin: isAdmin });
    console.log(`Admin claim set for user ${uid}: ${isAdmin}`);
    
    // Update the user document in Firestore as well
    await db.collection("users").doc(uid).update({
      isAdmin: isAdmin,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error("Error setting admin claim:", error);
    throw error;
  }
};

// Firestore settings
db.settings({ ignoreUndefinedProperties: true });