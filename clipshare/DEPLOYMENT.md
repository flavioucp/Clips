# Guía de Despliegue en Producción

## ClipShare Production Deployment Guide

### 1. Requisitos Previos

- Dominio propio
- Certificado SSL/TLS
- Base de datos PostgreSQL gestionada (AWS RDS, Supabase, etc.)
- Bucket S3 en AWS
- Servicio de email (SendGrid recomendado)
- Opción A: Vercel para hosting
- Opción B: Servidor VPS (DigitalOcean, AWS EC2, Linode)

### 2. Despliegue en Vercel (Recomendado)

#### Paso 1: Preparar Repositorio

```bash
# Crear repositorio en GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/clipshare.git
git push -u origin main
```

#### Paso 2: Conectar a Vercel

1. Visita https://vercel.com
2. Click "Import Project"
3. Conectar GitHub
4. Seleccionar repositorio `clipshare`
5. Vercel detectará Next.js automáticamente

#### Paso 3: Configurar Secrets

En Vercel Dashboard → Settings → Environment Variables

```
# Database
DATABASE_URL=postgresql://user:pass@host:5432/clipshare

# JWT
JWT_SECRET=<generate-secure-random-32-chars>
JWT_REFRESH_SECRET=<generate-secure-random-32-chars>

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_S3_BUCKET=clipshare-prod
AWS_S3_URL=https://clipshare-prod.s3.amazonaws.com

# Email
SENDGRID_API_KEY=<your-sendgrid-key>
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Security
NEXTAUTH_SECRET=<generate-secure-random>
MAX_FILE_SIZE_MB=200

# Performance
REDIS_URL=redis://host:port
```

#### Paso 4: Database Migration

```bash
# En tu máquina local
npx prisma migrate deploy --preview-feature

# O configurar webhook en Vercel para automático
```

#### Paso 5: Custom Domain

1. Ir a Vercel → Domains
2. Agregar tu dominio
3. Configurar DNS records según Vercel
4. Auto SSL

### 3. Despliegue en Docker (DigitalOcean, AWS EC2)

#### Paso 1: Preparar Servidor

```bash
# SSH en servidor
ssh root@your-server-ip

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clonar repositorio
git clone https://github.com/yourusername/clipshare.git
cd clipshare
```

#### Paso 2: Configurar Producción

```bash
# Copiar env de producción
cp .env.example .env.production

# Editar con valores reales
nano .env.production
```

#### Paso 3: Crear docker-compose.prod.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: clipshare-prod
    environment:
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: always
    volumes:
      - ./public:/app/public

  postgres:
    image: postgres:15-alpine
    container_name: clipshare-db-prod
    environment:
      POSTGRES_DB: clipshare
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    restart: always

  nginx:
    image: nginx:alpine
    container_name: clipshare-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    restart: always

volumes:
  postgres_prod_data:
```

#### Paso 4: Configurar Nginx (SSL)

```bash
# Generar certificado con Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
```

#### Paso 5: Ejecutar

```bash
# Build y start con producción
docker-compose -f docker-compose.prod.yml up -d

# Ejecutar migraciones
docker-compose -f docker-compose.prod.yml exec web npm run migrate:deploy

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f web
```

### 4. Seguridad en Producción

```bash
# 1. Firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 2. Actualizar sistema
sudo apt-get update
sudo apt-get upgrade -y

# 3. Monitoreo
# Instalar Prometheus + Grafana

# 4. Backups automáticos
# Configurar snapshots en DigitalOcean o AWS
```

### 5. Monitoreo y Logs

```bash
# Sentry para error tracking
SENTRY_DSN=https://your-key@sentry.io/project-id

# Prometheus metrics
curl http://localhost:3000/api/metrics

# Health checks
curl http://localhost:3000/api/health
```

### 6. Escalabilidad

- CloudFront (CDN) para archivos S3
- Auto-scaling en Vercel (automático)
- Load balancer en Docker (con nginx)
- Database replication
- Redis para cache

### 7. Disaster Recovery

- Backups diarios BD
- Replicación S3 cross-region
- Rollback plan
- Monitoring de uptime

### 8. Checklist Pre-Producción

- [ ] Certificado SSL configurado
- [ ] Contraseñas seguras (JWT_SECRET de 32+ chars)
- [ ] Database backup habilitado
- [ ] Rate limiting testea do
- [ ] Email verificación funciona
- [ ] S3 bucket configurado y testeado
- [ ] Logs centralizados
- [ ] Monitores de error
- [ ] CDN activado
- [ ] HTTPS redirect habilitado
- [ ] CORS whitelist configurado
- [ ] Admin users creados

