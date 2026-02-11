const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔒 Proteger rutas - Validar JWT
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Obtener token del header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'No autorizado - Token no proporcionado' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🛡️ CRÍTICO: Buscar usuario en BD (no confiar solo en el token)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Usuario no existe o fue eliminado' 
      });
    }

    // Guardar usuario en request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Error autenticación:', error.message);
    return res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};

// 🔒 SOLO ADMIN - Doble validación
exports.admin = async (req, res, next) => {
  try {
    // 🛡️ CRÍTICO: Verificar rol directamente desde BD
    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Acceso denegado - Requiere privilegios de administrador' 
      });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Error verificando permisos' 
    });
  }
};

// 🔒 Validar permisos específicos (opcional avanzado)
exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    const user = await User.findById(req.user._id);
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permiso para esta acción' 
      });
    }
    next();
  };
};