/**
 * Endpoint: GET /api/users/:id/clips
 * Obtener clips de un usuario
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
    const { limit = 20, cursor } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Verificar que usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Obtener clips del usuario (solo públicos)
    const clips = await prisma.clip.findMany({
      where: {
        userId: id,
        privacy: 'PUBLIC',
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string) || 20,
      cursor: cursor ? { id: cursor as string } : undefined,
      skip: cursor ? 1 : 0,
      include: {
        tags: {
          include: { tag: true },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    logger.info({
      msg: 'User clips fetched',
      userId: id,
      count: clips.length,
    });

    return res.status(200).json({
      clips,
      userId: id,
    });
  } catch (error) {
    logger.error({
      msg: 'Get user clips error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
