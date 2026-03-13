const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { filterXSS } = require('xss');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const passport = require('passport');
const path = require('path');
require('dotenv').config();

const app = express();

// ✅ CORS primero — antes que cualquier otro middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frhealtyhelp.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// 🛡️ SEGURIDAD: Headers HTTP seguros
app.use(helmet());

// 🛡️ SEGURIDAD: Prevenir ataques HPP
app.use(hpp());

// 🛡️ SEGURIDAD: Rate limiting general (100 peticiones por IP cada 15 min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones, intenta en 15 minutos'
});
app.use('/api/', limiter);

// 🛡️ Rate limiting para login — más permisivo en desarrollo
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  message: 'Demasiados intentos de login, espera 15 minutos'
});
app.use('/api/auth/login', authLimiter);

// Middlewares básicos
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 🛡️ XSS limpio compatible con Express 5
app.use((req, res, next) => {
  if (req.body) {
    const clean = JSON.parse(filterXSS(JSON.stringify(req.body)));
    req.body = clean;
  }
  next();
});

// 🔒 Inicializar Passport
app.use(passport.initialize());

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Error MongoDB:', err);
    process.exit(1);
  });
//imagenes de perfil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/consumos', require('./routes/consumos'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente ✅' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.stack);
  res.status(500).json({
    error: 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/auth/google\n`);
});

// recetas admin
const AdminLog = require('./models/AdminLog');
console.log('AdminLog enum:', AdminLog.schema.path('action').enumValues);