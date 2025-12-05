const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { compressAndSaveImages } = require('../middleware/upload');

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
    const [publicaciones] = await db.query(`
      SELECT 
        p.id, p.titulo, p.descripcion, p.precio, p.estado, p.created_at,
        u.id as usuario_id, u.nombre as usuario_nombre, u.email as usuario_email,
        (SELECT url FROM imagenes WHERE publicacion_id = p.id ORDER BY orden LIMIT 1) as imagen_principal
      FROM publicaciones p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.estado = 'activo'
      ORDER BY p.created_at DESC
    `);

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
    const [publicaciones] = await db.query(`
      SELECT 
        p.*, 
        u.id as usuario_id, u.nombre as usuario_nombre, 
        u.email as usuario_email, u.telefono as usuario_telefono
      FROM publicaciones p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (publicaciones.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Obtener imágenes
    const [imagenes] = await db.query(
      'SELECT id, url, orden FROM imagenes WHERE publicacion_id = ? ORDER BY orden',
      [id]
    );

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
    const [publicaciones] = await db.query(`
      SELECT 
        p.*,
        (SELECT url FROM imagenes WHERE publicacion_id = p.id ORDER BY orden LIMIT 1) as imagen_principal
      FROM publicaciones p
      WHERE p.usuario_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener mis publicaciones:', error);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
});

// Crear publicación con imágenes
router.post('/', authMiddleware, upload.array('imagenes', 8), compressAndSaveImages, publicacionValidation, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await connection.rollback();
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, descripcion, precio } = req.body;

    // Insertar publicación
    const [result] = await connection.query(
      'INSERT INTO publicaciones (usuario_id, titulo, descripcion, precio) VALUES (?, ?, ?, ?)',
      [req.user.id, titulo, descripcion, precio]
    );

    const publicacionId = result.insertId;

    // Insertar imágenes si existen
    if (req.files && req.files.length > 0) {
      const imagenesData = req.files.map((file, index) => [
        publicacionId,
        `/uploads/${file.filename}`,
        index
      ]);

      await connection.query(
        'INSERT INTO imagenes (publicacion_id, url, orden) VALUES ?',
        [imagenesData]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Publicación creada exitosamente',
      publicacionId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear publicación:', error);
    res.status(500).json({ error: 'Error al crear publicación' });
  } finally {
    connection.release();
  }
});

// Actualizar publicación
router.put('/:id', authMiddleware, upload.array('imagenes', 8), compressAndSaveImages, publicacionValidation, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { titulo, descripcion, precio, imagenesAEliminar } = req.body;

    // Verificar que la publicación pertenece al usuario
    const [publicaciones] = await connection.query(
      'SELECT usuario_id FROM publicaciones WHERE id = ?',
      [id]
    );

    if (publicaciones.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (publicaciones[0].usuario_id !== req.user.id) {
      await connection.rollback();
      return res.status(403).json({ error: 'No tienes permiso para editar esta publicación' });
    }

    // Actualizar publicación
    await connection.query(
      'UPDATE publicaciones SET titulo = ?, descripcion = ?, precio = ? WHERE id = ?',
      [titulo, descripcion, precio, id]
    );

    // Eliminar imágenes si se especificaron
    if (imagenesAEliminar) {
      const idsAEliminar = JSON.parse(imagenesAEliminar);
      if (idsAEliminar.length > 0) {
        await connection.query(
          'DELETE FROM imagenes WHERE id IN (?) AND publicacion_id = ?',
          [idsAEliminar, id]
        );
      }
    }

    // Agregar nuevas imágenes si existen
    if (req.files && req.files.length > 0) {
      // Obtener el orden máximo actual
      const [maxOrden] = await connection.query(
        'SELECT COALESCE(MAX(orden), -1) as max_orden FROM imagenes WHERE publicacion_id = ?',
        [id]
      );

      const startOrden = maxOrden[0].max_orden + 1;
      const imagenesData = req.files.map((file, index) => [
        id,
        `/uploads/${file.filename}`,
        startOrden + index
      ]);

      await connection.query(
        'INSERT INTO imagenes (publicacion_id, url, orden) VALUES ?',
        [imagenesData]
      );
    }

    await connection.commit();

    res.json({ message: 'Publicación actualizada exitosamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({ error: 'Error al actualizar publicación' });
  } finally {
    connection.release();
  }
});

// Eliminar publicación
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la publicación pertenece al usuario
    const [publicaciones] = await db.query(
      'SELECT usuario_id FROM publicaciones WHERE id = ?',
      [id]
    );

    if (publicaciones.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (publicaciones[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación' });
    }

    // Eliminar publicación (las imágenes se eliminan por CASCADE)
    await db.query('DELETE FROM publicaciones WHERE id = ?', [id]);

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
    const [publicaciones] = await db.query(
      'SELECT usuario_id FROM publicaciones WHERE id = ?',
      [id]
    );

    if (publicaciones.length === 0) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    if (publicaciones[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta publicación' });
    }

    // Actualizar estado
    await db.query('UPDATE publicaciones SET estado = ? WHERE id = ?', [estado, id]);

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
