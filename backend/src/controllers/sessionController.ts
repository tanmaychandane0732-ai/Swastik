import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { simulationEngine } from '../services/simulationEngine';
import { dataRepository } from '../repositories/dataRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getGuestUserId } from "../utils/guestUser"

export const createSessionSchema = z.object({
  scenarioType: z.string().optional(),
  startingCash: z.number().optional(),
  startingDebt: z.number().optional(),
  pilotCallsign: z.string().optional(),
});

export const advanceMonthSchema = z.object({
  scenarioId: z.string(),
  choiceId: z.string(),
  choiceText: z.string(),
  cashDelta: z.number(),
  debtDelta: z.number(),
  isOptimal: z.boolean(),
  explanation: z.string().optional(),
  whyExplanation: z.string().optional(),
  category: z.string().optional(),
});

export class SessionController {
  public static async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
     const userId = req.user?.userId || await getGuestUserId();
      const { scenarioType, startingCash, startingDebt, pilotCallsign } = req.body;

      const result = await simulationEngine.startSession({
        userId,
        scenarioType,
        startingCash,
        startingDebt,
        pilotCallsign,
      });

      res.status(201).json({
        success: true,
        message: 'Financial flight simulator session initiated.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async listSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || 'guest_user';
      const sessions = await dataRepository.getUserSessions(userId);

      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const session = await dataRepository.getSessionById(id);
      if (!session) {
        res.status(404).json({ success: false, message: 'Flight session not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async advanceMonth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const stepResult = await simulationEngine.advanceMonth(id, req.body);

      res.status(200).json({
        success: true,
        message: stepResult.isCompleted
          ? 'Flight mission completed! Landing report generated.'
          : 'Month advanced successfully.',
        data: stepResult,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const report = await simulationEngine.getSessionReport(id);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}
