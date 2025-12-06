# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript types are correct: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`
- [ ] Tests pass: `npm run test`
- [ ] No console errors in build: `npm run build`
- [ ] Build succeeds without warnings

### Security Review
- [ ] Changed JWT secrets to 32+ character random strings
- [ ] Set strong database password (32+ chars with special characters)
- [ ] S3 credentials are secure and rotated
- [ ] CORS whitelist includes only trusted domains
- [ ] Rate limiting thresholds are appropriate
- [ ] Email verification enabled (confirm SMTP settings)
- [ ] Admin email configured for alerts
- [ ] Security headers verified in `nginx.conf`
- [ ] HTTPS/SSL certificate obtained

### Database
- [ ] PostgreSQL credentials are strong
- [ ] Database backups configured
- [ ] Migrations tested locally
- [ ] Database indexes verified for performance
- [ ] Connection pooling configured for production
- [ ] Backup restoration tested

### Storage (S3/Minio)
- [ ] AWS S3 bucket created or Minio server running
- [ ] Bucket policies configured (public read, authenticated write)
- [ ] Lifecycle policies set (auto-delete old files)
- [ ] Encryption enabled (AES256)
- [ ] Credentials rotated
- [ ] Backup strategy in place

### Environment Variables
- [ ] All `.env.example` variables have values in `.env.production`
- [ ] No secrets committed to git
- [ ] Variables reviewed for typos
- [ ] Production URLs correct (domain, API endpoints)

```env
# Required Variables
DATABASE_URL=postgresql://user:pass@host:5432/clipshare
JWT_SECRET=<32+ chars random string>
JWT_REFRESH_SECRET=<32+ chars random string>
NEXTAUTH_SECRET=<32+ chars random string>
AWS_ACCESS_KEY_ID=<S3 credentials>
AWS_SECRET_ACCESS_KEY=<S3 credentials>
AWS_S3_BUCKET=clipshare-production
AWS_S3_REGION=us-east-1
NEXT_PUBLIC_API_URL=https://yourdomain.com
EMAIL_SERVICE=<sendgrid|mailgun|smtp>
EMAIL_FROM=noreply@yourdomain.com
```

## Deployment Method: Docker on VPS

### Server Setup
- [ ] VPS provisioned (2GB RAM minimum, 20GB storage)
- [ ] Ubuntu 22.04 or similar
- [ ] Docker installed: `apt-get install docker.io docker-compose`
- [ ] Docker daemon running: `systemctl start docker`
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Firewall configured (ports 80, 443 open)
- [ ] SSH key configured for git access

### Docker Deployment
```bash
# 1. Clone repository
git clone <repo-url> /opt/clipshare
cd /opt/clipshare

# 2. Configure environment
cp .env.example .env.production
# Edit .env.production with production values

# 3. Build production image
docker-compose -f docker-compose.prod.yml build

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Run migrations
docker-compose -f docker-compose.prod.yml exec web npm run migrate

# 6. Seed initial data (optional)
docker-compose -f docker-compose.prod.yml exec web npm run seed

# 7. Verify health
curl http://localhost:3000/api/health
```

### Reverse Proxy (Nginx)
- [ ] SSL certificate installed in `/etc/nginx/ssl/`
- [ ] nginx.conf updated with your domain
- [ ] Nginx restarted: `systemctl restart nginx`
- [ ] SSL verification: `curl https://yourdomain.com`
- [ ] HTTP redirects to HTTPS

```bash
# Install Nginx
apt-get install nginx

# Test configuration
nginx -t

# Restart
systemctl restart nginx

# Enable on boot
systemctl enable nginx
```

### Monitoring & Maintenance
- [ ] Health check endpoint responds: `curl /api/health`
- [ ] Log aggregation configured (check container logs)
- [ ] Backup cron jobs scheduled
  ```bash
  # Daily database backup at 2 AM
  0 2 * * * docker-compose -f /opt/clipshare/docker-compose.prod.yml exec -T postgres pg_dump -U postgres clipshare > /backups/db_$(date +\%Y\%m\%d).sql
  ```
- [ ] Monitoring alerts configured (CPU, disk, memory)
- [ ] SSL renewal automated (certbot)

## Deployment Method: Vercel (Easiest)

### Setup
- [ ] Repository pushed to GitHub
- [ ] Vercel account created
- [ ] GitHub integration connected
- [ ] PostgreSQL database provisioned (e.g., Railway, Supabase, or self-hosted)

### Environment Variables in Vercel
```
DATABASE_URL=postgresql://...
JWT_SECRET=<random 32+ chars>
JWT_REFRESH_SECRET=<random 32+ chars>
NEXTAUTH_SECRET=<random 32+ chars>
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_S3_REGION=...
NEXT_PUBLIC_API_URL=https://yourdomain.vercel.app
```

### Deployment
```bash
# 1. Push to GitHub
git push origin main

# 2. Vercel auto-deploys or manually deploy:
vercel --prod

# 3. Set custom domain in Vercel dashboard

# 4. Run migrations
vercel env pull
npm run migrate
```

## Post-Deployment

### Verification
- [ ] Homepage loads: `https://yourdomain.com`
- [ ] Register form works
- [ ] Login with demo user works
- [ ] Upload form accessible
- [ ] API endpoints respond
- [ ] Comments work
- [ ] Likes work
- [ ] Search works
- [ ] Database queries execute
- [ ] S3 storage working (file uploads succeed)

### Testing in Production
```bash
# Test health
curl https://yourdomain.com/api/health

# Test registration
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "TestPass123!"
  }'

# Test login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Monitoring
- [ ] Application logs being collected
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled (New Relic, Datadog)
- [ ] Uptime monitoring configured (Pingdom, UptimeRobot)
- [ ] Database query logs accessible
- [ ] User analytics being tracked (Google Analytics, Mixpanel)

### Backup Verification
- [ ] Daily database backups running
- [ ] Test restore of recent backup
- [ ] S3 backups/versioning enabled
- [ ] Backup retention policy set

## Performance Optimization

### CDN
- [ ] CloudFlare or similar CDN configured
- [ ] Static assets served via CDN
- [ ] Caching headers optimized
- [ ] Compression enabled (gzip/brotli)

### Database
- [ ] Indexes verified: `EXPLAIN ANALYZE` on slow queries
- [ ] Connection pooling configured
- [ ] Query logging enabled for debugging
- [ ] Database size monitored

### Frontend
- [ ] Image optimization verified (next/image)
- [ ] Code splitting working
- [ ] Lazy loading for clips
- [ ] Bundle size analyzed

### Server
- [ ] Memory usage under 70%
- [ ] CPU usage average under 50%
- [ ] Disk space monitoring alert set

## Security Hardening

### Application
- [ ] Rate limiting verified
- [ ] Forbidden words filter updated for your region
- [ ] CSP headers tested
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified (Prisma)
- [ ] XSS protection verified (sanitization)

### Infrastructure
- [ ] DDoS protection enabled (Cloudflare)
- [ ] WAF rules configured
- [ ] SSH key-based auth only
- [ ] Fail2ban or similar configured
- [ ] SSH port changed from 22
- [ ] Firewall rules reviewed

### Data
- [ ] Encryption at rest enabled (database, S3)
- [ ] Encryption in transit enabled (HTTPS)
- [ ] Sensitive data not logged
- [ ] GDPR compliance reviewed
- [ ] Data retention policy set

## Scale Planning

### High Traffic (>10,000 concurrent users)
- [ ] Database replicas configured
- [ ] Read replicas for reports/analytics
- [ ] Caching layer (Redis) enabled
- [ ] CDN bandwidth optimized
- [ ] Load balancing configured
- [ ] Horizontal scaling tested

### Storage
- [ ] S3 bucket versioning enabled
- [ ] Lifecycle policies configured
- [ ] Transfer acceleration enabled if needed
- [ ] Cross-region replication for backup

## Documentation
- [ ] Deployment procedures documented
- [ ] Runbook created for common issues
- [ ] On-call guide prepared
- [ ] Team access and permissions documented
- [ ] Emergency contact list maintained

## Post-Launch Monitoring (First 24 hours)
- [ ] Check error logs every hour
- [ ] Monitor CPU/memory/disk usage
- [ ] Verify backups are running
- [ ] Monitor user registrations
- [ ] Check email verification flow
- [ ] Test all key features manually
- [ ] Monitor database query times
- [ ] Check S3 upload/download times
- [ ] Verify SSL certificate validity
- [ ] Check security header configuration

---

## Common Issues & Solutions

### Database Connection Timeout
```bash
# Check PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT 1;"
```

### S3 Upload Fails
```bash
# Verify credentials in .env
# Test S3 connection
npm run test:s3

# Check bucket permissions
aws s3 ls s3://clipshare-production
```

### Out of Memory
```bash
# Increase container memory
# In docker-compose.yml, add:
services:
  web:
    deploy:
      resources:
        limits:
          memory: 2G
```

### SSL Certificate Issues
```bash
# Verify certificate
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Renew certificate
certbot renew

# Check Nginx SSL config
nginx -t
```

---

## Rollback Procedure

If issues occur:

```bash
# 1. Identify the bad version
git log --oneline | head -5

# 2. Revert to previous version
git revert HEAD
git push origin main

# 3. Vercel auto-deploys new version

# Or manually:
docker-compose pull
docker-compose up -d
docker-compose exec web npm run migrate
```

---

**Deployment Status: Ready for Production** ✅

After completing this checklist, your ClipShare application will be production-ready with proper security, monitoring, and scale considerations.
