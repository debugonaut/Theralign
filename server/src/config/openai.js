import { GoogleGenerativeAI } from '@google/generative-ai';
import config from './env.js';

let geminiClient = null;

export const getOpenAIClient = () => {
  if (!config.ai.openaiKey) return null;

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(config.ai.openaiKey);
  }

  return geminiClient;
};
