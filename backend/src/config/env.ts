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
  APP_TIMEZONE: z.string().default('Asia/Kolkata'),
  FREE_DAILY_GAME_LIMIT: z.string().default('3').transform((val) => parseInt(val, 10)),
  PREMIUM_DAILY_GAME_LIMIT: z.string().default('25').transform((val) => parseInt(val, 10)),
  FREE_DAILY_AI_LIMIT: z.string().default('5').transform((val) => parseInt(val, 10)),
  PREMIUM_DAILY_AI_LIMIT: z.string().default('50').transform((val) => parseInt(val, 10)),
  PAYMENT_ENV: z.enum(['test', 'live']).default('test'),
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
  RAZORPAY_PREMIUM_PLAN_ID: z.string().optional().default(''),
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
