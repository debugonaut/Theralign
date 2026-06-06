import app from './app.js';
import config from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import logger from './src/utils/logger.js';
import { initReminderJob } from './src/jobs/reminderJob.js';

// ==========================================
// PROCESS SAFETY NETS & LOGS
// ==========================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at promise:', promise, 'reason:', reason);
  // Do NOT crash the server in production — log and continue
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown! Fatal state, exiting...', err);
  process.exit(1); // Exit process immediately — let Render/container supervisor restart
});

// Define immediate startup routine
const startServer = async () => {
  try {
    // 1. Start Express HTTP Listener immediately so Render detects the port
    const server = app.listen(config.port, () => {
      logger.info(`Theralign Express Server running in [${config.nodeEnv}] on port ${config.port}`);
    });

    // 2. Establish database connection + run seeds in background
    connectDB().catch((err) => {
      logger.error('Background DB init failed:', err);
    });

    // 3. Initialize scheduled background jobs
    initReminderJob();

    process.on('SIGTERM', () => {
      logger.warn('SIGTERM signal received. Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    });
  } catch (startupError) {
    logger.error('Fatal failure occurred during API startup routine:', startupError);
    process.exit(1);
  }
};

// Initiate server launch
startServer();
