const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

// Configuración de almacenamiento temporal
const storage = multer.memoryStorage(); // Guardar en memoria para procesar con Sharp

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo antes de comprimir
  fileFilter: fileFilter
});

// Middleware para comprimir y guardar imágenes
const compressAndSaveImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    // Asegurar que el directorio uploads existe
    await fs.mkdir('uploads', { recursive: true });

    // Procesar cada imagen
    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'img-' + uniqueSuffix + '.webp'; // Convertir todo a WebP
        const filepath = path.join('uploads', filename);

        // Comprimir y convertir a WebP con Sharp
        await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 }) // Buena calidad con compresión
          .toFile(filepath);

        return {
          ...file,
          filename: filename,
          path: filepath
        };
      })
    );

    // Reemplazar req.files con archivos procesados
    req.files = processedFiles;
    next();
  } catch (error) {
    console.error('Error al comprimir imágenes:', error);
    next(error);
  }
};

module.exports = upload;
module.exports.compressAndSaveImages = compressAndSaveImages;
