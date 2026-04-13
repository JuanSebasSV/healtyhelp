const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const { filterXSS } = require('xss');
const rateLimit  = require('express-rate-limit');
const hpp        = require('hpp');
const passport   = require('passport');
const path       = require('path');
require('dotenv').config();

const app = express();

// ✅ CORS primero
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frhealtyhelp.onrender.com',
    'https://healtyhelp11.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🛡️ Seguridad
app.use(helmet());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones, intenta en 15 minutos'
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  message: 'Demasiados intentos de login, espera 15 minutos'
});
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  if (req.body) {
    req.body = JSON.parse(filterXSS(JSON.stringify(req.body)));
  }
  next();
});

app.use(passport.initialize());

// Conexión MongoDB + seed de términos al conectar
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado');
    // Seed de términos y condiciones — solo actúa si la colección está vacía
    try {
      const seedTerms = require('./scripts/seedTerms');
      await seedTerms();
    } catch (err) {
      console.error('⚠️  Error en seed de términos:', err.message);
    }
  })
  .catch(err => {
    console.error('❌ Error MongoDB:', err);
    process.exit(1);
  });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth',           require('./routes/auth'));
app.use('/api/admin',          require('./routes/admin'));
app.use('/api/recipes',        require('./routes/recipes'));
app.use('/api/consumos',       require('./routes/consumos'));
app.use('/api/chat',           require('./routes/chat'));
app.use('/api/terms',          require('./routes/terms'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api',                require('./routes/utils'));
app.use('/api/recomendaciones', require('./routes/recomendaciones'));

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente ✅' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.stack);
  res.status(500).json({
    error: 'Error del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// 404
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

const AdminLog = require('./models/AdminLog');
console.log('AdminLog enum:', AdminLog.schema.path('action').enumValues);