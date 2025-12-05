# Market Fiscalía - Notas de Desarrollo

## Arquitectura

### Backend (Node.js + Express)
- **Puerto**: 5000
- **Base de datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Upload de archivos**: Multer
- **Seguridad**: bcryptjs para passwords

### Frontend (React)
- **Puerto**: 3000
- **Routing**: React Router v6
- **Estado**: Context API
- **HTTP Client**: Axios

## Endpoints API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
  - Body: { nombre, email, password, telefono?, cargo? }
  - Validación: email debe terminar en @minpublico.cl
  
- `POST /api/auth/login` - Inicio de sesión
  - Body: { email, password }
  - Response: { token, user }

- `GET /api/auth/profile` - Perfil del usuario autenticado
  - Headers: Authorization: Bearer <token>

### Publicaciones
- `GET /api/publicaciones` - Feed de todas las publicaciones activas
  - Query params: ninguno
  - Response: Array de publicaciones con imagen principal

- `GET /api/publicaciones/:id` - Detalle de una publicación
  - Response: Publicación completa con todas las imágenes y datos del vendedor

- `GET /api/publicaciones/user/myposts` - Mis publicaciones
  - Headers: Authorization: Bearer <token>
  - Response: Array de publicaciones del usuario autenticado

- `POST /api/publicaciones` - Crear publicación
  - Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
  - Body: FormData con titulo, descripcion, precio, imagenes[]
  
- `PUT /api/publicaciones/:id` - Editar publicación
  - Headers: Authorization: Bearer <token>, Content-Type: multipart/form-data
  - Body: FormData con campos a actualizar + imagenesAEliminar (JSON array de IDs)

- `DELETE /api/publicaciones/:id` - Eliminar publicación
  - Headers: Authorization: Bearer <token>

## Base de Datos

### Tabla: usuarios
- id (PK, AUTO_INCREMENT)
- nombre (VARCHAR 100)
- email (VARCHAR 100, UNIQUE)
- password (VARCHAR 255, hashed)
- telefono (VARCHAR 20, nullable)
- cargo (VARCHAR 100, nullable)
- created_at, updated_at (TIMESTAMP)

### Tabla: publicaciones
- id (PK, AUTO_INCREMENT)
- usuario_id (FK -> usuarios.id)
- titulo (VARCHAR 200)
- descripcion (TEXT)
- precio (DECIMAL 10,2)
- estado (ENUM: activo, vendido, inactivo)
- created_at, updated_at (TIMESTAMP)

### Tabla: imagenes
- id (PK, AUTO_INCREMENT)
- publicacion_id (FK -> publicaciones.id, CASCADE)
- url (VARCHAR 500)
- orden (INT)
- created_at (TIMESTAMP)

## Flujo de Autenticación

1. Usuario se registra o hace login
2. Backend genera un JWT con payload: { id, email }
3. Frontend guarda el token en localStorage
4. En cada petición protegida, se envía el token en header Authorization
5. Middleware `authMiddleware` verifica el token
6. Si es válido, adjunta `req.user` con los datos decodificados

## Flujo de Publicación

1. Usuario crea publicación con datos + imágenes
2. Multer guarda las imágenes en `/uploads` con nombre único
3. Backend crea registro en tabla `publicaciones`
4. Backend crea registros en tabla `imagenes` con rutas
5. Transacción asegura que todo se guarde o nada

## Mejoras Futuras

- [ ] Sistema de mensajería entre usuarios
- [ ] Notificaciones push
- [ ] Categorías de productos
- [ ] Búsqueda y filtros
- [ ] Sistema de valoraciones
- [ ] Historial de ventas
- [ ] Panel de administración
- [ ] Estadísticas de uso
- [ ] Integración con Cloudinary para imágenes
- [ ] Soporte para PostgreSQL
- [ ] Tests unitarios e integración
- [ ] Docker containers
- [ ] CI/CD pipeline

## Consideraciones de Seguridad

- ✅ Contraseñas nunca se guardan en texto plano
- ✅ JWT expira después de 7 días
- ✅ Solo emails @minpublico.cl pueden registrarse
- ✅ CORS configurado para permitir solo frontend autorizado
- ✅ Validación de tipos de archivo en uploads
- ✅ Límite de tamaño de imágenes (5MB)
- ✅ SQL injection protegido por queries parametrizadas
- ⚠️ Falta rate limiting para prevenir ataques
- ⚠️ Falta sanitización de HTML en descripciones

## Mantenimiento

### Backup de Base de Datos
```sql
mysqldump -u root -p market_fiscalia > backup.sql
```

### Restaurar Base de Datos
```sql
mysql -u root -p market_fiscalia < backup.sql
```

### Limpiar imágenes huérfanas
Las imágenes se eliminan automáticamente por CASCADE cuando se borra una publicación.

### Logs
- Backend: logs en consola (considerar winston para producción)
- Frontend: logs en consola del navegador

## Variables de Entorno Requeridas

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=market_fiscalia
DB_PORT=3306
JWT_SECRET=clave_super_secreta
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Comandos Útiles

### Backend
```bash
npm start          # Producción
npm run dev        # Desarrollo con nodemon
```

### Frontend
```bash
npm start          # Desarrollo
npm run build      # Build para producción
```

## Solución de Problemas

### Error: ER_NOT_SUPPORTED_AUTH_MODE
Ejecutar en MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_password';
FLUSH PRIVILEGES;
```

### Error: EADDRINUSE (puerto ocupado)
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error: Cannot find module
```bash
rm -rf node_modules
npm install
```
