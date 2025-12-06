/**
 * Endpoint: GET /api/comments?clipId=...
 * Obtener comentarios de un clip
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
    const { clipId, limit = '20', cursor } = req.query;

    if (!clipId || typeof clipId !== 'string') {
      return res.status(400).json({ error: 'Clip ID required' });
    }

    const pageLimit = Math.min(parseInt(limit as string) || 20, 100);
    const cursorObj = cursor ? { id: cursor as string } : undefined;

    // Obtener comentarios (solo top-level)
    const comments = await prisma.comment.findMany({
      where: {
        clipId,
        parentId: null,
      },
      orderBy: { createdAt: 'desc' },
      take: pageLimit + 1,
      ...(cursorObj && { skip: 1, cursor: cursorObj }),
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    let hasMore = false;
    if (comments.length > pageLimit) {
      hasMore = true;
      comments.pop();
    }

    const nextCursor = comments.length > 0 ? comments[comments.length - 1].id : null;

    logger.info({
      msg: 'Comments fetched',
      clipId,
      count: comments.length,
    });

    return res.status(200).json({
      comments,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    logger.error({
      msg: 'Get comments error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
