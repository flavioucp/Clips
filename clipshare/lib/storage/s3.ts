/**
 * Integración con AWS S3 para almacenamiento de archivos
 * Soporta: upload, signed URLs, delete
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/lib/logger';

// Inicializar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // Para Minio compatible:
  ...(process.env.AWS_S3_ENDPOINT && {
    endpoint: process.env.AWS_S3_ENDPOINT,
    forcePathStyle: true,
  }),
});

interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

/**
 * Subir archivo a S3
 * @param fileBuffer Buffer del archivo
 * @param fileName Nombre del archivo (con extensión)
 * @param mimeType MIME type del archivo
 * @returns URL pública y key del objeto
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  const bucket = process.env.AWS_S3_BUCKET || 'clipshare-bucket';
  const key = `uploads/${Date.now()}-${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256',
      // Cache control: 1 año para assets de usuario
      CacheControl: 'public, max-age=31536000, immutable',
    });

    await s3Client.send(command);

    const baseUrl = process.env.AWS_S3_URL || `https://${bucket}.s3.amazonaws.com`;
    const url = `${baseUrl}/${key}`;

    logger.info({
      msg: 'File uploaded to S3',
      key,
      fileName,
      mimeType,
    });

    return {
      url,
      key,
      bucket,
    };
  } catch (error) {
    logger.error({
      msg: 'S3 upload error',
      error: error instanceof Error ? error.message : 'Unknown error',
      fileName,
    });
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Generar URL firmada para descargar/streamear archivo
 * @param key Key del objeto en S3
 * @param expirySeconds Segundos de validez (default: 1 hora)
 * @returns URL firmada
 */
export async function generateSignedUrl(
  key: string,
  expirySeconds: number = 3600
): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET || 'clipshare-bucket';

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expirySeconds,
    });

    return url;
  } catch (error) {
    logger.error({
      msg: 'Failed to generate signed URL',
      error: error instanceof Error ? error.message : 'Unknown error',
      key,
    });
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Eliminar archivo de S3
 * @param key Key del objeto en S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const bucket = process.env.AWS_S3_BUCKET || 'clipshare-bucket';

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);

    logger.info({
      msg: 'File deleted from S3',
      key,
    });
  } catch (error) {
    logger.error({
      msg: 'S3 delete error',
      error: error instanceof Error ? error.message : 'Unknown error',
      key,
    });
    throw new Error('Failed to delete file from S3');
  }
}

/**
 * Extraer key de URL de S3
 */
export function getKeyFromS3Url(url: string): string {
  const baseUrl = process.env.AWS_S3_URL || `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com`;
  return url.replace(baseUrl + '/', '');
}
