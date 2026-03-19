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
  age: {
    type: Number,
    min: [18, 'Debes ser mayor de 18 años'],
    max: [100, 'La edad máxima permitida es 100 años']
  },
  weight: { type: Number, min: 40, max: 150 }, // kg
  height: { type: Number, min: 50, max: 210 }, // cm
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleId: String,
  avatar: String,
  isVerified: { type: Boolean, default: false },
  verificationCode:   String,
  verificationExpire: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  isSuperAdmin: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret:    String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual('isLocked').get(function() {
  return this.lockUntil && this.lockUntil > Date.now();
});

userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 15 * 60 * 1000;
    }
  }
  return this.save({ validateBeforeSave: false });
};

userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);