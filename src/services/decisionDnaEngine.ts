import { DecisionDNAProfile, DecisionArchetype } from '../types/flightSimulator';
import { SimulatorPlayerState } from '../data/lifeSimulatorScenarios';

/**
 * Decision DNA Engine
 * Computes psychological and behavioral traits from simulated flight choices:
 * - Patience (delayed gratification)
 * - Risk Intelligence (calculated diversification vs gambling)
 * - Debt Discipline (avoiding predatory liabilities)
 * - Scam Immunity (detecting phishing/fraud)
 * - Emergency Readiness (retaining liquid fuel/buffer)
 */

export class DecisionDNAEngine {
  static analyze(playerState: SimulatorPlayerState): DecisionDNAProfile {
    const history = playerState.decisionsHistory || [];

    // Calculate sub-scores (0-100)
    let patience = 65;
    let riskIntelligence = 60;
    let debtDiscipline = 70;
    let scamImmunity = 70;
    let emergencyReadiness = 65;

    // Evaluate based on final financial metrics
    if (playerState.cash >= 25000) emergencyReadiness += 25;
    else if (playerState.cash >= 10000) emergencyReadiness += 10;
    else emergencyReadiness -= 25;

    if (playerState.debt === 0) debtDiscipline += 25;
    else if (playerState.debt > 25000) debtDiscipline -= 35;
    else debtDiscipline -= 15;

    if (playerState.invested >= 20000) {
      riskIntelligence += 20;
      patience += 20;
    } else if (playerState.invested === 0) {
      patience -= 15;
    }

    if (playerState.creditScore >= 750) debtDiscipline += 10;
    else if (playerState.creditScore < 600) debtDiscipline -= 20;

    // Evaluate based on specific choices in history
    history.forEach((choiceId) => {
      // Optimal choices
      if (choiceId.includes('optimal') || choiceId.includes('50/30/20') || choiceId.includes('avalanche')) {
        patience += 8;
        debtDiscipline += 8;
        emergencyReadiness += 8;
      }
      // Scam detection choices
      if (choiceId.includes('block') || choiceId.includes('report') || choiceId.includes('decline')) {
        scamImmunity += 15;
      }
      // Splurge / YOLO choices
      if (choiceId.includes('splurge') || choiceId.includes('yolo') || choiceId.includes('impulse')) {
        patience -= 15;
        emergencyReadiness -= 10;
      }
      // Debt trap choices
      if (choiceId.includes('loan') || choiceId.includes('emi') || choiceId.includes('credit_trap')) {
        debtDiscipline -= 20;
        riskIntelligence -= 10;
      }
      // Falling for scams
      if (choiceId.includes('crypto_tip') || choiceId.includes('scam_accept') || choiceId.includes('fake_upi')) {
        scamImmunity -= 30;
        riskIntelligence -= 20;
      }
    });

    // Clamp all traits between 15 and 99
    patience = Math.min(99, Math.max(15, patience));
    riskIntelligence = Math.min(99, Math.max(15, riskIntelligence));
    debtDiscipline = Math.min(99, Math.max(15, debtDiscipline));
    scamImmunity = Math.min(99, Math.max(15, scamImmunity));
    emergencyReadiness = Math.min(99, Math.max(15, emergencyReadiness));

    // Determine Archetype
    let archetype: DecisionArchetype = 'Strategic Flight Captain';
    let tagline = 'Disciplined, long-term asset allocator with high situational awareness.';
    let badgeIcon = '👑';
    let summary = 'You flew through emergencies and market temptations with textbook discipline. You treat debt like bad weather and liquidity like precious jet fuel.';
    let primaryStrength = 'Unshakable emergency buffer and systematic compounding habits.';
    let dangerBlindSpot = 'May over-save in cash and miss out on long-term equity compounding.';
    let recommendedFlightCheck = 'Increase systematic investment plans (SIPs) in diversified broad-market ETFs.';

    if (debtDiscipline < 45) {
      archetype = 'Debt-Trapped Glider';
      tagline = 'Struggling against high-APR aerodynamic drag and compound debt interest.';
      badgeIcon = '⚠️';
      summary = 'High debt obligations and ongoing EMIs are draining your monthly lift. A single emergency risks stalling your financial flight.';
      primaryStrength = 'Resilience in the face of cashflow pressure.';
      dangerBlindSpot = 'Treating EMIs and credit cards as supplemental income rather than expensive debt.';
      recommendedFlightCheck = 'Execute the Debt Avalanche method immediately. Cease all non-essential discretionary spending until credit balances are ₹0.';
    } else if (scamImmunity < 45) {
      archetype = 'Impulsive High-Altitude Flyer';
      tagline = 'Prone to FOMO and vulnerable to social-engineering radar deception.';
      badgeIcon = '⚡';
      summary = 'You are eager to grow wealth quickly, but your excitement makes you vulnerable to fake payment proofs, Telegram pump groups, and unregulated loan apps.';
      primaryStrength = 'High ambition and enthusiasm for financial growth.';
      dangerBlindSpot = 'Believing that high returns can exist without proportional volatility and risk.';
      recommendedFlightCheck = 'Implement a 48-hour cooling-off rule on any financial offer promising more than 15% annual returns.';
    } else if (riskIntelligence >= 80 && emergencyReadiness >= 75) {
      archetype = 'Strategic Flight Captain';
      tagline = 'Master of risk parity, compounding engines, and cashflow cruising.';
      badgeIcon = '✈️';
      summary = 'Your balance sheet is built like a Boeing 787: redundant security systems, deep emergency reserves, and clean compound cruising.';
      primaryStrength = 'Flawless balance between liquid runway and capital appreciation.';
      dangerBlindSpot = 'Over-optimizing minor expenses instead of focusing on career income acceleration.';
      recommendedFlightCheck = 'Maintain your flight plan and mentor friends to prevent them from falling into predatory credit traps.';
    } else if (emergencyReadiness >= 85 && riskIntelligence < 60) {
      archetype = 'Conservative Parachute Holder';
      tagline = 'Extremely safe and debt-averse, but threatened by inflation drag.';
      badgeIcon = '🛡️';
      summary = 'You keep large cash reserves and never touch debt. However, keeping too much money in low-yield savings accounts exposes your wealth to silent inflation loss.';
      primaryStrength = 'Zero risk of insolvency or emergency default.';
      dangerBlindSpot = 'Inflation risk: your purchasing power decays over decades.';
      recommendedFlightCheck = 'Move surplus cash beyond 6 months of expenses into Nifty 50 Index funds.';
    } else if (scamImmunity >= 85 && debtDiscipline >= 75) {
      archetype = 'Vigilant Scam-Proof Navigator';
      tagline = 'Eagle-eyed fraud detection and impenetrable personal cybersecurity.';
      badgeIcon = '🎯';
      summary = 'You easily spotted fake UPI requests, deceptive 7-day loan apps, and suspicious stock tips. Your financial defenses are bank-grade.';
      primaryStrength = 'High skepticism against social engineering and predatory financial traps.';
      dangerBlindSpot = 'Can be overly defensive, hesitating to invest in genuine growth opportunities.';
      recommendedFlightCheck = 'Channel your disciplined skepticism into research-backed value investing.';
    } else {
      archetype = 'Calculated Risk-Taker';
      tagline = 'Adaptive explorer seeking calculated growth with calculated hedges.';
      badgeIcon = '🧭';
      summary = 'You are comfortable navigating moderate turbulence and balance short-term enjoyment with long-term investment goals.';
      primaryStrength = 'Balanced financial agility and willingness to seize opportunities.';
      dangerBlindSpot = 'Can drift into lifestyle creep during periods of continuous income growth.';
      recommendedFlightCheck = 'Automate transfers to savings on the day your salary is credited.';
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

