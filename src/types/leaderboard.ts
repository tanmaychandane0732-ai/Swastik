export interface LeaderboardEntry {
  id: string;
  rank?: number;
  playerName: string;
  score: number;
  netWorth: number;
  financialHealth: number;
  badgesCount: number;
  completionTimeSeconds: number;
  persona: string;
  createdAt: string;
  isCurrentPlayer?: boolean;
}

