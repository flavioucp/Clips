/**
 * Middleware para proteger rutas
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { parse } from 'cookie';

export async function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, userId: string) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const cookies = parse(req.headers.cookie || '');
      const token = cookies.accessToken;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      return handler(req, res, decoded.userId);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export async function withAdmin(
  handler: (req: NextApiRequest, res: NextApiResponse, userId: string) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const cookies = parse(req.headers.cookie || '');
      const token = cookies.accessToken;

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const decoded = verifyAccessToken(token);
      if (!decoded || decoded.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return handler(req, res, decoded.userId);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
