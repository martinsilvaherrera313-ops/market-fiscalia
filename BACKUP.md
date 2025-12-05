# Guía de Backup y Mantenimiento - Market Fiscalía

## 📦 Copias de Seguridad (Backup)

### ¿Qué necesitas respaldar?

1. **Base de datos MySQL** (usuarios, publicaciones, imágenes)
2. **Carpeta de imágenes** (`backend/uploads/`)
3. **Código fuente** (si hiciste modificaciones)
4. **Variables de entorno** (archivos `.env`)

---

## 💾 Backup de Base de Datos

### Opción 1: Usando MySQL Workbench (Recomendado para principiantes)

1. Abre MySQL Workbench
2. Conecta a tu base de datos
3. Ve a: **Server** → **Data Export**
4. Selecciona la base de datos `market_fiscalia`
5. Opciones recomendadas:
   - ✅ Export to Self-Contained File
   - Nombre: `market_fiscalia_backup_YYYY-MM-DD.sql`
   - ✅ Include Create Schema
6. Click en **Start Export**
7. Guarda el archivo en un lugar seguro

### Opción 2: Usando Línea de Comandos

**En Windows PowerShell:**
```powershell
# Navega a la carpeta de MySQL
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"

# Crear backup
.\mysqldump.exe -u root -p market_fiscalia > "C:\Backups\market_fiscalia_backup_$(Get-Date -Format 'yyyy-MM-dd').sql"
```

**En Linux/Mac:**
```bash
# Crear backup
mysqldump -u root -p market_fiscalia > ~/backups/market_fiscalia_backup_$(date +%Y-%m-%d).sql
```

### Automatizar Backup Diario

**Script para Windows (backup_daily.bat):**
```batch
@echo off
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin"
set BACKUP_PATH="C:\Backups\MarketFiscalia"
set DATE=%date:~-4%%date:~3,2%%date:~0,2%

%MYSQL_PATH%\mysqldump.exe -u root -pTU_PASSWORD market_fiscalia > %BACKUP_PATH%\backup_%DATE%.sql

echo Backup completado: backup_%DATE%.sql
```

**Programar en Task Scheduler (Windows):**
1. Abre "Programador de tareas"
2. Crear tarea básica
3. Nombre: "Backup Market Fiscalía"
4. Frecuencia: Diaria a las 2:00 AM
5. Acción: Iniciar programa → backup_daily.bat

---

## 🖼️ Backup de Imágenes

### Método Manual

**Windows:**
1. Navega a `backend\uploads\`
2. Copia toda la carpeta a tu backup
3. Ejemplo: `C:\Backups\MarketFiscalia\uploads_2025-12-03\`

**Script automatizado (PowerShell):**
```powershell
$fecha = Get-Date -Format "yyyy-MM-dd"
$origen = "C:\Users\marti\Desktop\Market Fiscalia\backend\uploads"
$destino = "C:\Backups\MarketFiscalia\uploads_$fecha"

Copy-Item -Path $origen -Destination $destino -Recurse
Write-Host "Backup de imágenes completado: $destino"
```

### Método con Sincronización (Recomendado)

**Usando OneDrive/Google Drive:**
1. Instala OneDrive o Google Drive Desktop
2. Configura para sincronizar `backend/uploads/`
3. Las imágenes se respaldarán automáticamente en la nube

**Usando rsync (Linux/Mac):**
```bash
# Backup local
rsync -avz ~/Market\ Fiscalia/backend/uploads/ ~/Backups/uploads_$(date +%Y-%m-%d)/

# Backup a servidor remoto
rsync -avz ~/Market\ Fiscalia/backend/uploads/ usuario@servidor:/backup/uploads/
```

---

## 🔄 Restaurar desde Backup

### Restaurar Base de Datos

**Opción 1: MySQL Workbench**
1. Abre MySQL Workbench
2. Ve a: **Server** → **Data Import**
3. Selecciona: Import from Self-Contained File
4. Busca tu archivo `.sql`
5. Selecciona Default Target Schema: `market_fiscalia`
6. Click en **Start Import**

**Opción 2: Línea de Comandos**
```powershell
# Windows
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
.\mysql.exe -u root -p market_fiscalia < "C:\Backups\market_fiscalia_backup_2025-12-03.sql"

# Linux/Mac
mysql -u root -p market_fiscalia < ~/backups/market_fiscalia_backup_2025-12-03.sql
```

### Restaurar Imágenes

Simplemente copia la carpeta backup de uploads de vuelta a `backend/uploads/`:

```powershell
# Windows PowerShell
Copy-Item -Path "C:\Backups\MarketFiscalia\uploads_2025-12-03\*" -Destination "C:\Users\marti\Desktop\Market Fiscalia\backend\uploads\" -Recurse -Force
```

```bash
# Linux/Mac
cp -r ~/Backups/uploads_2025-12-03/* ~/Market\ Fiscalia/backend/uploads/
```

---

## 🧹 Mantenimiento Regular

### Limpieza de Base de Datos

**Eliminar publicaciones antiguas (más de 1 año):**
```sql
-- Primero revisa cuántas hay
SELECT COUNT(*) FROM publicaciones 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Si estás seguro, elimina
DELETE FROM publicaciones 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)
AND estado != 'activo';
```

**Nota**: Las imágenes asociadas se eliminan automáticamente por CASCADE.

### Optimizar Tablas

```sql
-- Optimizar todas las tablas
OPTIMIZE TABLE usuarios;
OPTIMIZE TABLE publicaciones;
OPTIMIZE TABLE imagenes;
```

### Limpiar Imágenes Huérfanas

**Script para verificar imágenes sin publicación:**
```sql
-- Ver imágenes que ya no tienen publicación asociada
SELECT i.id, i.url, i.publicacion_id
FROM imagenes i
LEFT JOIN publicaciones p ON i.publicacion_id = p.id
WHERE p.id IS NULL;

-- Eliminar imágenes huérfanas
DELETE i FROM imagenes i
LEFT JOIN publicaciones p ON i.publicacion_id = p.id
WHERE p.id IS NULL;
```

Luego elimina los archivos físicos huérfanos manualmente o con script.

### Monitorear Espacio en Disco

**Windows PowerShell:**
```powershell
# Ver tamaño de carpeta uploads
$size = (Get-ChildItem "backend\uploads" -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB
Write-Host "Tamaño de uploads: $size GB"
```

**Linux/Mac:**
```bash
du -sh backend/uploads/
```

---

## 📊 Monitoreo de la Base de Datos

### Estadísticas Útiles

```sql
-- Total de usuarios registrados
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- Total de publicaciones activas
SELECT COUNT(*) as publicaciones_activas 
FROM publicaciones WHERE estado = 'activo';

-- Publicaciones por usuario
SELECT u.nombre, u.email, COUNT(p.id) as total_publicaciones
FROM usuarios u
LEFT JOIN publicaciones p ON u.id = p.usuario_id
GROUP BY u.id
ORDER BY total_publicaciones DESC;

-- Promedio de imágenes por publicación
SELECT AVG(img_count) as promedio_imagenes
FROM (
    SELECT publicacion_id, COUNT(*) as img_count
    FROM imagenes
    GROUP BY publicacion_id
) as conteo;

-- Tamaño aproximado de la base de datos
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'market_fiscalia'
GROUP BY table_schema;
```

---

## 🔐 Backup en Producción (Railway)

### Opción 1: Backup Manual desde Railway

1. Ve a tu proyecto en Railway
2. Click en el servicio MySQL
3. Ve a la pestaña "Data"
4. Exporta los datos usando las queries SQL anteriores
5. Guarda los resultados

### Opción 2: Conectar desde MySQL Workbench

1. En Railway, ve a tu servicio MySQL
2. Ve a "Connect" → "Public Networking"
3. Copia las credenciales
4. En MySQL Workbench:
   - Hostname: [de Railway]
   - Port: [de Railway]
   - Username: [de Railway]
   - Password: [de Railway]
5. Conecta y haz backup como normalmente

### Opción 3: Automatizar con Script

```bash
#!/bin/bash
# backup_railway.sh

RAILWAY_HOST="containers-us-west-XXX.railway.app"
RAILWAY_PORT="5432"
RAILWAY_USER="root"
RAILWAY_PASS="tu_password"
RAILWAY_DB="railway"

BACKUP_DIR="~/backups/railway"
DATE=$(date +%Y-%m-%d)

mkdir -p $BACKUP_DIR

mysqldump -h $RAILWAY_HOST -P $RAILWAY_PORT -u $RAILWAY_USER -p$RAILWAY_PASS $RAILWAY_DB > $BACKUP_DIR/backup_$DATE.sql

echo "Backup completado: backup_$DATE.sql"
```

### Backup de Imágenes en Producción

**Problema**: En Railway/Render, los archivos subidos se pierden al reiniciar.

**Solución recomendada**: Migrar a Cloudinary

1. Crea cuenta gratuita en [Cloudinary](https://cloudinary.com)
2. Instala SDK: `npm install cloudinary`
3. Configura en lugar de Multer
4. Las imágenes se almacenan permanentemente

---

## 📅 Calendario de Mantenimiento Recomendado

### Diario
- [ ] Verificar que los servicios estén corriendo
- [ ] Revisar logs por errores

### Semanal
- [ ] Backup de base de datos
- [ ] Backup de carpeta uploads
- [ ] Revisar uso de disco

### Mensual
- [ ] Optimizar tablas de base de datos
- [ ] Limpiar imágenes huérfanas
- [ ] Revisar estadísticas de uso
- [ ] Actualizar dependencias (si hay parches de seguridad)

### Trimestral
- [ ] Revisar y limpiar publicaciones muy antiguas
- [ ] Auditoría de seguridad
- [ ] Revisar logs completos
- [ ] Actualizar documentación

---

## 🚨 Plan de Recuperación ante Desastres

### Escenario 1: Se Elimina la Base de Datos

1. Detener el backend
2. Restaurar último backup de BD
3. Verificar integridad de datos
4. Reiniciar backend
5. Probar funcionalidad

### Escenario 2: Se Pierden las Imágenes

1. Restaurar carpeta uploads desde backup
2. Verificar permisos de la carpeta
3. Reiniciar backend
4. Probar carga de imágenes

### Escenario 3: Fallo Completo del Servidor

1. Preparar nuevo servidor
2. Instalar Node.js y MySQL
3. Clonar código desde GitHub
4. Restaurar base de datos desde backup
5. Restaurar carpeta uploads
6. Configurar variables de entorno
7. Iniciar servicios
8. Probar funcionamiento

### Escenario 4: Hackeo/Datos Comprometidos

1. Detener todos los servicios inmediatamente
2. Cambiar todas las contraseñas
3. Cambiar JWT_SECRET
4. Restaurar desde backup limpio
5. Auditar código por vulnerabilidades
6. Notificar a usuarios (forzar cambio de contraseña)
7. Reiniciar con nuevas medidas de seguridad

---

## 📝 Registro de Backups

Mantén un registro de tus backups:

```
Fecha       | Tipo           | Tamaño  | Ubicación                    | Verificado
------------|----------------|---------|------------------------------|-----------
2025-12-01  | BD + Imágenes  | 250MB   | C:\Backups\market_20251201  | ✅
2025-12-02  | BD + Imágenes  | 255MB   | C:\Backups\market_20251202  | ✅
2025-12-03  | BD + Imágenes  | 260MB   | C:\Backups\market_20251203  | ✅
```

---

## 💡 Mejores Prácticas

1. **Regla 3-2-1**: 3 copias, en 2 tipos de medios, 1 fuera del sitio
2. **Automatiza**: Usa scripts para backups automáticos
3. **Verifica**: Prueba restaurar regularmente
4. **Documenta**: Mantén instrucciones actualizadas
5. **Rotación**: Mantén últimos 30 días diarios, 12 meses mensuales
6. **Encripta**: Protege backups con contraseña si contienen datos sensibles
7. **Monitorea**: Verifica que los backups se ejecuten correctamente

---

## 🔧 Herramientas Recomendadas

### Para Backups
- **MySQL Workbench**: Backup manual de BD
- **Cron/Task Scheduler**: Automatización
- **rsync**: Sincronización de archivos (Linux/Mac)
- **Robocopy**: Copia robusta (Windows)

### Para Almacenamiento
- **Google Drive**: 15GB gratis
- **OneDrive**: 5GB gratis
- **Dropbox**: 2GB gratis
- **Mega**: 20GB gratis

### Para Monitoreo
- **UptimeRobot**: Monitoreo de uptime gratis
- **Datadog**: Monitoreo avanzado
- **New Relic**: APM y monitoreo

---

**Recuerda**: Un backup no es backup hasta que lo has probado restaurar. ✅

---

*Última actualización: Diciembre 2025*
