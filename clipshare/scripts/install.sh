#!/bin/bash

# Script de instalación rápida para desarrollo local

set -e

echo "🚀 ClipShare Installation Script"
echo "================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL no está instalado localmente"
    echo "   Usa Docker: docker-compose up -d postgres"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Crear archivo .env
if [ ! -f .env.local ]; then
    echo "📝 Copiando .env.example a .env.local"
    cp .env.example .env.local
    echo "⚠️  Edita .env.local con tus valores antes de continuar"
fi

# Ejecutar migraciones
echo "🗄️  Ejecutando migraciones..."
npm run migrate

# Ejecutar seed
echo "🌱 Poblando BD con datos de demostración..."
npm run seed

echo ""
echo "✨ ¡Instalación completada!"
echo ""
echo "📚 Próximos pasos:"
echo "  1. npm run dev           # Iniciar servidor de desarrollo"
echo "  2. http://localhost:3000 # Abrir en navegador"
echo ""
echo "📝 Credenciales de demostración:"
echo "  alice@example.com / SecurePass123!"
echo "  bob@example.com / SecurePass123!"
