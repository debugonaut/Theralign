import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded (loads from server root)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProd = process.env.NODE_ENV === 'production';

// Core variables required in all environments
const requiredVars = ['JWT_SECRET', 'CLIENT_URL'];

// Additional production-hardening requirements
if (isProd) {
  requiredVars.push(
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  );
}

const missingVars = [];

// Validate Mongo URI (either MONGODB_URI or MONGO_URI)
const mongoUriVal = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUriVal) {
  missingVars.push('MONGODB_URI / MONGO_URI');
}

for (const key of requiredVars) {
  if (!process.env[key]) {
    missingVars.push(key);
  }
}

if (missingVars.length > 0) {
  console.error(`\n[FATAL STARTUP ERROR] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please configure these variables in the server/.env file or dashboard before running the server.\n');
  process.exit(1);
}

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: mongoUriVal,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  clientUrl: process.env.CLIENT_URL,
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  
  ai: {
    openaiKey: process.env.OPENAI_API_KEY || '',
  }
};

// Freeze the config object to prevent accidental runtime modifications
Object.freeze(config);

export default config;
