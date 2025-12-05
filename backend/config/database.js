require('dotenv').config();

// Detectar si estamos usando PostgreSQL (producción) o MySQL (local)
const isPostgres = process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres';

let pool;

if (isPostgres) {
  // PostgreSQL para Render
  const { Pool } = require('pg');
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  // Verificar conexión PostgreSQL
  pool.query('SELECT NOW()')
    .then(() => console.log('✅ Conexión a PostgreSQL exitosa'))
    .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err.message));

} else {
  // MySQL para desarrollo local
  const mysql = require('mysql2/promise');
  
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'market_fiscalia',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Verificar conexión MySQL
  pool.getConnection()
    .then(connection => {
      console.log('✅ Conexión a MySQL exitosa');
      connection.release();
    })
    .catch(err => {
      console.error('❌ Error al conectar a MySQL:', err.message);
    });
}

module.exports = pool;
