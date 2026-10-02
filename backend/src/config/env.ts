import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

// Resolve .env location robustly whether launched from root or backend directory
const candidateEnvPaths = [
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const developmentJwtSecret = 'finquest_super_secret_jwt_key_hackathon_2026_gd01_flight_sim';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('mongodb://localhost:27017/finquest'),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().optional().default(''),
  PRISMA_DEBUG: z.string().optional().default('false'),
});

const parsedEnv = envSchema.parse(process.env);

if (
  parsedEnv.NODE_ENV === 'production' &&
  (!parsedEnv.JWT_SECRET ||
    parsedEnv.JWT_SECRET.length < 32 ||
    parsedEnv.JWT_SECRET === developmentJwtSecret)
) {
  throw new Error('JWT_SECRET must be set to a unique value in production.');
}

export const env = {
  ...parsedEnv,
  JWT_SECRET: parsedEnv.JWT_SECRET || developmentJwtSecret,
};
