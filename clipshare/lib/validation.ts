/**
 * Validaciones de entrada con Zod
 */

import { z } from 'zod';

// Constants
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'image/gif'
];

export const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

export function isValidFileSize(bytes: number): boolean {
  return bytes <= MAX_FILE_SIZE;
}

const FORBIDDEN_WORDS = [
  'violence',
  'racism',
  'sexism',
  'hate',
  'abuse',
  'spam',
  'scam'
];

export function checkForbiddenWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return FORBIDDEN_WORDS.some(word => lowerText.includes(word));
}

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/\d/, 'Password must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const PasswordResetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/\d/, 'Password must contain a number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character'),
  token: z.string().min(1, 'Reset token is required'),
});

// Clip schemas
export const CreateClipSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  privacy: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  tags: z.array(z.string().max(50)).optional().default([]),
});

export const SearchClipsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  tag: z.string().optional(),
  q: z.string().optional(),
  sortBy: z.enum(['newest', 'popular', 'trending']).optional().default('newest'),
});

// Comment schemas
export const CreateCommentSchema = z.object({
  clipId: z.string().cuid('Invalid clip ID'),
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  parentId: z.string().cuid('Invalid parent ID').optional(),
});

// Report schemas
export const CreateReportSchema = z.object({
  reason: z.enum([
    'INAPPROPRIATE_CONTENT',
    'SPAM',
    'COPYRIGHT_VIOLATION',
    'HARASSMENT',
    'HATE_SPEECH',
    'OTHER',
  ]),
  description: z.string().max(500).optional(),
});

// User schemas
export const UpdateUserProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateClipInput = z.infer<typeof CreateClipSchema>;
export type SearchClipsInput = z.infer<typeof SearchClipsSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileSchema>;
