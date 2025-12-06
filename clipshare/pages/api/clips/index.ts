/**
 * Endpoint: GET /api/clips
 * Obtener feed de clips con búsqueda y filtrado
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { SearchClipsSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validar query params
    const params = SearchClipsSchema.parse({
      cursor: req.query.cursor,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      tag: req.query.tag,
      q: req.query.q,
      sortBy: req.query.sortBy || 'newest',
    });

    // Construir where clause
    const where: any = {
      privacy: 'PUBLIC',
    };

    // Búsqueda full-text
    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
      ];
    }

    // Filtro por tag
    if (params.tag) {
      where.tags = {
        some: {
          tag: {
            name: params.tag,
          },
        },
      };
    }

    // Orden
    const orderBy: any = {};
    if (params.sortBy === 'popular') {
      orderBy.viewsCount = 'desc';
    } else if (params.sortBy === 'trending') {
      // Trending: recientes con muchas vistas
      orderBy.createdAt = 'desc';
    } else {
      orderBy.createdAt = 'desc'; // Newest default
    }

    // Paginación cursor-based
    const clips = await prisma.clip.findMany({
      where,
      orderBy,
      take: params.limit + 1, // +1 para detectar si hay más
      cursor: params.cursor ? { id: params.cursor } : undefined,
      skip: params.cursor ? 1 : 0,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
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

    // Detectar si hay más clips
    const hasMore = clips.length > params.limit;
    const data = hasMore ? clips.slice(0, -1) : clips;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    logger.info({
      msg: 'Clips fetched',
      count: data.length,
      sortBy: params.sortBy,
    });

    return res.status(200).json({
      clips: data,
      pagination: {
        cursor: nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error({
      msg: 'Get clips error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
