/**
 * Endpoint: GET /api/clips/:id
 * Obtener detalle de un clip específico
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
      return res.status(400).json({ error: 'Clip ID required' });
    }

    // Obtener clip
    const clip = await prisma.clip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            email: true,
            bio: true,
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

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Verificar permiso (si es privado)
    if (clip.privacy === 'PRIVATE') {
      // Aquí verificar si usuario actual es owner
      // Por ahora solo mostrar publicos
      return res.status(403).json({ error: 'Access denied' });
    }

    // Incrementar contador de vistas (anti-fraud)
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ipStr = Array.isArray(userIp) ? userIp[0] : userIp;

    const viewIps = clip.viewIpAddresses as string[];
    if (!viewIps.includes(ipStr)) {
      await prisma.clip.update({
        where: { id },
        data: {
          viewsCount: clip.viewsCount + 1,
          viewIpAddresses: [...viewIps, ipStr],
        },
      });
    }

    logger.info({
      msg: 'Clip viewed',
      clipId: id,
      ip: ipStr,
    });

    return res.status(200).json({
      clip: {
        ...clip,
        tags: clip.tags.map((ct) => ct.tag),
      },
    });
  } catch (error) {
    logger.error({
      msg: 'Get clip error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
