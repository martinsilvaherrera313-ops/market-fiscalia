require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');
const readline = require('readline');

// Detectar tipo de base de datos
const isPostgres = process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres';

function toSQL(query, params) {
  if (!isPostgres) return { query, params };
  let paramIndex = 1;
  const newQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
  return { query: newQuery, params };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword() {
  try {
    console.log('\n🔐 RESTABLECER CONTRASEÑA DE USUARIO\n');
    
    // Mostrar usuarios disponibles
    const { query: listQuery, params: listParams } = toSQL(
      'SELECT id, nombre, email FROM usuarios ORDER BY id',
      []
    );
    const result = await db.query(listQuery, listParams);
    const users = isPostgres ? result.rows : result[0];
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados\n');
      process.exit(0);
    }
    
    console.log('📋 USUARIOS DISPONIBLES:\n');
    console.log('ID | Nombre                    | Email');
    console.log('---|---------------------------|----------------------------------');
    
    users.forEach(user => {
      console.log(`${user.id.toString().padEnd(2)} | ${user.nombre.padEnd(25)} | ${user.email}`);
    });
    
    console.log('\n');
    
    // Solicitar email del usuario
    const email = await question('Ingresa el email del usuario: ');
    
    if (!email.trim()) {
      console.log('❌ Email no puede estar vacío\n');
      rl.close();
      process.exit(1);
    }
    
    // Verificar que el usuario existe
    const { query: checkQuery, params: checkParams } = toSQL(
      'SELECT id, nombre, email FROM usuarios WHERE email = ?',
      [email.trim()]
    );
    const checkResult = await db.query(checkQuery, checkParams);
    const foundUsers = isPostgres ? checkResult.rows : checkResult[0];
    
    if (foundUsers.length === 0) {
      console.log(`\n❌ Usuario con email "${email}" no encontrado\n`);
      rl.close();
      process.exit(1);
    }
    
    const user = foundUsers[0];
    
    // Solicitar nueva contraseña
    const newPassword = await question('Ingresa la nueva contraseña (mínimo 6 caracteres): ');
    
    if (newPassword.length < 6) {
      console.log('\n❌ La contraseña debe tener al menos 6 caracteres\n');
      rl.close();
      process.exit(1);
    }
    
    // Confirmar acción
    const confirm = await question(`\n⚠️  ¿Confirmas cambiar la contraseña de "${user.nombre}" (${user.email})? (s/n): `);
    
    if (confirm.toLowerCase() !== 's' && confirm.toLowerCase() !== 'si') {
      console.log('\n❌ Operación cancelada\n');
      rl.close();
      process.exit(0);
    }
    
    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    const { query: updateQuery, params: updateParams } = toSQL(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, user.id]
    );
    await db.query(updateQuery, updateParams);
    
    console.log('\n✅ Contraseña actualizada exitosamente\n');
    console.log(`👤 Usuario: ${user.nombre}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Nueva contraseña: ${newPassword}\n`);
    console.log('💡 El usuario ya puede iniciar sesión con la nueva contraseña\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();
