import { mkdir, copyFile, access, readFile as fsReadFile, writeFile as fsWriteFile } from 'fs/promises';
import { dirname, join } from 'path';
import { config } from '../config.js';

/**
 * Ensure a directory exists, create it if it doesn't
 * @param dirPath - Path to the directory
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    // Ignore error if directory already exists
    if (err.code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${dirPath}: ${err.message}`);
    }
  }
}

/**
 * Copy a template file to a target path
 * @param templateName - Name of the template file (e.g., "Daily Log.md")
 * @param targetPath - Destination path for the copied file
 */
export async function copyTemplate(templateName: string, targetPath: string): Promise<void> {
  const sourcePath = join(config.templatesDir, templateName);

  try {
    // Ensure target directory exists
    await ensureDir(dirname(targetPath));

    // Copy the file
    await copyFile(sourcePath, targetPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    throw new Error(`Failed to copy template ${templateName}: ${err.message}`);
  }
}

/**
 * Check if a file exists
 * @param filePath - Path to the file
 * @returns True if file exists, false otherwise
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file contents as string
 * @param filePath - Path to the file
 * @returns File contents
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fsReadFile(filePath, 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

/**
 * Write content to a file
 * @param filePath - Path to the file
 * @param content - Content to write
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    // Ensure directory exists
    await ensureDir(dirname(filePath));

    await fsWriteFile(filePath, content, 'utf-8');
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    throw new Error(`Failed to write file ${filePath}: ${err.message}`);
  }
}
