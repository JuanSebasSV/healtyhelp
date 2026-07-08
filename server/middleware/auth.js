const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas - Validar JWT
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'No autorizado - Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario fresco desde BD incluyendo isSuperAdmin y flags de baneo
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Usuario no existe o fue eliminado' });
    }

    // Rechazar si la cuenta está baneada en este momento.
    // El baneo puede ser permanente (baneadoHasta === null) o temporal
    // (baneadoHasta > Date.now()). Si el temporal ya expiró y nadie llamó
    // a /unban, el flag baneado queda en true pero dejamos pasar.
    if (user.baneado) {
      const permanente = !user.baneadoHasta;
      const vigente = permanente || new Date(user.baneadoHasta).getTime() > Date.now();
      if (vigente) {
        const hastaIso = permanente ? null : new Date(user.baneadoHasta).toISOString();
        const mensaje = permanente
          ? `Tu cuenta está suspendida permanentemente${user.baneadoMotivo ? `. Motivo: ${user.baneadoMotivo}` : ''}.`
          : `Tu cuenta está suspendida hasta ${hastaIso}${user.baneadoMotivo ? `. Motivo: ${user.baneadoMotivo}` : ''}.`;
        return res.status(403).json({
          error: mensaje,
          banned: true,
          permanente,
          baneadoHasta: hastaIso,
          baneadoMotivo: user.baneadoMotivo || null,
        });
      }
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Error autenticación:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// SOLO ADMIN
exports.admin = async (req, res, next) => {
  try {
    // Refrescar usuario desde BD para tener isSuperAdmin actualizado
    const user = await User.findById(req.user._id).select('-password');

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado - Requiere privilegios de administrador' });
    }

    // Actualizar req.user con datos frescos
    req.user = user;
    next();

  } catch (error) {
    return res.status(403).json({ error: 'Error verificando permisos' });
  }
};

// Validar permisos específicos
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    req.user = user;
    next();
  };
};