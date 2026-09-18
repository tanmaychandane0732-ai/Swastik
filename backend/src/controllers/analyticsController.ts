import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { decisionDnaService } from '../services/decisionDnaService';
import { riskRadarService } from '../services/riskRadarService';
import { whatIfService } from '../services/whatIfService';

export const decisionDnaSchema = z.object({
  cash: z.number(),
  debt: z.number(),
  invested: z.number().optional(),
  creditScore: z.number(),
  decisionsHistory: z.array(
    z.object({
      scenarioId: z.string().optional(),
      choiceId: z.string(),
      isOptimal: z.boolean().optional(),
      cashDelta: z.number().optional(),
      debtDelta: z.number().optional(),
    })
  ),
});

export const riskRadarSchema = z.object({
  cash: z.number(),
  debt: z.number(),
  monthlyIncome: z.number().optional(),
  monthlyExpenses: z.number().optional(),
  creditScore: z.number(),
  scamChoiceCount: z.number().optional(),
  speculativeChoiceCount: z.number().optional(),
  impulseChoiceCount: z.number().optional(),
});

export const whatIfSchema = z.object({
  startingCash: z.number(),
  startingDebt: z.number(),
  monthlySavingsActual: z.number(),
  monthlyDebtPaymentActual: z.number(),
  actualInterestRateAnnual: z.number(),
  monthlySavingsCounterfactual: z.number(),
  monthlyDebtPaymentCounterfactual: z.number(),
  counterfactualInterestRateAnnual: z.number(),
  scenarioTitle: z.string().optional(),
});

export class AnalyticsController {
  public static async getDecisionDna(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = decisionDnaService.analyze(req.body);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getRiskRadar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = riskRadarService.calculate(req.body);
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getWhatIf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projection = whatIfService.simulateDivergence(req.body);
      res.status(200).json({
        success: true,
        data: projection,
      });
    } catch (error) {
      next(error);
    }
  }
}

