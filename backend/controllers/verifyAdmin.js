// controllers/verifyAdmin.js
import { auth, db } from "../firebase.js";

export const verifyAdmin = async (req, res) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // First check if admin flag is already in the request object
      if (req.user.admin === true) {
        return res.json({ isAdmin: true });
      }
      
      // Otherwise, verify with Firebase Auth
      const userRecord = await auth.getUser(req.user.uid);
      const isAdminClaim = userRecord.customClaims?.admin === true;
      
      if (isAdminClaim) {
        // Return early if Firebase Auth says user is admin
        return res.json({ isAdmin: true });
      }
      
      // As a fallback, check Firestore
      const userDoc = await db.collection("users").doc(req.user.uid).get();
      const isAdminFirestore = userDoc.exists && userDoc.data().isAdmin === true;
      
      // If admin in Firestore but not in Auth, update Auth claims
      if (isAdminFirestore && !isAdminClaim) {
        await auth.setCustomUserClaims(req.user.uid, { admin: true });
        console.log(`Updated admin claim for user ${req.user.uid} based on Firestore data`);
      }
      
      return res.json({ isAdmin: isAdminFirestore });
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ error: "Failed to verify admin status" });
    }
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};