export interface WhatIfOutcome {
  year1NetWorth: number;
  year5NetWorth: number;
  interestPaid5Years: number;
  stressLevel: 'Low' | 'Moderate' | 'Severe' | 'Critical';
}

export interface WhatIfProjection {
  currentChoiceOutcome: WhatIfOutcome;
  alternativeChoiceOutcome: WhatIfOutcome;
  divergenceSummary: string;
}

export interface WhatIfSimulationParams {
  startingCash: number;
  startingDebt: number;
  monthlySavingsActual: number;
  monthlyDebtPaymentActual: number;
  actualInterestRateAnnual: number;
  monthlySavingsCounterfactual: number;
  monthlyDebtPaymentCounterfactual: number;
  counterfactualInterestRateAnnual: number;
  scenarioTitle?: string;
}

export class WhatIfService {
  /**
   * Projects 5-year financial trajectory over 60 months using compound interest and monthly cash flows.
   */
  private projectTrajectory(
    initialCash: number,
    initialDebt: number,
    monthlySavings: number,
    monthlyDebtRepayment: number,
    annualDebtInterestRate: number,
    annualInvestmentReturnRate: number = 0.12 // 12% CAGR equity benchmark
  ): { netWorthY1: number; netWorthY5: number; totalInterestPaid: number } {
    let cash = initialCash;
    let debt = initialDebt;
    let totalInterestPaid = 0;
    const monthlyReturn = Math.pow(1 + annualInvestmentReturnRate, 1 / 12) - 1;
    const monthlyDebtRate = annualDebtInterestRate / 12;

    let netWorthY1 = 0;
    let netWorthY5 = 0;

    for (let month = 1; month <= 60; month++) {
      // 1. Debt compounding & repayment
      if (debt > 0) {
        const interest = debt * monthlyDebtRate;
        totalInterestPaid += interest;
        debt += interest;
        const payment = Math.min(debt, monthlyDebtRepayment);
        debt -= payment;
      }

      // 2. Savings & investment compounding
      cash = cash * (1 + monthlyReturn) + monthlySavings;

      if (month === 12) {
        netWorthY1 = Math.round(cash - debt);
      }
      if (month === 60) {
        netWorthY5 = Math.round(cash - debt);
      }
    }

    return {
      netWorthY1,
      netWorthY5,
      totalInterestPaid: Math.round(totalInterestPaid),
    };
  }

  private determineStressLevel(debt: number, netWorth: number): 'Low' | 'Moderate' | 'Severe' | 'Critical' {
    if (debt > 100000 || netWorth < -50000) return 'Critical';
    if (debt > 40000 || netWorth < 0) return 'Severe';
    if (debt > 10000) return 'Moderate';
    return 'Low';
  }

  public simulateDivergence(params: WhatIfSimulationParams): WhatIfProjection {
    const {
      startingCash,
      startingDebt,
      monthlySavingsActual,
      monthlyDebtPaymentActual,
      actualInterestRateAnnual,
      monthlySavingsCounterfactual,
      monthlyDebtPaymentCounterfactual,
      counterfactualInterestRateAnnual,
      scenarioTitle = 'Financial Decision Divergence',
    } = params;

    const actual = this.projectTrajectory(
      startingCash,
      startingDebt,
      monthlySavingsActual,
      monthlyDebtPaymentActual,
      actualInterestRateAnnual
    );

    const alternative = this.projectTrajectory(
      startingCash,
      startingDebt,
      monthlySavingsCounterfactual,
      monthlyDebtPaymentCounterfactual,
      counterfactualInterestRateAnnual
    );

    const gapY5 = alternative.netWorthY5 - actual.netWorthY5;
    const interestSaved = actual.totalInterestPaid - alternative.totalInterestPaid;

    let divergenceSummary = '';
    if (gapY5 > 0) {
      divergenceSummary = `By choosing the optimal route in "${scenarioTitle}", you would accumulate ₹${gapY5.toLocaleString('en-IN')} more in net worth over 5 years and save ₹${Math.max(0, interestSaved).toLocaleString('en-IN')} in compounding debt interest.`;
    } else {
      divergenceSummary = `Your current flight trajectory matches or exceeds the conservative benchmark, yielding steady altitude stability over 5 years.`;
    }

    return {
      currentChoiceOutcome: {
        year1NetWorth: actual.netWorthY1,
        year5NetWorth: actual.netWorthY5,
        interestPaid5Years: actual.totalInterestPaid,
        stressLevel: this.determineStressLevel(startingDebt, actual.netWorthY5),
      },
      alternativeChoiceOutcome: {
        year1NetWorth: alternative.netWorthY1,
        year5NetWorth: alternative.netWorthY5,
        interestPaid5Years: alternative.totalInterestPaid,
        stressLevel: this.determineStressLevel(0, alternative.netWorthY5),
      },
      divergenceSummary,
    };
  }
}

export const whatIfService = new WhatIfService();

