export type EnvironmentMood =
  | 'home'
  | 'diagnostic'
  | 'simulator'
  | 'drills'
  | 'turbulence'
  | 'scam'
  | 'radar'
  | 'certificate'
  | 'classroom'
  | 'academy'
  | 'leaderboard';

export interface EnvironmentPalette {
  id: EnvironmentMood;
  name: string;
  chapterNumber: string;
  subtitle: string;
  // Normalized scroll position center (0 to 1) for landing page
  scrollAnchor: number;

  // Dark mode colors — Bright cinematic environmental lights over deep obsidian
  primaryColor: string;     // e.g. #0284C7 or #8B5CF6
  secondaryColor: string;   // e.g. #00D2FF or #EC4899
  accentColor: string;      // e.g. #FF6A2A or #38BDF8
  glowColor: string;        // rgba string for large radial blur
  ambientBg: string;        // CSS gradient

  // Dark mode text contrast tokens
  darkTextPrimary: string;
  darkTextSecondary: string;
  darkTextMuted: string;

  // Light mode colors — Airy, vibrant, luminous palettes
  lightPrimary: string;
  lightSecondary: string;
  lightAccent: string;
  lightGlow: string;
  lightBg: string;

  // Light mode text contrast tokens (deep navy, charcoal, deep plum, deep forest)
  lightTextPrimary: string;
  lightTextSecondary: string;
  lightTextMuted: string;
}

export const ENVIRONMENT_PALETTES: Record<EnvironmentMood, EnvironmentPalette> = {
  home: {
    id: 'home',
    name: 'PRE-FLIGHT ODYSSEY',
    chapterNumber: '01',
    subtitle: 'High-stakes financial flight training with zero real-world risk',
    scrollAnchor: 0.05,
    // Dark: Sky Blue + Aqua + Sunlight Horizon Orange
    primaryColor: '#0077B6',
    secondaryColor: '#00D2FF',
    accentColor: '#FF6A2A',
    glowColor: 'rgba(0, 210, 255, 0.32)',
    ambientBg: 'radial-gradient(ellipse 95% 75% at 50% 8%, rgba(0, 119, 182, 0.40) 0%, rgba(0, 210, 255, 0.15) 45%, rgba(10, 12, 15, 0) 78%)',
    darkTextPrimary: '#F8FAFC',
    darkTextSecondary: '#CBD5E1',
    darkTextMuted: '#94A3B8',
    // Light: Bright Sky + Aqua Glow + Crisp Navy text
    lightPrimary: '#0284C7',
    lightSecondary: '#38BDF8',
    lightAccent: '#EA580C',
    lightGlow: 'rgba(56, 189, 248, 0.28)',
    lightBg: 'radial-gradient(ellipse 95% 75% at 50% 8%, rgba(186, 230, 253, 0.70) 0%, rgba(224, 242, 254, 0.45) 45%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#0F172A',
    lightTextSecondary: '#334155',
    lightTextMuted: '#64748B',
  },

  diagnostic: {
    id: 'diagnostic',
    name: 'COGNITIVE READINESS',
    chapterNumber: '02',
    subtitle: 'Measure your baseline financial IQ and behavioral instincts',
    scrollAnchor: 0.18,
    // Dark: Electric Blue + Data Cyan + Deep Navy
    primaryColor: '#2563EB',
    secondaryColor: '#00E5FF',
    accentColor: '#38BDF8',
    glowColor: 'rgba(0, 229, 255, 0.35)',
    ambientBg: 'radial-gradient(ellipse 90% 70% at 50% 22%, rgba(37, 99, 235, 0.42) 0%, rgba(0, 229, 255, 0.18) 42%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#F0F9FF',
    darkTextSecondary: '#BAE6FD',
    darkTextMuted: '#7DD3FC',
    // Light: Vibrant Cyan + Azure + Deep Cobalt text
    lightPrimary: '#1D4ED8',
    lightSecondary: '#0284C7',
    lightAccent: '#0369A1',
    lightGlow: 'rgba(125, 211, 252, 0.35)',
    lightBg: 'radial-gradient(ellipse 90% 70% at 50% 22%, rgba(191, 219, 254, 0.75) 0%, rgba(224, 242, 254, 0.50) 45%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#0C2D6B',
    lightTextSecondary: '#1E3A8A',
    lightTextMuted: '#475569',
  },

  simulator: {
    id: 'simulator',
    name: 'FLIGHT ODYSSEY',
    chapterNumber: '03',
    subtitle: '6-Month Career Simulation with live cashflow cascades',
    scrollAnchor: 0.35,
    // Dark: Aviation Blue + Cockpit Orange + High-Lift Gold
    primaryColor: '#0284C7',
    secondaryColor: '#FF6A2A',
    accentColor: '#F59E0B',
    glowColor: 'rgba(255, 106, 42, 0.35)',
    ambientBg: 'radial-gradient(ellipse 90% 68% at 50% 28%, rgba(2, 132, 199, 0.38) 0%, rgba(255, 106, 42, 0.22) 48%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#FFF7ED',
    darkTextSecondary: '#FFEDD5',
    darkTextMuted: '#FDBA74',
    // Light: Sky Blue + Warm Coral Peach + Deep Charcoal text
    lightPrimary: '#0369A1',
    lightSecondary: '#EA580C',
    lightAccent: '#D97706',
    lightGlow: 'rgba(254, 215, 170, 0.45)',
    lightBg: 'radial-gradient(ellipse 90% 68% at 50% 28%, rgba(224, 242, 254, 0.70) 0%, rgba(255, 237, 213, 0.55) 48%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#1E293B',
    lightTextSecondary: '#475569',
    lightTextMuted: '#64748B',
  },

  drills: {
    id: 'drills',
    name: 'TACTICAL COMBAT DECK',
    chapterNumber: '04',
    subtitle: 'Cyber scam forensics, emergency drills, and 6-axis Risk Radar',
    scrollAnchor: 0.52,
    // Dark: Cyber Violet + Emerald + Magenta
    primaryColor: '#8B5CF6',
    secondaryColor: '#10B981',
    accentColor: '#EC4899',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    ambientBg: 'radial-gradient(ellipse 90% 68% at 50% 32%, rgba(139, 92, 246, 0.38) 0%, rgba(16, 185, 129, 0.20) 45%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#FAF5FF',
    darkTextSecondary: '#E9D5FF',
    darkTextMuted: '#C084FC',
    // Light: Soft Lavender + Pale Mint + Deep Plum text
    lightPrimary: '#7C3AED',
    lightSecondary: '#059669',
    lightAccent: '#DB2777',
    lightGlow: 'rgba(221, 214, 254, 0.45)',
    lightBg: 'radial-gradient(ellipse 90% 68% at 50% 32%, rgba(243, 232, 255, 0.75) 0%, rgba(209, 250, 229, 0.45) 45%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#2E1065',
    lightTextSecondary: '#4C1D95',
    lightTextMuted: '#6B7280',
  },

  turbulence: {
    id: 'turbulence',
    name: 'CONSEQUENCE ENGINE',
    chapterNumber: '05',
    subtitle: 'Observe compounding aftermath of delayed gratification vs credit traps',
    scrollAnchor: 0.68,
    // Dark: Warning Amber + Emergency Crimson + Burn Red
    primaryColor: '#EA580C',
    secondaryColor: '#EF4444',
    accentColor: '#F59E0B',
    glowColor: 'rgba(234, 88, 12, 0.40)',
    ambientBg: 'radial-gradient(ellipse 88% 68% at 50% 36%, rgba(234, 88, 12, 0.42) 0%, rgba(239, 68, 68, 0.22) 45%, rgba(10, 12, 15, 0) 82%)',
    darkTextPrimary: '#FFF1F2',
    darkTextSecondary: '#FFE4E6',
    darkTextMuted: '#FDA4AF',
    // Light: Soft Coral Amber + Rose Light + Deep Charcoal text
    lightPrimary: '#C2410C',
    lightSecondary: '#DC2626',
    lightAccent: '#D97706',
    lightGlow: 'rgba(254, 215, 170, 0.50)',
    lightBg: 'radial-gradient(ellipse 88% 68% at 50% 36%, rgba(255, 237, 213, 0.80) 0%, rgba(254, 226, 226, 0.55) 45%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#451A03',
    lightTextSecondary: '#7C2D12',
    lightTextMuted: '#64748B',
  },

  scam: {
    id: 'scam',
    name: 'FORENSIC INVESTIGATION',
    chapterNumber: '05B',
    subtitle: 'Identify phishing red flags, fake UPI QR codes, and predatory schemes',
    scrollAnchor: 0.52,
    // Dark: Cyber Violet + Electric Magenta + Laser Cyan
    primaryColor: '#7C3AED',
    secondaryColor: '#D946EF',
    accentColor: '#00E5FF',
    glowColor: 'rgba(217, 70, 239, 0.35)',
    ambientBg: 'radial-gradient(ellipse 88% 68% at 50% 38%, rgba(124, 58, 237, 0.40) 0%, rgba(217, 70, 239, 0.24) 45%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#FDF4FF',
    darkTextSecondary: '#F5D0FE',
    darkTextMuted: '#E879F9',
    // Light: Soft Orchid + Deep Plum text
    lightPrimary: '#6D28D9',
    lightSecondary: '#C026D3',
    lightAccent: '#0284C7',
    lightGlow: 'rgba(240, 171, 252, 0.35)',
    lightBg: 'radial-gradient(ellipse 88% 68% at 50% 38%, rgba(250, 232, 255, 0.75) 0%, rgba(253, 242, 248, 0.50) 45%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#3B0764',
    lightTextSecondary: '#581C87',
    lightTextMuted: '#6B7280',
  },

  radar: {
    id: 'radar',
    name: 'RISK RADAR MATRIX',
    chapterNumber: '05C',
    subtitle: 'Real-time 6-axis vulnerability monitoring across flight parameters',
    scrollAnchor: 0.52,
    // Dark: Emerald Green + Bio Cyan + Deep Marine
    primaryColor: '#059669',
    secondaryColor: '#06B6D4',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.36)',
    ambientBg: 'radial-gradient(ellipse 88% 68% at 50% 38%, rgba(5, 150, 105, 0.40) 0%, rgba(6, 182, 212, 0.22) 45%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#ECFDF5',
    darkTextSecondary: '#A7F3D0',
    darkTextMuted: '#6EE7B7',
    // Light: Soft Sage + Pale Cyan + Deep Forest text
    lightPrimary: '#047857',
    lightSecondary: '#0891B2',
    lightAccent: '#059669',
    lightGlow: 'rgba(167, 243, 208, 0.45)',
    lightBg: 'radial-gradient(ellipse 88% 68% at 50% 38%, rgba(209, 250, 229, 0.75) 0%, rgba(207, 250, 254, 0.50) 45%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#064E3B',
    lightTextSecondary: '#065F46',
    lightTextMuted: '#475569',
  },

  certificate: {
    id: 'certificate',
    name: 'COMPETENCE PROOF',
    chapterNumber: '06',
    subtitle: 'Permanent recognized certification backed by decision benchmarks',
    scrollAnchor: 0.82,
    // Dark: Sunrise Gold + Champagne Orange + Royal Violet
    primaryColor: '#F59E0B',
    secondaryColor: '#FF6A2A',
    accentColor: '#8B5CF6',
    glowColor: 'rgba(245, 158, 11, 0.38)',
    ambientBg: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(245, 158, 11, 0.42) 0%, rgba(255, 106, 42, 0.24) 45%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#FFFBEB',
    darkTextSecondary: '#FDE68A',
    darkTextMuted: '#FCD34D',
    // Light: Warm Champagne Gold + Warm Amber + Deep Espresso text
    lightPrimary: '#D97706',
    lightSecondary: '#EA580C',
    lightAccent: '#7C3AED',
    lightGlow: 'rgba(253, 230, 138, 0.45)',
    lightBg: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(254, 243, 199, 0.80) 0%, rgba(255, 237, 213, 0.55) 45%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#451A03',
    lightTextSecondary: '#78350F',
    lightTextMuted: '#64748B',
  },

  classroom: {
    id: 'classroom',
    name: 'INSTITUTIONAL COCKPIT',
    chapterNumber: '07',
    subtitle: 'Cohort intelligence and systemic failure-trap analytics for educators',
    scrollAnchor: 0.90,
    // Dark: Electric Cyan + Oceanic Teal + Cobalt
    primaryColor: '#00D2FF',
    secondaryColor: '#059669',
    accentColor: '#38BDF8',
    glowColor: 'rgba(0, 210, 255, 0.34)',
    ambientBg: 'radial-gradient(ellipse 88% 68% at 50% 25%, rgba(0, 210, 255, 0.38) 0%, rgba(5, 150, 105, 0.20) 50%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#F0FDFA',
    darkTextSecondary: '#CCFBF1',
    darkTextMuted: '#5EEAD4',
    // Light: Sky Blue + Crisp Mint + Deep Navy text
    lightPrimary: '#0284C7',
    lightSecondary: '#047857',
    lightAccent: '#00D2FF',
    lightGlow: 'rgba(186, 230, 253, 0.45)',
    lightBg: 'radial-gradient(ellipse 88% 68% at 50% 25%, rgba(207, 250, 254, 0.75) 0%, rgba(209, 250, 229, 0.45) 50%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#0C2D6B',
    lightTextSecondary: '#134E4A',
    lightTextMuted: '#475569',
  },

  academy: {
    id: 'academy',
    name: 'FLIGHT ACADEMY',
    chapterNumber: 'KNOWLEDGE',
    subtitle: 'Compounding mathematics, credit score dynamics, and cash runway theory',
    scrollAnchor: 0.5,
    // Dark: Indigo Violet + Soft Cyan + Lavender
    primaryColor: '#6366F1',
    secondaryColor: '#06B6D4',
    accentColor: '#A5B4FC',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    ambientBg: 'radial-gradient(ellipse 88% 68% at 50% 25%, rgba(99, 102, 241, 0.38) 0%, rgba(6, 182, 212, 0.20) 50%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#EEF2FF',
    darkTextSecondary: '#C7D2FE',
    darkTextMuted: '#818CF8',
    // Light: Soft Lavender + Pale Cyan + Deep Plum text
    lightPrimary: '#4F46E5',
    lightSecondary: '#0891B2',
    lightAccent: '#6366F1',
    lightGlow: 'rgba(199, 210, 254, 0.45)',
    lightBg: 'radial-gradient(ellipse 88% 68% at 50% 25%, rgba(224, 231, 255, 0.75) 0%, rgba(207, 250, 254, 0.45) 50%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#1E1B4B',
    lightTextSecondary: '#312E81',
    lightTextMuted: '#475569',
  },

  leaderboard: {
    id: 'leaderboard',
    name: 'FLIGHT LEAGUE',
    chapterNumber: 'RANKINGS',
    subtitle: 'Competence rankings based on decision quality, not luck',
    scrollAnchor: 0.5,
    // Dark: Radiant Gold + Royal Violet + Amber
    primaryColor: '#F59E0B',
    secondaryColor: '#8B5CF6',
    accentColor: '#FF6A2A',
    glowColor: 'rgba(245, 158, 11, 0.36)',
    ambientBg: 'radial-gradient(ellipse 88% 68% at 50% 25%, rgba(245, 158, 11, 0.38) 0%, rgba(139, 92, 246, 0.22) 50%, rgba(10, 12, 15, 0) 80%)',
    darkTextPrimary: '#FFFBEB',
    darkTextSecondary: '#FDE68A',
    darkTextMuted: '#FCD34D',
    // Light: Champagne Gold + Pale Violet + Deep Espresso text
    lightPrimary: '#D97706',
    lightSecondary: '#7C3AED',
    lightAccent: '#EA580C',
    lightGlow: 'rgba(253, 230, 138, 0.45)',
    lightBg: 'radial-gradient(ellipse 88% 68% at 50% 25%, rgba(254, 243, 199, 0.80) 0%, rgba(237, 233, 254, 0.45) 50%, rgba(248, 250, 252, 0) 80%)',
    lightTextPrimary: '#451A03',
    lightTextSecondary: '#581C87',
    lightTextMuted: '#64748B',
  },
};
