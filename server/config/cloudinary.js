const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function createCloudinaryStorage({ folder, allowedFormats, transformation }) {
  return {
    _handleFile(req, file, cb) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, allowed_formats: allowedFormats, transformation },
        (error, result) => {
          if (error) return cb(error);
          cb(null, {
            path:     result.secure_url,
            filename: result.public_id,
            size:     result.bytes,
          });
        }
      );
      file.stream.pipe(uploadStream);
    },

    _removeFile(req, file, cb) {
      cloudinary.uploader.destroy(file.filename, cb);
    },
  };
}

const uploadAvatar = multer({
  storage: createCloudinaryStorage({
    folder:         'healtyhelp/avatars',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }],
  }),
  limits:     { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  },
});

const uploadResena = multer({
  storage: createCloudinaryStorage({
    folder:         'healtyhelp/resenas',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  }),
  limits:     { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  },
});

module.exports = { cloudinary, uploadAvatar, uploadResena };