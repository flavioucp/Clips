/**
 * Endpoint: POST /api/auth/logout
 * Cerrar sesión y revocar tokens
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { serializeLogoutCookie } from '@/lib/auth/jwt';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { logger } from '@/lib/logger';
import { parse } from 'cookie';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener tokens de cookies/headers
    const cookies = parse(req.headers.cookie || '');
    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    if (accessToken) {
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        // Revocar refresh tokens del usuario
        await prisma.refreshToken.updateMany({
          where: { userId: decoded.userId },
          data: { isRevoked: true },
        });

        logger.info({ msg: 'User logged out', userId: decoded.userId });
      }
    }

    // Limpiar cookies
    res.setHeader(
      'Set-Cookie',
      [
        serializeLogoutCookie('accessToken'),
        serializeLogoutCookie('refreshToken'),
      ]
    );

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error({
      msg: 'Logout error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
