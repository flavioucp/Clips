/**
 * Utilidades para procesamiento de video con FFmpeg
 * Genera: thumbnail, obtiene duración
 */

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { logger } from '@/lib/logger';

// Configurar path de ffmpeg (default: 'ffmpeg')
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || 'ffmpeg');
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH || 'ffprobe');

/**
 * Obtener duración de video en segundos
 */
export async function getVideoDuration(
  inputPath: string
): Promise<number | null> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        logger.error({
          msg: 'FFprobe error',
          error: err.message,
        });
        resolve(null);
        return;
      }

      const duration = Math.round(metadata.format.duration || 0);
      resolve(duration);
    });
  });
}

/**
 * Generar thumbnail de video
 * @param inputPath Path del archivo de entrada
 * @param outputPath Path donde guardar el thumbnail
 * @param atSeconds Segundo del video donde tomar screenshot (default: 1)
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  atSeconds: number = 1
): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg(inputPath)
      .on('end', () => {
        logger.info({
          msg: 'Thumbnail generated',
          outputPath,
        });
        resolve(true);
      })
      .on('error', (err) => {
        logger.error({
          msg: 'Thumbnail generation error',
          error: err.message,
        });
        resolve(false);
      })
      .screenshot({
        timestamps: [atSeconds],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: process.env.THUMBNAIL_SIZE || '320x180',
      });
  });
}

/**
 * Convertir video a formato compatible (opcional)
 * Útil para normalizar formatos
 */
export async function transcodeVideo(
  inputPath: string,
  outputPath: string,
  format: 'mp4' | 'webm' = 'mp4'
): Promise<boolean> {
  return new Promise((resolve) => {
    const command = ffmpeg(inputPath);

    if (format === 'mp4') {
      command
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions('-crf', '28') // Quality (default 28, lower = better)
        .outputOptions('-preset', 'fast'); // Speed vs quality
    } else if (format === 'webm') {
      command
        .videoCodec('libvpx-vp9')
        .audioCodec('libopus')
        .outputOptions('-crf', '30');
    }

    command
      .on('end', () => {
        logger.info({
          msg: 'Video transcoded',
          outputPath,
          format,
        });
        resolve(true);
      })
      .on('error', (err) => {
        logger.error({
          msg: 'Transcode error',
          error: err.message,
        });
        resolve(false);
      })
      .save(outputPath);
  });
}

/**
 * Validar que el archivo es un video real
 * Usa ffprobe para verificar streams
 */
export async function isValidVideoFile(inputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        resolve(false);
        return;
      }

      // Verificar que tiene al menos un stream de video o audio
      const hasVideo = metadata.streams.some((s) => s.codec_type === 'video');
      const hasAudio = metadata.streams.some((s) => s.codec_type === 'audio');

      resolve(hasVideo || hasAudio);
    });
  });
}
