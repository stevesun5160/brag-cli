import type { SectionInfo } from '../types/index.js';

/**
 * Find a section in markdown content
 * @param content - Markdown content
 * @param sectionName - Name of the section (without ## prefix)
 * @returns Section information or null if not found
 */
export function findSection(content: string, sectionName: string): SectionInfo | null {
  const lines = content.split('\n');
  const sectionPattern = new RegExp(`^##\\s+${sectionName.trim()}\\s*$`);

  let startLine = -1;
  let endLine = -1;

  // Find section start
  for (let i = 0; i < lines.length; i++) {
    if (sectionPattern.test(lines[i])) {
      startLine = i;
      break;
    }
  }

  if (startLine === -1) {
    return null;
  }

  // Find section end (next ## heading or end of file)
  endLine = lines.length;
  for (let i = startLine + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      endLine = i;
      break;
    }
  }

  // Extract content (excluding the title line)
  const sectionContent = lines.slice(startLine + 1, endLine).join('\n');

  return {
    name: sectionName,
    startLine,
    endLine,
    content: sectionContent,
  };
}

/**
 * Append content to a section
 * @param content - Markdown content
 * @param sectionName - Name of the section
 * @param newContent - Content to append
 * @returns Updated markdown content
 * @throws {Error} If section is not found
 */
export function appendToSection(content: string, sectionName: string, newContent: string): string {
  const section = findSection(content, sectionName);

  if (!section) {
    throw new Error(`Section "${sectionName}" not found`);
  }

  const lines = content.split('\n');

  // Insert new content before the next section or at the end
  const insertPosition = section.endLine;

  // Add a newline before the new content if the section is not empty
  const currentContent = section.content.trim();
  const separator = currentContent ? '\n' : '';

  lines.splice(insertPosition, 0, separator + newContent);

  return lines.join('\n');
}

/**
 * Replace a section's content
 * @param content - Markdown content
 * @param sectionName - Name of the section
 * @param newContent - New content for the section
 * @returns Updated markdown content
 * @throws {Error} If section is not found
 */
export function replaceSection(content: string, sectionName: string, newContent: string): string {
  const section = findSection(content, sectionName);

  if (!section) {
    throw new Error(`Section "${sectionName}" not found`);
  }

  const lines = content.split('\n');

  // Remove old content (excluding the title)
  lines.splice(section.startLine + 1, section.endLine - section.startLine - 1);

  // Insert new content after the title
  const newLines = newContent.split('\n');
  lines.splice(section.startLine + 1, 0, ...newLines);

  return lines.join('\n');
}

/**
 * Extract a section's content (without the title)
 * @param content - Markdown content
 * @param sectionName - Name of the section
 * @returns Section content (without title)
 * @throws {Error} If section is not found
 */
export function extractSection(content: string, sectionName: string): string {
  const section = findSection(content, sectionName);

  if (!section) {
    throw new Error(`Section "${sectionName}" not found`);
  }

  return section.content;
}
