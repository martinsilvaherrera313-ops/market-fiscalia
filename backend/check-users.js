require('dotenv').config();
const db = require('./config/database');

async function checkUsers() {
  try {
    const [users] = await db.query('SELECT id, nombre, email, created_at FROM usuarios ORDER BY id');
    
    console.log('\n📋 USUARIOS REGISTRADOS:\n');
    console.log('ID | Nombre                    | Email');
    console.log('---|---------------------------|----------------------------------');
    
    users.forEach(user => {
      console.log(`${user.id.toString().padEnd(2)} | ${user.nombre.padEnd(25)} | ${user.email}`);
    });
    
    console.log(`\n✅ Total: ${users.length} usuarios\n`);
    console.log('⚠️  Las contraseñas están hasheadas con bcrypt.');
    console.log('💡 Si olvidaste tu contraseña, crea un nuevo usuario o usa reset-password.js\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
