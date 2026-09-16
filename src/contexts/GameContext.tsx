import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { GameState, GameAction, EducationalFeedback, GameSettings } from '../types/game';
import { persistenceService } from '../services/persistence';
import { soundManager } from '../services/audioService';
import { calculateStreakMultiplier, calculateFinancialHealthScore } from '../utils/financialMath';

export const INITIAL_STATE: GameState = {
  player: {
    name: '',
    avatarId: 'avatar-1',
  },
  netWorth: 50000,
  financialHealth: 75,
  score: 0,
  streak: 0,
  streakMultiplier: 1.0,
  currentLevel: 1,
  completedLevels: [],
  levelScores: {
    level1: 0,
    level2: 0,
    level3: 0,
  },
  budget: {
    income: 60000,
    needs: 0,
    wants: 0,
    savings: 0,
    isSubmitted: false,
    score: 0,
  },
  debt: {
    totalDebt: 0,
    decisions: [],
    score: 0,
  },
  investment: {
    portfolioValue: 0,
    choices: [],
    score: 0,
  },
  scam: {
    detectedScams: 0,
    missedScams: 0,
    totalAnalyzed: 0,
    scamScore: 0,
  },
  badges: ['badge_rookie'],
  settings: {
    soundEnabled: true,
    reducedMotion: false,
    theme: 'dark',
    videoBackground: {
      enabled: false,
      url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31627-large.mp4',
      preset: 'cyber',
      opacity: 0.35,
    },
  },
  gameStage: 'landing',
  history: [
    {
      timestamp: Date.now(),
      netWorthChange: 0,
      reason: 'Started career with ₹50,000 baseline reserve',
    },
  ],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_STAGE':
      return {
        ...state,
        gameStage: action.payload,
      };

    case 'SET_PLAYER_NAME':
      return {
        ...state,
        player: {
          ...state.player,
          name: action.payload.trim() || 'FinQuester',
        },
      };

    case 'SUBMIT_BUDGET': {
      const { needs, wants, savings, score, netWorthChange, healthChange } = action.payload;
      const earnedScore = Math.round(score * state.streakMultiplier);
      const newHealth = calculateFinancialHealthScore(state.financialHealth, healthChange).score;
      const newNetWorth = state.netWorth + netWorthChange;

      const newBadges = [...state.badges];
      if (score >= 900 && !newBadges.includes('badge_budget_master')) {
        newBadges.push('badge_budget_master');
      }
      if (savings >= state.budget.income * 0.2 && !newBadges.includes('badge_smart_saver')) {
        newBadges.push('badge_smart_saver');
      }

      return {
        ...state,
        netWorth: newNetWorth,
        financialHealth: newHealth,
        score: state.score + earnedScore,
        budget: {
          ...state.budget,
          needs,
          wants,
          savings,
          isSubmitted: true,
          score: earnedScore,
        },
        levelScores: {
          ...state.levelScores,
          level1: earnedScore,
        },
        badges: newBadges,
        history: [
          ...state.history,
          {
            timestamp: Date.now(),
            netWorthChange,
            reason: 'Monthly salary allocation & savings',
          },
        ],
      };
    }

    case 'RECORD_DEBT_DECISION': {
      const decision = action.payload;
      const earnedScore = Math.round(decision.scoreImpact * state.streakMultiplier);
      const newHealth = calculateFinancialHealthScore(state.financialHealth, decision.healthImpact).score;
      const newNetWorth = state.netWorth + decision.netWorthImpact;
      const newTotalDebt = state.debt.totalDebt + decision.debtImpact;

      let newStreak = state.streak;
      let newBadges = [...state.badges];

      if (decision.isOptimal) {
        newStreak += 1;
      } else {
        newStreak = 0;
      }

      const newMultiplier = calculateStreakMultiplier(newStreak);

      if (newStreak >= 5 && !newBadges.includes('badge_streak_champion')) {
        newBadges.push('badge_streak_champion');
      }

      const updatedDecisions = [...state.debt.decisions, decision];
      const allOptimal = updatedDecisions.length >= 3 && updatedDecisions.every(d => d.isOptimal);
      if (allOptimal && !newBadges.includes('badge_debt_ninja')) {
        newBadges.push('badge_debt_ninja');
      }

      return {
        ...state,
        netWorth: newNetWorth,
        financialHealth: newHealth,
        score: state.score + earnedScore,
        streak: newStreak,
        streakMultiplier: newMultiplier,
        debt: {
          totalDebt: newTotalDebt,
          decisions: updatedDecisions,
          score: state.debt.score + earnedScore,
        },
        levelScores: {
          ...state.levelScores,
          level2: state.debt.score + earnedScore,
        },
        badges: newBadges,
        history: [
          ...state.history,
          {
            timestamp: Date.now(),
            netWorthChange: decision.netWorthImpact,
            reason: decision.title,
          },
        ],
      };
    }

    case 'SUBMIT_INVESTMENTS': {
      const { choices, score, netWorthChange, healthChange } = action.payload;
      const earnedScore = Math.round(score * state.streakMultiplier);
      const newHealth = calculateFinancialHealthScore(state.financialHealth, healthChange).score;
      const newNetWorth = state.netWorth + netWorthChange;

      const newBadges = [...state.badges];
      const hasIndexFund = choices.some(c => c.category === 'index_fund' && c.allocationAmount > 0);
      const hasNoPonzi = !choices.some(c => (c.category === 'get_rich_quick' || c.category === 'speculative_crypto') && c.allocationAmount > 0);
      
      if (hasIndexFund && hasNoPonzi && !newBadges.includes('badge_invest_strategist')) {
        newBadges.push('badge_invest_strategist');
      }

      return {
        ...state,
        netWorth: newNetWorth,
        financialHealth: newHealth,
        score: state.score + earnedScore,
        investment: {
          portfolioValue: choices.reduce((acc, c) => acc + c.allocationAmount, 0),
          choices,
          score: earnedScore,
        },
        badges: newBadges,
        history: [
          ...state.history,
          {
            timestamp: Date.now(),
            netWorthChange,
            reason: 'Portfolio asset diversification',
          },
        ],
      };
    }

    case 'RECORD_SCAM_VERDICT': {
      const { isCorrect, scoreChange, healthChange, netWorthChange } = action.payload;
      const earnedScore = Math.round(scoreChange * state.streakMultiplier);
      const newHealth = calculateFinancialHealthScore(state.financialHealth, healthChange).score;
      const newNetWorth = state.netWorth + netWorthChange;

      let newStreak = state.streak;
      const newBadges = [...state.badges];

      if (isCorrect) {
        newStreak += 1;
      } else {
        newStreak = 0;
      }
      const newMultiplier = calculateStreakMultiplier(newStreak);

      const detectedScams = isCorrect ? state.scam.detectedScams + 1 : state.scam.detectedScams;
      const missedScams = !isCorrect ? state.scam.missedScams + 1 : state.scam.missedScams;
      const totalAnalyzed = state.scam.totalAnalyzed + 1;

      if (detectedScams >= 2 && !newBadges.includes('badge_scam_hunter')) {
        newBadges.push('badge_scam_hunter');
      }

      return {
        ...state,
        netWorth: newNetWorth,
        financialHealth: newHealth,
        score: state.score + earnedScore,
        streak: newStreak,
        streakMultiplier: newMultiplier,
        scam: {
          detectedScams,
          missedScams,
          totalAnalyzed,
          scamScore: state.scam.scamScore + earnedScore,
        },
        levelScores: {
          ...state.levelScores,
          level3: (state.investment.score || 0) + (state.scam.scamScore + earnedScore),
        },
        badges: newBadges,
        history: [
          ...state.history,
          {
            timestamp: Date.now(),
            netWorthChange,
            reason: isCorrect ? 'Scam Radar intercepted threat' : 'Vulnerable to fraudulent scheme',
          },
        ],
      };
    }

    case 'COMPLETE_LEVEL': {
      const { levelNumber, levelScore } = action.payload;
      const completed = Array.from(new Set([...state.completedLevels, levelNumber]));
      const newLevelKey = `level${levelNumber}` as 'level1' | 'level2' | 'level3';

      const newBadges = [...state.badges];
      if (completed.length >= 3 && !newBadges.includes('badge_financial_pro')) {
        newBadges.push('badge_financial_pro');
      }

      return {
        ...state,
        completedLevels: completed,
        currentLevel: Math.min(3, levelNumber + 1),
        levelScores: {
          ...state.levelScores,
          [newLevelKey]: levelScore,
        },
        badges: newBadges,
      };
    }

    case 'UNLOCK_BADGE': {
      if (state.badges.includes(action.payload)) return state;
      return {
        ...state,
        badges: [...state.badges, action.payload],
      };
    }

    case 'INCREMENT_STREAK': {
      const nextStreak = state.streak + 1;
      return {
        ...state,
        streak: nextStreak,
        streakMultiplier: calculateStreakMultiplier(nextStreak),
      };
    }

    case 'RESET_STREAK': {
      return {
        ...state,
        streak: 0,
        streakMultiplier: 1.0,
      };
    }

    case 'TOGGLE_SOUND': {
      const nextVal = !state.settings.soundEnabled;
      soundManager.setMuted(!nextVal);
      const nextSettings = { ...state.settings, soundEnabled: nextVal };
      persistenceService.saveSettings(nextSettings);
      return {
        ...state,
        settings: nextSettings,
      };
    }

    case 'TOGGLE_REDUCED_MOTION': {
      const nextVal = !state.settings.reducedMotion;
      const nextSettings = { ...state.settings, reducedMotion: nextVal };
      persistenceService.saveSettings(nextSettings);
      return {
        ...state,
        settings: nextSettings,
      };
    }

    case 'SET_THEME': {
      const nextTheme = action.payload;
      const nextSettings = { ...state.settings, theme: nextTheme };
      persistenceService.saveSettings(nextSettings);
      if (typeof document !== 'undefined') {
        if (nextTheme === 'light') {
          document.documentElement.classList.remove('dark');
          document.body.classList.add('theme-clean');
        } else {
          document.documentElement.classList.add('dark');
          document.body.classList.remove('theme-clean');
        }
      }
      return {
        ...state,
        settings: nextSettings,
      };
    }

    case 'TOGGLE_VIDEO_BACKGROUND': {
      const current = state.settings.videoBackground || INITIAL_STATE.settings.videoBackground;
      const nextSettings = {
        ...state.settings,
        videoBackground: {
          ...current,
          enabled: !current.enabled,
        },
      };
      persistenceService.saveSettings(nextSettings);
      return {
        ...state,
        settings: nextSettings,
      };
    }

    case 'SET_VIDEO_BACKGROUND': {
      const current = state.settings.videoBackground || INITIAL_STATE.settings.videoBackground;
      const nextSettings = {
        ...state.settings,
        videoBackground: {
          ...current,
          ...action.payload,
        },
      };
      persistenceService.saveSettings(nextSettings);
      return {
        ...state,
        settings: nextSettings,
      };
    }

    case 'RESTART_GAME': {
      persistenceService.resetGame();
      return {
        ...INITIAL_STATE,
        settings: state.settings,
        gameStage: 'dashboard',
      };
    }

    case 'LOAD_SAVED_GAME': {
      return action.payload;
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  feedback: EducationalFeedback;
  showFeedback: (feedback: Omit<EducationalFeedback, 'isOpen'>) => void;
  hideFeedback: () => void;
  restartQuest: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, () => {
    const saved = persistenceService.loadGame();
    const savedSettings = persistenceService.loadSettings();
    if (saved) {
      const mergedSettings: GameSettings = {
        ...INITIAL_STATE.settings,
        ...(saved.settings || {}),
        videoBackground: {
          ...INITIAL_STATE.settings.videoBackground,
          ...(saved.settings?.videoBackground || {}),
        },
      };
      if (savedSettings) {
        soundManager.setMuted(!savedSettings.soundEnabled);
      }
      return { ...saved, settings: mergedSettings };
    }
    if (savedSettings) {
      soundManager.setMuted(!savedSettings.soundEnabled);
      const mergedSettings: GameSettings = {
        ...INITIAL_STATE.settings,
        ...savedSettings,
        videoBackground: {
          ...INITIAL_STATE.settings.videoBackground,
          ...(savedSettings.videoBackground || {}),
        },
      };
      return { ...INITIAL_STATE, settings: mergedSettings };
    }
    return INITIAL_STATE;
  });

  const [feedback, setFeedback] = useState<EducationalFeedback>({
    isOpen: false,
    title: '',
    verdict: 'success',
    headline: '',
    financialImpact: { netWorthDelta: 0, healthDelta: 0, scoreDelta: 0 },
    whyItHappened: '',
    whatYouShouldLearn: '',
  });

  // Auto-persist game state changes & sync theme
  useEffect(() => {
    persistenceService.saveGame(state);
  }, [state]);

  useEffect(() => {
    if (state.settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('theme-clean');
    } else {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('theme-clean');
    }
  }, [state.settings.theme]);

  const showFeedback = (data: Omit<EducationalFeedback, 'isOpen'>) => {
    if (data.verdict === 'success') {
      soundManager.playSuccess();
    } else if (data.verdict === 'danger') {
      soundManager.playWarning();
    } else {
      soundManager.playClick();
    }
    setFeedback({ ...data, isOpen: true });
  };

  const hideFeedback = () => {
    if (feedback.onContinue) {
      feedback.onContinue();
    }
    setFeedback(prev => ({ ...prev, isOpen: false }));
  };

  const restartQuest = () => {
    dispatch({ type: 'RESTART_GAME' });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        feedback,
        showFeedback,
        hideFeedback,
        restartQuest,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

