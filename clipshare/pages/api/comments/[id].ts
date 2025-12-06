/**
 * Endpoint: DELETE /api/comments/:id
 * Eliminar comentario (solo owner o admin)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const userId = req.userId!;
    const userRole = req.user?.role;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Comment ID required' });
    }

    // Obtener comentario
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Verificar permisos (owner o admin)
    if (comment.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Eliminar comentario (cascada eliminará respuestas)
    await prisma.comment.delete({
      where: { id },
    });

    logger.info({
      msg: 'Comment deleted',
      commentId: id,
      userId,
    });

    return res.status(200).json({
      message: 'Comment deleted',
    });
  } catch (error) {
    logger.error({
      msg: 'Delete comment error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

export default requireAuth(handler);
