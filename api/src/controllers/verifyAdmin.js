/* eslint-disable */
// controllers/verifyAdmin.js
//import { auth, db } from "../firebase.js";

export const verifyAdmin = async (req, res) => {
  try {
    // Special case for emulator development user
    if (req.user && req.user.uid === 'emulator-dev-user') {
      console.log('⚠️ Emulator mode: Auto-approving admin verification')
      return res.status(200).json({ isAdmin: true })
    }

    // For regular users, check if they have admin privileges
    const isAdmin = req.user && req.user.admin === true

    return res.status(200).json({ isAdmin })
  } catch (error) {
    console.error('Error in verifyAdmin controller:', error)
    return res.status(500).json({ error: 'Server error verifying admin status' })
  }
}
