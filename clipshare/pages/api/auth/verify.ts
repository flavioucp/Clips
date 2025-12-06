/**
 * Endpoint: GET /api/auth/verify?token=...
 * Verificar email con token de verificación
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Verification token required' });
    }

    // Buscar usuario con este token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiresAt: {
          gt: new Date(), // Token aún válido
        },
      },
    });

    if (!user) {
      logger.warn({ msg: 'Email verification: Invalid or expired token' });
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Marcar email como verificado
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    logger.info({ msg: 'Email verified', userId: user.id, email: user.email });

    return res.status(200).json({
      message: 'Email verified successfully',
      email: user.email,
    });
  } catch (error) {
    logger.error({
      msg: 'Email verification error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
