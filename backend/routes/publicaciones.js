const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { compressAndSaveImages } = require('../middleware/upload');

// Detectar tipo de base de datos
const isPostgres = process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres';

// Helper para convertir placeholders
function toSQL(query, params) {
  if (!isPostgres) return { query, params };
  let paramIndex = 1;
  const newQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  return { query: newQuery, params };
}

// Validaciones
const publicacionValidation = [
  body('titulo').trim().notEmpty().withMessage('El título es requerido')
    .isLength({ max: 200 }).withMessage('El título no puede exceder 200 caracteres'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es requerida'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
];

// Obtener todas las publicaciones activas (feed)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id, p.titulo, p.descripcion, p.precio, p.estado, p.created_at,
        u.id as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email,
        (SELECT url FROM imagenes WHERE publicacion_id = p.id ORDER BY orden LIMIT 1) as imagen_principal
      FROM publicaciones p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'activo'
      ORDER BY p.created_at DESC
    `);

    const publicaciones = isPostgres ? result.rows : result[0];
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// Obtener una publicación específica con todas sus imágenes
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener publicación
    const { query: pubQuery, params: pubParams } = toSQL(`
      SELECT 
        p.*, 
        u.id as usuario_id, u.nombre as usuario_nombre, 
        u.email as usuario_email, u.telefono as usuario_telefono
      FROM publicaciones p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [id]);
    const pubResult = await db.query(pubQuery, pubParams);
    const publicaciones = isPostgres ? pubResult.rows : pubResult[0];

    if (publicaciones.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Obtener imágenes
    const { query: imgQuery, params: imgParams } = toSQL(
      'SELECT id, url, orden FROM imagenes WHERE publicacion_id = ? ORDER BY orden',
      [id]
    );
    const imgResult = await db.query(imgQuery, imgParams);
    const imagenes = isPostgres ? imgResult.rows : imgResult[0];

    const publicacion = {
      ...publicaciones[0],
      imagenes
    };

    res.json(publicacion);
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({ error: 'Error al obtener publicación' });
  }
});

// Obtener mis publicaciones
router.get('/user/myposts', authMiddleware, async (req, res) => {
  try {
    const { query: myQuery, params: myParams } = toSQL(`
      SELECT 
        p.*,
        (SELECT url FROM imagenes WHERE publicacion_id = p.id ORDER BY orden LIMIT 1) as imagen_principal
      FROM publicaciones p
      WHERE p.usuario_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    const myResult = await db.query(myQuery, myParams);
    const publicaciones = isPostgres ? myResult.rows : myResult[0];

    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener mis publicaciones:', error);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// Crear publicación con imágenes
router.post('/', authMiddleware, upload.array('imagenes', 8), compressAndSaveImages, publicacionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, descripcion, precio } = req.body;

    // Insertar publicación
    const { query: insertQuery, params: insertParams } = toSQL(
      isPostgres
        ? 'INSERT INTO publicaciones (usuario_id, titulo, descripcion, precio) VALUES (?, ?, ?, ?) RETURNING id'
        : 'INSERT INTO publicaciones (usuario_id, titulo, descripcion, precio) VALUES (?, ?, ?, ?)',
      [req.user.id, titulo, descripcion, precio]
    );
    
    const insertResult = await db.query(insertQuery, insertParams);
    const publicacionId = isPostgres ? insertResult.rows[0].id : insertResult[0].insertId;

    // Insertar imágenes si existen
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const { query: imgQuery, params: imgParams } = toSQL(
          'INSERT INTO imagenes (publicacion_id, url, orden) VALUES (?, ?, ?)',
          [publicacionId, file.path, i]
        );
        await db.query(imgQuery, imgParams);
      }
    }

    res.status(201).json({
      message: 'Publicación creada exitosamente',
      publicacionId
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ error: 'Error al crear publicación' });
  }
});

// Actualizar publicación
router.put('/:id', authMiddleware, upload.array('imagenes', 8), compressAndSaveImages, publicacionValidation, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, imagenesAEliminar } = req.body;

    // Verificar que la publicación pertenece al usuario
    const { query: checkQuery, params: checkParams } = toSQL(
      'SELECT usuario_id FROM publicaciones WHERE id = ?',
      [id]
    );
    const checkResult = await db.query(checkQuery, checkParams);
    const publicaciones = isPostgres ? checkResult.rows : checkResult[0];

    if (publicaciones.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (publicaciones[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta publicación' });
    }

    // Actualizar publicación
    const { query: updateQuery, params: updateParams } = toSQL(
      'UPDATE publicaciones SET titulo = ?, descripcion = ?, precio = ? WHERE id = ?',
      [titulo, descripcion, precio, id]
    );
    await db.query(updateQuery, updateParams);

    // Eliminar imágenes si se especificaron
    if (imagenesAEliminar) {
      const idsAEliminar = JSON.parse(imagenesAEliminar);
      if (idsAEliminar.length > 0) {
        for (const imgId of idsAEliminar) {
          const { query: delQuery, params: delParams } = toSQL(
            'DELETE FROM imagenes WHERE id = ? AND publicacion_id = ?',
            [imgId, id]
          );
          await db.query(delQuery, delParams);
        }
      }
    }

    // Agregar nuevas imágenes si existen
    if (req.files && req.files.length > 0) {
      // Obtener el orden máximo actual
      const { query: maxQuery, params: maxParams } = toSQL(
        'SELECT COALESCE(MAX(orden), -1) as max_orden FROM imagenes WHERE publicacion_id = ?',
        [id]
      );
      const maxResult = await db.query(maxQuery, maxParams);
      const maxRows = isPostgres ? maxResult.rows : maxResult[0];
      const startOrden = maxRows[0].max_orden + 1;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const { query: insQuery, params: insParams } = toSQL(
          'INSERT INTO imagenes (publicacion_id, url, orden) VALUES (?, ?, ?)',
          [id, file.path, startOrden + i]
        );
        await db.query(insQuery, insParams);
      }
    }

    res.json({ message: 'Publicación actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({ error: 'Error al actualizar publicación' });
  }
});

// Eliminar publicación
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la publicación pertenece al usuario
    const { query: checkQuery, params: checkParams } = toSQL(
      'SELECT usuario_id FROM publicaciones WHERE id = ?',
      [id]
    );
    const checkResult = await db.query(checkQuery, checkParams);
    const publicaciones = isPostgres ? checkResult.rows : checkResult[0];

    if (publicaciones.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (publicaciones[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación' });
    }

    // Eliminar publicación (las imágenes se eliminan por CASCADE)
    const { query: delQuery, params: delParams } = toSQL(
      'DELETE FROM publicaciones WHERE id = ?',
      [id]
    );
    await db.query(delQuery, delParams);

    res.json({ message: 'Publicación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ error: 'Error al eliminar publicación' });
  }
});

// Marcar publicación como vendida
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    if (!['activo', 'vendido', 'inactivo'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Verificar que la publicación pertenece al usuario
    const { query: checkQuery, params: checkParams } = toSQL(
      'SELECT usuario_id FROM publicaciones WHERE id = ?',
      [id]
    );
    const checkResult = await db.query(checkQuery, checkParams);
    const publicaciones = isPostgres ? checkResult.rows : checkResult[0];

    if (publicaciones.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (publicaciones[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta publicación' });
    }

    // Actualizar estado
    const { query: updateQuery, params: updateParams } = toSQL(
      'UPDATE publicaciones SET estado = ? WHERE id = ?',
      [estado, id]
    );
    await db.query(updateQuery, updateParams);

    const mensajes = {
      vendido: 'Publicación marcada como vendida',
      activo: 'Publicación reactivada',
      inactivo: 'Publicación desactivada'
    };

    res.json({ message: mensajes[estado] || 'Estado actualizado' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

module.exports = router;
