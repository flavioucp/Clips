/**
 * Endpoint: POST /api/auth/refresh
 * Refrescar access token usando refresh token
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken, generateAccessToken, serializeTokenCookie } from '@/lib/auth/jwt';
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
    // Obtener refresh token de cookies
    const cookies = parse(req.headers.cookie || '');
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      logger.warn({ msg: 'Refresh: No refresh token provided' });
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verificar token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      logger.warn({ msg: 'Refresh: Invalid refresh token' });
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Verificar en BD que token no esté revocado
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      logger.warn({ msg: 'Refresh: Token revoked or not found', userId: decoded.userId });
      return res.status(401).json({ error: 'Refresh token invalid' });
    }

    if (new Date() > tokenRecord.expiresAt) {
      logger.warn({ msg: 'Refresh: Token expired', userId: decoded.userId });
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      logger.warn({ msg: 'Refresh: User not found', userId: decoded.userId });
      return res.status(401).json({ error: 'User not found' });
    }

    // Generar nuevo access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);

    // Setear nueva cookie
    res.setHeader(
      'Set-Cookie',
      serializeTokenCookie('accessToken', newAccessToken, 900)
    );

    logger.info({ msg: 'Token refreshed', userId: user.id });

    return res.status(200).json({
      message: 'Token refreshed',
      accessToken: newAccessToken,
    });
  } catch (error) {
    logger.error({
      msg: 'Refresh error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
