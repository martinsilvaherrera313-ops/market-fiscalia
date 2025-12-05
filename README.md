# Market Fiscalía

Plataforma web de marketplace para funcionarios de la Fiscalía de Chile. Permite a los miembros publicar, comprar y vender artículos entre colegas de manera segura y amigable.

## 🚀 Características

- ✅ **Autenticación segura** con validación de correo @minpublico.cl
- 📝 **Publicaciones completas** con título, precio, descripción y hasta 5 fotos
- 🖼️ **Visualización optimizada** de imágenes con galería
- 👤 **Gestión de perfil** y publicaciones propias
- ✏️ **Edición y eliminación** de publicaciones
- 📱 **Diseño responsive** para móviles y tablets
- 🔒 **Seguridad** con JWT y bcrypt

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior) / MySQL Workbench
- npm o yarn

## 🛠️ Instalación Local

### 1. Clonar o descargar el proyecto

### 2. Configurar la Base de Datos

1. Abre MySQL Workbench
2. Crea una nueva conexión o usa una existente
3. Ejecuta el script `backend/database/schema.sql`
4. Esto creará la base de datos `market_fiscalia` y todas las tablas necesarias

### 3. Configurar el Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` basado en `.env.example`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_NAME=market_fiscalia
DB_PORT=3306

JWT_SECRET=una_clave_secreta_muy_segura_cambiala_123456
PORT=5000

FRONTEND_URL=http://localhost:3000
```

Crea la carpeta para las imágenes:

```bash
mkdir uploads
```

### 4. Configurar el Frontend

```bash
cd frontend
npm install
```

Crea un archivo `.env` basado en `.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Iniciar la Aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📱 Uso de la Aplicación

1. **Registro**: Crea una cuenta con tu correo @minpublico.cl
2. **Login**: Inicia sesión con tus credenciales
3. **Ver publicaciones**: Explora el feed principal
4. **Crear publicación**: Click en "Nueva Publicación"
5. **Ver detalles**: Click en cualquier publicación para ver datos de contacto
6. **Mis publicaciones**: Gestiona tus propias publicaciones
7. **Editar/Eliminar**: Modifica o elimina tus publicaciones

## 🌐 Despliegue Gratuito

### Opción 1: Railway (Backend + MySQL)

**Railway** es la mejor opción para el backend con base de datos MySQL incluida.

1. Crea una cuenta en [Railway.app](https://railway.app)
2. Click en "New Project" → "Deploy from GitHub repo"
3. Conecta tu repositorio
4. Railway detectará automáticamente el proyecto Node.js
5. Agrega un servicio MySQL: "New" → "Database" → "Add MySQL"
6. Configura las variables de entorno en Railway:
   - `DB_HOST`: (lo proporciona Railway automáticamente)
   - `DB_USER`: (lo proporciona Railway automáticamente)
   - `DB_PASSWORD`: (lo proporciona Railway automáticamente)
   - `DB_NAME`: market_fiscalia
   - `DB_PORT`: (lo proporciona Railway automáticamente)
   - `JWT_SECRET`: tu_clave_secreta
   - `FRONTEND_URL`: tu_dominio_de_vercel
   - `PORT`: 5000

7. En el servicio de MySQL, ejecuta el script `schema.sql`
8. Railway generará una URL pública para tu API

**Límites gratuitos**: 500 horas/mes de ejecución, suficiente para varios usuarios.

### Opción 2: Render (Backend + PostgreSQL)

Si prefieres PostgreSQL en lugar de MySQL:

1. Crea cuenta en [Render.com](https://render.com)
2. Crea un nuevo "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
5. Crea una base de datos PostgreSQL (gratuita)
6. Configura las variables de entorno
7. Adapta el código para usar PostgreSQL

**Límites gratuitos**: El servicio se suspende después de 15 minutos de inactividad, pero es completamente gratis.

### Frontend: Vercel

**Vercel** es ideal para desplegar aplicaciones React.

1. Crea cuenta en [Vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Configuración:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Configura variables de entorno:
   - `REACT_APP_API_URL`: URL de tu backend en Railway/Render
6. Deploy

Vercel generará una URL tipo: `https://tu-proyecto.vercel.app`

**Límites gratuitos**: Ilimitado para proyectos personales.

### Alternativa Frontend: Netlify

1. Crea cuenta en [Netlify.com](https://netlify.com)
2. Arrastra la carpeta `build` o conecta GitHub
3. Configuración:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. Agrega las variables de entorno
5. Deploy

**Límites gratuitos**: 100 GB de ancho de banda/mes.

## 📂 Estructura del Proyecto

```
Market Fiscalia/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración MySQL
│   ├── database/
│   │   └── schema.sql            # Esquema de BD
│   ├── middleware/
│   │   ├── auth.js               # Autenticación JWT
│   │   └── upload.js             # Upload de imágenes
│   ├── routes/
│   │   ├── auth.js               # Rutas de autenticación
│   │   └── publicaciones.js      # Rutas de publicaciones
│   ├── uploads/                  # Carpeta de imágenes
│   ├── .env                      # Variables de entorno
│   ├── package.json
│   └── server.js                 # Servidor Express
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js         # Barra de navegación
    │   │   ├── Navbar.css
    │   │   └── PrivateRoute.js   # Rutas protegidas
    │   ├── context/
    │   │   └── AuthContext.js    # Contexto de autenticación
    │   ├── pages/
    │   │   ├── Home.js           # Feed principal
    │   │   ├── Login.js          # Inicio de sesión
    │   │   ├── Register.js       # Registro
    │   │   ├── PublicationDetail.js  # Detalle de publicación
    │   │   ├── CreatePublication.js  # Crear publicación
    │   │   ├── EditPublication.js    # Editar publicación
    │   │   └── MyPublications.js     # Mis publicaciones
    │   ├── services/
    │   │   └── api.js            # Cliente Axios
    │   ├── App.js                # Componente principal
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── .env                      # Variables de entorno
    └── package.json
```

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens JWT con expiración de 7 días
- Validación de email @minpublico.cl
- Protección de rutas con middleware de autenticación
- Validación de tipos de archivo en uploads
- Límite de tamaño de imágenes (5MB)

## 🎨 Tecnologías

**Backend:**
- Node.js
- Express
- MySQL
- JWT (jsonwebtoken)
- bcryptjs
- Multer
- express-validator

**Frontend:**
- React
- React Router
- Axios
- CSS3

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Publicaciones
- `GET /api/publicaciones` - Listar todas las publicaciones
- `GET /api/publicaciones/:id` - Ver detalle de publicación
- `GET /api/publicaciones/user/myposts` - Mis publicaciones (requiere auth)
- `POST /api/publicaciones` - Crear publicación (requiere auth)
- `PUT /api/publicaciones/:id` - Editar publicación (requiere auth)
- `DELETE /api/publicaciones/:id` - Eliminar publicación (requiere auth)

## 🤝 Recomendaciones de Despliegue

Para un uso óptimo con múltiples usuarios simultáneos:

1. **Backend**: Railway con MySQL (mejor rendimiento y persistencia)
2. **Frontend**: Vercel (CDN global, muy rápido)
3. **Imágenes**: Considera usar Cloudinary para almacenamiento de imágenes en producción

## 📧 Soporte

Para problemas o preguntas, contacta al administrador del sistema.

## 📄 Licencia

Uso interno - Fiscalía de Chile
