import { HealthStatus, ScamTarget } from '../types/game';

/**
 * Evaluates budget allocation against the standard 50/30/20 rule:
 * - 50% Needs
 * - 30% Wants
 * - 20% Savings
 */
export function calculateBudgetScore(
  income: number,
  needs: number,
  wants: number,
  savings: number
): {
  score: number;
  healthDelta: number;
  netWorthDelta: number;
  status: HealthStatus;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
  allocatedPct: number;
  feedback: string;
  isBalanced: boolean;
} {
  if (income <= 0) {
    return {
      score: 0,
      healthDelta: -10,
      netWorthDelta: 0,
      status: 'critical',
      needsPct: 0,
      wantsPct: 0,
      savingsPct: 0,
      allocatedPct: 0,
      feedback: 'Invalid income value.',
      isBalanced: false,
    };
  }

  const needsPct = Math.round((needs / income) * 100);
  const wantsPct = Math.round((wants / income) * 100);
  const savingsPct = Math.round((savings / income) * 100);
  const allocatedPct = needsPct + wantsPct + savingsPct;

  // Over-budget deficit check
  if (needs + wants + savings > income) {
    const deficit = (needs + wants + savings) - income;
    return {
      score: 250,
      healthDelta: -25,
      netWorthDelta: -deficit,
      status: 'critical',
      needsPct,
      wantsPct,
      savingsPct,
      allocatedPct,
      feedback: `Budget Deficit! You allocated ${allocatedPct}% of your income. Overspending forces you into high-interest debt!`,
      isBalanced: false,
    };
  }

  // Calculate deviation from target 50 / 30 / 20
  // Deviations:
  // Needs: target 50 (tolerance +/- 5%)
  // Wants: target 30 (tolerance: lower is ok, higher is penalized)
  // Savings: target 20 (tolerance: higher is rewarded, lower penalized)
  let penalty = 0;
  
  if (needsPct > 50) {
    penalty += (needsPct - 50) * 12;
  }
  if (wantsPct > 30) {
    penalty += (wantsPct - 30) * 18; // heavy penalty for lifestyle inflation
  }
  if (savingsPct < 20) {
    penalty += (20 - savingsPct) * 20; // very heavy penalty for not saving
  }

  // Unallocated money that is left over counts positively if not zero, but optimum is full plan
  const unallocated = income - (needs + wants + savings);

  let baseScore = Math.max(100, Math.min(1000, 1000 - penalty));

  // Health and net worth changes
  let healthDelta = 0;
  let status: HealthStatus = 'healthy';
  let feedback = '';

  if (savingsPct >= 20 && wantsPct <= 30 && needsPct <= 50) {
    status = 'excellent';
    baseScore = Math.max(baseScore, 950);
    healthDelta = +15;
    feedback = 'Flawless 50/30/20 Discipline! You secured essential needs, kept lifestyle spending under 30%, and stored at least 20% into wealth-building savings.';
  } else if (savingsPct >= 15 && wantsPct <= 35 && needsPct <= 55) {
    status = 'healthy';
    healthDelta = +8;
    feedback = 'Solid Financial Balance! Very close to the golden 50/30/20 benchmark. A slight trim on wants will supercharge your emergency reserves.';
  } else if (savingsPct < 10) {
    status = 'warning';
    healthDelta = -8;
    feedback = 'Savings Vulnerability: Allocating under 10% to savings leaves you exposed to unexpected financial emergencies and medical surprises.';
  } else if (wantsPct > 40) {
    status = 'warning';
    healthDelta = -12;
    feedback = 'Lifestyle Inflation Alert: Over 40% allocated to Wants! Discretionary splurges are eating into your long-term compound growth.';
  } else {
    status = 'critical';
    healthDelta = -15;
    feedback = 'Unbalanced Budget: High fixed commitments and low savings create immediate cashflow stress.';
  }

  // Net worth delta is basically the saved amount for the month
  const netWorthDelta = savings + Math.round(unallocated * 0.5);

  return {
    score: baseScore,
    healthDelta,
    netWorthDelta,
    status,
    needsPct,
    wantsPct,
    savingsPct,
    allocatedPct,
    feedback,
    isBalanced: status === 'excellent' || status === 'healthy',
  };
}

/**
 * Calculates compound interest growth for debt scenarios
 * Demonstrates the mathematical danger of minimum monthly payments vs paying in full
 */
export function calculateCompoundDebt(
  principal: number,
  annualRatePct: number,
  monthlyPayment: number,
  monthsCount: number = 24
): {
  months: number[];
  balances: number[];
  totalInterestPaid: number;
  isCompoundingOutOfControl: boolean;
  totalPaid: number;
  payoffMonth: number | null;
} {
  const monthlyRate = annualRatePct / 100 / 12;
  const months: number[] = [];
  const balances: number[] = [];
  let currentBalance = principal;
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let payoffMonth: number | null = null;

  for (let m = 0; m <= monthsCount; m++) {
    months.push(m);
    balances.push(Math.max(0, Math.round(currentBalance)));

    if (currentBalance <= 0 && payoffMonth === null) {
      payoffMonth = m;
    }

    if (currentBalance > 0) {
      // If paying in full within month 0 (grace period), no interest is incurred
      if (monthlyPayment >= currentBalance && m === 0) {
        totalPaid += currentBalance;
        currentBalance = 0;
      } else {
        const monthlyInterest = currentBalance * monthlyRate;
        totalInterestPaid += monthlyInterest;
        
        const totalDue = currentBalance + monthlyInterest;
        const payment = Math.min(monthlyPayment, totalDue);
        totalPaid += payment;
        currentBalance = Math.max(0, totalDue - payment);
      }
    }
  }

  // Debt is compounding out of control if after 12 months balance is still high or interest exceeds 30% of principal
  const isCompoundingOutOfControl = balances[12] >= principal * 0.7 || totalInterestPaid >= principal * 0.3;

  return {
    months,
    balances,
    totalInterestPaid: Math.round(totalInterestPaid),
    isCompoundingOutOfControl,
    totalPaid: Math.round(totalPaid),
    payoffMonth,
  };
}

/**
 * Determines streak multiplier based on consecutive smart financial choices
 */
export function calculateStreakMultiplier(streak: number): number {
  if (streak >= 7) return 2.0;
  if (streak >= 5) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
}

/**
 * Computes overall Financial Health score (0 to 100)
 */
export function calculateFinancialHealthScore(
  baseHealth: number,
  delta: number
): { score: number; status: HealthStatus } {
  const score = Math.max(0, Math.min(100, Math.round(baseHealth + delta)));
  let status: HealthStatus = 'healthy';
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'healthy';
  else if (score >= 40) status = 'warning';
  else status = 'critical';

  return { score, status };
}

/**
 * Evaluates player's scam detection decision & red flag tagging
 */
export function calculateScamScore(
  target: ScamTarget,
  selectedFlagIds: string[],
  playerMarkedScam: boolean
): {
  isCorrect: boolean;
  score: number;
  healthDelta: number;
  netWorthDelta: number;
  detectedCount: number;
  missedCount: number;
  falsePositiveCount: number;
  explanation: string;
} {
  const isCorrect = playerMarkedScam === target.actualScam;
  
  if (target.actualScam) {
    // How many correct flags did player identify?
    const truePositives = selectedFlagIds.filter(id => target.correctFlags.includes(id));
    const falsePositives = selectedFlagIds.filter(id => !target.correctFlags.includes(id));
    const missedFlags = target.correctFlags.filter(id => !selectedFlagIds.includes(id));

    if (playerMarkedScam) {
      // Correctly flagged as scam
      const precisionBonus = truePositives.length * 150;
      const falsePenalty = falsePositives.length * 40;
      const baseScore = 600 + precisionBonus - falsePenalty;

      return {
        isCorrect: true,
        score: Math.max(400, Math.min(1000, baseScore)),
        healthDelta: +10,
        netWorthDelta: +5000, // saved money that would have been lost
        detectedCount: truePositives.length,
        missedCount: missedFlags.length,
        falsePositiveCount: falsePositives.length,
        explanation: `Threat Neutralized! You identified ${truePositives.length} critical scam indicators and protected your capital.`,
      };
    } else {
      // Fell for the scam!
      return {
        isCorrect: false,
        score: 100,
        healthDelta: -25,
        netWorthDelta: -15000, // money stolen by scam
        detectedCount: 0,
        missedCount: target.correctFlags.length,
        falsePositiveCount: 0,
        explanation: `Trap Triggered! You trusted a fraudulent promise. Scammers exploit fear of missing out (FOMO) and guaranteed return lies.`,
      };
    }
  } else {
    // Legit offer
    if (!playerMarkedScam) {
      return {
        isCorrect: true,
        score: 850,
        healthDelta: +8,
        netWorthDelta: +4000,
        detectedCount: 0,
        missedCount: 0,
        falsePositiveCount: selectedFlagIds.length,
        explanation: `Smart Assessment: Recognized a genuine, regulated, transparent investment vehicle without paranoia.`,
      };
    } else {
      return {
        isCorrect: false,
        score: 300,
        healthDelta: -5,
        netWorthDelta: 0,
        detectedCount: 0,
        missedCount: 0,
        falsePositiveCount: selectedFlagIds.length,
        explanation: `False Alarm: You rejected a legitimate, regulated instrument. While caution is good, avoiding all genuine growth causes inflation erosion.`,
      };
    }
  }
}
