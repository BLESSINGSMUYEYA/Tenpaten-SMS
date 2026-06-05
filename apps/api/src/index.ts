import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

// ---- Server Boot ----
const PORT = env.PORT || 4000;

async function startServer() {
  // Connect to PostgreSQL
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Tenpaten SMS API running on http://localhost:${PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful Shutdown
  const shutdown = async () => {
    console.log('Stopping server gracefully...');
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
