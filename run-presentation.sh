#!/usr/bin/env bash

# =============================================================================
# OPUS RENTALS - ASISTENTE DE EJECUCION Y SUSTENTACION EN LINUX
# Compatible con Ubuntu, Debian, Fedora, Arch Linux y derivados
# =============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "================================================================="
echo "   OPUS RENTALS - ASISTENTE DE EJECUCION Y SUSTENTACION (LINUX)  "
echo "================================================================="
echo ""

# 1. Diagnostico del entorno Linux
HAS_DOCKER=false
HAS_COMPOSE=false
HAS_NODE=false
HAS_JAVA=false

if command -v docker >/dev/null 2>&1; then HAS_DOCKER=true; fi
if docker compose version >/dev/null 2>&1; then HAS_COMPOSE=true; fi
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then HAS_NODE=true; fi
if command -v java >/dev/null 2>&1; then HAS_JAVA=true; fi

echo "Diagnostico del entorno Linux:"
if [ "$HAS_DOCKER" = true ] && [ "$HAS_COMPOSE" = true ]; then
  echo "  [OK] Docker y Docker Compose disponibles."
else
  echo "  [!] Docker o Docker Compose no disponibles (o requieren sudo)."
fi

if [ "$HAS_NODE" = true ]; then
  NODE_VER=$(node -v 2>/dev/null || echo "")
  echo "  [OK] Node.js ($NODE_VER) y NPM disponibles."
else
  echo "  [!] Node.js no detectado en PATH."
fi

if [ "$HAS_JAVA" = true ]; then
  echo "  [OK] Java Runtime detectado."
else
  echo "  [!] Java no detectado en PATH."
fi

echo ""
echo "Opciones de ejecucion para la sustentacion:"
echo "  1) Docker Compose Completo (MySQL 8 + Spring Boot 3 + Nginx Frontend)"
echo "  2) Frontend Ligero con Mock Autonomo (Recomendado si NO hay Docker ni MySQL)"
echo "  3) Frontend Vite conectado a API Backend en localhost:8080"
echo "  4) Detener contenedores Docker (docker compose down)"
echo "  5) Salir"
echo ""
read -p "Selecciona una opcion [1-5]: " OPTION

case $OPTION in
  1)
    echo ""
    echo "--> Levantando plataforma completa con Docker Compose..."
    if [ "$HAS_DOCKER" = false ]; then
      echo "Error: Docker no se encuentra instalado o este usuario no tiene permisos."
      echo "Prueba con 'sudo ./run-presentation.sh' o usa la Opcion 2 (Modo Ligero)."
      exit 1
    fi
    docker compose up -d --build
    echo ""
    echo "================================================================="
    echo "  SISTEMA EN LINEA EXITOSAMENTE                                  "
    echo "================================================================="
    echo "  - Frontend Web:          http://localhost"
    echo "  - Backend API:           http://localhost:8080/api/v1"
    echo "  - Documentacion Swagger: http://localhost:8080/swagger-ui.html"
    echo "  - Credenciales demo:     password123"
    echo "================================================================="
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "http://localhost" >/dev/null 2>&1 || true
    fi
    ;;
  2)
    echo ""
    echo "--> Iniciando Frontend en modo autonomo con Mock..."
    if [ "$HAS_NODE" = false ]; then
      echo "Error: Node.js y NPM son requeridos para esta opcion."
      exit 1
    fi
    cd frontend
    if [ ! -d "node_modules" ]; then
      echo "Instalando dependencias de Node..."
      npm install
    fi
    echo ""
    echo "Iniciando servidor en http://localhost:5173..."
    npm run dev:mock
    ;;
  3)
    echo ""
    echo "--> Iniciando Frontend conectado a backend..."
    if [ "$HAS_NODE" = false ]; then
      echo "Error: Node.js y NPM son requeridos."
      exit 1
    fi
    cd frontend
    if [ ! -d "node_modules" ]; then
      echo "Instalando dependencias de Node..."
      npm install
    fi
    echo "Iniciando servidor Vite..."
    npm run dev
    ;;
  4)
    echo ""
    echo "--> Deteniendo contenedores Docker..."
    docker compose down
    echo "Contenedores detenidos correctamente."
    ;;
  5)
    echo "Saliendo."
    exit 0
    ;;
  *)
    echo "Opcion no valida."
    exit 1
    ;;
esac
