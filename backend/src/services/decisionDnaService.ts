export type DecisionArchetype =
  | 'Strategic Flight Captain'
  | 'Calculated Risk-Taker'
  | 'Vigilant Scam-Proof Navigator'
  | 'Impulsive High-Altitude Flyer'
  | 'Debt-Trapped Glider'
  | 'Conservative Parachute Holder';

export interface DecisionDNAProfile {
  archetype: DecisionArchetype;
  tagline: string;
  badgeIcon: string;
  summary: string;
  traits: {
    patience: number;          // delayed gratification (0-100)
    riskIntelligence: number;  // calculated risk vs gambling (0-100)
    debtDiscipline: number;    // avoiding predatory debt (0-100)
    scamImmunity: number;      // spotting phishing / scams (0-100)
    emergencyReadiness: number;// maintaining liquid runway buffer (0-100)
  };
  primaryStrength: string;
  dangerBlindSpot: string;
  recommendedFlightCheck: string;
}

export interface DecisionEvaluationContext {
  cash: number;
  debt: number;
  invested?: number;
  creditScore: number;
  decisionsHistory: Array<{
    scenarioId?: string;
    choiceId: string;
    isOptimal?: boolean;
    cashDelta?: number;
    debtDelta?: number;
  }>;
}

export class DecisionDnaService {
  public analyze(context: DecisionEvaluationContext): DecisionDNAProfile {
    const { cash, debt, invested = 0, creditScore, decisionsHistory } = context;

    let patience = 65;
    let riskIntelligence = 60;
    let debtDiscipline = 70;
    let scamImmunity = 70;
    let emergencyReadiness = 65;

    // Liquid runway / Emergency readiness evaluation
    if (cash >= 30000) emergencyReadiness += 25;
    else if (cash >= 15000) emergencyReadiness += 10;
    else if (cash < 5000) emergencyReadiness -= 30;
    else emergencyReadiness -= 15;

    // Debt discipline evaluation
    if (debt === 0) debtDiscipline += 25;
    else if (debt > 30000) debtDiscipline -= 35;
    else if (debt > 10000) debtDiscipline -= 20;
    else debtDiscipline -= 5;

    // Investment & wealth intelligence
    if (invested >= 25000) {
      riskIntelligence += 20;
      patience += 20;
    } else if (invested >= 10000) {
      riskIntelligence += 10;
      patience += 10;
    } else if (invested === 0) {
      patience -= 10;
    }

    // CIBIL credit standing
    if (creditScore >= 750) debtDiscipline += 12;
    else if (creditScore < 600) debtDiscipline -= 25;
    else if (creditScore < 680) debtDiscipline -= 10;

    // Evaluate choice triggers in decisionsHistory
    for (const d of decisionsHistory) {
      const id = (d.choiceId || '').toLowerCase();

      if (d.isOptimal || id.includes('optimal') || id.includes('50/30/20') || id.includes('avalanche') || id.includes('sip')) {
        patience += 6;
        debtDiscipline += 6;
        emergencyReadiness += 6;
      }
      if (id.includes('block') || id.includes('report') || id.includes('decline') || id.includes('verify')) {
        scamImmunity += 15;
      }
      if (id.includes('splurge') || id.includes('yolo') || id.includes('impulse') || id.includes('upgrade')) {
        patience -= 15;
        emergencyReadiness -= 10;
      }
      if (id.includes('loan') || id.includes('emi') || id.includes('credit_trap') || id.includes('bnpl') || id.includes('minimum_due')) {
        debtDiscipline -= 20;
        riskIntelligence -= 10;
      }
      if (id.includes('crypto_tip') || id.includes('scam_accept') || id.includes('fake_upi') || id.includes('guaranteed_return')) {
        scamImmunity -= 30;
        riskIntelligence -= 20;
      }
    }

    // Clamp between 15 and 99
    patience = Math.min(99, Math.max(15, Math.round(patience)));
    riskIntelligence = Math.min(99, Math.max(15, Math.round(riskIntelligence)));
    debtDiscipline = Math.min(99, Math.max(15, Math.round(debtDiscipline)));
    scamImmunity = Math.min(99, Math.max(15, Math.round(scamImmunity)));
    emergencyReadiness = Math.min(99, Math.max(15, Math.round(emergencyReadiness)));

    // Archetype Determination
    let archetype: DecisionArchetype;
    let tagline: string;
    let badgeIcon: string;
    let summary: string;
    let primaryStrength: string;
    let dangerBlindSpot: string;
    let recommendedFlightCheck: string;

    if (debt > 25000 || debtDiscipline < 45) {
      archetype = 'Debt-Trapped Glider';
      tagline = 'Heavy payload stalling altitude; compounding interest eating altitude rapidly.';
      badgeIcon = '🛬';
      summary = 'Your simulation revealed vulnerability to revolving liabilities and EMI traps. High interest payments (24-42% APR) continuously consume your monthly airspeed.';
      primaryStrength = 'Resilient under pressure';
      dangerBlindSpot = 'Minimizing minimum-payment dangers & BNPL creeping debt';
      recommendedFlightCheck = 'Execute Debt Snowball/Avalanche protocol immediately. Freeze unsecured credit lines.';
    } else if (scamImmunity < 50) {
      archetype = 'Impulsive High-Altitude Flyer';
      tagline = 'Chasing hypersonic climb rates while leaving radar blind to cyber scams & traps.';
      badgeIcon = '🚀';
      summary = 'High ambition, but susceptible to deceptive urgency and high-return lures. You risk catastrophic cabin depressurization when unregulated opportunities arise.';
      primaryStrength = 'Aggressive wealth accumulation instinct';
      dangerBlindSpot = 'FOMO and unregulated get-rich-quick lures';
      recommendedFlightCheck = 'Always invoke the 48-Hour Radar Check before executing financial transfers over ₹2,000.';
    } else if (riskIntelligence < 50 && emergencyReadiness > 80 && patience > 75) {
      archetype = 'Conservative Parachute Holder';
      tagline = 'Cruising at low altitude with extreme reserves, yet losing ground to inflation.';
      badgeIcon = '🪂';
      summary = 'Extreme safety discipline protects your fuel tank, but fear of market turbulence leaves your wealth vulnerable to long-term purchasing power erosion.';
      primaryStrength = 'Zero risk of sudden liquidity crash; bulletproof emergency buffer';
      dangerBlindSpot = 'Inflation drag on idle cash balances';
      recommendedFlightCheck = 'Deploy automated SIPs into diversified broad-market index funds (Nifty 50).';
    } else if (patience >= 80 && debtDiscipline >= 80 && emergencyReadiness >= 75) {
      archetype = 'Strategic Flight Captain';
      tagline = 'Mastery of aeronautical finance: balanced lift, disciplined fuel, and compound propulsion.';
      badgeIcon = '✈️';
      summary = 'Demonstrated exceptional flight discipline across all 6 financial quarters. You maintained positive airspeed, prioritized emergency fuel, and avoided predatory debt traps.';
      primaryStrength = 'Systematic long-term compounding & calm decision making';
      dangerBlindSpot = 'Complacency during extended bull markets';
      recommendedFlightCheck = 'Continue rebalancing your flight portfolio annually and mentoring cadet flyers.';
    } else if (scamImmunity >= 85 && debtDiscipline >= 75) {
      archetype = 'Vigilant Scam-Proof Navigator';
      tagline = 'Unbreachable radar detection against fraudulent traps and predatory credit schemes.';
      badgeIcon = '🛡️';
      summary = 'Exceptional cyber and credit discipline. You effortlessly dismantle fake UPI requests, unauthorized loan apps, and suspicious investment promises.';
      primaryStrength = 'Impenetrable fraud defense & strict CIBIL preservation';
      dangerBlindSpot = 'Overly defensive capital deployment hindering aggressive compounding';
      recommendedFlightCheck = 'Gradually allocate surplus cash runway into long-term equity growth assets.';
    } else {
      archetype = 'Calculated Risk-Taker';
      tagline = 'Agile navigation through turbulent economic airspaces with balanced risk tolerance.';
      badgeIcon = '🧭';
      summary = 'You take calculated economic risks while preserving fundamental aircraft stability. With slight tuning of emergency reserves, you are primed for high altitude.';
      primaryStrength = 'Quick adaptation to changing market conditions';
      dangerBlindSpot = 'Occasional underestimation of worst-case emergency black swan events';
      recommendedFlightCheck = 'Reinforce 6 months of mandatory living expenses in liquid instruments before expanding equity risk.';
    }

    return {
      archetype,
      tagline,
      badgeIcon,
      summary,
      traits: {
        patience,
        riskIntelligence,
        debtDiscipline,
        scamImmunity,
        emergencyReadiness,
      },
      primaryStrength,
      dangerBlindSpot,
      recommendedFlightCheck,
    };
  }
}

export const decisionDnaService = new DecisionDnaService();
