#!/bin/bash

echo "========================================"
echo "Market Fiscalía - Instalación Automática"
echo "========================================"
echo ""

echo "[1/4] Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo la instalación del backend"
    exit 1
fi
cd ..

echo ""
echo "[2/4] Instalando dependencias del frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo la instalación del frontend"
    exit 1
fi
cd ..

echo ""
echo "[3/4] Creando carpeta de uploads..."
mkdir -p backend/uploads

echo ""
echo "[4/4] Verificando archivos .env..."
if [ ! -f "backend/.env" ]; then
    echo "ADVERTENCIA: No existe backend/.env"
    echo "Copia backend/.env.example a backend/.env y configúralo"
fi
if [ ! -f "frontend/.env" ]; then
    echo "ADVERTENCIA: No existe frontend/.env"
    echo "Copia frontend/.env.example a frontend/.env y configúralo"
fi

echo ""
echo "========================================"
echo "Instalación completada!"
echo "========================================"
echo ""
echo "Próximos pasos:"
echo "1. Configura backend/.env con tus credenciales de MySQL"
echo "2. Configura frontend/.env con la URL del backend"
echo "3. Ejecuta el script backend/database/schema.sql en MySQL"
echo "4. Ejecuta ./start.sh para iniciar la aplicación"
echo ""
