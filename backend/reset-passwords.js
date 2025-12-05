require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function resetPasswords() {
  try {
    // Nueva contraseña simple: "123456"
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('\n🔄 Reseteando contraseñas...\n');
    
    // Actualizar todas las contraseñas
    const [result] = await db.query(
      'UPDATE usuarios SET password = ?',
      [hashedPassword]
    );
    
    console.log(`✅ ${result.affectedRows} contraseñas actualizadas\n`);
    
    // Mostrar usuarios
    const [users] = await db.query('SELECT id, nombre, email FROM usuarios ORDER BY id');
    
    console.log('📋 USUARIOS CON NUEVA CONTRASEÑA:\n');
    console.log('Email                          | Contraseña');
    console.log('-------------------------------|------------');
    
    users.forEach(user => {
      console.log(`${user.email.padEnd(30)} | 123456`);
    });
    
    console.log('\n💡 Ahora puedes iniciar sesión con cualquier usuario usando la contraseña: 123456\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();
