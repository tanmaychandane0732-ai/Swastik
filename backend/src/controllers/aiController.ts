import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiService } from '../services/aiService';
import { env } from '../config/env';

export const aiCoachSchema = z.object({
  choiceLabel: z.string(),
  choiceDescription: z.string().optional(),
  scenarioTitle: z.string(),
  cash: z.number(),
  debt: z.number(),
  creditScore: z.number(),
  cashDelta: z.number(),
  debtDelta: z.number(),
  isOptimal: z.boolean(),
});

export class AIController {
  public static async explain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const explanation = await aiService.explainDecision(req.body);
      res.status(200).json({
        success: true,
        data: explanation,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async status(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hasKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== "");
      res.status(200).json({
        success: true,
        data: {
          provider: hasKey ? "Google Gemini AI" : "Deterministic Indian Financial Flight Instructor",
          isConfigured: hasKey,
          operational: true,
          model: hasKey ? "gemini-1.5-flash" : "deterministic-flight-coach-v2",
          rulesEngine: "Indian Aviation & Financial Regulatory Framework (RBI/SEBI/CIBIL/1930)",
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

