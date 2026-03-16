const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    minlength: [6, 'Mínimo 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleId: String,
  avatar: String,
  isVerified: {
    type: Boolean,
    default: false
  },

  // ── Verificación de email al registro ──
  verificationCode:   String,
  verificationExpire: Date,

  // ── Bloqueo por intentos fallidos ──
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret:    String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// ── Encriptar contraseña ──
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Comparar contraseña ──
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Cuenta bloqueada? ──
userSchema.virtual('isLocked').get(function() {
  return this.lockUntil && this.lockUntil > Date.now();
});

// ── Incrementar intentos fallidos ──
userSchema.methods.incLoginAttempts = async function() {
  // Si el bloqueo anterior ya expiró, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    // Bloquear tras 5 intentos por 15 minutos
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 15 * 60 * 1000;
    }
  }
  return this.save({ validateBeforeSave: false });
};

// ── Resetear intentos ──
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);