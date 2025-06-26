import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from './models/User.js';




passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use env variable
  scope: ['profile', 'email'],
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const user = await User.findOrCreateFromGoogle(profile);
    done(null, user);
  } catch (error) {
    done(error);
  }
}));

// Serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialization
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.getById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;