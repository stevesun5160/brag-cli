import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from '../config.js'

/**
 * Load a prompt template from the prompts directory
 * @param filename - Name of the prompt file to load
 * @returns The prompt template content
 */
function loadPromptTemplate(filename: string): string {
  const filePath = join(config.promptsDir, filename)
  return readFileSync(filePath, 'utf-8')
}

/**
 * Create a prompt for polishing daily journal content
 * @param journalContent - The raw journal content from Work Journal section
 * @returns Prompt for AI to polish the content
 */
export function createPolishPrompt(journalContent: string): string {
  // Security: Use structured format to separate system instructions from user content
  // This prevents prompt injection by clearly delimiting what is user input
  const template = loadPromptTemplate('polish-prompt.md')
  const escapedContent = journalContent.replace(/<\/?USER_INPUT>/g, '')
  return template.replace('{{USER_INPUT}}', escapedContent)
}

/**
 * Create a prompt for generating monthly summary
 * @param monthlyLogs - Combined content from all logs in the month
 * @returns Prompt for AI to generate summary
 */
export function createSummaryPrompt(monthlyLogs: string): string {
  // Security: Use structured format to separate system instructions from user content
  const template = loadPromptTemplate('summary-prompt.md')
  const escapedContent = monthlyLogs.replace(/<\/?USER_INPUT>/g, '')
  return template.replace('{{USER_INPUT}}', escapedContent)
}
