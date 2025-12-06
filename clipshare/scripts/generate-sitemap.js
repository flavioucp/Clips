#!/usr/bin/env node

/**
 * Script para generar sitemap.xml dinámicamente
 * Ejecutar: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://clipshare.com';

const staticPages = [
  '',
  '/auth/login',
  '/auth/register',
  '/privacy',
  '/terms',
];

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  console.log('✅ Sitemap generado:', sitemapPath);
}

generateSitemap();
