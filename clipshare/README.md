# ClipShare

ClipShare es una plataforma moderna de compartición de clips de video y GIFs construida con Next.js, TypeScript, PostgreSQL y AWS S3.

## ⚙️ Stack Técnico

- **Frontend**: Next.js 14 + TypeScript + React 18 + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Base de datos**: PostgreSQL
- **Almacenamiento**: AWS S3 (o compatible con Minio)
- **Autenticación**: JWT en HTTP-only cookies + Refresh tokens
- **Video**: FFmpeg (para thumbnails y duración)
- **Tests**: Jest + React Testing Library + Supertest
- **DevOps**: Docker + Docker Compose

## 🚀 Quick Start con Docker

```bash
# Clonar y navegar
git clone <repo>
cd clipshare

# Copiar archivo de configuración
cp .env.example .env.local

# Ejecutar con Docker
docker-compose up --build

# En otra terminal, ejecutar migraciones y seed
docker-compose exec web npm run migrate
docker-compose exec web npm run seed
```

Accede a http://localhost:3000

## 🔧 Configuración local sin Docker

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- FFmpeg
- AWS S3 o Minio local

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Crear base de datos
createdb clipshare

# Ejecutar migraciones
npm run migrate

# Generar seed (datos demo)
npm run seed

# Ejecutar en desarrollo
npm run dev
```

Accede a http://localhost:3000

## 📋 Variables de Entorno

Ver `.env.example` para la lista completa. Variables críticas:

```env
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/clipshare

# JWT
JWT_SECRET=tu_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=clipshare-bucket
AWS_S3_URL=https://clipshare-bucket.s3.amazonaws.com

# Email (para verificación y recuperación)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@clipshare.com

# Seguridad
NEXTAUTH_SECRET=tu_secret_adicional
MAX_FILE_SIZE_MB=200
```

## 📚 API Reference

### Autenticación

**POST /api/auth/register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**POST /api/auth/login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**GET /api/auth/verify?token=...**
```bash
curl http://localhost:3000/api/auth/verify?token=TOKEN_RECIBIDO_EN_EMAIL
```

**POST /api/auth/refresh**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"
```

### Clips

**POST /api/clips/upload**
```bash
curl -X POST http://localhost:3000/api/clips/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@video.mp4" \
  -F "title=My Awesome Clip" \
  -F "description=This is awesome" \
  -F "tags=gaming,funny" \
  -F "privacy=public"
```

**GET /api/clips**
```bash
curl 'http://localhost:3000/api/clips?cursor=0&limit=20&tag=gaming&q=search'
```

**GET /api/clips/:id**
```bash
curl http://localhost:3000/api/clips/CLIP_ID
```

**POST /api/clips/:id/like**
```bash
curl -X POST http://localhost:3000/api/clips/CLIP_ID/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**POST /api/clips/:id/report**
```bash
curl -X POST http://localhost:3000/api/clips/CLIP_ID/report \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "inappropriate_content",
    "description": "Detalles del reporte"
  }'
```

### Comentarios

**POST /api/comments**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clipId": "CLIP_ID",
    "content": "Great clip!",
    "parentId": "PARENT_COMMENT_ID (opcional)"
  }'
```

**GET /api/comments?clipId=CLIP_ID**
```bash
curl 'http://localhost:3000/api/comments?clipId=CLIP_ID&limit=20'
```

**DELETE /api/comments/:id**
```bash
curl -X DELETE http://localhost:3000/api/comments/COMMENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Usuarios

**GET /api/users/:id**
```bash
curl http://localhost:3000/api/users/USER_ID
```

**GET /api/users/:id/clips**
```bash
curl 'http://localhost:3000/api/users/USER_ID/clips?limit=20'
```

**PATCH /api/users/profile**
```bash
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "bio": "My bio"
  }'
```

## 🛡️ Seguridad

### En Producción

1. **HTTPS y HSTS**
   - Fuerza HTTPS en todas las conexiones
   - Configura HSTS (HTTP Strict-Transport-Security)
   - Usar certificado SSL/TLS válido

2. **Secrets y Environment Variables**
   - Nunca commitear `.env.local`
   - Usar secrets manager (AWS Secrets Manager, Vault, etc.)
   - Rotación regular de keys

3. **Rate Limiting**
   - Configurado automáticamente en endpoints sensibles
   - Límites: login (5 intentos/15min), upload (10/hora), api general (100/min)

4. **CORS**
   - Whitelist de dominios permitidos en `lib/security/cors.ts`

5. **Content Security Policy**
   - Configurado en headers (ver `next.config.js`)

6. **Validación**
   - Todas las inputs validadas con Zod server-side
   - Sanitización XSS automática

7. **Almacenamiento de Contraseñas**
   - Bcrypt con salt rounds = 12
   - Políticas: mínimo 8 caracteres, complejidad requerida

8. **JWT**
   - Access token: 15 minutos
   - Refresh token: 7 días
   - Stored en HTTP-only, secure cookies

### Escaneo Antivirus (Opcional)

Para activar escaneo ClamAV en uploads, configurar:
```env
CLAMAV_ENABLED=true
CLAMAV_HOST=clamav
CLAMAV_PORT=3310
```

## 🚀 Despliegue

### Vercel

1. Pushear a GitHub
2. Conectar repo en Vercel
3. Configurar secrets en "Settings > Environment Variables"
4. Configurar PostgreSQL (recomendado: Supabase, AWS RDS, Neon)
5. Configurar S3 bucket en AWS
6. Deploy automático en push a `main`

```bash
# Variables necesarias en Vercel:
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
SENDGRID_API_KEY
```

### Docker (DigitalOcean, AWS EC2, etc.)

```bash
# Build image
docker build -t clipshare:latest .

# Push a Docker Hub o ECR
docker tag clipshare:latest myrepo/clipshare:latest
docker push myrepo/clipshare:latest

# Ejecutar en servidor
docker run -d \
  --name clipshare \
  -p 3000:3000 \
  --env-file .env \
  myrepo/clipshare:latest
```

Con Docker Compose en producción:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🧪 Tests

```bash
# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 📖 Documentación de Código

- **`lib/auth.ts`**: Funciones de autenticación y JWT
- **`lib/storage/s3.ts`**: Utilidades para S3
- **`lib/video.ts`**: Manejo de video con FFmpeg
- **`lib/security/`**: Middlewares de seguridad
- **`pages/api/`**: Endpoints API
- **`components/`**: Componentes React reutilizables
- **`prisma/schema.prisma`**: Modelo de datos

## 🗄️ Modelos de Base de Datos

```
User
  - id (PK)
  - email (unique)
  - name
  - password (hashed)
  - email_verified
  - avatar_url
  - bio
  - role (user|admin)
  - created_at

Clip
  - id (PK)
  - user_id (FK)
  - title
  - description
  - file_url
  - thumbnail_url
  - duration
  - size
  - privacy (public|private)
  - tags (many-to-many)
  - views_count
  - created_at

Comment
  - id (PK)
  - clip_id (FK)
  - user_id (FK)
  - content
  - parent_id (nullable, para threads)
  - created_at

Like
  - id (PK)
  - clip_id (FK)
  - user_id (FK)
  - created_at

Report
  - id (PK)
  - clip_id (FK)
  - user_id (FK)
  - reason
  - description
  - status (pending|reviewed|dismissed)
  - created_at
```

## 🌐 SEO

- Meta tags dinámicos en cada página
- Open Graph para redes sociales
- JSON-LD schema para VideoObject
- Sitemap.xml generado
- robots.txt configurado
- Server-side rendering (SSR) en páginas críticas

## 📱 Responsive

- Mobile-first design
- Tailwind CSS breakpoints
- Testeo en múltiples viewports
- Touch-friendly UI

## 🌍 Internacionalización (i18n)

Soporta EN y ES. Configuración en `next-i18next.config.js`.

```bash
# Cambiar idioma: ?locale=es o selector en UI
```

## 🐛 Troubleshooting

**Error: "ENOENT: no such file or directory, open '.env.local'"**
```bash
cp .env.example .env.local
```

**Error en migraciones Prisma**
```bash
npm run migrate:deploy
# Si hay conflictos:
npx prisma migrate resolve --rolled-back
```

**Puerto 3000 ya en uso**
```bash
# macOS/Linux
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**S3/Minio no conecta**
- Verificar credenciales en `.env.local`
- Verificar bucket existe
- Revisar security groups / firewall

## 📜 Licencia

MIT

## 👥 Soporte

Para issues, abrir en GitHub issues. Para preguntas, ver documentación de Next.js, Prisma y AWS SDK.

---

**Happy clipping! 🎬**
