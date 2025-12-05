# Checklist de Verificación - Market Fiscalía

Use este checklist para asegurarse de que la aplicación está correctamente instalada y funcionando.

## ✅ Pre-instalación

### Requisitos del Sistema
- [ ] Node.js v14+ instalado
  - Verificar: `node --version`
- [ ] npm instalado
  - Verificar: `npm --version`
- [ ] MySQL o MariaDB instalado y corriendo
  - Verificar: MySQL Workbench puede conectarse
- [ ] Git instalado (para despliegue)
  - Verificar: `git --version`

## ✅ Instalación Local

### Base de Datos
- [ ] MySQL está corriendo
- [ ] Puedes conectarte a MySQL con usuario y contraseña
- [ ] Ejecutaste `backend/database/schema.sql` en MySQL Workbench
- [ ] La base de datos `market_fiscalia` existe
- [ ] Las 3 tablas están creadas: `usuarios`, `publicaciones`, `imagenes`

### Backend
- [ ] Ejecutaste `npm install` en carpeta backend
- [ ] Creaste archivo `backend/.env` (copiando desde `.env.example`)
- [ ] Configuraste las credenciales de MySQL en `.env`
- [ ] Configuraste JWT_SECRET en `.env`
- [ ] La carpeta `backend/uploads` existe
- [ ] No hay errores al ejecutar `npm start` en backend

### Frontend
- [ ] Ejecutaste `npm install` en carpeta frontend
- [ ] Creaste archivo `frontend/.env` (copiando desde `.env.example`)
- [ ] Configuraste REACT_APP_API_URL en `.env`
- [ ] No hay errores al ejecutar `npm start` en frontend

## ✅ Verificación de Funcionamiento

### Servidor Backend (Puerto 5000)
- [ ] Backend inicia sin errores
- [ ] Ves mensaje "✅ Conexión a MySQL exitosa"
- [ ] Ves mensaje "🚀 Servidor corriendo en puerto 5000"
- [ ] Puedes acceder a http://localhost:5000/api en el navegador
- [ ] Ves respuesta JSON con mensaje de API funcionando

### Servidor Frontend (Puerto 3000)
- [ ] Frontend inicia sin errores
- [ ] Se abre automáticamente http://localhost:3000
- [ ] Ves la página de login/registro
- [ ] No hay errores en la consola del navegador (F12)

## ✅ Pruebas de Funcionalidad

### 1. Registro de Usuario
- [ ] Puedes acceder a la página de registro
- [ ] El formulario muestra todos los campos
- [ ] Al intentar registrar con email sin @minpublico.cl, muestra error
- [ ] Al registrar con email @minpublico.cl válido, el registro es exitoso
- [ ] Después del registro, entras automáticamente al sistema
- [ ] Ves el navbar con tu nombre

### 2. Inicio de Sesión
- [ ] Puedes cerrar sesión
- [ ] Ves la página de login
- [ ] Al ingresar credenciales incorrectas, muestra error
- [ ] Al ingresar credenciales correctas, entras al sistema
- [ ] Ves el feed de publicaciones (vacío si no hay publicaciones)

### 3. Crear Publicación
- [ ] Click en "Nueva Publicación" funciona
- [ ] Ves el formulario completo
- [ ] Puedes escribir título, precio y descripción
- [ ] Puedes seleccionar imágenes (hasta 5)
- [ ] Ves preview de las imágenes seleccionadas
- [ ] Puedes eliminar imágenes del preview
- [ ] Al enviar el formulario, la publicación se crea
- [ ] Te redirige a la página de detalle de la publicación

### 4. Ver Publicaciones
- [ ] Ves tu publicación en el feed principal
- [ ] La imagen se muestra correctamente
- [ ] El título, precio y descripción son visibles
- [ ] Tu nombre aparece como vendedor
- [ ] Click en la tarjeta te lleva al detalle

### 5. Detalle de Publicación
- [ ] Ves la imagen principal grande
- [ ] Si hay múltiples imágenes, ves las miniaturas
- [ ] Click en miniaturas cambia la imagen principal
- [ ] Ves toda la información: título, precio, descripción
- [ ] Ves información del vendedor: nombre, email, teléfono
- [ ] Ves las fechas de creación y actualización
- [ ] Como dueño, ves botones "Editar" y "Eliminar"

### 6. Editar Publicación
- [ ] Click en "Editar" te lleva al formulario de edición
- [ ] Los datos actuales se muestran en el formulario
- [ ] Puedes modificar título, precio y descripción
- [ ] Ves las imágenes actuales
- [ ] Puedes marcar imágenes para eliminar (botón X)
- [ ] Puedes restaurar imágenes marcadas (botón ↶)
- [ ] Puedes agregar nuevas imágenes
- [ ] Al guardar, los cambios se aplican
- [ ] Te redirige al detalle con los cambios aplicados

### 7. Eliminar Publicación
- [ ] Click en "Eliminar" muestra confirmación
- [ ] Al confirmar, la publicación se elimina
- [ ] Ya no aparece en el feed
- [ ] Ya no aparece en "Mis Publicaciones"

### 8. Mis Publicaciones
- [ ] Click en "Mis Publicaciones" en el menú funciona
- [ ] Ves todas tus publicaciones
- [ ] Cada publicación muestra su estado (activo)
- [ ] Botones "Ver", "Editar" y "Eliminar" funcionan

### 9. Responsive Design
- [ ] La página se ve bien en pantalla completa (desktop)
- [ ] Abres DevTools (F12) y cambias a vista móvil
- [ ] El menú se adapta correctamente
- [ ] Las tarjetas de publicaciones se ven bien
- [ ] Los formularios son usables en móvil
- [ ] Las imágenes se ajustan correctamente

### 10. Validaciones
- [ ] No puedes crear publicación sin título
- [ ] No puedes crear publicación sin precio
- [ ] No puedes crear publicación sin descripción
- [ ] No puedes poner precio negativo
- [ ] No puedes subir más de 5 imágenes
- [ ] No puedes subir archivos que no sean imágenes
- [ ] Imágenes muy grandes (>5MB) muestran error

### 11. Seguridad
- [ ] Sin iniciar sesión, te redirige a login
- [ ] No puedes acceder a rutas protegidas sin token
- [ ] No puedes editar publicaciones de otros usuarios
- [ ] No puedes eliminar publicaciones de otros usuarios
- [ ] Tu contraseña no es visible en la base de datos (está hasheada)

### 12. Múltiples Usuarios
- [ ] Crea una segunda cuenta con otro email @minpublico.cl
- [ ] Con la segunda cuenta, ves las publicaciones de la primera
- [ ] Puedes ver detalles de publicaciones de otros
- [ ] Ves información de contacto del otro usuario
- [ ] NO ves botones editar/eliminar en publicaciones de otros
- [ ] Puedes crear tus propias publicaciones

## ✅ Preparación para Despliegue

### Git y GitHub
- [ ] Tienes cuenta de GitHub
- [ ] Creaste un repositorio en GitHub
- [ ] Ejecutaste `git init` en la carpeta del proyecto
- [ ] Agregaste archivos con `git add .`
- [ ] Hiciste commit: `git commit -m "Initial commit"`
- [ ] Conectaste con GitHub: `git remote add origin URL`
- [ ] Hiciste push: `git push -u origin main`

### Railway (Backend)
- [ ] Tienes cuenta en Railway.app
- [ ] Conectaste tu cuenta de GitHub
- [ ] Creaste nuevo proyecto desde GitHub
- [ ] Agregaste servicio MySQL
- [ ] Configuraste variables de entorno
- [ ] Ejecutaste el schema SQL en Railway
- [ ] El backend está desplegado y funcionando
- [ ] Tienes la URL del backend

### Vercel (Frontend)
- [ ] Tienes cuenta en Vercel.com
- [ ] Conectaste tu cuenta de GitHub
- [ ] Importaste el proyecto
- [ ] Configuraste Root Directory: `frontend`
- [ ] Configuraste variable REACT_APP_API_URL
- [ ] El frontend está desplegado
- [ ] Puedes acceder a la URL de Vercel
- [ ] La aplicación funciona en producción

### Conexión Backend-Frontend
- [ ] Actualizaste FRONTEND_URL en Railway
- [ ] Actualizaste REACT_APP_API_URL en Vercel
- [ ] Puedes registrarte en producción
- [ ] Puedes crear publicaciones en producción
- [ ] Las imágenes se cargan en producción

## ✅ Post-Despliegue

### Pruebas Finales
- [ ] Registro funciona en producción
- [ ] Login funciona en producción
- [ ] Crear publicación funciona
- [ ] Editar publicación funciona
- [ ] Eliminar publicación funciona
- [ ] Las imágenes se cargan correctamente
- [ ] El sitio es accesible desde móvil
- [ ] HTTPS está activo (candado verde)
- [ ] No hay errores en consola

### Documentación
- [ ] Compartiste la URL con los usuarios
- [ ] Proporcionaste el USER_GUIDE.md
- [ ] Proporcionaste el FAQ.md
- [ ] Configuraste canal de soporte

## ⚠️ Problemas Comunes y Soluciones

### ❌ Error: ER_ACCESS_DENIED_ERROR
**Problema**: Credenciales de MySQL incorrectas  
**Solución**: Verifica usuario y password en backend/.env

### ❌ Error: ECONNREFUSED
**Problema**: Backend no está corriendo o puerto incorrecto  
**Solución**: Asegúrate de que backend esté en puerto 5000

### ❌ Error: CORS
**Problema**: Frontend y backend en dominios diferentes  
**Solución**: Configura FRONTEND_URL correctamente en backend

### ❌ Imágenes no cargan
**Problema**: Ruta incorrecta o carpeta uploads no existe  
**Solución**: Verifica que backend/uploads exista y tenga permisos

### ❌ Token inválido
**Problema**: JWT_SECRET diferente entre desarrollo y producción  
**Solución**: Usa el mismo JWT_SECRET o cierra sesión e inicia de nuevo

### ❌ Puerto ocupado
**Problema**: 3000 o 5000 ya en uso  
**Solución**: Cierra la aplicación que usa ese puerto o cambia el puerto

## 📞 Contacto para Soporte

Si algo no funciona después de revisar este checklist:
1. Revisa los logs en la terminal
2. Revisa la consola del navegador (F12)
3. Consulta la documentación (README.md, FAQ.md)
4. Contacta al administrador del sistema

---

## ✨ Estado Final

Si marcaste TODOS los items ✅ :
- 🎉 ¡Felicitaciones! La aplicación está completamente funcional
- 📤 Está lista para usar en producción
- 👥 Puedes invitar a los usuarios a registrarse

---

*Última actualización: Diciembre 2025*
