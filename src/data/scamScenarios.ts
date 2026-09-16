import { ScamRedFlag, ScamTarget } from '../types/game';

export const COMMON_RED_FLAGS: ScamRedFlag[] = [
  {
    id: 'flag_guaranteed_return',
    label: 'Guaranteed Unrealistic Returns',
    description: 'Promises abnormal returns (e.g. 200%-500% weekly or 30% monthly) with zero risk.',
  },
  {
    id: 'flag_urgency_pressure',
    label: 'Artificial Urgency & FOMO',
    description: 'Forces rush decisions: "Only 3 spots left", "Offer expires in 15 minutes!", "Act now".',
  },
  {
    id: 'flag_upfront_fee',
    label: 'Upfront Fee to Unlock Profits',
    description: 'Demands you deposit a "processing fee", "tax clearance", or "security deposit" before withdrawing your money.',
  },
  {
    id: 'flag_crypto_direct',
    label: 'Direct Anonymous Crypto Transfer',
    description: 'Requires sending funds directly to a personal wallet address or unverified UPI handle with no recourse.',
  },
  {
    id: 'flag_otp_credentials',
    label: 'Requests Confidential OTP / Passwords',
    description: 'Asks for bank OTP, login password, or secret crypto recovery seed phrase under pretense of "verification".',
  },
  {
    id: 'flag_unregulated',
    label: 'Unregulated / Unverified Entity',
    description: 'Operates solely via Telegram/WhatsApp channels with zero registration under financial regulators (SEBI/RBI/SEC).',
  },
  {
    id: 'flag_multilevel_recruiting',
    label: 'Pyramid / Referral Recruiting Focus',
    description: 'Compensation primarily comes from recruiting downstream victims rather than genuine economic activity.',
  },
];

export const SCAM_TARGETS: ScamTarget[] = [
  {
    id: 'scam_telegram_doubler',
    senderName: '@ApexCryptoWhale_VIP',
    platform: 'Telegram',
    timestamp: 'Just now',
    messageText: '🚨 EXCLUSIVE PUMP ALERT! My proprietary insider trading algorithm has a 100% win rate. Send 0.1 BTC or 500 USDT to wallet address 0x71C... and receive 3x payout back within 6 hours GUARANTEED. Zero risk! Only 4 spots left before channel closes forever! 🚀💰',
    offerHighlight: '3x Payout in 6 hours guaranteed. Send crypto directly to wallet.',
    actualScam: true,
    availableFlags: COMMON_RED_FLAGS,
    correctFlags: [
      'flag_guaranteed_return',
      'flag_urgency_pressure',
      'flag_crypto_direct',
      'flag_unregulated',
    ],
    explanation: 'Classic "Wallet Doubler" fraud. Once crypto is transferred to an anonymous wallet, blockchain transactions are irreversible. The scammer blocks you instantly.',
    whyDangerous: 'Cryptocurrency transactions cannot be reversed by bank disputes. Scammers use fake screenshots and bot testimonials to trigger intense fear of missing out.',
    tip: 'No legitimate investment can legally guarantee 300% in 6 hours. High return ALWAYS entails high risk.',
  },
  {
    id: 'legit_index_etf',
    senderName: 'National Stock Exchange (NSE) Certified Broker',
    platform: 'Email',
    timestamp: 'Today, 10:30 AM',
    messageText: 'Monthly SIP confirmation: Your scheduled order of ₹5,000 for Nifty 50 Index Mutual Fund has been executed successfully. Total Expense Ratio: 0.08%. Units credited to your registered Demat account. Past 10-year CAGR has been ~12.4%, subject to market fluctuations.',
    offerHighlight: '0.08% low expense ratio, transparent units credited to regulated Demat.',
    actualScam: false,
    availableFlags: COMMON_RED_FLAGS,
    correctFlags: [],
    explanation: 'Legitimate regulated investment. Clear risk disclaimer ("subject to market fluctuations"), ultra-low fees (0.08%), and direct credit to SEBI-regulated Demat depository.',
    whyDangerous: 'Rejecting regulated index investing due to misplaced paranoia causes your cash to lose 6-7% purchasing power every single year to inflation.',
    tip: 'Always look for statutory regulator registration (SEBI, RBI, SEC) and transparent expense ratios.',
  },
  {
    id: 'scam_whatsapp_task',
    senderName: '+62 812-9844-3112 (HR Recruiter Priya)',
    platform: 'WhatsApp',
    timestamp: 'Yesterday, 4:15 PM',
    messageText: 'Hello! I am Priya from Global Digital Media. We have urgent work-from-home vacancies! Just subscribe to YouTube channels and like Instagram reels to earn ₹3,000 to ₹8,000 per day. To activate your VIP Merchant account and receive your first payout, please deposit a refundable security verification fee of ₹2,500.',
    offerHighlight: 'Earn ₹8,000/day liking videos, pay ₹2,500 security deposit first.',
    actualScam: true,
    availableFlags: COMMON_RED_FLAGS,
    correctFlags: [
      'flag_guaranteed_return',
      'flag_upfront_fee',
      'flag_unregulated',
    ],
    explanation: 'The infamous "Task / YouTube Like" scam. They pay ₹150 for the first task to build false trust, then entice you to deposit thousands into "prepaid merchant accounts" where your money is stolen.',
    whyDangerous: 'Legitimate employers will NEVER demand a job applicant pay upfront "security deposits" or "verification fees" to get paid.',
    tip: 'Rule of thumb: If a job asks you to pay money to make money, it is 100% an advance-fee fraud.',
  },
  {
    id: 'scam_urgent_kyc_sms',
    senderName: 'VM-HDFCBNK-ALRT',
    platform: 'SMS',
    timestamp: '2 hours ago',
    messageText: 'URGENT: Dear Customer, your NetBanking account has been BLOCKED due to non-update of PAN card. Click bit.ly/hdfc-kyc-update-24 to verify your PAN, debit card PIN, and OTP immediately to avoid permanent account termination within 2 hours.',
    offerHighlight: 'Account suspended! Click short link and submit card PIN + OTP in 2 hours.',
    actualScam: true,
    availableFlags: COMMON_RED_FLAGS,
    correctFlags: [
      'flag_urgency_pressure',
      'flag_otp_credentials',
      'flag_unregulated',
    ],
    explanation: 'Phishing SMS impersonating major banks using URL shorteners (bit.ly). Banks never request card PINs or OTPs over SMS links.',
    whyDangerous: 'Entering OTPs or card CVV/PINs on spoofed lookalike web forms grants cybercriminals instant direct access to drain your bank balances via unauthorized UPI transfers.',
    tip: 'Always check the domain name. Never click shortened links in SMS. Always open your bank app directly.',
  },
];

