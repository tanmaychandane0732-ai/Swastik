import { DebtScenario } from '../types/scenarios';
import { calculateCompoundDebt } from '../utils/financialMath';

// Precalculate compound comparisons for realistic financial scenarios
const ccCompoundMin = calculateCompoundDebt(25000, 36, 1250, 24);
const ccCompoundFull = calculateCompoundDebt(25000, 36, 25000, 24);

const bnplCompoundTrap = calculateCompoundDebt(35000, 30, 2000, 24);
const loanCompoundTrap = calculateCompoundDebt(80000, 38, 3500, 30);

export const DEBT_SCENARIOS: DebtScenario[] = [
  {
    id: 'bnpl_gadget',
    title: 'The Flagship Phone "No-Cost EMI" Illusion',
    category: 'BNPL',
    badge: 'Buy Now Pay Later Trap',
    description: 'Your dream smartphone just launched for ₹36,000. A BNPL checkout service flashes: "Zero down payment! Split into 12 easy monthly payments of ₹3,000".',
    principalAmount: 36000,
    quotedTerms: '₹3,000 / month for 12 months with "0% upfront processing".',
    hiddenCatch: 'Clause 14b in fine print: Missing a single payment triggers retroactive 30% APR backdated to day 1, plus ₹750 late penalty fees each month.',
    options: [
      {
        id: 'opt_bnpl_take',
        label: 'Take BNPL 12-Month Plan',
        tagline: 'Treat yourself now, pay ₹3,000 per month later',
        result: {
          scenarioId: 'bnpl_gadget',
          choiceId: 'opt_bnpl_take',
          title: 'Fell into the BNPL Psych Trap',
          debtImpact: 36000,
          netWorthImpact: -6500,
          healthImpact: -14,
          scoreImpact: 150,
          isOptimal: false,
          explanation: 'BNPL exploits behavioral friction reduction. Studies show consumers spend 40% more when using BNPL because the immediate pain of paying is removed.',
          whyExplanation: 'BNPL schemes make big purchases feel tiny. When a surprise expense hits next month, missed payment penalties and 30% interest quickly inflate your ₹36,000 phone into a ₹44,000 headache.',
          compoundComparison: {
            months: bnplCompoundTrap.months,
            minimumPayBalance: bnplCompoundTrap.balances,
            fullPayBalance: bnplCompoundTrap.months.map((_, i) => (i === 0 ? 36000 : 0)),
            totalInterestPaidMin: bnplCompoundTrap.totalInterestPaid,
            totalInterestPaidFull: 0,
          },
        },
      },
      {
        id: 'opt_bnpl_save',
        label: 'Save Up & Buy with Cash / Skip',
        tagline: 'Set aside ₹6,000/month for 6 months, earn interest instead',
        result: {
          scenarioId: 'bnpl_gadget',
          choiceId: 'opt_bnpl_save',
          title: 'Patience Protected Your Freedom!',
          debtImpact: 0,
          netWorthImpact: +3600,
          healthImpact: +12,
          scoreImpact: 850,
          isOptimal: true,
          explanation: 'By delaying gratification, you kept control of your cashflow and earned interest rather than paying lender fees.',
          whyExplanation: 'If you cannot afford to buy a depreciating electronic gadget twice in cash, taking debt to buy it is a direct wealth transfer from your future to the credit company.',
        },
      },
    ],
  },
  {
    id: 'credit_card_minimum',
    title: 'The "Minimum Amount Due" Black Hole',
    category: 'CREDIT_CARD',
    badge: '36% APR Compound Trap',
    description: 'Your credit card bill arrives for ₹25,000 after festive shopping. The statement prominently highlights: "Minimum Amount Due: Just ₹1,250!" with a shiny green pay button.',
    principalAmount: 25000,
    quotedTerms: 'Pay only 5% (₹1,250) today to avoid card suspension.',
    hiddenCatch: 'Interest rate is 3% per month (36% to 42% APR). New interest is calculated daily on the entire outstanding balance!',
    options: [
      {
        id: 'opt_cc_minimum',
        label: 'Pay Minimum Due (₹1,250)',
        tagline: 'Keep remaining ₹23,750 in your checking account for now',
        result: {
          scenarioId: 'credit_card_minimum',
          choiceId: 'opt_cc_minimum',
          title: 'Trapped in the 36% Compound Vise',
          debtImpact: 23750,
          netWorthImpact: -11200,
          healthImpact: -22,
          scoreImpact: 100,
          isOptimal: false,
          explanation: 'Paying only the minimum due pays off almost zero principal! Nearly the entire ₹1,250 payment goes straight into the bank\'s pocket as interest fee.',
          whyExplanation: 'At 36% APR, paying only minimum dues on a ₹25,000 balance takes over 6 years to clear and costs an astounding ₹16,000+ in pure interest alone!',
          compoundComparison: {
            months: ccCompoundMin.months,
            minimumPayBalance: ccCompoundMin.balances,
            fullPayBalance: ccCompoundFull.balances,
            totalInterestPaidMin: ccCompoundMin.totalInterestPaid,
            totalInterestPaidFull: 0,
          },
        },
      },
      {
        id: 'opt_cc_full',
        label: 'Pay Statement in Full (₹25,000)',
        tagline: 'Eliminate the balance immediately, pay ₹0 in interest',
        result: {
          scenarioId: 'credit_card_minimum',
          choiceId: 'opt_cc_full',
          title: 'Credit Card Ninja Masterclass',
          debtImpact: 0,
          netWorthImpact: +2500, // saved interest + reward points intact
          healthImpact: +16,
          scoreImpact: 950,
          isOptimal: true,
          explanation: 'Credit cards are lethal when borrowed against, but brilliant when paid in full: you enjoyed a 45-day interest-free loan plus reward points at zero fee.',
          whyExplanation: 'Golden Rule of Credit: Always pay the Total Amount Due before the due date. The Minimum Amount Due is a mathematically designed wealth trap.',
          compoundComparison: {
            months: ccCompoundMin.months,
            minimumPayBalance: ccCompoundMin.balances,
            fullPayBalance: ccCompoundFull.balances,
            totalInterestPaidMin: ccCompoundMin.totalInterestPaid,
            totalInterestPaidFull: 0,
          },
        },
      },
    ],
  },
  {
    id: 'predatory_loan_app',
    title: 'Instant Cash App "Approval in 2 Minutes"',
    category: 'PREDATORY_LOAN',
    badge: 'Loan Shark Alert',
    description: 'Your friends are planning a Goa weekend trip. A quick-loan app sends a push notification: "Pre-approved loan of ₹80,000 instantly disbursed to your UPI! No collateral, no salary slip required!"',
    principalAmount: 80000,
    quotedTerms: 'Disbursement within 120 seconds.',
    hiddenCatch: 'Upfront 8% "file fee" deducted immediately (you receive only ₹73,600). Daily compounding interest of 0.1% (36.5% annual APR) + aggressive data harvesting permissions.',
    options: [
      {
        id: 'opt_loan_accept',
        label: 'Accept Instant Cash Disbursal',
        tagline: 'Go on the trip with friends now, worry about repayments later',
        result: {
          scenarioId: 'predatory_loan_app',
          choiceId: 'opt_loan_accept',
          title: 'Predatory Lending Quicksand',
          debtImpact: 80000,
          netWorthImpact: -18000,
          healthImpact: -26,
          scoreImpact: 80,
          isOptimal: false,
          explanation: 'You took a high-interest unsecured loan for a perishable consumption expense (vacation). High upfront processing fees and 38% APR cripple your net worth.',
          whyExplanation: 'Borrowing money for vacations or lifestyle indulgences is the #1 trigger for young professionals entering a debt spiral. Once trapped, people often take a second loan just to pay the first.',
          compoundComparison: {
            months: loanCompoundTrap.months,
            minimumPayBalance: loanCompoundTrap.balances,
            fullPayBalance: loanCompoundTrap.months.map((_, i) => (i === 0 ? 80000 : 0)),
            totalInterestPaidMin: loanCompoundTrap.totalInterestPaid,
            totalInterestPaidFull: 0,
          },
        },
      },
      {
        id: 'opt_loan_decline',
        label: 'Decline Loan & Plan a Budget Trip',
        tagline: 'Travel within current means, keep zero debt liabilities',
        result: {
          scenarioId: 'predatory_loan_app',
          choiceId: 'opt_loan_decline',
          title: 'Bullet Dodged: Debt-Free Peace of Mind',
          debtImpact: 0,
          netWorthImpact: +4000,
          healthImpact: +14,
          scoreImpact: 900,
          isOptimal: true,
          explanation: 'You protected your credit score and emotional peace. You understand the golden rule: Never finance temporary leisure with high-interest debt.',
          whyExplanation: 'Unregulated instant loan apps often use predatory harassment tactics and sky-high interest. Living within your current income ensures freedom and autonomy.',
        },
      },
    ],
  },
];

