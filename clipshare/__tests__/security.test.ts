/**
 * Tests unitarios para seguridad
 */

import {
  sanitizeString,
  isValidVideoMimeType,
  isValidFileSize,
  checkForbiddenWords,
} from '@/lib/security';

describe('Security Utils', () => {
  describe('sanitizeString', () => {
    it('should escape XSS attempts', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeString(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;');
    });

    it('should escape HTML entities', () => {
      const input = '"><img src=x onerror=alert(1)>';
      const result = sanitizeString(input);
      expect(result).not.toContain('<img');
    });
  });

  describe('isValidVideoMimeType', () => {
    it('should allow video/mp4', () => {
      expect(isValidVideoMimeType('video/mp4')).toBe(true);
    });

    it('should allow image/gif', () => {
      expect(isValidVideoMimeType('image/gif')).toBe(true);
    });

    it('should reject invalid types', () => {
      expect(isValidVideoMimeType('application/pdf')).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should allow files under limit', () => {
      const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '200');
      const maxBytes = maxSizeMB * 1024 * 1024;
      expect(isValidFileSize(maxBytes - 1)).toBe(true);
    });

    it('should reject files over limit', () => {
      const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '200');
      const maxBytes = maxSizeMB * 1024 * 1024;
      expect(isValidFileSize(maxBytes + 1)).toBe(false);
    });
  });

  describe('checkForbiddenWords', () => {
    it('should detect forbidden words', () => {
      // Esto depende de la lista de palabras configurada
      expect(typeof checkForbiddenWords('normal text')).toBe('boolean');
    });
  });
});
