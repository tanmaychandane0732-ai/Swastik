// The Express dependency is provided by the backend runtime; keep compilation
// working when its type declarations are unavailable in the current workspace.
// @ts-ignore TS2307: Express is resolved from the backend installation.
import express, { NextFunction, Request, Response } from "express";
// The CORS dependency is provided by the backend runtime; keep compilation
// working when its type declarations are unavailable in the current workspace.
// @ts-ignore TS2307: CORS is resolved from the backend installation.
import cors from "cors";
// The Helmet dependency is provided by the backend runtime; keep compilation
// working when its type declarations are unavailable in the current workspace.
// @ts-ignore TS2307: Helmet is resolved from the backend installation.
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { dataRepository } from "./repositories/dataRepository";
import { databaseManager } from "./config/database";
import { optionalAuth } from "./middleware/authMiddleware";

declare const process: {
  uptime(): number;
};

// Route imports
import authRoutes from "./routes/authRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import assessmentRoutes from "./routes/assessmentRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import aiRoutes from "./routes/aiRoutes";
import challengeRoutes from "./routes/challengeRoutes";
import classroomRoutes from "./routes/classroomRoutes";
import userRoutes from "./routes/userRoutes";
import testRoutes from "./routes/testRoutes";

const app = express();

// Security & Core Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.FRONTEND_URL) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Health Endpoint
app.get("/api/health", async (_req: Request, res: Response) => {
  const isDbConnected = databaseManager.isDatabaseConnected();
  const dbDiagnostics = databaseManager.getDatabaseDiagnostics();

  res.status(200).json({
    status: "HEALTHY",
    service: "FinQuest Flight Control Backend",
    version: "2.0.0-hackathon",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      type: "mongodb",
      connected: isDbConnected,
      mode: isDbConnected ? "persistent" : "in-memory",
      persistence: isDbConnected ? "ENABLED" : "DISABLED",
      operational: true,
      isAtlas: dbDiagnostics.isAtlas,
      target: dbDiagnostics.maskedUrl,
    },
    aiCoach: {
      provider: env.GEMINI_API_KEY
        ? "Google Gemini AI"
        : "Deterministic Indian Financial Flight Instructor",
      ready: true,
    },
  });
});

// Dedicated Database Status Endpoint
app.get("/api/health/db", async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    database: databaseManager.getDatabaseDiagnostics(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/classroom", classroomRoutes);
if (env.NODE_ENV !== "production") {
  app.use("/api/test", testRoutes);
}

// Scenarios
app.get(
  "/api/scenarios",
  async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const scenarios = await dataRepository.listScenarios();
    res.status(200).json({ success: true, data: scenarios });
  } catch (err) {
    next(err);
  }
  }
);

// Badges
app.get(
  "/api/badges",
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const allBadges = await dataRepository.listBadges();
    const userBadges = userId
      ? await dataRepository.getUserBadges(userId)
      : [];

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
  }
);

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Flight deck path not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error Handler
app.use(errorHandler);

export default app;