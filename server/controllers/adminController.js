const User = require('../models/User');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    // 🛡️ Validar que el que solicita sea admin (doble check)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 🛡️ Prevenir que se elimine a sí mismo
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        error: 'No puedes eliminarte a ti mismo' 
      });
    }

    await user.deleteOne();

    res.json({ 
      success: true, 
      message: 'Usuario eliminado' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cambiar rol de usuario
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validar rol
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 🛡️ Prevenir que se quite sus propios permisos de admin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        error: 'No puedes modificar tu propio rol' 
      });
    }

    user.role = role;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Rol actualizado',
      user 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Estadísticas
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        admins,
        regularUsers
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};