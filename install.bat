@echo off
echo ========================================
echo Market Fiscalia - Instalacion Automatica
echo ========================================
echo.

echo [1/4] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion del backend
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion del frontend
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Creando carpeta de uploads...
if not exist "backend\uploads" mkdir backend\uploads

echo.
echo [4/4] Verificando archivos .env...
if not exist "backend\.env" (
    echo ADVERTENCIA: No existe backend\.env
    echo Copia backend\.env.example a backend\.env y configuralo
)
if not exist "frontend\.env" (
    echo ADVERTENCIA: No existe frontend\.env
    echo Copia frontend\.env.example a frontend\.env y configuralo
)

echo.
echo ========================================
echo Instalacion completada!
echo ========================================
echo.
echo Proximos pasos:
echo 1. Configura backend\.env con tus credenciales de MySQL
echo 2. Configura frontend\.env con la URL del backend
echo 3. Ejecuta el script backend\database\schema.sql en MySQL Workbench
echo 4. Ejecuta start.bat para iniciar la aplicacion
echo.
pause
