/**
 * Endpoint: GET /api/auth/me
 * Obtener información del usuario autenticado
 * Con fallback a mock data en desarrollo
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';
import { MOCK_USERS } from '@/lib/mockData';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Para desarrollo: retornar el primer usuario mock
    // En producción, verificar JWT token y obtener del DB
    const user = MOCK_USERS[0];

    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    logger.info({ msg: 'User fetched', userId: user.id });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error({
      msg: 'Auth me error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}
