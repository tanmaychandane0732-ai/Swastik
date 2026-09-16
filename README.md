# FINQUEST — Interactive Financial Literacy Web Game
### Hack2Ignite Innovation Challenge — Track GD-01

> **"Master Your Money. Outsmart Your Future."**

FinQuest is a high-fidelity, interactive financial literacy web game engineered for the Hack2Ignite Innovation Challenge. It combines modern fintech aesthetics, tactical game mechanics, and behavioral finance education to teach young adults and early-career professionals how to budget, evade predatory debt traps, understand compound interest, allocate investments, and intercept fraudulent digital scams.

---

## Key Features & Gameplay Modules

### 1. Global Financial HUD (Persistent Top Bar)
- **Real-Time Net Worth**: Displays current capital in Indian Rupees (₹) with animated count-up and floating delta indicators (`+₹5,000`, `-₹12,000`).
- **Financial Health Score (0-100)**: Visual status ring and color-coded indicator (`Excellent`, `Healthy`, `Needs Attention`, `Critical`).
- **Dynamic Score Multiplier**: Rewards consecutive smart financial decisions with active streak bonuses (`1.0x` → `1.2x` → `1.5x` → `2.0x`).
- **Tactile Controls**: Instant audio mute/unmute toggle, quick access to the Achievement Showcase, and career reset options.

### 2. Level 1: Income & Budgeting Arena
- **The 50/30/20 Framework**: Manage a ₹60,000 monthly salary.
- **Interactive Sliders**: Dynamically allocate funds across **Essential Needs (50%)**, **Lifestyle Wants (30%)**, and **Future Savings (20%)**.
- **Live SVG Donut Chart**: Synchronously recalculates percentages, remaining cashflow, and deficit alerts in real-time.
- **Educational Rule**: "Pay yourself first" and avoid lifestyle inflation.

### 3. Level 2: Credit & Debt Trap Dungeon
- **Deceptive Financing Scenarios**:
  - **BNPL Gadget Trap**: The psychological illusion of "No-Cost EMI" with hidden late fees and retroactive 30% APR.
  - **The Minimum Payment Black Hole**: Contrasts paying only 5% (₹1,250) vs paying statement balance in full (₹25,000).
  - **Predatory Quick-Loan App**: Exposes instant cash disbursals with 36.5% APR and 8% upfront processing deductions.
- **Interactive Compound Debt Visualizer**: Dynamic SVG curve contrasting total payoff duration and thousands of rupees wasted in compounding interest versus debt-free peace of mind.

### 4. Level 3: Investment Strategy & Scam Radar
- **Asset Allocation**: Allocate savings into diversified low-cost Broad Market Index Funds (Nifty 50 ETF) and safe liquid emergency cushions, while identifying speculative crypto pump-and-dump coins and Ponzi schemes.
- **Tactical Scam Detection Radar**:
  - High-tech circular radar interface with continuous sweeping beam, concentric sonar rings, and pulsing threat coordinates.
  - Simulated viral intercepts from WhatsApp, Telegram, Email, and SMS.
  - **Interactive Red Flag Inspector**: Click to tag suspicious red flags (*Guaranteed Unrealistic Returns, Artificial Urgency/FOMO, Upfront Fee, Direct Crypto Transfer, Requests OTP*).
  - Radar Verdict trigger: Mark as Fraudulent Scam or Verified Legitimate Instrument.

### 5. Educational Feedback System ("The Mathematical Why")
- Every financial choice triggers a structured `FeedbackModal` explaining:
  1. Outcome verdict (Optimal / Caution / Danger).
  2. Concrete balance sheet impact (Net Worth, Health, Score, Debt).
  3. The mathematical mechanics behind the outcome (e.g. daily APR compounding, behavioral friction reduction).
  4. Actionable real-world rule of thumb.

### 6. Results Dashboard & Financial Archetype Generator
- Computes customized persona based on gameplay behavior:
  - **The Wealth Guardian** (Pristine defense, zero toxic debt, high scam accuracy)
  - **The Smart Strategist** (Disciplined budgeting and cashflow optimization)
  - **The Conscious Budget Builder** (Solid financial foundations)
  - **The Optimistic Growth Seeker** (Eager for returns, refining risk defense)
- Detailed score breakdown across all 3 levels.
- Direct scorecard sharing and Hall of Fame submission.

### 7. Competitive Leaderboard & Achievement Badges
- **Hall of Fame**: Filterable ranking displaying score, net worth, health rating, badges count, and completion timestamps.
- **Achievement Showcase**: Unlocks badges such as *Budget Master*, *Smart Saver*, *Debt Free Ninja*, *Investment Strategist*, *Scam Hunter*, *Streak Champion*, and *Financial Pro*.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 18 + Vite + TypeScript | Blazing-fast compilation, strict type safety, modular components |
| **Styling** | Tailwind CSS v3 + Custom Design Tokens | Dark futuristic fintech aesthetics (`#0F172A`, `#059669`, `#4F46E5`), glassmorphism (`backdrop-blur: 12px`) |
| **Animations** | Framer Motion | Spring physics, tactile button feedback, card flip transitions, radar sweep |
| **Audio Engine** | Web Audio API + Howler.js | Procedural synthesized SFX (clicks, coins, success chords, buzzes, radar pings) with zero latency |
| **Data Visuals** | Custom SVG + Canvas Confetti | Responsive compound debt curves, real-time donut charts, victory celebrations |
| **State & Storage**| React Context + useReducer + LocalStorage | Centralized game state with automated persistence and graceful recovery |
| **Testing** | Vitest | Deterministic test suite for 50/30/20 math, compound interest, health meter, and scam scoring |

---

## Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on v24.21.0)
- npm 9+ (tested on v11.19.0)

### Installation
```bash
# 1. Clone repository
git clone <repo-url>
cd reactnative

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Unit Tests
```bash
npm run test
```

### Production Build
```bash
npm run build
npm run preview
```

---

## Deployment (Vercel)

This project is configured as a standard Vite Single Page Application (SPA). To deploy on Vercel:
1. Push repository to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.

---

## Hackathon Evaluation Alignment (GD-01)
- **Functional Gameplay**: 100% playable end-to-end game loop without dead buttons or mock screens.
- **Educational Impact**: Grounded in verified personal finance principles (50/30/20 rule, APR compounding math, SEBI/RBI regulatory awareness).
- **Vibecoding UI/UX**: Dark glassmorphic design system with spring physics, neon glows, and responsive tactile interactions.
- **Offline & Fallback Safety**: Procedural Web Audio API ensures audio SFX work in any browser without external asset 404s. LocalStorage ensures zero reliance on external database uptime.
