# 🔐 Guía para Restablecer Contraseñas

## 📋 Opciones Disponibles

### **Opción 1: Restablecer Contraseña Individual (RECOMENDADO)**

Resetea la contraseña de un usuario específico de forma interactiva.

**Pasos:**

1. Abre una terminal en la carpeta `backend`
2. Ejecuta:
   ```bash
   npm run reset-password
   ```
3. Sigue las instrucciones:
   - Se mostrará la lista de usuarios
   - Ingresa el email del usuario
   - Ingresa la nueva contraseña (mín. 6 caracteres)
   - Confirma la operación

**Ejemplo:**
```
📋 USUARIOS DISPONIBLES:

ID | Nombre                    | Email
---|---------------------------|----------------------------------
1  | Juan López                | juan@minpublico.cl
2  | María González            | maria@minpublico.cl

Ingresa el email del usuario: juan@minpublico.cl
Ingresa la nueva contraseña (mínimo 6 caracteres): nuevaclave123
⚠️  ¿Confirmas cambiar la contraseña de "Juan López"? (s/n): s

✅ Contraseña actualizada exitosamente
```

---

### **Opción 2: Restablecer TODAS las Contraseñas**

⚠️ **CUIDADO:** Esto resetea las contraseñas de TODOS los usuarios a "123456"

**Pasos:**

1. Abre una terminal en la carpeta `backend`
2. Ejecuta:
   ```bash
   npm run reset-all-passwords
   ```

Solo usar en casos de emergencia o pruebas.

---

### **Opción 3: Ver Lista de Usuarios**

Para ver qué usuarios están registrados:

```bash
npm run check-users
```

Muestra:
- ID
- Nombre
- Email
- Fecha de registro

---

## 🛠️ Desde la Base de Datos Directamente

### **En Render (PostgreSQL):**

1. Ve a https://dashboard.render.com
2. Selecciona tu base de datos PostgreSQL
3. Click en **"Shell"**
4. Ejecuta:

```sql
-- Ver usuarios
SELECT id, nombre, email FROM usuarios;

-- Resetear contraseña de un usuario específico
-- (Contraseña hasheada para "123456")
UPDATE usuarios 
SET password = '$2a$10$YourHashedPasswordHere'
WHERE email = 'usuario@minpublico.cl';
```

Para generar el hash de una contraseña:
```bash
node -e "console.log(require('bcryptjs').hashSync('tucontraseña', 10))"
```

---

## 📧 ¿Implementar Sistema de Email?

**Actualmente NO hay sistema automático de "Olvidé mi contraseña"** porque requiere:
- ❌ Servicio de email (SendGrid, Mailgun, etc.)
- ❌ Costos adicionales
- ❌ Configuración compleja

**Alternativas actuales:**
1. ✅ El usuario contacta al administrador por email/teléfono
2. ✅ El admin usa el script `reset-password` para cambiar la contraseña
3. ✅ Se le informa al usuario su nueva contraseña temporal
4. ✅ El usuario puede cambiarla desde "Editar Perfil"

---

## 🚀 Implementación Futura (Opcional)

Si quieres un sistema automático de recuperación por email:

**Requiere:**
- Servicio de email (SendGrid tiene plan gratuito: 100 emails/día)
- Tabla en BD para tokens de recuperación
- Endpoint para generar token y enviar email
- Página para ingresar nueva contraseña con el token

**¿Te gustaría que lo implemente?** Avísame y lo agrego.

---

## 💡 Recomendaciones

1. **Contraseñas temporales:** Usa contraseñas simples al resetear (ej: "123456")
2. **Pide al usuario cambiarla:** Desde "Editar Perfil" → Seguridad → Cambiar Contraseña
3. **Documenta el proceso:** Comparte esta guía con los usuarios o administradores
4. **Seguridad:** Solo los administradores deben tener acceso a estos scripts

---

## ❓ Problemas Comunes

**Error: "Usuario no encontrado"**
- Verifica que el email sea correcto
- Usa `npm run check-users` para ver emails registrados

**Error: "Cannot connect to database"**
- Verifica el archivo `.env` en backend
- Asegúrate que las credenciales de BD sean correctas

**Error: "Module not found"**
- Ejecuta `npm install` en la carpeta backend
