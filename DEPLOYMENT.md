# Guía de Despliegue - Market Fiscalía

Esta guía te ayudará a desplegar la aplicación completamente gratis en internet.

## 🎯 Opciones Recomendadas

**Backend + Base de Datos**: Railway  
**Frontend**: Vercel

Ambos servicios son gratuitos, fáciles de usar y no requieren tarjeta de crédito.

---

## 📦 Opción 1: Railway (Backend + MySQL) - RECOMENDADO

Railway es perfecto porque incluye MySQL gratis y es muy simple de configurar.

### Paso 1: Preparar el Proyecto

1. Crea una cuenta en [GitHub.com](https://github.com) si no tienes
2. Sube tu proyecto a GitHub:
   ```bash
   cd "C:\Users\marti\Desktop\Market Fiscalia"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/market-fiscalia.git
   git push -u origin main
   ```

### Paso 2: Desplegar en Railway

1. Ve a [Railway.app](https://railway.app)
2. Click en "Login with GitHub"
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Elige tu repositorio `market-fiscalia`
6. Railway detectará automáticamente Node.js

### Paso 3: Agregar Base de Datos MySQL

1. En tu proyecto de Railway, click en "New"
2. Selecciona "Database" → "Add MySQL"
3. Railway creará automáticamente una base de datos MySQL

### Paso 4: Conectar MySQL al Backend

1. Click en el servicio MySQL
2. Ve a la pestaña "Connect"
3. Copia las credenciales (HOST, USER, PASSWORD, etc.)
4. Click en tu servicio de backend (Node.js)
5. Ve a la pestaña "Variables"
6. Agrega estas variables:

```
DB_HOST=<tu_mysql_host_de_railway>
DB_USER=<tu_mysql_user_de_railway>
DB_PASSWORD=<tu_mysql_password_de_railway>
DB_NAME=railway
DB_PORT=<tu_mysql_port_de_railway>
JWT_SECRET=MiClaveSecreta2024!Fiscalia
PORT=5000
FRONTEND_URL=https://tu-proyecto.vercel.app
```

### Paso 5: Ejecutar el Schema SQL

1. En Railway, click en el servicio MySQL
2. Ve a la pestaña "Data"
3. Click en "Query"
4. Copia y pega el contenido de `backend/database/schema.sql`
5. Cambia `market_fiscalia` por `railway` en la línea `USE`
6. Click en "Run Query"

### Paso 6: Configurar Root Directory

1. Click en tu servicio backend
2. Ve a "Settings"
3. En "Root Directory" escribe: `backend`
4. En "Start Command" escribe: `npm start`
5. Click en "Deploy"

### Paso 7: Obtener URL del Backend

1. Ve a tu servicio backend
2. En "Settings" → "Networking"
3. Click en "Generate Domain"
4. Copia la URL (ejemplo: `market-fiscalia-production.up.railway.app`)

**¡Listo! Tu backend está funcionando.**

---

## 🎨 Opción 2: Vercel (Frontend) - RECOMENDADO

### Paso 1: Preparar el Frontend

1. En tu proyecto local, ve a `frontend/.env`:
   ```env
   REACT_APP_API_URL=https://TU-BACKEND-DE-RAILWAY.up.railway.app/api
   ```

2. Actualiza el archivo de producción (crea `frontend/.env.production`):
   ```env
   REACT_APP_API_URL=https://TU-BACKEND-DE-RAILWAY.up.railway.app/api
   ```

### Paso 2: Desplegar en Vercel

1. Ve a [Vercel.com](https://vercel.com)
2. Click en "Sign Up" con GitHub
3. Click en "Add New Project"
4. Selecciona tu repositorio `market-fiscalia`
5. Configura el proyecto:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

6. En "Environment Variables" agrega:
   ```
   REACT_APP_API_URL=https://TU-BACKEND-DE-RAILWAY.up.railway.app/api
   ```

7. Click en "Deploy"

### Paso 3: Obtener URL del Frontend

Vercel generará una URL como: `https://market-fiscalia.vercel.app`

### Paso 4: Actualizar CORS en Backend

1. Vuelve a Railway
2. Actualiza la variable `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://market-fiscalia.vercel.app
   ```

**¡Listo! Tu frontend está en línea.**

---

## 🔄 Alternativa: Render.com (Backend)

Si prefieres Render en lugar de Railway:

### Paso 1: Crear Servicio Web

1. Ve a [Render.com](https://render.com)
2. Sign up con GitHub
3. Click en "New +" → "Web Service"
4. Conecta tu repositorio
5. Configuración:
   - **Name**: market-fiscalia-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Paso 2: Crear Base de Datos

1. Click en "New +" → "PostgreSQL"
2. Nombre: market-fiscalia-db
3. Plan: Free
4. Click en "Create Database"

### Paso 3: Convertir Schema a PostgreSQL

Render usa PostgreSQL gratis (no MySQL). Deberás adaptar el schema:

```sql
-- Cambiar INT AUTO_INCREMENT a SERIAL
-- Cambiar ENGINE=InnoDB a nada
-- Resto es compatible
```

### Paso 4: Variables de Entorno en Render

En tu Web Service, agrega:
```
DB_HOST=<postgres_host_de_render>
DB_USER=<postgres_user_de_render>
DB_PASSWORD=<postgres_password_de_render>
DB_NAME=<postgres_db_de_render>
DB_PORT=5432
JWT_SECRET=MiClaveSecreta2024!Fiscalia
PORT=5000
FRONTEND_URL=https://tu-proyecto.vercel.app
```

**Nota**: Render requiere adaptar el código para PostgreSQL usando el paquete `pg` en lugar de `mysql2`.

---

## 🌐 Alternativa: Netlify (Frontend)

Si prefieres Netlify en lugar de Vercel:

### Opción A: Deploy desde Git

1. Ve a [Netlify.com](https://netlify.com)
2. Sign up con GitHub
3. Click en "Add new site" → "Import an existing project"
4. Conecta GitHub y selecciona tu repo
5. Configuración:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
6. En "Environment variables":
   ```
   REACT_APP_API_URL=https://TU-BACKEND.up.railway.app/api
   ```
7. Deploy

### Opción B: Deploy Manual (Más Simple)

1. En tu PC, ve a la carpeta frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Ve a [Netlify.com](https://netlify.com) y arrastra la carpeta `build` a "Drop your site here"

3. En "Site settings" → "Environment variables", agrega:
   ```
   REACT_APP_API_URL=https://TU-BACKEND.up.railway.app/api
   ```

---

## ✅ Checklist Final

Después de desplegar, verifica:

- [ ] Backend responde en `https://tu-backend.up.railway.app/api`
- [ ] Frontend carga en `https://tu-proyecto.vercel.app`
- [ ] Puedes registrarte con un correo @minpublico.cl
- [ ] Puedes iniciar sesión
- [ ] Puedes crear una publicación
- [ ] Las imágenes se cargan correctamente
- [ ] Puedes ver publicaciones de otros
- [ ] Puedes editar tus publicaciones
- [ ] Puedes eliminar tus publicaciones

---

## 🐛 Solución de Problemas

### Error: CORS
**Problema**: El frontend no puede conectarse al backend  
**Solución**: Verifica que `FRONTEND_URL` en Railway coincida con tu URL de Vercel

### Error: No se cargan las imágenes
**Problema**: Las imágenes no aparecen  
**Solución**: Verifica que la URL de la API sea correcta en el frontend. Considera usar Cloudinary para imágenes en producción.

### Error: Base de datos no conecta
**Problema**: "Error al conectar a MySQL"  
**Solución**: Verifica que las variables de entorno en Railway sean correctas

### El backend se "duerme"
**Problema**: En Render, el servicio gratuito se suspende después de 15 minutos  
**Solución**: Usa Railway que tiene mejor uptime gratuito

---

## 📊 Límites de los Planes Gratuitos

### Railway
- ✅ 500 horas/mes de ejecución
- ✅ 100GB de ancho de banda
- ✅ 1GB de almacenamiento MySQL
- ⚠️ Después de 500 horas, el servicio se detiene hasta el mes siguiente

### Vercel
- ✅ Despliegues ilimitados
- ✅ 100GB de ancho de banda
- ✅ Dominio personalizado gratis
- ⚠️ Sin límite de tiempo

### Render
- ✅ Completamente gratis
- ⚠️ El servicio se suspende después de 15 minutos de inactividad
- ⚠️ Tarda ~30 segundos en "despertar"

---

## 🚀 Tips para Producción

1. **Imágenes**: Considera usar [Cloudinary](https://cloudinary.com) (gratis hasta 25GB)
2. **Dominio**: Puedes usar dominios gratis de [Freenom](https://freenom.com)
3. **Monitoreo**: Usa [UptimeRobot](https://uptimerobot.com) para mantener el servicio activo
4. **HTTPS**: Railway y Vercel incluyen HTTPS automáticamente

---

## 📝 Comandos Útiles

### Ver logs en Railway
1. Click en tu servicio
2. Ve a la pestaña "Deployments"
3. Click en el último deployment
4. Ve a "Logs"

### Actualizar el proyecto
Simplemente haz push a GitHub:
```bash
git add .
git commit -m "Actualización"
git push
```

Railway y Vercel se actualizarán automáticamente.

---

¡Con esta guía deberías tener tu marketplace funcionando completamente gratis en internet! 🎉
