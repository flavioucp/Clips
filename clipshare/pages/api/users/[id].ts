/**
 * Endpoint: GET /api/users/:id
 * Obtener información pública de usuario
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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            clips: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info({
      msg: 'User profile fetched',
      userId: id,
    });

    return res.status(200).json({
      user,
    });
  } catch (error) {
    logger.error({
      msg: 'Get user error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
