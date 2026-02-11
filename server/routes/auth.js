const passport = require('passport');
require('../config/passport');

// Ruta para iniciar login con Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generar JWT
    const token = generateToken(req.user._id);
    
    // Redirigir al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);