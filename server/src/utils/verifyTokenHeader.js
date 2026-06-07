import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Lightweight JWT check for rate-limit tiering only (no DB lookup).
 */
export const hasValidAuthToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return false;
  try {
    jwt.verify(authHeader.split(' ')[1], config.jwtSecret);
    return true;
  } catch {
    return false;
  }
};
