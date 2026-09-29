import app from "./app";
import { env } from "./config/env";
import prisma from "./config/prisma";

declare const console: {
  log: (...data: unknown[]) => void;
  error: (...data: unknown[]) => void;
};

declare const process: {
  exit: (code?: number) => never;
  on: (event: string, listener: () => void | Promise<void>) => void;
};

const server = app.listen(env.PORT, async () => {
  console.log("====================================================");
  console.log("🚀 FINQUEST FINANCIAL FLIGHT CONTROL SERVER");
  console.log(`📡 Listening on http://localhost:${env.PORT}`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
  console.log("====================================================");

  try {
    await prisma.$connect();
    console.log("✅ Database: Connected to MongoDB via Prisma ORM");
  } catch (error) {
    console.error("❌ Database: MongoDB connection failed");
    console.error(error);
  }
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("\n🛑 Initiating graceful touchdown of FinQuest Flight Server...");

  await prisma.$disconnect();

  server.close(() => {
    console.log("✈️ Flight Server safely landed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);