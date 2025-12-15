require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function resetPassword() {
  try {
    // Mostrar lista de usuarios
    const [users] = await db.query('SELECT id, nombre, email FROM usuarios ORDER BY id');
    
    console.log('\n📋 USUARIOS DISPONIBLES:\n');
    console.log('ID | Nombre                    | Email');
    console.log('---|---------------------------|----------------------------------');
    users.forEach(user => {
      console.log(`${user.id.toString().padEnd(2)} | ${user.nombre.padEnd(25)} | ${user.email}`);
    });
    console.log('');

    // Preguntar ID del usuario
    rl.question('Ingresa el ID del usuario: ', async (userId) => {
      const user = users.find(u => u.id === parseInt(userId));
      
      if (!user) {
        console.log('❌ Usuario no encontrado');
        rl.close();
        process.exit(1);
      }

      // Preguntar nueva contraseña
      rl.question('Ingresa la nueva contraseña: ', async (newPassword) => {
        if (newPassword.length < 6) {
          console.log('❌ La contraseña debe tener al menos 6 caracteres');
          rl.close();
          process.exit(1);
        }

        // Encriptar y actualizar
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, userId]);

        console.log(`\n✅ Contraseña actualizada para: ${user.nombre} (${user.email})`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Nueva contraseña: ${newPassword}\n`);

        rl.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();
