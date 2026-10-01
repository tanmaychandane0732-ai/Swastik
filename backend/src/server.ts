import app from "./app";
import { env } from "./config/env";
import { databaseManager } from "./config/database";

declare const console: {
  log: (...data: unknown[]) => void;
  error: (...data: unknown[]) => void;
  warn: (...data: unknown[]) => void;
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
  console.log("====================================================");

  try {
    await databaseManager.initializeDatabase();
  } catch (err: any) {
    if (env.NODE_ENV === "production") {
      console.error("🛑 Server aborting due to database initialization failure in production.");
      process.exit(1);
    }
  }

  console.log(`🩺 Health check: http://localhost:${env.PORT}/api/health`);
  console.log("====================================================");
});

// Graceful Shutdown
const shutdown = async () => {
  console.log("\n🛑 Initiating graceful touchdown of FinQuest Flight Server...");

  await databaseManager.disconnectDatabase();

  server.close(() => {
    console.log("✈️ Flight Server safely landed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);