const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const mejorarFotoGoogle = (url) => {
  if (!url) return null;
  return url.replace(/=s\d+-c$/, '=s400-c').replace(/=s\d+$/, '=s400');
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails?.[0]?.value;
        const googleAvatar = mejorarFotoGoogle(profile.photos?.[0]?.value);

        if (!googleEmail) {
          return done(new Error('No se pudo obtener el email de Google'), null);
        }

        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          user.avatar = googleAvatar;
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        user = await User.findOne({ email: googleEmail });
        if (user) {
          user.googleId = profile.id;
          user.avatar = googleAvatar;
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: googleEmail,
          avatar: googleAvatar,
          isVerified: true
        });

        done(null, user);
      } catch (error) {
        console.error('Error en Google Strategy:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;