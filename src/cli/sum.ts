#!/usr/bin/env node
import minimist from 'minimist';
import { basename, join } from 'path';
import { config, validateConfig } from '../config.js';
import { getMonthLogs } from '../utils/date.js';
import { readFile, writeFile } from '../utils/file.js';
import { generateContent } from '../ai/gemini.js';
import { createSummaryPrompt } from '../ai/prompts.js';
import { validateYearMonthFormat, validatePathWithinBase } from '../utils/security.js';

/**
 * Main function for brag-sum command
 */
async function main(): Promise<void> {
  const args = minimist(process.argv.slice(2));
  const yearMonthArg = args._[0] as string | undefined;

  // Validate input
  if (!yearMonthArg) {
    console.error('Error: Please provide year-month in YYYY-MM format');
    console.error('Usage: brag-sum YYYY-MM');
    console.error('Example: brag-sum 2026-01');
    process.exit(1);
  }

  try {
    // Security: Validate and sanitize year-month format
    const yearMonth = validateYearMonthFormat(yearMonthArg);

    // Validate API key exists
    validateConfig();

    // Get all log files for the month
    console.log(`Finding logs for ${yearMonth}...`);
    const logFiles = await getMonthLogs(yearMonth);

    if (logFiles.length === 0) {
      console.error(`No logs found for ${yearMonth}`);
      console.error('Please create some daily logs first using: brag-add');
      process.exit(1);
    }

    console.log(`Found ${logFiles.length} log(s)`);

    // Read and combine all logs
    console.log('Reading logs...');
    const allLogs: string[] = [];
    for (const logFile of logFiles) {
      // Security: Validate each log file path is within logs directory
      validatePathWithinBase(logFile, config.logsDir);
      const content = await readFile(logFile);
      allLogs.push(content);
    }

    const combinedLogs = allLogs.join('\n\n---\n\n');

    // Generate summary using AI
    console.log('Generating monthly summary with AI...');
    console.log('This may take a moment...\n');

    const prompt = createSummaryPrompt(combinedLogs);
    const summary = await generateContent(prompt);

    // Write summary to file
    const summaryPath = join(config.summariesDir, `${yearMonth}-summary.md`);

    // Security: Validate the constructed path is within summaries directory
    validatePathWithinBase(summaryPath, config.summariesDir);

    await writeFile(summaryPath, summary);

    console.log(`✓ Successfully generated monthly summary`);
    console.log(`  File: ${basename(summaryPath)}`);
    console.log(`\nYou can now review and edit the summary file.`);
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
