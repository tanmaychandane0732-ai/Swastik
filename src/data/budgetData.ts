export interface BudgetProfile {
  id: string;
  role: string;
  monthlyIncome: number;
  description: string;
  suggestedNeeds: number;
  suggestedWants: number;
  suggestedSavings: number;
}

export const DEFAULT_BUDGET_PROFILE: BudgetProfile = {
  id: 'standard_60k',
  role: 'Associate Product Engineer',
  monthlyIncome: 60000,
  description: 'You just received your first steady tech salary! Every rupee you allocate this month sets your compounding trajectory.',
  suggestedNeeds: 30000, // 50%
  suggestedWants: 18000, // 30%
  suggestedSavings: 12000, // 20%
};

export const BUDGET_EXPENSE_EXAMPLES = {
  needs: [
    { name: 'Rent & Society Maintenance', typical: '₹16,000 - ₹20,000' },
    { name: 'Groceries & Essential Nutrition', typical: '₹6,000 - ₹8,000' },
    { name: 'Utilities, Electricity & Metro Pass', typical: '₹3,000 - ₹4,000' },
    { name: 'Basic Term & Health Insurance', typical: '₹2,000' },
  ],
  wants: [
    { name: 'Weekend Dining & Food Delivery', typical: '₹6,000 - ₹8,000' },
    { name: 'OTT & Gaming Subscriptions', typical: '₹1,500' },
    { name: 'Apparel, Gadgets & Shopping', typical: '₹5,000 - ₹8,000' },
    { name: 'Concert & Movie Tickets', typical: '₹2,500' },
  ],
  savings: [
    { name: 'Emergency Contingency Fund', typical: '₹5,000' },
    { name: 'Low-cost Index Fund SIP', typical: '₹5,000' },
    { name: 'Retirement & Long-term Wealth', typical: '₹2,000' },
  ],
};

export const BUDGET_DID_YOU_KNOW = [
  "The 50/30/20 framework was popularized by Senator Elizabeth Warren in 'All Your Worth'. It guarantees you enjoy today while automating freedom tomorrow.",
  "An Emergency Fund should cover 3 to 6 months of essential living expenses (Needs). It protects you from having to take predatory loans if an unexpected medical or career event happens.",
  "Every ₹5,000 per month saved and invested in an index fund averaging 12% per year grows to over ₹50,00,000 (₹50 Lakhs) in 20 years!",
];
