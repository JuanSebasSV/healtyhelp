const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const { filterXSS } = require('xss');
const rateLimit  = require('express-rate-limit');
const hpp        = require('hpp');
const passport   = require('passport');
const cookieParser = require('cookie-parser');
const path       = require('path');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const DEFAULT_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://healthyhelpoficial.com',
  'https://www.healthyhelpoficial.com',
];

app.use(cors({
  origin: [...new Set([...DEFAULT_ORIGINS, ...ALLOWED_ORIGINS])],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 🛡️ Seguridad
app.use(helmet());
app.use(hpp());

const csrfProtection = require('./middleware/csrf');
app.use('/api/', csrfProtection);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Demasiadas peticiones, intenta en 15 minutos'
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: 'Demasiados intentos de login, espera 15 minutos'
});
app.use('/api/auth/login', authLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = filterXSS(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});

app.use(passport.initialize());

// Conexión MongoDB + seed de términos al conectar
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  minPoolSize: 5,
})
  .then(async () => {
    console.log('✅ MongoDB conectado');
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

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB desconectado. Intentando reconectar...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/healthz', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    db: { state: dbState, ok: dbOk },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',           require('./routes/auth'));
app.use('/api/admin',          require('./routes/admin'));
app.use('/api/users',          require('./routes/users'));
app.use('/api/recipes',        require('./routes/recipes'));
app.use('/api/consumos',       require('./routes/consumos'));
app.use('/api/chat',           require('./routes/chat'));
app.use('/api/terms',          require('./routes/terms'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api',                require('./routes/utils'));
app.use('/api/recomendaciones', require('./routes/recomendaciones'));
app.use('/api/contacto', require('./routes/contacto'));
app.use('/api/favoritos', require('./routes/favoritos'));

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente ✅' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la petición' });
  }
  next(err);
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
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Google OAuth: http://localhost:${PORT}/api/auth/google\n`);
});

const SHUTDOWN_TIMEOUT_MS = 10000;
const shutdown = (signal) => {
  console.log(`\n📴 ${signal} recibido, cerrando servidor...`);
  const timer = setTimeout(() => {
    console.error('⏰ Timeout en shutdown, forzando salida');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB cerrado');
    } catch (err) {
      console.error('⚠️  Error cerrando MongoDB:', err.message);
    }
    clearTimeout(timer);
    console.log('✅ Servidor cerrado limpiamente');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));