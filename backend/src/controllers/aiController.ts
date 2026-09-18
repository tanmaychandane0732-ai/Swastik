import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiService } from '../services/aiService';

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
}

