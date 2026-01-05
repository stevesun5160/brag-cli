import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ensureDir, copyTemplate, fileExists, readFile, writeFile } from './file.js';
import { mkdir, writeFile as fsWriteFile, rm, readFile as fsReadFile } from 'fs/promises';
import { join } from 'path';
import { config } from '../config.js';

describe('file utils', () => {
  const testDir = join(process.cwd(), 'test-files');

  beforeEach(async () => {
    // Clean up before each test
    await rm(testDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Clean up after each test
    await rm(testDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('ensureDir', () => {
    it('should create directory if it does not exist', async () => {
      const dirPath = join(testDir, 'new-dir');
      await ensureDir(dirPath);

      // Verify directory exists
      expect(await fileExists(dirPath)).toBe(true);
    });

    it('should not throw error if directory already exists', async () => {
      const dirPath = join(testDir, 'existing-dir');
      await mkdir(dirPath, { recursive: true });

      // Should not throw
      await expect(ensureDir(dirPath)).resolves.toBeUndefined();
    });

    it('should create nested directories', async () => {
      const dirPath = join(testDir, 'level1', 'level2', 'level3');
      await ensureDir(dirPath);

      expect(await fileExists(dirPath)).toBe(true);
    });
  });

  describe('copyTemplate', () => {
    beforeEach(async () => {
      // Create a mock template
      const templatesDir = join(testDir, 'templates');
      await mkdir(templatesDir, { recursive: true });
      await fsWriteFile(
        join(templatesDir, 'test-template.md'),
        '# Test Template\n\nTemplate content',
        'utf-8'
      );

      // Override config
      vi.spyOn(config, 'templatesDir', 'get').mockReturnValue(templatesDir);
    });

    it('should copy template to target path', async () => {
      const targetPath = join(testDir, 'output', 'copied.md');
      await copyTemplate('test-template.md', targetPath);

      expect(await fileExists(targetPath)).toBe(true);

      const content = await fsReadFile(targetPath, 'utf-8');
      expect(content).toBe('# Test Template\n\nTemplate content');
    });

    it('should create target directory if it does not exist', async () => {
      const targetPath = join(testDir, 'deep', 'nested', 'path', 'file.md');
      await copyTemplate('test-template.md', targetPath);

      expect(await fileExists(targetPath)).toBe(true);
    });

    it('should throw error if template does not exist', async () => {
      const targetPath = join(testDir, 'output.md');
      await expect(copyTemplate('non-existent.md', targetPath)).rejects.toThrow('Failed to copy template');
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const filePath = join(testDir, 'existing.txt');
      await mkdir(testDir, { recursive: true });
      await fsWriteFile(filePath, 'content', 'utf-8');

      expect(await fileExists(filePath)).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const filePath = join(testDir, 'non-existing.txt');
      expect(await fileExists(filePath)).toBe(false);
    });

    it('should return true for existing directory', async () => {
      await mkdir(testDir, { recursive: true });
      expect(await fileExists(testDir)).toBe(true);
    });
  });

  describe('readFile', () => {
    it('should read file contents', async () => {
      const filePath = join(testDir, 'read-test.txt');
      const content = 'Hello, World!';

      await mkdir(testDir, { recursive: true });
      await fsWriteFile(filePath, content, 'utf-8');

      const result = await readFile(filePath);
      expect(result).toBe(content);
    });

    it('should handle UTF-8 content', async () => {
      const filePath = join(testDir, 'utf8.txt');
      const content = '你好世界 🌍';

      await mkdir(testDir, { recursive: true });
      await fsWriteFile(filePath, content, 'utf-8');

      const result = await readFile(filePath);
      expect(result).toBe(content);
    });

    it('should throw error for non-existing file', async () => {
      const filePath = join(testDir, 'non-existing.txt');
      await expect(readFile(filePath)).rejects.toThrow('Failed to read file');
    });
  });

  describe('writeFile', () => {
    it('should write content to file', async () => {
      const filePath = join(testDir, 'write-test.txt');
      const content = 'Test content';

      await writeFile(filePath, content);

      const result = await fsReadFile(filePath, 'utf-8');
      expect(result).toBe(content);
    });

    it('should create directory if it does not exist', async () => {
      const filePath = join(testDir, 'nested', 'path', 'file.txt');
      const content = 'Content in nested path';

      await writeFile(filePath, content);

      expect(await fileExists(filePath)).toBe(true);
      const result = await fsReadFile(filePath, 'utf-8');
      expect(result).toBe(content);
    });

    it('should overwrite existing file', async () => {
      const filePath = join(testDir, 'overwrite.txt');

      await mkdir(testDir, { recursive: true });
      await fsWriteFile(filePath, 'Old content', 'utf-8');

      await writeFile(filePath, 'New content');

      const result = await fsReadFile(filePath, 'utf-8');
      expect(result).toBe('New content');
    });

    it('should handle UTF-8 content', async () => {
      const filePath = join(testDir, 'utf8-write.txt');
      const content = '測試內容 🚀';

      await writeFile(filePath, content);

      const result = await fsReadFile(filePath, 'utf-8');
      expect(result).toBe(content);
    });
  });
});
