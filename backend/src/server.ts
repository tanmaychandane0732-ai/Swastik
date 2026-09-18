import app from './app';
import { env } from './config/env';
import { dataRepository } from './repositories/dataRepository';

const server = app.listen(env.PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 FINQUEST FINANCIAL FLIGHT CONTROL SERVER`);
  console.log(`📡 Listening on http://localhost:${env.PORT}`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
  console.log(`====================================================`);

  const hasDb = await dataRepository.testConnection();
  if (hasDb) {
    console.log(`✅ Database: Connected to PostgreSQL via Prisma ORM`);
  } else {
    console.log(`⚡ Database: PostgreSQL offline. 100% resilient In-Memory Store active with Indian Reality Scenarios pre-seeded.`);
  }
});

// Graceful Shutdown
const shutdown = () => {
  console.log('\n🛑 Initiating graceful touchdown of FinQuest Flight Server...');
  server.close(() => {
    console.log('✈️ Flight Server safely landed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

