# ClipShare Project Structure

```
clipshare/
├── apps/
│   └── web/                          # Aplicación Next.js principal
│       ├── pages/
│       │   ├── api/                  # Endpoints API
│       │   │   ├── auth/            # Autenticación
│       │   │   ├── clips/           # Gestión de clips
│       │   │   ├── comments/        # Sistema de comentarios
│       │   │   ├── users/           # Perfiles de usuario
│       │   │   ├── health.ts        # Health check
│       │   │   └── ...
│       │   ├── auth/                # Páginas de autenticación
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   └── ...
│       │   ├── clip/                # Detalle de clip
│       │   │   └── [id].tsx
│       │   ├── dashboard.tsx        # Panel del usuario
│       │   ├── upload.tsx           # Subida de clips
│       │   ├── index.tsx            # Home
│       │   ├── _app.tsx             # Wrapper global
│       │   └── _document.tsx        # HTML document
│       ├── components/              # Componentes React reutilizables
│       ├── lib/                     # Librerías y utilidades
│       │   ├── auth/               # JWT, passwords
│       │   ├── storage/            # S3 integration
│       │   ├── video/              # FFmpeg utilities
│       │   ├── security/           # Rate limiting, sanitization
│       │   ├── validation.ts       # Zod schemas
│       │   ├── logger.ts           # Logging
│       │   ├── middleware.ts       # Auth middleware
│       │   └── ...
│       ├── hooks/                 # Custom React hooks
│       │   └── useAuth.ts
│       ├── types/                 # TypeScript types
│       ├── styles/                # CSS global
│       │   └── globals.css
│       ├── public/                # Assets estáticos
│       │   ├── locales/           # Archivos i18n
│       │   ├── robots.txt
│       │   └── ...
│       ├── __tests__/             # Tests
│       └── ...
├── prisma/
│   ├── schema.prisma              # Modelo de datos
│   ├── migrations/                # Migraciones de BD
│   └── seed.ts/seed.js            # Script de datos iniciales
├── docker/
│   └── docker-compose.yml         # Servicios containerizados
│   └── docker-compose.prod.yml    # Configuración de producción
├── scripts/
│   ├── seed.js                    # Poblar BD
│   ├── install.sh                 # Instalación rápida
│   ├── generate-sitemap.js        # SEO sitemap
│   └── ...
├── nginx.conf                     # Configuración Nginx
├── Dockerfile                     # Build image
├── .env.example                   # Variables de entorno de ejemplo
├── .eslintrc.json                # ESLint config
├── .gitignore
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── jest.config.js                # Jest config
├── package.json                  # Dependencias
├── README.md                     # Documentación principal
├── DEPLOYMENT.md                 # Guía de despliegue
├── TERMS.md                      # Términos de servicio
├── PRIVACY.md                    # Política de privacidad
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD
└── ...
```

## Guía Rápida

### Instalación Local

```bash
# 1. Clonar repo
git clone <repo>
cd clipshare

# 2. Instalar dependencias
npm install

# 3. Configurar variables
cp .env.example .env.local

# 4. Ejecutar con Docker
docker-compose up --build

# 5. Migraciones y seed
docker-compose exec web npm run migrate
docker-compose exec web npm run seed

# 6. Acceder
http://localhost:3000
```

### Scripts npm Disponibles

```bash
npm run dev              # Desarrollo local
npm run build            # Build para producción
npm run start            # Iniciar servidor
npm run migrate          # Migraciones Prisma (dev)
npm run migrate:deploy   # Migraciones (prod)
npm run seed             # Poblar BD con datos demo
npm run lint             # ESLint
npm run type-check       # TypeScript check
npm run test             # Jest tests
npm run test:watch       # Tests watch mode
npm run test:coverage    # Coverage report
npm run prisma:studio    # Prisma Studio GUI
```

### Variables de Entorno Críticas

```env
DATABASE_URL              # PostgreSQL connection
JWT_SECRET               # Access token secret (min 32 chars)
JWT_REFRESH_SECRET       # Refresh token secret
AWS_S3_BUCKET            # S3 bucket name
AWS_ACCESS_KEY_ID        # AWS credentials
AWS_SECRET_ACCESS_KEY    # AWS credentials
SENDGRID_API_KEY         # Email service
MAX_FILE_SIZE_MB         # Upload limit
```

### Endpoints Principales

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/clips/upload` - Subir clip
- `GET /api/clips/list` - Obtener clips (paginado)
- `GET /api/clips/detail?id=...` - Detalles de clip
- `POST /api/clips/:id/like` - Like/Unlike
- `POST /api/comments/create` - Crear comentario
- `GET /api/comments/list?clipId=...` - Obtener comentarios
- `GET /api/users/profile?id=...` - Perfil de usuario
- `GET /api/users/clips?id=...` - Clips del usuario
- `GET /api/health` - Health check

## Características Implementadas

✅ Autenticación JWT con HTTP-only cookies
✅ Subida de videos/GIFs con validación
✅ Generación de thumbnails (FFmpeg)
✅ S3 integration para almacenamiento
✅ Búsqueda y filtrado de clips
✅ Sistema de comentarios (2 niveles)
✅ Likes y contador de vistas
✅ Reportes de contenido
✅ Rate limiting y protección DDOS
✅ Sanitización XSS
✅ Database seeds
✅ Docker + Docker Compose
✅ Tests básicos
✅ GitHub Actions CI/CD
✅ SEO (meta tags, sitemap, robots.txt)
✅ Responsive design
✅ i18n (EN/ES)
✅ Logging estructurado
✅ Health check endpoint

## Seguridad

✅ Contraseñas hasheadas (bcrypt, 12 rounds)
✅ JWT con expiración
✅ Account lockout tras failed attempts
✅ Rate limiting configurado
✅ CORS restrictivo
✅ Helmet headers
✅ CSP básico
✅ HTTPS (con Nginx)
✅ HSTS
✅ Validación server-side (Zod)
✅ Input sanitization
✅ CSRF protection
✅ SQL injection prevention (Prisma)

## Próximos Pasos (Opcionales)

- [ ] Admin dashboard para moderación
- [ ] Búsqueda full-text avanzada
- [ ] Sistema de notificaciones
- [ ] Transcodificación de video en background
- [ ] Cache con Redis
- [ ] Analíticas detalladas
- [ ] Sistema de recomendaciones
- [ ] Streaming adaptativo (HLS)
- [ ] Integración con redes sociales
- [ ] Webhook system para eventos

## Soporte

- Documentación: Ver README.md principal
- Issues: GitHub issues
- Email: support@clipshare.com

---

**Happy Clipping! 🎬**
