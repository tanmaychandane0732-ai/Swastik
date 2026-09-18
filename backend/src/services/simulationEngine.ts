import { dataRepository } from '../repositories/dataRepository';
import { decisionDnaService, DecisionDNAProfile } from './decisionDnaService';
import { riskRadarService, RiskRadarMetrics } from './riskRadarService';
import { InMemoryGameSession, InMemoryDecision } from '../repositories/inMemoryStore';

export interface StartSessionParams {
  userId: string;
  scenarioType?: string;
  startingCash?: number;
  startingDebt?: number;
  monthlyIncome?: number;
  pilotCallsign?: string;
}

export interface DecisionPayload {
  scenarioId: string;
  choiceId: string;
  choiceText: string;
  cashDelta: number;
  debtDelta: number;
  isOptimal: boolean;
  explanation?: string;
  whyExplanation?: string;
  category?: string;
}

export interface SimulationStepResult {
  session: InMemoryGameSession;
  decisionRecorded: InMemoryDecision;
  isCompleted: boolean;
  stepFeedback: {
    monthlySalary: number;
    mandatoryExpenses: number;
    interestCharged: number;
    cashAfterStep: number;
    debtAfterStep: number;
    cibilChange: number;
    stressChange: number;
    message: string;
  };
  nextScenario?: any;
  finalReport?: any;
}

export class SimulationEngine {
  private readonly MONTHLY_SALARY = 30000;
  private readonly MANDATORY_EXPENSES = 18000; // Rent, groceries, utilities
  private readonly MAX_MONTHS = 6;

  public async startSession(params: StartSessionParams): Promise<{ session: InMemoryGameSession; initialScenario: any }> {
    const {
      userId,
      scenarioType = 'LIFE_SIMULATOR',
      startingCash = 15000,
      startingDebt = 0,
    } = params;

    const session = await dataRepository.createSession({
      userId,
      scenarioType,
      currentMonth: 1,
      totalCash: startingCash,
      totalDebt: startingDebt,
      netWorth: startingCash - startingDebt,
      creditScore: 720,
      stressLevel: 20,
      status: 'IN_PROGRESS',
    });

    const scenarios = await dataRepository.getScenarios();
    const initialScenario = scenarios.find((s) => s.month === 1) || scenarios[0] || null;

    return { session, initialScenario };
  }

  public async advanceMonth(sessionId: string, payload: DecisionPayload): Promise<SimulationStepResult> {
    const session = await dataRepository.findSessionById(sessionId);
    if (!session) {
      const error: any = new Error('Flight session not found.');
      error.statusCode = 404;
      throw error;
    }

    if (session.status === 'COMPLETED') {
      const error: any = new Error('This flight mission has already landed.');
      error.statusCode = 400;
      throw error;
    }

    const currentMonth = session.currentMonth;
    let cash = session.currentCash ?? session.totalCash ?? 10000;
    let debt = session.debt ?? session.totalDebt ?? 0;
    let creditScore = session.creditScore;
    let stressLevel = session.stressLevel ?? 20;

    // 1. Monthly baseline cashflow: +₹30,000 Salary, -₹18,000 Essentials
    const monthlyNetCash = this.MONTHLY_SALARY - this.MANDATORY_EXPENSES; // +12,000
    cash += monthlyNetCash;

    // 2. Compounding interest on revolving debt (3.5% monthly = ~42% APR)
    let interestCharged = 0;
    if (debt > 0) {
      interestCharged = Math.round(debt * 0.035);
      debt += interestCharged;
    }

    // 3. Apply Player Decision Impacts
    cash += payload.cashDelta;
    debt += payload.debtDelta;
    if (debt < 0) {
      cash += Math.abs(debt); // Overpayment returns to cash
      debt = 0;
    }

    // 4. Calculate CIBIL & Stress shifts
    let cibilDelta = 0;
    let stressDelta = 0;

    if (payload.isOptimal) {
      cibilDelta += 8;
      stressDelta -= 6;
    } else {
      cibilDelta -= 12;
      stressDelta += 15;
    }

    // Impact of negative cash / debt spiral
    if (cash < 0) {
      // Overdraft penalty & distress
      debt += Math.abs(cash);
      cash = 0;
      cibilDelta -= 25;
      stressDelta += 20;
    }

    if (debt > 35000) {
      cibilDelta -= 15;
      stressDelta += 18;
    } else if (debt === 0) {
      cibilDelta += 5;
    }

    creditScore = Math.min(850, Math.max(300, creditScore + cibilDelta));
    stressLevel = Math.min(100, Math.max(0, stressLevel + stressDelta));
    const netWorth = cash - debt;

    // 5. Record Decision in Database/Store
    const decisionRecord = await dataRepository.createDecision({
      sessionId: session.id,
      scenarioId: payload.scenarioId,
      month: currentMonth,
      choiceSelected: payload.choiceId,
      cashImpact: payload.cashDelta,
      debtImpact: payload.debtDelta,
      stressImpact: stressDelta,
      cibilImpact: cibilDelta,
      isOptimal: payload.isOptimal,
      explanation: payload.explanation,
    });

    const isLastMonth = currentMonth >= this.MAX_MONTHS;
    const nextMonth = currentMonth + 1;
    const nextStatus = isLastMonth ? 'COMPLETED' : 'IN_PROGRESS';

    // Calculate interim or final flight score (0-1000)
    const baseScore = Math.min(500, Math.max(0, Math.round(netWorth / 150)));
    const cibilComponent = Math.round((creditScore / 850) * 300);
    const stressBonus = Math.round((100 - stressLevel) * 2);
    const totalScore = Math.min(1000, Math.max(100, baseScore + cibilComponent + stressBonus));

    const updatedSession = await dataRepository.updateSession(sessionId, {
      currentMonth: isLastMonth ? currentMonth : nextMonth,
      currentCash: cash,
      totalCash: cash,
      debt,
      totalDebt: debt,
      netWorth,
      creditScore,
      stressLevel,
      score: totalScore,
      status: nextStatus,
    });

    // Check next scenario
    const allScenarios = await dataRepository.getScenarios();
    const nextScenario = isLastMonth ? null : allScenarios.find((s) => s.month === nextMonth) || null;

    let finalReport = null;
    if (isLastMonth) {
      finalReport = await this.getSessionReport(sessionId);
    }

    return {
      session: updatedSession,
      decisionRecorded: decisionRecord,
      isCompleted: isLastMonth,
      stepFeedback: {
        monthlySalary: this.MONTHLY_SALARY,
        mandatoryExpenses: this.MANDATORY_EXPENSES,
        interestCharged,
        cashAfterStep: cash,
        debtAfterStep: debt,
        cibilChange: cibilDelta,
        stressChange: stressDelta,
        message: payload.isOptimal
          ? 'Clear skies! Disciplined choice protected altitude and increased airspeed.'
          : 'Encountered financial turbulence! Extra interest or cash depletion lowered flight stability.',
      },
      nextScenario,
      finalReport,
    };
  }

  public async getSessionReport(sessionId: string): Promise<any> {
    const session = await dataRepository.findSessionById(sessionId);
    if (!session) {
      const error: any = new Error('Flight session not found.');
      error.statusCode = 404;
      throw error;
    }

    const decisions = await dataRepository.getSessionDecisions(sessionId);
    const user = await dataRepository.findUserById(session.userId);

    // Compute Decision DNA Profile
    const dnaProfile = decisionDnaService.analyze({
      cash: session.totalCash,
      debt: session.totalDebt,
      creditScore: session.creditScore,
      decisionsHistory: decisions.map((d) => ({
        choiceId: d.choiceSelected,
        isOptimal: d.isOptimal,
        cashDelta: d.cashImpact,
        debtDelta: d.debtImpact,
      })),
    });

    // Count risky choices for Risk Radar
    const scamCount = decisions.filter((d) => !d.isOptimal && d.choiceSelected.toLowerCase().includes('scam')).length;
    const impulseCount = decisions.filter((d) => !d.isOptimal && (d.choiceSelected.toLowerCase().includes('splurge') || d.choiceSelected.toLowerCase().includes('emi'))).length;

    // Compute 6-axis Risk Radar
    const riskRadar = riskRadarService.calculate({
      cash: session.totalCash,
      debt: session.totalDebt,
      creditScore: session.creditScore,
      scamChoiceCount: scamCount,
      impulseChoiceCount: impulseCount,
    });

    // Determine flight status
    let flightStatus: 'smooth' | 'turbulent' | 'crash' = 'smooth';
    if (session.netWorth < 0 || session.totalDebt > 40000 || session.creditScore < 580) {
      flightStatus = 'crash';
    } else if (session.totalDebt > 15000 || session.stressLevel > 65) {
      flightStatus = 'turbulent';
    }

    // Build flight logs
    const flightLogs = decisions.map((d) => ({
      month: d.month,
      scenarioTitle: `Month ${d.month} Flight Checkpoint`,
      choiceSelected: d.choiceSelected,
      cashDelta: d.cashImpact,
      debtDelta: d.debtImpact,
      netWorthResult: session.netWorth,
      isOptimal: d.isOptimal,
      turbulenceReason: d.isOptimal ? undefined : 'Unfavorable compounding or liquidity drain',
    }));

    // Key lessons summary
    const keyLessons = [
      session.totalDebt === 0
        ? 'Maintained zero revolving liabilities: saved over ₹14,000 in compounding 42% credit card interest.'
        : 'Revolving high-interest liabilities create severe drag on monthly airspeed.',
      session.totalCash >= 20000
        ? 'Maintained emergency runway buffer: ready for unforeseen engine turbulence.'
        : 'Low liquid reserves leave the aircraft vulnerable to sudden emergency shocks.',
      session.creditScore >= 750
        ? 'Excellent CIBIL score (750+): unlocks lowest prime lending rates and premium financial privileges.'
        : 'CIBIL score dropped below prime tier: prioritize timely repayments to repair credit altitude.',
    ];

    return {
      flightStatus,
      captainName: user?.name || 'Cadet Pilot',
      flightDurationMonths: session.currentMonth,
      finalAltitude: session.netWorth,
      fuelRemaining: session.totalCash,
      airspeed: this.MONTHLY_SALARY - this.MANDATORY_EXPENSES,
      totalDebt: session.totalDebt,
      cibilScore: session.creditScore,
      overallScore: session.score,
      decisionDNA: dnaProfile,
      riskRadar,
      flightLogs,
      keyLessons,
    };
  }
}

export const simulationEngine = new SimulationEngine();
