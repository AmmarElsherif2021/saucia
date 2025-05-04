import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: "saucia-6c18c",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Initialize Firebase Admin SDK
const firebaseApp = initializeApp({ credential: cert(serviceAccount) });

// Initialize services
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

// Admin claims function
export const setAdminClaim = async (uid, isAdmin) => {
  try {
    // Set custom claims for the user
    await auth.setCustomUserClaims(uid, { admin: isAdmin });
    console.log(`Admin claim set for user ${uid}: ${isAdmin}`);
  } catch (error) {
    console.error("Error setting admin claim:", error);
    throw error;
  }
};

// Firestore settings
db.settings({ ignoreUndefinedProperties: true });