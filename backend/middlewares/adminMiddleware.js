import { auth } from "../firebase.js";

export const isAdmin = async (req, res, next) => {
  try {
    const { uid } = req.user;

    const userRecord = await auth.getUser(uid);
    const customClaims = userRecord.customClaims || {};

    if (customClaims.admin === true) {
      next();
    } else {
      res.status(403).json({ error: "Access denied: Admin privileges required" });
    }
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ error: "Server error during authorization" });
  }
};
