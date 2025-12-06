/**
 * Endpoint: GET /api/clips/[id]
 * Obtener detalles de un clip + comentarios
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid clip ID' });
      }

      // Obtener clip
      const clip = await prisma.clip.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true, bio: true },
          },
          tags: {
            include: { tag: true },
          },
          comments: {
            where: { parentId: null }, // Solo comentarios top-level
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
              },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { comments: true, likes: true },
          },
        },
      });

      if (!clip) {
        return res.status(404).json({ error: 'Clip not found' });
      }

      // Incrementar contador de vistas (anti-fraud simple)
      const clientIp = (req.headers['x-forwarded-for'] as string) || 
                       (req.socket?.remoteAddress) || 
                       'unknown';
      
      // Si la IP no está en la lista, incrementar vistas
      if (!clip.viewIpAddresses.includes(clientIp)) {
        await prisma.clip.update({
          where: { id },
          data: {
            viewsCount: { increment: 1 },
            viewIpAddresses: {
              push: clientIp,
            },
          },
        });
      }

      logger.info({
        msg: 'Clip viewed',
        clipId: id,
        ip: clientIp,
      });

      return res.status(200).json({
        clip: {
          id: clip.id,
          title: clip.title,
          description: clip.description,
          fileUrl: clip.fileUrl,
          thumbnailUrl: clip.thumbnailUrl,
          duration: clip.duration,
          fileSize: clip.fileSize,
          privacy: clip.privacy,
          viewsCount: clip.viewsCount,
          createdAt: clip.createdAt,
          updatedAt: clip.updatedAt,
          user: clip.user,
          tags: clip.tags.map((ct) => ct.tag.name),
          comments: clip.comments,
          _count: clip._count,
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
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
