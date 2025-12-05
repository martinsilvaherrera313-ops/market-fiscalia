const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: fileFilter
});

// Helper para convertir buffer a stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Middleware para comprimir y subir imágenes a Cloudinary
const compressAndSaveImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    // Procesar cada imagen
    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        // Comprimir con Sharp
        const compressedBuffer = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toBuffer();

        // Subir a Cloudinary
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'market-fiscalia',
              resource_type: 'image',
              format: 'webp'
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  ...file,
                  filename: result.public_id,
                  path: result.secure_url,
                  cloudinary_id: result.public_id
                });
              }
            }
          );

          bufferToStream(compressedBuffer).pipe(uploadStream);
        });
      })
    );

    req.files = processedFiles;
    next();
  } catch (error) {
    console.error('Error al procesar imágenes:', error);
    next(error);
  }
};

module.exports = upload;
module.exports.compressAndSaveImages = compressAndSaveImages;
