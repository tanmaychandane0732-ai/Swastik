import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { challengeService } from '../services/challengeService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getGuestUserId } from "../utils/guestUser";

export const attemptChallengeSchema = z.object({
  optionId: z.string(),
});

export class ChallengeController {
  public static async getDaily(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string | undefined;
      const dilemma = await challengeService.getDailyChallenge(dateStr);

      res.status(200).json({
        success: true,
        data: dilemma,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async attempt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const { optionId } = req.body;
      const userId = req.user?.userId || await getGuestUserId();

      const result = await challengeService.submitAttempt(userId, id, optionId);

      res.status(200).json({
        success: true,
        message: result.isOptimal
          ? 'Clear maneuver! Maximum community resilience points awarded.'
          : 'Encountered risk turbulence in daily scenario.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
