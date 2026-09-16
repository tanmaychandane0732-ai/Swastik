import { GameSettings, GameState } from '../types/game';

const GAME_STORAGE_KEY = 'finquest_game_state_v1';
const SETTINGS_STORAGE_KEY = 'finquest_settings_v1';

export const persistenceService = {
  saveGame(state: GameState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(GAME_STORAGE_KEY, serialized);
    } catch (e) {
      console.warn('[Persistence] Failed to save game state to LocalStorage:', e);
    }
  },

  loadGame(): GameState | null {
    try {
      const data = localStorage.getItem(GAME_STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as GameState;
      // Basic sanity validation
      if (parsed && typeof parsed.score === 'number' && typeof parsed.netWorth === 'number') {
        return parsed;
      }
      return null;
    } catch (e) {
      console.warn('[Persistence] Corrupted LocalStorage data detected, starting fresh:', e);
      return null;
    }
  },

  resetGame(): void {
    try {
      localStorage.removeItem(GAME_STORAGE_KEY);
    } catch (e) {
      console.warn('[Persistence] Failed to reset game state:', e);
    }
  },

  saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[Persistence] Failed to save settings:', e);
    }
  },

  loadSettings(): GameSettings | null {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as GameSettings;
    } catch (e) {
      return null;
    }
  },
};
