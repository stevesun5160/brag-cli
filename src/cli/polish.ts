#!/usr/bin/env node
import minimist from 'minimist';
import { basename, join } from 'path';
import { config, validateConfig } from '../config.js';
import { getToday, parseDate } from '../utils/date.js';
import { fileExists, readFile, writeFile } from '../utils/file.js';
import { extractSection } from '../utils/markdown.js';
import { generateContent } from '../ai/gemini.js';
import { createPolishPrompt } from '../ai/prompts.js';
import { validateDateFormat, validatePathWithinBase } from '../utils/security.js';

/**
 * Main function for brag-polish command
 */
async function main(): Promise<void> {
  const args = minimist(process.argv.slice(2));
  const dateArg = args._[0] as string | undefined;

  try {
    // Validate API key exists
    validateConfig();

    // Determine which log to polish
    let targetDate: string;
    if (dateArg) {
      // Security: Validate and sanitize date input
      try {
        targetDate = validateDateFormat(dateArg);
        // Also validate with date parser for actual date validity
        parseDate(targetDate);
      } catch (error) {
        const err = error as Error;
        console.error(`Invalid date: ${err.message}`);
        console.error('Usage: brag-polish [YYYY-MM-DD]');
        console.error('Example: brag-polish 2026-01-05');
        process.exit(1);
      }
    } else {
      targetDate = getToday();
    }

    const logPath = join(config.logsDir, `${targetDate}.md`);

    // Security: Validate the constructed path is within logs directory
    validatePathWithinBase(logPath, config.logsDir);

    // Check if log file exists
    if (!(await fileExists(logPath))) {
      console.error(`Error: Log file not found for date ${targetDate}`);
      console.error(`Please create a log first using: brag-add`);
      process.exit(1);
    }

    // Read log content
    const content = await readFile(logPath);

    // Extract Work Journal section
    let journalContent: string;
    try {
      journalContent = extractSection(content, 'Work Journal');
    } catch (error) {
      console.error('Error: Could not find "Work Journal" section in log file');
      process.exit(1);
    }

    // Check if there's content to polish
    if (!journalContent.trim()) {
      console.log('Work Journal section is empty. Nothing to polish.');
      process.exit(0);
    }

    console.log('Polishing your journal with AI...');
    console.log('This may take a moment...\n');

    // Generate polished content using AI
    const prompt = createPolishPrompt(journalContent);
    const polishedContent = await generateContent(prompt);

    // Write polished content back to file
    await writeFile(logPath, polishedContent);

    console.log(`✓ Successfully polished ${targetDate}.md`);
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
