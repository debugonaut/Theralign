import app from './app.js';
import config from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import logger from './src/utils/logger.js';

// Define immediate startup routine
const startServer = async () => {
  try {
    // 1. Establish database connection first
    await connectDB();

    // 2. Start Express HTTP Listener
    const server = app.listen(config.port, () => {
      logger.info(`PhysioConnect Express Server running in [${config.nodeEnv}] on port ${config.port}`);
    });

    // 3. Gracefully manage unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection detected! Shutting down server gracefully...', err);
      server.close(() => {
        process.exit(1);
      });
    });

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
