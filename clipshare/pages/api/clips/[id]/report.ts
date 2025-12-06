/**
 * Endpoint: POST /api/clips/:id/report
 * Reportar un clip como contenido inapropiado
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { CreateReportSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const prisma = new PrismaClient();

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const userId = req.userId!;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Clip ID required' });
    }

    // Validar input
    const { reason, description } = CreateReportSchema.parse(req.body);

    // Verificar que clip existe
    const clip = await prisma.clip.findUnique({
      where: { id },
    });

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    // Verificar que usuario no sea el owner
    if (clip.userId === userId) {
      return res.status(400).json({ error: 'Cannot report your own clip' });
    }

    // Verificar que no ya ha reportado
    const existingReport = await prisma.report.findFirst({
      where: {
        clipId: id,
        userId,
      },
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this clip' });
    }

    // Crear reporte
    const report = await prisma.report.create({
      data: {
        clipId: id,
        userId,
        reason,
        description,
        status: 'PENDING',
      },
    });

    logger.info({
      msg: 'Clip reported',
      reportId: report.id,
      clipId: id,
      userId,
      reason,
    });

    return res.status(201).json({
      message: 'Clip reported successfully',
      reportId: report.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error({
      msg: 'Report clip error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

export default requireAuth(handler);
