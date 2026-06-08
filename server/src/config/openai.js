import Groq from 'groq-sdk';
import config from './env.js';

let groqClient = null;

export const getOpenAIClient = () => {
  if (!config.ai.openaiKey) return null;

  if (!groqClient) {
    groqClient = new Groq({ apiKey: config.ai.openaiKey });
  }

  return groqClient;
};
