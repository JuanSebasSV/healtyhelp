exports.require2FA = async (req, res, next) => {
  if (req.user.role === 'admin' && !req.user.twoFactorEnabled) {
    return res.status(403).json({ 
      error: 'Los administradores deben habilitar 2FA',
      requireSetup: true 
    });
  }
  next();
};