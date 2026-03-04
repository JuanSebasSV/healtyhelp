const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function initializeSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    const superAdminExists = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });

    if (superAdminExists) {
      console.log('⚠️  Superadmin ya existe. No se creará duplicado.');
      process.exit(0);
    }

    const superAdmin = await User.create({
      name: process.env.SUPER_ADMIN_NAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
      role: 'admin',
      isVerified: true,
      isSuperAdmin: true
    });

    console.log('✅ Superadmin creado exitosamente');
    console.log('📧 Email:', superAdmin.email);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña inmediatamente después del primer login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeSuperAdmin();