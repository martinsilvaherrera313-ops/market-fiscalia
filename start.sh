#!/bin/bash

echo "========================================"
echo "Market Fiscalía - Iniciando Servidores"
echo "========================================"
echo ""

echo "Verificando archivos de configuración..."
if [ ! -f "backend/.env" ]; then
    echo "ERROR: No existe backend/.env"
    echo "Copia backend/.env.example a backend/.env y configúralo"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "ERROR: No existe frontend/.env"
    echo "Copia frontend/.env.example a frontend/.env y configúralo"
    exit 1
fi

echo ""
echo "Iniciando backend en el puerto 5000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

echo ""
echo "Iniciando frontend en el puerto 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Servidores iniciados!"
echo "========================================"
echo ""
echo "Backend: http://localhost:5000/api (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Para detener los servidores:"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID
