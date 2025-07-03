import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { User } from './models/User.js';

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { user, isNew } = await User.findOrCreateFromGoogle(profile);
    
    // Check if profile is complete
    const profileComplete = user.first_name && 
                           user.last_name && 
                           user.phone_number;

    done(null, {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      isAdmin: user.is_admin,
      isNewUser: isNew,
      profileComplete
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    done(error);
  }
}));

// JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.getById(jwtPayload.id);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));
export default passport;