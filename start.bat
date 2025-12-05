@echo off
title Market Fiscalia - Servidor Backend y Frontend

echo ========================================
echo Market Fiscalia - Iniciando Servidores
echo ========================================
echo.

echo Verificando archivos de configuracion...
if not exist "backend\.env" (
    echo ERROR: No existe backend\.env
    echo Copia backend\.env.example a backend\.env y configuralo
    pause
    exit /b 1
)

if not exist "frontend\.env" (
    echo ERROR: No existe frontend\.env
    echo Copia frontend\.env.example a frontend\.env y configuralo
    pause
    exit /b 1
)

echo.
echo Iniciando backend en el puerto 5000...
start "Market Fiscalia - Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo.
echo Iniciando frontend en el puerto 3000...
start "Market Fiscalia - Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Servidores iniciados!
echo ========================================
echo.
echo Backend: http://localhost:5000/api
echo Frontend: http://localhost:3000
echo.
echo Presiona Ctrl+C en cada ventana para detener los servidores
echo.
pause
