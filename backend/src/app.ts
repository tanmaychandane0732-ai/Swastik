import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { dataRepository } from './repositories/dataRepository';

// Route imports
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import aiRoutes from './routes/aiRoutes';
import challengeRoutes from './routes/challengeRoutes';
import classroomRoutes from './routes/classroomRoutes';
import { optionalAuth } from './middleware/authMiddleware';

const app = express();

// Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Health & System Telemetry Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const isPrismaConnected = await dataRepository.testConnection();
  res.status(200).json({
    status: 'HEALTHY',
    service: 'FinQuest Flight Control Backend',
    version: '2.0.0-hackathon',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      mode: isPrismaConnected ? 'PostgreSQL (Prisma ORM)' : 'Resilient In-Memory High-Speed Cache',
      operational: true,
    },
    aiCoach: {
      provider: env.GEMINI_API_KEY ? 'Google Gemini AI' : 'Deterministic Indian Financial Flight Instructor',
      ready: true,
    },
  });
});

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/classroom', classroomRoutes);

// Direct scenario & badge endpoints
app.get('/api/scenarios', async (req: Request, res: Response, next) => {
  try {
    const scenarios = await dataRepository.listScenarios();
    res.status(200).json({ success: true, data: scenarios });
  } catch (err) {
    next(err);
  }
});

app.get('/api/badges', optionalAuth, async (req: any, res: Response, next) => {
  try {
    const userId = req.user?.userId;
    const allBadges = await dataRepository.listBadges();
    const userBadges = userId ? await dataRepository.getUserBadges(userId) : [];
    res.status(200).json({
      success: true,
      data: {
        allBadges,
        userBadges,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 404 Catch-All
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Flight deck path not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;

