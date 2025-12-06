/**
 * Endpoint: GET /api/clips
 * Obtener feed de clips con búsqueda y ordenamiento
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';
import { MOCK_CLIPS } from '@/lib/mockData';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '20', q, sortBy = 'newest' } = req.query;
    const pageLimit = Math.min(parseInt(limit as string) || 20, 100);

    // Use mock data
    let clips = [...MOCK_CLIPS];

    // Búsqueda de texto
    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      clips = clips.filter(
        clip =>
          clip.title.toLowerCase().includes(query) ||
          clip.description.toLowerCase().includes(query)
      );
    }

    // Ordenar
    if (sortBy === 'popular') {
      clips.sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sortBy === 'trending') {
      clips.sort((a, b) => {
        const bScore = b.viewsCount + (b._count?.likes || 0) * 10;
        const aScore = a.viewsCount + (a._count?.likes || 0) * 10;
        return bScore - aScore;
      });
    } else {
      clips.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const paginated = clips.slice(0, pageLimit);
    const hasMore = clips.length > pageLimit;

    logger.info({
      msg: 'Clips fetched',
      count: paginated.length,
    });

    return res.status(200).json({
      clips: paginated,
      hasMore,
    });
  } catch (error) {
    logger.error({
      msg: 'Get clips error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}
