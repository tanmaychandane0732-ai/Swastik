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

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'model']),
        content: z.string(),
      })
    )
    .optional(),
  context: z
    .object({
      stage: z.string().optional(),
      financialHealth: z.number().optional(),
      netWorth: z.number().optional(),
      score: z.number().optional(),
      playerName: z.string().optional(),
    })
    .optional(),
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

  public static async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const chatResponse = await aiService.chat(req.body);
      res.status(200).json({
        success: true,
        data: chatResponse,
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
