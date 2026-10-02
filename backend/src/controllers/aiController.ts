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

export const aiScenarioSchema = z.object({
  topic: z.enum(['budgeting', 'debt', 'investments', 'scams', 'emergency']).optional(),
  difficulty: z.enum(['cadet', 'navigator', 'commander']).optional(),
});

export const aiConceptSchema = z.object({
  concept: z.string().min(1, 'Concept name is required'),
});

export const aiScamSchema = z.object({
  message: z.string().min(1, 'Simulated scam message is required'),
  sender: z.string().optional(),
  offerType: z.string().optional(),
});

export const aiWhatIfSchema = z.object({
  eventTitle: z.string().min(1),
  eventDescription: z.string().min(1),
  currentCash: z.number(),
  currentDebt: z.number(),
  currentScore: z.number(),
});

export const aiFlightReportSchema = z.object({
  playerName: z.string().min(1),
  finalScore: z.number(),
  finalHealth: z.number(),
  finalNetWorth: z.number(),
  completedLevels: z.array(z.string()).default([]),
  badgesEarned: z.array(z.string()).default([]),
});

export class AIController {
  public static async explain(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const explanation = await aiService.analyzeFinancialDecision(req.body);
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
      const chatResponse = await aiService.generateCoachResponse(req.body);
      res.status(200).json({
        success: true,
        data: chatResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async scenario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scenario = await aiService.generateScenario(req.body);
      res.status(200).json({
        success: true,
        data: scenario,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async concept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.explainFinancialConcept(req.body.concept);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async analyzeScam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.analyzeScamCase(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async whatIf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.generateWhatIf(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async flightReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await aiService.generateFlightReportInsight(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async status(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isConfigured = aiService.isConfigured();
      const model = aiService.getModelName();
      res.status(200).json({
        success: true,
        data: {
          provider: isConfigured ? `Google Gemini (${model})` : 'Deterministic Indian Financial Flight Instructor',
          isConfigured,
          operational: true,
          model,
          sdk: '@google/genai',
          rulesEngine: 'Indian Aviation & Financial Regulatory Framework (RBI/SEBI/CIBIL/1930)',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
