import app from './src/app';
import { connectDB } from './src/config/db';
import logger from './src/utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`SkillNexa Backend API Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`Health check available at http://localhost:${PORT}/api/health`);
  });

  const handleShutdown = () => {
    logger.info('Received shutdown signal. Gracefully closing server...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
};

startServer().catch((err) => {
  logger.error(`Fatal error starting server: ${err.message}`);
});
