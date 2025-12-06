/**
 * Endpoint: POST /api/clips/upload
 * Subir clip (video o GIF)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { uploadToS3 } from '@/lib/storage/s3';
import { getVideoDuration, generateThumbnail } from '@/lib/video/ffmpeg';
import { CreateClipSchema, ALLOWED_VIDEO_TYPES, isValidFileSize } from '@/lib/validation';
import { uploadLimiter, isValidVideoMimeType } from '@/lib/security';
import { logger } from '@/lib/logger';
import { parse } from 'cookie';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  try {
    await new Promise((resolve, reject) => {
      uploadLimiter(req, res, (result: any) => {
        if (result instanceof Error) reject(result);
        else resolve(result);
      });
    });
  } catch {
    return res.status(429).json({ error: 'Upload limit exceeded' });
  }

  // Verificar autenticación
  const cookies = parse(req.headers.cookie || '');
  const accessToken = cookies.accessToken;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  let uploadDir = '';

  try {
    // Crear directorio temporal
    uploadDir = path.join('/tmp', `upload-${Date.now()}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parsear form data
    const form = new IncomingForm({
      uploadDir,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '200') * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);

    // Validar campos requeridos
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    const privacy = Array.isArray(fields.privacy) ? fields.privacy[0] : fields.privacy;
    const tags = Array.isArray(fields.tags) ? fields.tags[0]?.split(',') : [];

    // Validar con Zod
    const validated = CreateClipSchema.parse({
      title,
      description,
      privacy,
      tags,
    });

    // Validar archivo
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = uploadedFile.filepath;
    const mimeType = uploadedFile.mimetype || 'application/octet-stream';
    const fileSize = uploadedFile.size;

    // Validar MIME type
    if (!isValidVideoMimeType(mimeType)) {
      logger.warn({
        msg: 'Invalid MIME type',
        mimeType,
        userId: decoded.userId,
      });
      return res.status(400).json({
        error: 'Invalid file type. Allowed: mp4, webm, mov, gif',
      });
    }

    // Validar tamaño
    if (!isValidFileSize(fileSize)) {
      logger.warn({
        msg: 'File too large',
        fileSize,
        userId: decoded.userId,
      });
      return res.status(413).json({
        error: `File too large. Maximum: ${process.env.MAX_FILE_SIZE_MB}MB`,
      });
    }

    // Leer archivo
    const fileBuffer = fs.readFileSync(filePath);

    // Obtener duración
    let duration = null;
    if (mimeType.startsWith('video/')) {
      duration = await getVideoDuration(filePath);
    }

    // Generar thumbnail
    let thumbnailUrl = null;
    if (mimeType.startsWith('video/')) {
      const thumbnailPath = path.join(uploadDir, 'thumbnail.jpg');
      const thumbnailGenerated = await generateThumbnail(filePath, thumbnailPath);

      if (thumbnailGenerated && fs.existsSync(thumbnailPath)) {
        const thumbnailBuffer = fs.readFileSync(thumbnailPath);
        const thumbResult = await uploadToS3(
          thumbnailBuffer,
          `thumb-${Date.now()}.jpg`,
          'image/jpeg'
        );
        thumbnailUrl = thumbResult.url;
      }
    }

    // Subir archivo principal a S3
    const uploadResult = await uploadToS3(
      fileBuffer,
      `${Date.now()}-${uploadedFile.originalFilename || 'clip'}`,
      mimeType
    );

    // Crear clip en BD
    const clip = await prisma.clip.create({
      data: {
        userId: decoded.userId,
        title: validated.title,
        description: validated.description,
        fileUrl: uploadResult.url,
        thumbnailUrl,
        duration,
        fileSize,
        mimeType,
        privacy: validated.privacy,
        tags: {
          create: validated.tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { name: tag.toLowerCase() },
                create: { name: tag.toLowerCase() },
              },
            },
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    logger.info({
      msg: 'Clip uploaded',
      clipId: clip.id,
      userId: decoded.userId,
    });

    return res.status(201).json({
      message: 'Clip uploaded successfully',
      clip: {
        id: clip.id,
        title: clip.title,
        fileUrl: clip.fileUrl,
        thumbnailUrl: clip.thumbnailUrl,
        duration: clip.duration,
      },
    });
  } catch (error) {
    logger.error({
      msg: 'Upload error',
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: decoded.userId,
    });

    return res.status(500).json({ error: 'Upload failed' });
  } finally {
    // Limpiar directorio temporal
    if (uploadDir && fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
    await prisma.$disconnect();
  }
}
