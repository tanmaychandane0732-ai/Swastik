/**
 * FinQuest Local Authentication Engine
 *
 * Implements client-side local authentication with persistence in LocalStorage.
 * Handles:
 * 1. Sign In / Register (Create account with pilot name, email, password)
 * 2. Log In (Validates against locally saved accounts; alerts if user hasn't signed up first)
 * 3. Quick Pilot Start (Guest username / callsign with zero password for immediate trial)
 * 4. Active session tracking across reloads
 */

export interface LocalPilotUser {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  role?: string;
  createdAt: string;
}

interface StoredAccount extends LocalPilotUser {
  passwordHash: string;
}

const REGISTERED_USERS_KEY = 'finquest_local_registered_users_v1';
const ACTIVE_USER_KEY = 'finquest_pilot_user';
const ACTIVE_NAME_KEY = 'finquest_pilot_name';
const TOKEN_KEY = 'finquest_pilot_token';

export const localAuth = {
  /**
   * Fetch all registered accounts on this device
   */
  getRegisteredUsers(): StoredAccount[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Register / Sign In a new pilot account locally
   */
  register(name: string, email: string, password: string): { success: boolean; message?: string; user?: LocalPilotUser } {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please enter a valid Pilot Callsign (at least 2 characters).' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid flight clearance email address.' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const users = this.getRegisteredUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (existing) {
      return {
        success: false,
        message: 'An account with this email or callsign already exists. Please switch to Log In!',
      };
    }

    const newAccount: StoredAccount = {
      id: `pilot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: cleanPass,
      isGuest: false,
      role: 'pilot',
      createdAt: new Date().toISOString(),
    };

    users.push(newAccount);
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
      this.setActiveSession(newAccount);
    } catch (e) {
      console.warn('[LocalAuth] Failed to persist user:', e);
    }

    const { passwordHash: _, ...publicUser } = newAccount;
    return { success: true, user: publicUser };
  },

  /**
   * Log In with existing registered credentials
   * Enforces that user should sign in/register first if no account exists!
   */
  login(emailOrCallsign: string, password: string): { success: boolean; message?: string; user?: LocalPilotUser } {
    const query = emailOrCallsign.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!query) {
      return { success: false, message: 'Please enter your registered email or pilot callsign.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'Please enter your password.' };
    }

    const users = this.getRegisteredUsers();

    if (users.length === 0) {
      return {
        success: false,
        message: 'No registered accounts found on this device. Please Sign In / Create Account first!',
      };
    }

    const user = users.find(
      (u) => u.email.toLowerCase() === query || u.name.toLowerCase() === query
    );

    if (!user) {
      return {
        success: false,
        message: 'Account not found. Please Sign In / Create Account first before logging in!',
      };
    }

    if (user.passwordHash !== cleanPass) {
      return {
        success: false,
        message: 'Incorrect password. Please verify your flight security clearance.',
      };
    }

    this.setActiveSession(user);
    const { passwordHash: _, ...publicUser } = user;
    return { success: true, user: publicUser };
  },

  /**
   * Quick start with temporary username / callsign (No password required)
   */
  startAsGuest(callsign: string): { success: boolean; user: LocalPilotUser } {
    const finalName = callsign.trim() || 'Cadet Aviator';

    const guestUser: LocalPilotUser = {
      id: `guest_${Date.now()}`,
      name: finalName,
      email: '',
      isGuest: true,
      role: 'guest',
      createdAt: new Date().toISOString(),
    };

    this.setActiveSession(guestUser);
    return { success: true, user: guestUser };
  },

  /**
   * Store current active session
   */
  setActiveSession(user: LocalPilotUser): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      localStorage.setItem(ACTIVE_NAME_KEY, user.name);
      localStorage.setItem(TOKEN_KEY, `local_token_${Date.now()}`);
    } catch {}
  },

  /**
   * Retrieve current active user session
   */
  getCurrentUser(): LocalPilotUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ACTIVE_USER_KEY);
      if (data) return JSON.parse(data);
      const name = localStorage.getItem(ACTIVE_NAME_KEY);
      if (name && name.trim()) {
        return {
          id: 'local_cached',
          name: name.trim(),
          email: '',
          isGuest: true,
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Check if pilot has an established name or authenticated session
   */
  isIdentified(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.name && user.name.trim() !== '' && user.name !== 'Cadet');
  },

  /**
   * Log out and clear active session
   */
  logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACTIVE_USER_KEY);
      localStorage.removeItem(ACTIVE_NAME_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
};
