const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Mejora la resolución de la foto de Google de 96px a 400px
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
        const googleEmail = profile.emails[0].value;
        const googleAvatar = mejorarFotoGoogle(profile.photos[0]?.value);

        // 1. Buscar por googleId — usuario ya vinculado con Google
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          // ✅ Siempre actualizar avatar con la foto más reciente de Google
          user.avatar = googleAvatar;
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // 2. Buscar por email — tiene cuenta normal, vincular Google
        user = await User.findOne({ email: googleEmail });
        if (user) {
          user.googleId = profile.id;
          user.avatar = googleAvatar; // ✅ Siempre poner el avatar de Google
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // 3. Crear cuenta nueva con Google
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

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;