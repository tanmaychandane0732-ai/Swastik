import { InvestmentChoice } from '../types/game';

export const INVESTMENT_OPTIONS: InvestmentChoice[] = [
  {
    id: 'inv_index_fund',
    title: 'Broad Market Index Fund (Nifty 50 / S&P 500 ETF)',
    category: 'index_fund',
    description: 'Invest in the top 50 blue-chip companies powering the national economy. Low expense ratio (<0.15%), broad sector diversification, and proven 15-year compounding history.',
    expectedReturnAnnual: 12,
    riskLevel: 'Moderate',
    allocationAmount: 0,
    isRecommended: true,
    educationalTakeaway: 'Legendary investor Warren Buffett recommends low-cost broad index funds for 99% of investors. Over 20 years, broad index funds outperform over 85% of actively managed funds.',
  },
  {
    id: 'inv_emergency_liquid',
    title: 'High-Safety Liquid / Overnight Debt Fund',
    category: 'emergency_fund',
    description: 'Capital preservation reserve invested in sovereign government treasury bills. Instant 1-click redemption with virtually zero default risk.',
    expectedReturnAnnual: 6.5,
    riskLevel: 'Low',
    allocationAmount: 0,
    isRecommended: true,
    educationalTakeaway: 'Liquid funds keep your emergency cash safe from market drops while beating ordinary checking account rates, preventing you from selling equity investments at a loss.',
  },
  {
    id: 'inv_crypto_moonshot',
    title: 'Hyped Meme Token / 100x Leverage Crypto Bot',
    category: 'speculative_crypto',
    description: 'Anonymous Telegram coin with a rocket emoji claiming "next 100x gem". High price volatility with 80% drawdowns in 48 hours.',
    expectedReturnAnnual: -40,
    riskLevel: 'Extreme',
    allocationAmount: 0,
    isRecommended: false,
    educationalTakeaway: 'Speculation is not investing. When high leverage or anonymous promoters are involved, retail traders almost always lose their principal to pump-and-dump syndicates.',
  },
  {
    id: 'inv_guaranteed_ponzi',
    title: '"Secret AI Arbitrage Bot" Guaranteed 30% Monthly',
    category: 'get_rich_quick',
    description: 'Exclusive private club claiming automated algorithmic trading guarantees 30% risk-free monthly payouts. Promises bonus if you recruit 3 friends.',
    expectedReturnAnnual: -100,
    riskLevel: 'Extreme',
    allocationAmount: 0,
    isRecommended: false,
    educationalTakeaway: 'Universal Law of Finance: If someone could guarantee 30% monthly risk-free, ₹10,000 would turn into ₹23 Crore in 3 years. They would not need your money. It is a textbook Ponzi scheme.',
  },
];

