import OpenAI from 'openai';
import config from './env.js';

let openaiClient = null;

export const getOpenAIClient = () => {
  if (!config.ai.openaiKey) {
    return null; // Caller must handle null gracefully
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: config.ai.openaiKey });
  }

  return openaiClient;
};
