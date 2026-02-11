const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
require('dotenv').config();

const app = express();

// 🛡️ SEGURIDAD: Headers HTTP seguros
app.use(helmet());

// 🛡️ SEGURIDAD: Prevenir NoSQL injection
app.use(mongoSanitize());

// 🛡️ SEGURIDAD: Prevenir XSS
app.use(xss());

// 🛡️ SEGURIDAD: Prevenir ataques HPP
app.use(hpp());

// 🛡️ SEGURIDAD: Rate limiting (máx 100 peticiones por IP cada 15 min)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones, intenta en 15 minutos'
});
app.use('/api/', limiter);

// 🛡️ SEGURIDAD: Rate limiting estricto para login (5 intentos cada 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, espera 15 minutos'
});
app.use('/api/auth/login', authLimiter);

// Middlewares
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de JSON
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error MongoDB:', err));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error del servidor',
    // En producción NO enviar detalles del error
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));