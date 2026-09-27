import { useGame } from '../contexts/GameContext';
import { soundManager } from '../services/audioService';

/**
 * useAudio — Hook for playing synchronized UI and Game sound events.
 *
 * Automatically respects the global `state.settings.soundEnabled` setting.
 */
export const useAudio = () => {
  const { state } = useGame();
  const isEnabled = state.settings.soundEnabled;

  return {
    isEnabled,
    // UI Events
    playClick: () => isEnabled && soundManager.playClick(),
    playNavChange: () => isEnabled && soundManager.playNavChange(),
    playDrawerOpen: () => isEnabled && soundManager.playDrawerOpen(),
    playDrawerClose: () => isEnabled && soundManager.playDrawerClose(),
    playToggle: () => isEnabled && soundManager.playToggle(),
    playCardFlip: () => isEnabled && soundManager.playCardFlip(),

    // Game Events
    playScenarioAppear: () => isEnabled && soundManager.playScenarioAppear(),
    playDecisionSelected: () => isEnabled && soundManager.playDecisionSelected(),
    playCorrectAnswer: () => isEnabled && soundManager.playCorrectAnswer(),
    playIncorrectAnswer: () => isEnabled && soundManager.playIncorrectAnswer(),
    playWarning: () => isEnabled && soundManager.playWarning(),
    playConsequence: () => isEnabled && soundManager.playConsequence(),
    playTurbulence: () => isEnabled && soundManager.playTurbulence(),
    playFlightStabilized: () => isEnabled && soundManager.playFlightStabilized(),
    playReward: () => isEnabled && soundManager.playReward(),
    playCoin: () => isEnabled && soundManager.playCoin(),
    playSuccess: () => isEnabled && soundManager.playSuccess(),
    playBadgeUnlock: () => isEnabled && soundManager.playBadgeUnlock(),
    playLevelComplete: () => isEnabled && soundManager.playLevelComplete(),
    playRedFlag: () => isEnabled && soundManager.playRedFlag(),
    playRadarPing: () => isEnabled && soundManager.playRadarPing(),
    playFinancialIqResult: () => isEnabled && soundManager.playFinancialIqResult(),
    playFlightReportCompletion: () => isEnabled && soundManager.playFlightReportCompletion(),
  };
};

