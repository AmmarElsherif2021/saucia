import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initiate Google Auth
router.get('/google', passport.authenticate('google'));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user;
    
    // Debug log
    console.log('Google OAuth callback received user:', {
      id: user.id,
      email: user.email,
      profileComplete: user.profileComplete
    });
    
    // Create token with appropriate payload
    const tokenPayload = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      profile_completed: user.profileComplete,
      requiresCompletion: !user.profileComplete
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Debug log
    console.log('Generated JWT with payload:', tokenPayload);
    
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Protected test endpoint
router.get('/protected', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({ message: 'Protected data', user: req.user });
  }
);

export default router;