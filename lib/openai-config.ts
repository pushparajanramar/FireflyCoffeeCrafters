// OpenAI Configuration
export const OPENAI_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4-vision-preview',
  maxTokens: 1000,
  temperature: 0.1, // Low temperature for consistent vision analysis
} as const;

// Validate that the API key is available
if (!OPENAI_CONFIG.apiKey && process.env.NODE_ENV !== 'development') {
  console.warn('OPENAI_API_KEY environment variable is not set');
}