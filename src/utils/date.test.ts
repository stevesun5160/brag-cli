import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getToday, formatTime, parseDate, getMonthLogs } from './date.js';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';

describe('date utils', () => {
  describe('getToday', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const date = getToday();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Verify it's a valid date
      expect(() => parseDate(date)).not.toThrow();
    });

    it('should return today\'s date', () => {
      const date = getToday();
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      expect(date).toBe(expected);
    });
  });

  describe('formatTime', () => {
    it('should return time in HH:mm format', () => {
      const time = formatTime();
      expect(time).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should use 24-hour format', () => {
      const time = formatTime();
      const [hours, minutes] = time.split(':').map(Number);
      expect(hours).toBeGreaterThanOrEqual(0);
      expect(hours).toBeLessThan(24);
      expect(minutes).toBeGreaterThanOrEqual(0);
      expect(minutes).toBeLessThan(60);
    });
  });

  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const date = parseDate('2026-01-05');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(5);
    });

    it('should throw error for invalid format', () => {
      expect(() => parseDate('2026/01/05')).toThrow('Invalid date format');
      expect(() => parseDate('01-05-2026')).toThrow('Invalid date format');
      expect(() => parseDate('2026-1-5')).toThrow('Invalid date format');
    });

    it('should throw error for invalid dates', () => {
      expect(() => parseDate('2026-13-01')).toThrow('Invalid date');
      expect(() => parseDate('2026-02-30')).toThrow('Invalid date');
    });
  });

  describe('getMonthLogs', () => {
    const testLogsDir = join(process.cwd(), 'test-logs');

    beforeEach(async () => {
      // Override config for testing
      vi.spyOn(config, 'logsDir', 'get').mockReturnValue(testLogsDir);

      // Create test directory
      await mkdir(testLogsDir, { recursive: true });

      // Create test log files
      await writeFile(join(testLogsDir, '2026-01-01.md'), '# Log 1');
      await writeFile(join(testLogsDir, '2026-01-02.md'), '# Log 2');
      await writeFile(join(testLogsDir, '2026-01-03.md'), '# Log 3');
      await writeFile(join(testLogsDir, '2026-02-01.md'), '# Log 4');
      await writeFile(join(testLogsDir, '2026-01-summary.md'), '# Summary');
    });

    afterEach(async () => {
      // Clean up test directory
      await rm(testLogsDir, { recursive: true, force: true });
      vi.restoreAllMocks();
    });

    it('should return logs for specified month', async () => {
      const logs = await getMonthLogs('2026-01');
      expect(logs).toHaveLength(3);
      expect(logs[0]).toContain('2026-01-01.md');
      expect(logs[1]).toContain('2026-01-02.md');
      expect(logs[2]).toContain('2026-01-03.md');
    });

    it('should exclude summary files', async () => {
      const logs = await getMonthLogs('2026-01');
      expect(logs.some(log => log.includes('summary'))).toBe(false);
    });

    it('should return empty array for non-existent month', async () => {
      const logs = await getMonthLogs('2026-12');
      expect(logs).toEqual([]);
    });

    it('should return logs in sorted order', async () => {
      const logs = await getMonthLogs('2026-01');
      expect(logs[0]).toContain('2026-01-01.md');
      expect(logs[1]).toContain('2026-01-02.md');
      expect(logs[2]).toContain('2026-01-03.md');
    });

    it('should throw error for invalid month format', async () => {
      await expect(getMonthLogs('2026-1')).rejects.toThrow('Invalid month format');
      await expect(getMonthLogs('202601')).rejects.toThrow('Invalid month format');
    });

    it('should return empty array when logs directory does not exist', async () => {
      vi.spyOn(config, 'logsDir', 'get').mockReturnValue('/non-existent-dir');
      const logs = await getMonthLogs('2026-01');
      expect(logs).toEqual([]);
    });
  });
});
