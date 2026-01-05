/**
 * Configuration for the Brag CLI application
 */
export interface Config {
  /** Gemini API key for AI functionality */
  geminiApiKey: string;
  /** Directory path for storing logs */
  logsDir: string;
  /** Directory path for storing summaries */
  summariesDir: string;
  /** Directory path for templates */
  templatesDir: string;
}

/**
 * Information about a Markdown section
 */
export interface SectionInfo {
  /** Section name (without ## prefix) */
  name: string;
  /** Starting line number (0-based) */
  startLine: number;
  /** Ending line number (0-based) */
  endLine: number;
  /** Content of the section (excluding the title) */
  content: string;
}

/**
 * A log entry with timestamp
 */
export interface LogEntry {
  /** Timestamp in HH:mm format */
  timestamp: string;
  /** Content of the log entry */
  content: string;
}
