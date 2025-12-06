/**
 * Middleware para proteger endpoints y obtener usuario actual
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader, extractTokenFromCookies } from '@/lib/auth/jwt';
import { parse } from 'cookie';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
  user?: any;
}

/**
 * Middleware para verificar autenticación
 * Extrae userId y user del request
 */
export async function withAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  requiredRole?: string
): Promise<boolean> {
  try {
    // Obtener token de Authorization header o cookies
    let token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      const cookies = parse(req.headers.cookie || '');
      token = extractTokenFromCookies(cookies);
    }

    if (!token) {
      logger.warn({ msg: 'Auth: No token provided' });
      res.status(401).json({ error: 'Authentication required' });
      return false;
    }

    // Verificar token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      logger.warn({ msg: 'Auth: Invalid token' });
      res.status(401).json({ error: 'Invalid token' });
      return false;
    }

    // Obtener usuario de BD
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      logger.warn({ msg: 'Auth: User not found', userId: decoded.userId });
      res.status(401).json({ error: 'User not found' });
      return false;
    }

    // Verificar role si es requerido
    if (requiredRole && user.role !== requiredRole) {
      logger.warn({
        msg: 'Auth: Insufficient permissions',
        userId: user.id,
        requiredRole,
      });
      res.status(403).json({ error: 'Insufficient permissions' });
      return false;
    }

    // Guardar en request
    req.userId = user.id;
    req.user = user;

    return true;
  } catch (error) {
    logger.error({
      msg: 'Auth middleware error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({ error: 'Internal server error' });
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Higher-order function para aplicar middleware a handler
 */
export function requireAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  requiredRole?: string
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!(await withAuth(req, res, requiredRole))) {
      return;
    }
    return handler(req, res);
  };
}
