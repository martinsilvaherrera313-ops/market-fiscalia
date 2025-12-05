const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

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
const registerValidation = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .custom(value => {
      if (!value.endsWith('@minpublico.cl')) {
        throw new Error('Solo se permiten correos @minpublico.cl');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('telefono').optional().trim(),
  body('departamento').optional().trim()
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// Registro de usuario
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, email, password, telefono, departamento } = req.body;

    // Verificar si el email ya existe
    const { query: checkQuery, params: checkParams } = toSQL(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    const existingUser = await db.query(checkQuery, checkParams);
    const rows = isPostgres ? existingUser.rows : existingUser[0];

    if (rows.length > 0) {
      return res.status(400).json({ 
        error: 'Este correo ya está registrado' 
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const { query: insertQuery, params: insertParams } = toSQL(
      isPostgres 
        ? 'INSERT INTO usuarios (nombre, email, password, telefono, departamento) VALUES (?, ?, ?, ?, ?) RETURNING id'
        : 'INSERT INTO usuarios (nombre, email, password, telefono, departamento) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, telefono || null, departamento || null]
    );
    const insertResult = await db.query(insertQuery, insertParams);
    const userId = isPostgres ? insertResult.rows[0].id : insertResult[0].insertId;

    // Generar token
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: userId,
        nombre,
        email,
        telefono,
        departamento
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
});

// Login de usuario
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario
    const { query: selectQuery, params: selectParams } = toSQL(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    const userResult = await db.query(selectQuery, selectParams);
    const users = isPostgres ? userResult.rows : userResult[0];

    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        departamento: user.departamento
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    });
  }
});

// Obtener perfil del usuario autenticado
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { query: profileQuery, params: profileParams } = toSQL(
      'SELECT id, nombre, email, telefono, departamento, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    const profileResult = await db.query(profileQuery, profileParams);
    const users = isPostgres ? profileResult.rows : profileResult[0];

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

module.exports = router;
