import { readdir } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Date string in YYYY-MM-DD format
 */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time in HH:mm format
 * @returns Time string in HH:mm format
 */
export function formatTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse and validate a date string
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 * @throws {Error} If date string is invalid
 */
export function parseDate(dateString: string): Date {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  // Verify the date components match (to catch invalid dates like 2026-02-30)
  const [year, month, day] = dateString.split('-').map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  return date;
}

/**
 * Get all log file paths for a given month
 * @param yearMonth - Month string in YYYY-MM format
 * @returns Array of log file paths for the specified month
 */
export async function getMonthLogs(yearMonth: string): Promise<string[]> {
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(yearMonth)) {
    throw new Error(`Invalid month format: ${yearMonth}. Expected YYYY-MM`);
  }

  try {
    const files = await readdir(config.logsDir);
    const logFiles = files
      .filter(file => file.startsWith(yearMonth) && file.endsWith('.md'))
      .filter(file => !file.includes('summary')) // Exclude summary files
      .map(file => join(config.logsDir, file))
      .sort();

    return logFiles;
  } catch (error) {
    // If directory doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}
