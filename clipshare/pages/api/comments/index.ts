/**
 * Endpoint: POST /api/comments
 * Crear comentario en un clip
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { CreateCommentSchema } from '@/lib/validation';
import { checkForbiddenWords } from '@/lib/security';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return createComment(req, res);
  } else if (req.method === 'GET') {
    return getComments(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function createComment(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const userId = req.userId!;

    // Validar input
    const { clipId, content, parentId } = CreateCommentSchema.parse(req.body);

    // Verificar clip existe
    const clip = await prisma.clip.findUnique({
      where: { id: clipId },
    });

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Moderación: verificar palabras prohibidas
    if (checkForbiddenWords(content)) {
      logger.warn({
        msg: 'Forbidden words detected in comment',
        userId,
      });
      return res.status(400).json({ error: 'Comment contains inappropriate content' });
    }

    // Si es respuesta, verificar que parent existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.clipId !== clipId) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }

      // No permitir respuestas a respuestas (max 2 niveles)
      if (parentComment.parentId) {
        return res.status(400).json({
          error: 'Cannot reply to a reply',
        });
      }
    }

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        clipId,
        userId,
        content,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    logger.info({
      msg: 'Comment created',
      commentId: comment.id,
      clipId,
      userId,
    });

    return res.status(201).json({
      message: 'Comment created',
      comment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error({
      msg: 'Create comment error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getComments(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { clipId, limit = 20 } = req.query;

    if (!clipId || typeof clipId !== 'string') {
      return res.status(400).json({ error: 'Clip ID required' });
    }

    // Obtener comentarios de nivel superior (no respuestas)
    const comments = await prisma.comment.findMany({
      where: {
        clipId,
        parentId: null,
      },
      take: parseInt(limit as string) || 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        // Incluir respuestas (hasta 2 niveles)
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 5, // Limitar respuestas mostradas
        },
      },
    });

    logger.info({
      msg: 'Comments fetched',
      clipId,
      count: comments.length,
    });

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    logger.error({
      msg: 'Get comments error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);
