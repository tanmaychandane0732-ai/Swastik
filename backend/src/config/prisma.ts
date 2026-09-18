import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let isPrismaAvailable = false;

try {
  prisma = new PrismaClient({
    log: [],
  });
  isPrismaAvailable = true;
} catch {
  isPrismaAvailable = false;
  prisma = null;
}

export { prisma, isPrismaAvailable };

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!prisma || !isPrismaAvailable) {
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

