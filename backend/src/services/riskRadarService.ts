export interface RiskRadarMetrics {
  debtRisk: number;              // 0 (low) to 100 (critical)
  emergencyVulnerability: number;// 0 (safe) to 100 (zero cash buffer)
  lifestyleCreep: number;        // 0 (disciplined) to 100 (runaway burn)
  volatilityExposure: number;    // 0 (diversified) to 100 (speculative)
  scamExposure: number;          // 0 (immune) to 100 (vulnerable)
  creditFragility: number;       // 0 (robust) to 100 (bad CIBIL)
}

export interface RiskEvaluationParams {
  cash: number;
  debt: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  creditScore: number;
  scamChoiceCount?: number;
  speculativeChoiceCount?: number;
  impulseChoiceCount?: number;
}

export class RiskRadarService {
  public calculate(params: RiskEvaluationParams): RiskRadarMetrics {
    const {
      cash,
      debt,
      monthlyIncome = 30000,
      monthlyExpenses = 18000,
      creditScore,
      scamChoiceCount = 0,
      speculativeChoiceCount = 0,
      impulseChoiceCount = 0,
    } = params;

    // 1. Debt Risk: based on Debt-to-Income / total debt
    let debtRisk = 0;
    if (debt > 0) {
      const debtRatio = debt / Math.max(1, monthlyIncome);
      debtRisk = Math.min(100, Math.round(debtRatio * 50));
    }

    // 2. Emergency Vulnerability: months of expenses covered by cash
    const monthsRunway = cash / Math.max(1, monthlyExpenses);
    let emergencyVulnerability = 100;
    if (monthsRunway >= 6) emergencyVulnerability = 10;
    else if (monthsRunway >= 3) emergencyVulnerability = 30;
    else if (monthsRunway >= 1) emergencyVulnerability = 60;
    else if (monthsRunway >= 0.5) emergencyVulnerability = 85;
    else emergencyVulnerability = 98;

    // 3. Lifestyle Creep: impulse buys & high burn
    let lifestyleCreep = Math.min(100, Math.round(15 + impulseChoiceCount * 25));

    // 4. Volatility Exposure: speculative investments / crypto gambling
    let volatilityExposure = Math.min(100, Math.round(10 + speculativeChoiceCount * 30));

    // 5. Scam Exposure: susceptibility to fraud
    let scamExposure = Math.min(100, Math.round(12 + scamChoiceCount * 40));

    // 6. Credit Fragility: derived from CIBIL score (300 to 900)
    let creditFragility = 0;
    if (creditScore >= 750) creditFragility = Math.max(5, Math.round((900 - creditScore) / 6));
    else if (creditScore >= 650) creditFragility = Math.round(35 + ((750 - creditScore) / 100) * 30);
    else creditFragility = Math.min(100, Math.round(65 + ((650 - Math.max(300, creditScore)) / 350) * 35));

    return {
      debtRisk: Math.max(0, Math.min(100, debtRisk)),
      emergencyVulnerability: Math.max(0, Math.min(100, emergencyVulnerability)),
      lifestyleCreep: Math.max(0, Math.min(100, lifestyleCreep)),
      volatilityExposure: Math.max(0, Math.min(100, volatilityExposure)),
      scamExposure: Math.max(0, Math.min(100, scamExposure)),
      creditFragility: Math.max(0, Math.min(100, creditFragility)),
    };
  }
}

export const riskRadarService = new RiskRadarService();

