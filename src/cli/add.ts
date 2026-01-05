#!/usr/bin/env node
import minimist from 'minimist';
import { basename, join } from 'path';
import { config } from '../config.js';
import { getToday, formatTime } from '../utils/date.js';
import { fileExists, copyTemplate, readFile, writeFile } from '../utils/file.js';
import { appendToSection } from '../utils/markdown.js';
import { sanitizePromptInput, validatePathWithinBase } from '../utils/security.js';

/**
 * Main function for brag-add command
 */
async function main(): Promise<void> {
  const args = minimist(process.argv.slice(2));
  const content = args._[0] as string | undefined;

  // Validate input
  if (!content) {
    console.error('Error: Please provide content to add');
    console.error('Usage: brag-add "your work item"');
    console.error('Example: brag-add "Fixed memory leak in authentication module"');
    process.exit(1);
  }

  try {
    // Get today's date (already validated by getToday)
    const today = getToday();
    const logPath = join(config.logsDir, `${today}.md`);

    // Security: Validate the constructed path is within logs directory
    validatePathWithinBase(logPath, config.logsDir);

    // Check if log file exists, create from template if not
    if (!(await fileExists(logPath))) {
      await copyTemplate('Daily Log.md', logPath);
      console.log(`Created new log file: ${basename(logPath)}`);
    }

    // Read current content
    const currentContent = await readFile(logPath);

    // Security: Sanitize user input to prevent prompt injection when content is later polished
    const sanitizedContent = sanitizePromptInput(content);

    // Prepare new entry
    const newEntry = `- ${sanitizedContent}`;

    // Append to Work Journal section
    const updatedContent = appendToSection(currentContent, 'Work Journal', newEntry);

    // Write back to file
    await writeFile(logPath, updatedContent);

    console.log(`✓ Added to ${today}.md`);
  } catch (error) {
    const err = error as Error;
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// Run main function
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
