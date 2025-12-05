# 🚀 Inicio Rápido - Market Fiscalía

## Paso 1: Instalar Dependencias

### Backend
```powershell
cd backend
npm install
```

### Frontend
```powershell
cd frontend
npm install
```

## Paso 2: Configurar Base de Datos

1. Abre **MySQL Workbench**
2. Ejecuta el archivo: `backend/database/schema.sql`
3. Esto creará la base de datos `market_fiscalia`

## Paso 3: Configurar Variables de Entorno

### Backend
Crea `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_PASSWORD_DE_MYSQL
DB_NAME=market_fiscalia
DB_PORT=3306

JWT_SECRET=clave_secreta_super_segura_123
PORT=5000

FRONTEND_URL=http://localhost:3000
```

### Frontend
Crea `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Paso 4: Crear Carpeta de Imágenes

```powershell
cd backend
mkdir uploads
```

## Paso 5: Iniciar Aplicación

Abre **DOS TERMINALES** en PowerShell:

### Terminal 1 - Backend
```powershell
cd backend
npm start
```

### Terminal 2 - Frontend
```powershell
cd frontend
npm start
```

## ✅ ¡Listo!

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000/api

## 🎯 Primeros Pasos

1. Regístrate con un correo @minpublico.cl
2. Inicia sesión
3. Crea tu primera publicación
4. ¡Explora el marketplace!

## 🐛 Problemas Comunes

**Error de conexión a MySQL:**
- Verifica que MySQL esté corriendo
- Revisa el usuario y password en `.env`
- Verifica que la base de datos `market_fiscalia` exista

**Puerto 3000 ocupado:**
```powershell
# El navegador te preguntará si usar otro puerto, acepta
```

**Imágenes no se cargan:**
- Verifica que la carpeta `backend/uploads` exista
- Verifica permisos de escritura en la carpeta

## 📚 Documentación Completa

- Ver `README.md` para documentación completa
- Ver `DEPLOYMENT.md` para desplegar en internet gratis
