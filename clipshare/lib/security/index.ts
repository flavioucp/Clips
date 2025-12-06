/**
 * Middlewares y utilidades de seguridad
 * Incluye: rate limiting, CORS, input sanitization, helmet
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

/**
 * Middleware Helmet para headers de seguridad
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        mediaSrc: ["'self'", 'https:', 'blob:'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 63072000, // 2 años
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
}

/**
 * Rate limiter para login
 */
export const loginLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || '900000'), // 15 min
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5'),
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later',
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Rate limiter para upload
 */
export const uploadLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS || '3600000'), // 1 hora
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || '10'),
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many uploads, please try again later',
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Rate limiter general para API
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || '60000'), // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_API_MAX || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Sanitizar strings para prevenir XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizar objeto recursivamente
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = sanitizeObject(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

/**
 * CORS configuración
 */
export function corsConfig() {
  const allowedOrigins = (
    process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000'
  ).split(',');

  return (req: NextApiRequest, res: NextApiResponse) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,OPTIONS,PATCH,DELETE,POST,PUT'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );
    }

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return true;
    }

    return false;
  };
}

/**
 * Validar MIME type de archivo
 */
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'image/gif'];

export function isValidVideoMimeType(mimeType: string): boolean {
  return ALLOWED_VIDEO_TYPES.includes(mimeType);
}

/**
 * Validar tamaño de archivo
 */
export function isValidFileSize(sizeBytes: number): boolean {
  const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '200');
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeBytes <= maxSizeBytes;
}

/**
 * Lista de palabras prohibidas (para moderación simple)
 */
const FORBIDDEN_WORDS = [
  'badword1',
  'badword2',
  'offensive',
  // Expandir según política de comunidad
];

export function checkForbiddenWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return FORBIDDEN_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
}

/**
 * Anti-fraud: verificar si usuario ya vio clip desde IP
 */
export function hasUserViewedFromIp(
  viewIps: string[],
  userIp: string,
  minutesWindow: number = 10
): boolean {
  // Aquí iría lógica más compleja con timestamps
  // Por ahora, simple verificación de IP
  return viewIps.includes(userIp);
}

/**
 * Account lockout tras intentos fallidos
 */
export function isAccountLocked(
  accountLockedUntil: Date | null | undefined
): boolean {
  if (!accountLockedUntil) return false;
  return new Date() < accountLockedUntil;
}

export function calculateLockoutUntil(attempts: number): Date {
  // Exponential backoff: 5min, 15min, 1hora, etc.
  const baseMinutes = 5;
  const lockoutMinutes = baseMinutes * Math.pow(2, Math.max(0, attempts - 5));
  const until = new Date();
  until.setMinutes(until.getMinutes() + lockoutMinutes);
  return until;
}
