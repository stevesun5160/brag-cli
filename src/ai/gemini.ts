import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

let aiClient: GoogleGenAI | null = null;

/**
 * Initialize the Gemini AI client
 * @returns GoogleGenAI client instance
 */
export function initGemini(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return aiClient;
}

/**
 * Generate content using Gemini AI
 * @param prompt - The prompt to send to Gemini
 * @returns Generated text content
 */
export async function generateContent(prompt: string): Promise<string> {
  try {
    const ai = initGemini();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || '';
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to generate content: ${err.message}`);
  }
}
