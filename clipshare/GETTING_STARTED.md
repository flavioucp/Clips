# 🚀 CÓMO EMPEZAR - 3 OPCIONES

## Opción 1: Docker (RECOMENDADO - Más fácil)

```powershell
# 1. Abre PowerShell
# 2. Ve al proyecto
cd "c:\Users\flavi\Clips\clipshare"

# 3. Inicia con Docker Compose
docker-compose up --build

# ⏳ Espera 2-3 minutos hasta ver "compiled successfully"

# 4. Abre en navegador
# http://localhost:3000

# 5. Login con credenciales demo
# Email: demo@example.com
# Password: Demo123!
```

**Servicios que se inician:**
- Next.js App (puerto 3000)
- PostgreSQL (puerto 5432)
- pgAdmin (puerto 5050)
- Minio/S3 (puerto 9000)
- Redis (puerto 6379)

---

## Opción 2: Local Development

```powershell
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Configurar database
npm run migrate

# 3. Poblar con datos demo (opcional)
npm run seed

# 4. Iniciar servidor
npm run dev

# 5. Abrir navegador
# http://localhost:3000
```

**Requisitos:**
- Node.js 18+ instalado
- PostgreSQL local corriendo
- Puertos 3000 disponible

---

## Opción 3: Build Production

```powershell
# Compilar
npm run build

# Ejecutar en producción
npm start
```

---

## 🎯 Lo Primero que Debes Hacer

### 1. Entender la estructura
```
clipshare/
├── pages/              # Páginas y API endpoints
│   ├── api/           # Todos los endpoints backend
│   ├── auth/          # Páginas de login/register
│   └── index.tsx      # Home
├── components/         # Componentes React reutilizables
├── lib/               # Utilidades (auth, storage, security)
├── prisma/            # Base de datos
├── docker-compose.yml # Configuración Docker
└── [docs]             # Documentación
```

### 2. Explorar los endpoints
Visita: `http://localhost:3000/api/health`
Deberías ver: `{"status":"ok"}`

### 3. Probar autenticación
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "Demo123!"
  }'
```

---

## 📚 Documentación Principal

| Archivo | Para Leer | Tiempo |
|---------|-----------|--------|
| **START_HERE.md** | Primero esto | 2 min |
| **QUICKSTART.md** | Setup rápido | 5 min |
| **README.md** | Documentación completa | 15 min |
| **ARCHITECTURE.md** | Entender el sistema | 10 min |
| **DEPLOYMENT.md** | Deploy a producción | 20 min |

---

## 🔧 Comandos Útiles

```powershell
# Build
npm run build

# Dev
npm run dev

# Tipo checking
npm run type-check

# Lint
npm run lint

# Tests
npm run test
npm run test:watch

# Database
npm run migrate              # Aplicar migraciones
npm run seed                 # Cargar datos demo
npm run prisma:studio       # GUI de base de datos

# Docker
docker-compose up --build    # Inicia
docker-compose down          # Detiene
docker-compose logs web      # Ver logs
```

---

## 🆘 Troubleshooting

### Puerto 3000 ya en uso
```powershell
# Encontrar proceso
Get-Process | Where-Object {$_.Ports -contains 3000}

# O cambiar puerto en .env
# NEXT_PUBLIC_PORT=3001
```

### Error de dependencias
```powershell
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
```

### PostgreSQL no conecta
```powershell
# Con Docker:
docker-compose restart postgres

# O verificar:
docker-compose logs postgres
```

### Build fallando
```powershell
npm run type-check  # Ver errores TypeScript
npm run lint        # Ver errores ESLint
```

---

## 🌟 Features Disponibles Ahora

✅ **Autenticación**
- Registrarse con email
- Login seguro
- Refresh tokens
- Logout
- Password recovery

✅ **Clips**
- Subir videos (MP4, WebM, MOV, GIF)
- Thumbnail automático
- Metadatos
- Privacidad (público/privado)

✅ **Social**
- Likes y dislikes
- Comentarios anidados (2 niveles)
- Reports de contenido
- Perfiles de usuario

✅ **Descubrimiento**
- Feed de inicio
- Búsqueda de clips
- Filtrado por tags
- Ordenamiento (nuevo, popular, tendencias)

---

## 📊 Stack Tecnológico

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT & Bcrypt

**DevOps:**
- Docker
- Docker Compose
- Nginx
- GitHub Actions

---

## 🔐 Variables de Entorno

Crear `.env.local` (ya incluye `.env.example`):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/clipshare"

# JWT
JWT_SECRET="your-secret-key-32-chars-min"
JWT_REFRESH_SECRET="your-refresh-secret-32-chars-min"

# S3 / Minio
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"
AWS_S3_BUCKET="clipshare"
AWS_S3_ENDPOINT="http://localhost:9000"

# Email (opcional)
EMAIL_SERVICE="sendgrid"
EMAIL_FROM="noreply@clipshare.com"
```

Con Docker estas variables ya están pre-configuradas.

---

## 🧪 Probar API Endpoints

### Registrarse
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!"
  }'
```

### Ver clips
```bash
curl http://localhost:3000/api/clips/list
```

### Health check
```bash
curl http://localhost:3000/api/health
```

---

## 🚀 Deploy a Producción

### Opción A: Vercel (Más fácil)
1. Push a GitHub
2. Conectar en Vercel
3. Agregar environment variables
4. Deploy automático

Ver: `DEPLOYMENT.md` → Vercel section

### Opción B: Docker en VPS
1. Provisionar VPS (DigitalOcean, Linode, AWS)
2. Instalar Docker
3. Clone repo
4. `docker-compose -f docker-compose.prod.yml up`

Ver: `DEPLOYMENT.md` → Docker section

---

## 📞 Soporte & Documentación

- **¿Cómo funciona X?** → Busca en `README.md`
- **¿Cómo despliego?** → Lee `DEPLOYMENT.md`
- **¿Cómo customizo?** → Mira `PROJECT_STRUCTURE.md`
- **¿Hay errores?** → Revisa logs con `docker-compose logs`

---

## 🎉 Next Steps

1. ✅ Inicia el proyecto (Docker)
2. ✅ Prueba login con demo
3. ✅ Sube un clip
4. ✅ Explora características
5. ✅ Personaliza (colores, textos, etc.)
6. ✅ Deploy a producción

---

**¡Listo! 🚀 ClipShare está en tus manos**

Cualquier duda, revisa la documentación o los archivos comentados en `lib/` y `pages/`.

Éxito! 🎬
