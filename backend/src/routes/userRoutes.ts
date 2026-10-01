import { Request, Response, Router, NextFunction } from "express";
import { requireAuth, optionalAuth } from "../middleware/authMiddleware";
import { authService } from "../services/authService";
import { dataRepository } from "../repositories/dataRepository";

const router = Router();

// GET /api/users/profile - Returns current user profile with pilot data
router.get("/profile", requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized pilot." });
      return;
    }

    const user = await authService.getProfile(userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile - Updates current user profile metrics
router.put("/profile", requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized pilot." });
      return;
    }

    const updatedProfile = await dataRepository.updateProfile(userId, req.body);
    res.status(200).json({
      success: true,
      message: "Flight profile telemetry updated successfully.",
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/users - Root endpoint
router.get("/", optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.userId) {
      const user = await authService.getProfile(req.user.userId);
      res.status(200).json({ success: true, data: user });
      return;
    }
    res.status(200).json({ success: true, message: "FinQuest User Management Service operational." });
  } catch (error) {
    next(error);
  }
});

// Test and Seed routes (Development)
router.get("/test", async (_req: Request, res: Response): Promise<void> => {
  try {
    const scenarios = await dataRepository.listScenarios();
    res.json({
      success: true,
      message: "User service operational",
      scenarioCount: scenarios.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Service error",
    });
  }
});

router.post("/seed", async (_req: Request, res: Response): Promise<void> => {
  try {
    const user = await dataRepository.createUser({
      name: "Shreyas",
      email: "shreyas@test.com",
      passwordHash: "demo123",
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
});

export default router;
