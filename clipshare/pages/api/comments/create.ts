/**
 * Endpoint: POST /api/comments
 * Crear comentario en un clip
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { CreateCommentSchema, checkForbiddenWords } from '@/lib/validation';
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

    // Validar body
    const { clipId, content, parentId } = CreateCommentSchema.parse(req.body);

    // Verificar que el clip existe
    const clip = await prisma.clip.findUnique({
      where: { id: clipId },
    });

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Verificar contenido prohibido
    if (checkForbiddenWords(content)) {
      logger.warn({
        msg: 'Forbidden words detected in comment',
        userId: decoded.userId,
      });
      return res.status(400).json({
        error: 'Comment contains inappropriate words',
      });
    }

    // Si es respuesta, validar que el comentario padre existe y es del mismo clip
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.clipId !== clipId) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }

      // Validar que no sea respuesta a respuesta (máximo 2 niveles)
      if (parentComment.parentId) {
        return res.status(400).json({
          error: 'Cannot reply to a reply (max 2 levels)',
        });
      }
    }

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        clipId,
        userId: decoded.userId,
        content,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    logger.info({
      msg: 'Comment created',
      commentId: comment.id,
      clipId,
      userId: decoded.userId,
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
      msg: 'Comment error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
