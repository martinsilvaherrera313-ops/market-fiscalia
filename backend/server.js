const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const db = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.postgresql.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Ejecutar el schema (PostgreSQL)
    if (process.env.DATABASE_URL) {
      console.log('📦 Inicializando base de datos PostgreSQL...');
      await db.query(schema);
      console.log('✅ Base de datos inicializada correctamente');
    }
  } catch (error) {
    console.log('ℹ️  Base de datos ya inicializada o error:', error.message);
  }
}

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/publicaciones', require('./routes/publicaciones'));

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API de Market Fiscalia funcionando correctamente',
    version: '1.0.0'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Iniciar servidor con inicialización de base de datos
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
