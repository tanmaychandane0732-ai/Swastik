import { LeaderboardEntry } from '../types/leaderboard';

const LEADERBOARD_KEY = 'finquest_leaderboard_v1';

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    playerName: 'Aarav Mehta',
    score: 3820,
    netWorth: 84500,
    financialHealth: 96,
    badgesCount: 7,
    completionTimeSeconds: 184,
    persona: 'The Wealth Guardian',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'seed-2',
    playerName: 'Aditi Sharma',
    score: 3650,
    netWorth: 78000,
    financialHealth: 92,
    badgesCount: 6,
    completionTimeSeconds: 215,
    persona: 'The Smart Strategist',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'seed-3',
    playerName: 'Rohan Verma',
    score: 3410,
    netWorth: 72400,
    financialHealth: 88,
    badgesCount: 5,
    completionTimeSeconds: 240,
    persona: 'The Smart Strategist',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'seed-4',
    playerName: 'Kavya Patel',
    score: 3180,
    netWorth: 68500,
    financialHealth: 82,
    badgesCount: 5,
    completionTimeSeconds: 260,
    persona: 'The Conscious Budget Builder',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'seed-5',
    playerName: 'Vikram Malhotra',
    score: 2950,
    netWorth: 63000,
    financialHealth: 76,
    badgesCount: 4,
    completionTimeSeconds: 310,
    persona: 'The Conscious Budget Builder',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const leaderboardService = {
  getEntries(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      if (!data) {
        // Seed initial data
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(SEED_LEADERBOARD));
        return this.assignRanks(SEED_LEADERBOARD);
      }
      const parsed = JSON.parse(data) as LeaderboardEntry[];
      return this.assignRanks(parsed);
    } catch {
      return this.assignRanks(SEED_LEADERBOARD);
    }
  },

  addEntry(entry: Omit<LeaderboardEntry, 'id' | 'rank'>): LeaderboardEntry[] {
    try {
      const current = this.getEntries();
      const newEntry: LeaderboardEntry = {
        ...entry,
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        isCurrentPlayer: true,
      };
      
      const updated = [...current.filter(e => !e.isCurrentPlayer), newEntry];
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
      return this.assignRanks(updated);
    } catch (e) {
      console.warn('[Leaderboard] Failed to save entry:', e);
      return this.getEntries();
    }
  },

  assignRanks(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    return [...entries]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.netWorth - a.netWorth;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  },

  clear(): void {
    try {
      localStorage.removeItem(LEADERBOARD_KEY);
    } catch {}
  },
};

