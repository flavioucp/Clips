# 🚀 ClipShare - Quick Start Guide

## En 5 minutos

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar o descargar proyecto
cd clipshare

# 2. Copiar configuración
cp .env.example .env.local

# 3. Ejecutar todo
docker-compose up --build

# 4. En otra terminal
docker-compose exec web npm run migrate
docker-compose exec web npm run seed

# 5. Abrir http://localhost:3000
```

**Demo Credentials:**
- `alice@example.com` / `SecurePass123!`
- `bob@example.com` / `SecurePass123!`

### Opción 2: Local (Sin Docker)

```bash
# 1. Requisitos
# - Node.js 18+
# - PostgreSQL 14+
# - FFmpeg

# 2. Instalar
npm install

# 3. Configurar BD
createdb clipshare

# 4. Configurar .env.local
cp .env.example .env.local
# Editar DATABASE_URL, JWT_SECRET, etc.

# 5. Ejecutar migraciones
npm run migrate
npm run seed

# 6. Iniciar
npm run dev

# 7. Abrir http://localhost:3000
```

## 📁 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `.env.example` | Variables de entorno (copiar a `.env.local`) |
| `docker-compose.yml` | Servicios (app, postgres, minio, pgadmin) |
| `prisma/schema.prisma` | Modelo de datos |
| `package.json` | Dependencias y scripts |
| `README.md` | Documentación completa |
| `DEPLOYMENT.md` | Guía de producción |

## 🔧 Scripts Útiles

```bash
npm run dev              # Desarrollo
npm run build            # Build
npm run migrate          # Migraciones
npm run seed             # Datos de prueba
npm run test             # Tests
npm run lint             # Linting
```

## 🌐 URLs Disponibles

- **App**: http://localhost:3000
- **PgAdmin**: http://localhost:5050 (admin@example.com / admin)
- **Minio**: http://localhost:9001 (minioadmin / minioadmin)

## 🏗️ Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **DB**: PostgreSQL
- **Storage**: AWS S3 (o Minio local)
- **Video**: FFmpeg
- **Auth**: JWT + HTTP-only cookies
- **Otros**: Docker, Nginx, Jest, ESLint

## 🔐 Seguridad

✅ Contraseñas hasheadas (bcrypt)
✅ JWT con refresh tokens
✅ Rate limiting
✅ Input sanitization
✅ HTTPS (en producción)
✅ Account lockout
✅ Account lockout

## 📊 API Endpoints

```bash
# Auth
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Clips
POST   /api/clips/upload
GET    /api/clips/list
GET    /api/clips/detail?id=...
POST   /api/clips/:id/like
POST   /api/clips/:id/report

# Comentarios
POST   /api/comments/create
GET    /api/comments/list?clipId=...
DELETE /api/comments/:id

# Usuarios
GET    /api/users/profile?id=...
GET    /api/users/clips?id=...

# Sistema
GET    /api/health
```

## 🐛 Troubleshooting

**Error: Port 3000 already in use**
```bash
# macOS/Linux
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Error: Database connection failed**
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps
docker-compose logs postgres

# Recrear base de datos
docker-compose down -v
docker-compose up postgres
```

**Error: FFmpeg not found**
```bash
# Instalar FFmpeg
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Docker (Ya incluido)
```

## 📚 Documentación Completa

- `README.md` - Guía completa
- `DEPLOYMENT.md` - Despliegue en producción
- `PROJECT_STRUCTURE.md` - Estructura del proyecto
- `TERMS.md` - Términos de servicio
- `PRIVACY.md` - Política de privacidad

## 🚀 Despliegue en Producción

Ver `DEPLOYMENT.md` para:
- Vercel (recomendado)
- Docker en DigitalOcean/AWS
- Nginx + SSL
- Backups y monitoring

## 💡 Tips

1. **Cambiar contraseña de demo**
   - Editar `.env` y re-ejecutar `seed`

2. **Agregar dominio personalizado**
   - Actualizar `NEXT_PUBLIC_API_URL` en `.env`

3. **Habilitar escaneo antivirus**
   - Configurar ClamAV en `CLAMAV_ENABLED=true`

4. **Redis para cache**
   - Descomentar en `docker-compose.yml`
   - Configurar `REDIS_URL` en `.env`

## 🤝 Contribuir

1. Fork el repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 Licencia

MIT License - ver LICENSE file

---

**¿Necesitas ayuda?**
- Lee `README.md` para documentación completa
- Revisa `DEPLOYMENT.md` para producción
- Check GitHub issues para problemas comunes

**¡Feliz compartición de clips! 🎬**
