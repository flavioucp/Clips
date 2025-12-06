/**
 * Endpoint: DELETE /api/comments/[id]
 * Eliminar comentario (solo el autor o admin)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { logger } from '@/lib/logger';
import { parse } from 'cookie';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Verificar autenticación
    const cookies = parse(req.headers.cookie || '');
    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Obtener comentario
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Verificar permisos (autor o admin)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (comment.userId !== decoded.userId && user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Eliminar comentario (y sus respuestas)
    await prisma.comment.deleteMany({
      where: {
        OR: [{ id }, { parentId: id }],
      },
    });

    logger.info({
      msg: 'Comment deleted',
      commentId: id,
      userId: decoded.userId,
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
