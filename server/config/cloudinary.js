// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage para avatares de usuario ──
const storageAvatars = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'healtyhelp/avatars',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
    transformation:   [{ width: 400, height: 400, crop: 'limit' }],
  },
});

const uploadAvatar = multer({
  storage: storageAvatars,
  limits:  { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  },
});

// ── Storage para imágenes de reseñas ──
const storageResenas = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'healtyhelp/resenas',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
    // Limitamos el tamaño pero NO transformamos aquí; queremos la URL original
    transformation:   [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const uploadResena = multer({
  storage: storageResenas,
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  },
});

module.exports = { cloudinary, uploadAvatar, uploadResena };