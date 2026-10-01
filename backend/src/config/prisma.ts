import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: process.env.PRISMA_DEBUG === "true" ? ["query", "error", "warn"] : ["warn"],
  });

const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
  .process?.env?.NODE_ENV;

if (nodeEnv !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;