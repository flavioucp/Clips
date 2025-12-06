/**
 * Endpoint: POST /api/clips/:id/like
 * Dar/quitar like a un clip
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const userId = req.userId!;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Clip ID required' });
    }

    // Verificar que clip existe
    const clip = await prisma.clip.findUnique({
      where: { id },
    });

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Verificar si ya tiene like
    const existingLike = await prisma.like.findUnique({
      where: {
        clipId_userId: {
          clipId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      // Remover like
      await prisma.like.delete({
        where: {
          clipId_userId: {
            clipId: id,
            userId,
          },
        },
      });

      logger.info({
        msg: 'Like removed',
        clipId: id,
        userId,
      });

      return res.status(200).json({
        message: 'Like removed',
        liked: false,
      });
    } else {
      // Agregar like
      await prisma.like.create({
        data: {
          clipId: id,
          userId,
        },
      });

      logger.info({
        msg: 'Like added',
        clipId: id,
        userId,
      });

      return res.status(200).json({
        message: 'Like added',
        liked: true,
      });
    }
  } catch (error) {
    logger.error({
      msg: 'Like clip error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

export default requireAuth(handler);
