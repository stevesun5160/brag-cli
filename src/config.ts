import { config as loadEnv } from 'dotenv'
import os from 'os'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import type { Config } from './types/index.js'

function expandEnvPath(input: string | undefined): string | undefined {
  if (!input) return input

  // 展開 $HOME
  if (input.startsWith('$HOME')) {
    return join(os.homedir(), input.replace('$HOME', ''))
  }

  // 展開 ~
  if (input.startsWith('~')) {
    return join(os.homedir(), input.slice(1))
  }

  return input
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

// Load environment variables from .env file
loadEnv({ path: join(projectRoot, '.env') })

/**
 * Application configuration
 */
export const config: Config = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  logsDir: expandEnvPath(process.env.LOGS_DIR) || join(projectRoot, 'logs'),
  summariesDir: expandEnvPath(process.env.SUMMARIES_DIR) || join(projectRoot, 'summaries'),
  templatesDir: join(projectRoot, 'templates'),
}

/**
 * Validate that all required configuration is present
 * @throws {Error} If required configuration is missing
 */
export function validateConfig(): void {
  if (!config.geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Please create a .env file with your API key.\n' +
        'Get your API key from: https://aistudio.google.com/apikey'
    )
  }
}
