import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { financialIqService } from '../services/financialIqService';
import { dataRepository } from '../repositories/dataRepository';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getGuestUserId } from "../utils/guestUser";

export const evaluateAssessmentSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      category: z.enum(['budget', 'debt', 'scam', 'investing', 'insurance']),
      scenario: z.string(),
      question: z.string(),
      options: z.array(
        z.object({
          id: z.string(),
          text: z.string(),
          isCorrect: z.boolean(),
          explanation: z.string(),
          points: z.number(),
        })
      ),
    })
  ),
  selectedOptionIds: z.record(z.string(), z.string()),
});

export const submitAssessmentSchema = z.object({
  type: z.enum(['PRE_FLIGHT', 'POST_FLIGHT']),
  result: z.object({
    totalScore: z.number(),
    categoryScores: z.object({
      budget: z.number(),
      debt: z.number(),
      scam: z.number(),
      investing: z.number(),
      insurance: z.number(),
    }),
    tier: z.enum([
      'Pre-Flight Cadet',
      'Co-Pilot in Training',
      'Licensed Financial Aviator',
      'Elite Squadron Commander',
    ]),
    completedAt: z.string().optional(),
  }),
  sessionId: z.string().optional(),
});

export const computeDeltaSchema = z.object({
  preResult: z.object({
    totalScore: z.number(),
    categoryScores: z.any(),
    tier: z.string(),
  }),
  postResult: z.object({
    totalScore: z.number(),
    categoryScores: z.any(),
    tier: z.string(),
  }),
});

export class AssessmentController {
  public static async evaluate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questions, selectedOptionIds } = req.body;
      const evaluation = financialIqService.evaluateSubmission(questions, selectedOptionIds);

      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async submit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || await getGuestUserId();
      const { type, result, sessionId } = req.body;

      const saved = await financialIqService.saveAssessment(userId, type, result, sessionId);

      res.status(201).json({
        success: true,
        message: `${type === 'PRE_FLIGHT' ? 'Pre-Flight' : 'Post-Flight'} diagnostic certified.`,
        data: saved,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async computeDelta(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { preResult, postResult } = req.body;
      const delta = financialIqService.computeDelta(preResult, postResult);

      res.status(200).json({
        success: true,
        data: delta,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async listUserAssessments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || 'guest_user';
      const assessments = await dataRepository.getUserAssessments(userId);

      res.status(200).json({
        success: true,
        data: assessments,
      });
    } catch (error) {
      next(error);
    }
  }
}

