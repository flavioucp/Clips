/**
 * Endpoint: POST /api/auth/register
 * Registrar nuevo usuario con email y contraseña
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, validatePasswordPolicy } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken, serializeTokenCookie } from '@/lib/auth/jwt';
import { RegisterSchema } from '@/lib/validation';
import { sanitizeObject } from '@/lib/security';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

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
    const { email, password, name } = RegisterSchema.parse(req.body);

    // Validar política de contraseña
    const passwordValidation = validatePasswordPolicy(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors,
      });
    }

    // Verificar si usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn({ msg: 'Register: User already exists', email });
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash de contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null, // Requerir verificación
      },
    });

    logger.info({ msg: 'User registered', userId: user.id, email });

    // Generar tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Guardar refresh token en BD
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });

    // Setear cookies
    res.setHeader(
      'Set-Cookie',
      [
        serializeTokenCookie('accessToken', accessToken, 900), // 15 min
        serializeTokenCookie('refreshToken', refreshToken, 7 * 24 * 60 * 60), // 7 días
      ]
    );

    return res.status(201).json({
      message: 'User registered successfully',
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
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    logger.error({
      msg: 'Register error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
