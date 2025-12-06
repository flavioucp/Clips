/**
 * Utilidades de autenticación con JWT
 * Incluye: generación de tokens, verificación, cookies HTTP-only
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { serialize } from 'cookie';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generar access token JWT
 */
export function generateAccessToken(
  userId: string,
  email: string,
  role: string = 'USER'
): string {
  const payload: TokenPayload = { userId, email, role, iat: 0 };
  const token = jwt.sign(
    payload,
    (process.env.JWT_SECRET || 'default-secret') as string,
    { expiresIn: process.env.JWT_EXPIRY || '900s' } as any
  );
  return token;
}

/**
 * Generar refresh token JWT
 */
export function generateRefreshToken(userId: string): string {
  const payload: any = { userId };
  const token = jwt.sign(
    payload,
    (process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' } as any
  );
  return token;
}

/**
 * Verificar y decodificar access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      (process.env.JWT_SECRET || 'default-secret') as string
    );
    return decoded as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verificar y decodificar refresh token
 */
export function verifyRefreshToken(
  token: string
): { userId: string } | null {
  try {
    const decoded = jwt.verify(
      token,
      (process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as string
    );
    return decoded as { userId: string };
  } catch (error) {
    return null;
  }
}

/**
 * Serializar token en HTTP-only cookie
 */
export function serializeTokenCookie(
  name: string,
  token: string,
  expirySeconds: number
): string {
  return serialize(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: expirySeconds,
    path: '/',
  });
}

/**
 * Serializar cookie de logout (expira inmediatamente)
 */
export function serializeLogoutCookie(name: string): string {
  return serialize(name, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Extraer token del header Authorization
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Extraer token de cookies
 */
export function extractTokenFromCookies(
  cookies: Record<string, string>,
  tokenName: string = 'accessToken'
): string | null {
  return cookies[tokenName] || null;
}
