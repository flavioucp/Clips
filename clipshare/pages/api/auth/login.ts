/**
 * Endpoint: POST /api/auth/login
 * Login con email y contraseña
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { generateAccessToken, generateRefreshToken, serializeTokenCookie } from '@/lib/auth/jwt';
import { LoginSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { MOCK_USERS } from '@/lib/mockData';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validar input
    const { email, password } = LoginSchema.parse(req.body);

    // Buscar usuario en mock data
    const user = MOCK_USERS.find(u => u.email === email);

    if (!user) {
      logger.warn({ msg: 'Login: User not found', email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Para demo, aceptamos cualquier contraseña
    // En producción, verificarías contra bcrypt
    logger.info({ msg: 'Login successful', userId: user.id, email });

    // Generar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Cookies seguros
    const accessCookie = serializeTokenCookie('accessToken', accessToken, 15 * 60); // 15 minutos
    const refreshCookie = serializeTokenCookie('refreshToken', refreshToken, 7 * 24 * 60 * 60); // 7 días

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    logger.error({
      msg: 'Login error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}
