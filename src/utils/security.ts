import { basename, resolve, sep } from 'path';

/**
 * Sanitize a filename to prevent path traversal attacks
 * Removes path separators and traversal sequences
 *
 * @param input - User-provided filename or date string
 * @returns Sanitized filename safe for use in file paths
 * @throws {Error} If input contains malicious patterns
 */
export function sanitizeFilename(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: filename must be a non-empty string');
  }

  // Check for null bytes (potential for bypassing filters)
  if (input.includes('\0')) {
    throw new Error('Invalid input: null bytes not allowed');
  }

  // Remove path traversal sequences (..)
  let sanitized = input.replace(/\.\./g, '');

  // Remove drive letters (C:, D:, etc.) for Windows paths
  sanitized = sanitized.replace(/^[A-Za-z]:/, '');

  // Split by both Unix (/) and Windows (\) separators
  // Take the last non-empty component (basename)
  const parts = sanitized.split(/[\/\\]+/);
  const filename = parts.filter(part => part.length > 0).pop() || '';

  // Ensure we still have content after sanitization
  if (!filename) {
    throw new Error('Invalid input: resulted in empty filename after sanitization');
  }

  return filename;
}

/**
 * Validate that a resolved path is within an allowed base directory
 * Prevents path traversal attacks by ensuring the final path doesn't escape
 *
 * @param filePath - The file path to validate
 * @param baseDir - The base directory that must contain the file
 * @returns The resolved file path if valid
 * @throws {Error} If path escapes the base directory
 */
export function validatePathWithinBase(filePath: string, baseDir: string): string {
  const resolvedPath = resolve(filePath);
  const resolvedBase = resolve(baseDir);

  // Normalize path separators for comparison
  const normalizedPath = resolvedPath.split(sep).join('/');
  const normalizedBase = resolvedBase.split(sep).join('/');

  // Check if the resolved path starts with the base directory
  if (!normalizedPath.startsWith(normalizedBase)) {
    throw new Error('Path traversal detected: file path must be within the designated directory');
  }

  return resolvedPath;
}

/**
 * Sanitize user input to prevent AI prompt injection attacks
 * Removes or neutralizes common prompt injection patterns
 *
 * @param input - User-provided content
 * @returns Sanitized content safe for inclusion in AI prompts
 */
export function sanitizePromptInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Maximum length to prevent abuse
  const MAX_LENGTH = 10000;
  let sanitized = input.slice(0, MAX_LENGTH);

  // Common prompt injection patterns to neutralize
  const dangerousPatterns = [
    // Instruction overrides
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
    /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,
    /forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|commands?)/gi,

    // System prompt manipulation
    /new\s+system\s+(prompt|message|instruction)/gi,
    /system\s*:\s*/gi,
    /\[system\]/gi,
    /\<\|system\|\>/gi,

    // Role switching
    /you\s+are\s+now\s+a\s+different/gi,
    /act\s+as\s+if\s+you/gi,
    /pretend\s+(you\s+are|to\s+be)/gi,

    // Common LLM delimiters
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /\<\|endoftext\|\>/gi,

    // Code fence escapes (to break out of context)
    /```\s*(end|stop|exit|finish)/gi,
    /```\s*\n\s*(ignore|new|system)/gi,
  ];

  // Replace dangerous patterns with a safe marker
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[filtered content]');
  });

  // Remove excessive special characters that might be used for injection
  // But preserve normal markdown formatting
  sanitized = sanitized.replace(/([`]{4,})/g, '```'); // Max 3 backticks
  sanitized = sanitized.replace(/([<>]{3,})/g, '<<'); // Limit angle brackets

  return sanitized;
}

/**
 * Validate a date string format (YYYY-MM-DD)
 * This is a security-focused validation that also checks for path traversal
 *
 * @param dateString - Date string to validate
 * @returns The validated date string
 * @throws {Error} If format is invalid or contains malicious patterns
 */
export function validateDateFormat(dateString: string): string {
  // First sanitize to prevent path traversal
  const sanitized = sanitizeFilename(dateString);

  // Then check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(sanitized)) {
    throw new Error(`Invalid date format: must be YYYY-MM-DD`);
  }

  return sanitized;
}

/**
 * Validate a year-month string format (YYYY-MM)
 * This is a security-focused validation that also checks for path traversal
 *
 * @param yearMonth - Year-month string to validate
 * @returns The validated year-month string
 * @throws {Error} If format is invalid or contains malicious patterns
 */
export function validateYearMonthFormat(yearMonth: string): string {
  // Check for path separators - reject immediately if found
  if (/[\/\\]/.test(yearMonth)) {
    throw new Error(`Invalid year-month format: path separators not allowed`);
  }

  // First sanitize to prevent path traversal
  const sanitized = sanitizeFilename(yearMonth);

  // Then check format
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(sanitized)) {
    throw new Error(`Invalid year-month format: must be YYYY-MM`);
  }

  // Validate month is between 01-12
  const [, monthStr] = sanitized.split('-');
  const month = parseInt(monthStr, 10);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid year-month format: month must be between 01 and 12`);
  }

  return sanitized;
}
