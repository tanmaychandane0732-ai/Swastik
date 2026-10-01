import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  User,
  X,
  Award,
  CheckCircle2,
  KeyRound,
  Mail,
  AlertCircle,
  LogIn,
  UserPlus,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui/Button';
import { localAuth } from '../services/localAuth';
import { AuthApi } from '../services/api/authApi';
import { soundManager } from '../services/audioService';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'register' | 'login' | 'guest';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'register',
}) => {
  const { state, dispatch } = useGame();
  const isLight = state.settings.theme === 'light';

  // Tabs: 'register' (Sign In / Create Account), 'login' (Log In), 'guest' (Quick Callsign)
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'guest'>(initialTab);
  const [name, setName] = useState(state.player.name || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      soundManager.playScenarioAppear();
      setActiveTab(initialTab);
      setErrorMessage(null);
      setSuccessMessage(null);
      if (state.player.name && !name) {
        setName(state.player.name);
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Handle Quick Guest Username submit (Temporary without password)
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const cleanName = name.trim() || 'Cadet Pilot';

    const apiResponse = await AuthApi.guest(cleanName);
    if (!apiResponse.success && apiResponse.error?.code !== 'NETWORK_OFFLINE') {
      soundManager.playWarning();
      setErrorMessage(apiResponse.message || 'Unable to create the pilot profile.');
      return;
    }
    const user = apiResponse.success ? apiResponse.data.user : localAuth.startAsGuest(cleanName).user;
    dispatch({ type: 'SET_PLAYER_NAME', payload: user.name });
    soundManager.playSuccess();
    setSuccessMessage(`Welcome aboard, ${user.name}! Flight clearance granted.`);

    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Handle Login or Register
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (activeTab === 'register') {
      const apiResponse = await AuthApi.register(name, email, password);
      if (apiResponse.success && apiResponse.data?.user) {
        const user = apiResponse.data.user;
        localAuth.setActiveSession({ ...user, createdAt: new Date().toISOString() });
        dispatch({ type: 'SET_PLAYER_NAME', payload: user.name });
        soundManager.playSuccess();
        setSuccessMessage(`Account created for Pilot ${user.name}! Your profile is saved.`);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        const res = localAuth.register(name, email, password);
        if (res.success && res.user && apiResponse.error?.code === 'NETWORK_OFFLINE') {
          dispatch({ type: 'SET_PLAYER_NAME', payload: res.user.name });
          soundManager.playSuccess();
          setSuccessMessage(`Account created for Pilot ${res.user.name}! Backend is offline; saved locally.`);
          setTimeout(() => onClose(), 700);
          return;
        }
        soundManager.playWarning();
        setErrorMessage(apiResponse.message || res.message || 'Registration failed. Please check your credentials.');
      }
    } else if (activeTab === 'login') {
      const apiResponse = await AuthApi.login(email || name, password);
      if (apiResponse.success && apiResponse.data?.user) {
        const user = apiResponse.data.user;
        localAuth.setActiveSession({ ...user, createdAt: new Date().toISOString() });
        dispatch({ type: 'SET_PLAYER_NAME', payload: user.name });
        soundManager.playSuccess();
        setSuccessMessage(`Welcome back, Captain ${user.name}! Telemetry synchronized.`);
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        const res = localAuth.login(email || name, password);
        if (res.success && res.user && apiResponse.error?.code === 'NETWORK_OFFLINE') {
          dispatch({ type: 'SET_PLAYER_NAME', payload: res.user.name });
          soundManager.playSuccess();
          setSuccessMessage(`Welcome back, Captain ${res.user.name}! Backend is offline; using local session.`);
          setTimeout(() => onClose(), 700);
          return;
        }
        soundManager.playWarning();
        setErrorMessage(apiResponse.message || res.message || 'Log in failed. User should sign in first before logging in.');
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-lg glass-elevated rounded-3xl p-6 sm:p-8 border shadow-2xl z-10 my-auto ${
            isLight
              ? 'text-[#17191D] border-black/10'
              : 'text-[#F5F5F2] border-white/12'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className={`absolute top-5 right-5 p-2 rounded-xl transition-colors cursor-pointer border ${
              isLight
                ? 'text-zinc-500 hover:text-zinc-900 bg-zinc-100 border-zinc-200'
                : 'text-zinc-400 hover:text-white bg-[#18181D] border-white/10 hover:border-[#FF6A2A]'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon & Track Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6A2A] flex items-center justify-center shadow-brand-orange text-white font-black">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6A2A] px-2.5 py-0.5 rounded-full bg-[#FF6A2A]/15 border border-[#FF6A2A]/35 font-numeric">
                  FLIGHT CLEARANCE CONTROL
                </span>
                <span className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Local Mode Active
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5 font-display">
                {activeTab === 'register'
                  ? 'Sign In / Create Account'
                  : activeTab === 'login'
                  ? 'Pilot Flight Deck Login'
                  : 'Quick Pilot Callsign'}
              </h3>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className={`grid grid-cols-3 gap-1 p-1 rounded-2xl border mb-5 text-xs font-bold ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-black/40 border-white/10'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-[#FF6A2A] text-white shadow-md font-extrabold'
                  : isLight
                  ? 'text-zinc-600 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign In (New)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-[#FF6A2A] text-white shadow-md font-extrabold'
                  : isLight
                  ? 'text-zinc-600 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setActiveTab('guest');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'guest'
                  ? 'bg-[#FF6A2A] text-white shadow-md font-extrabold'
                  : isLight
                  ? 'text-zinc-600 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Quick Callsign</span>
            </button>
          </div>

          {/* Description */}
          <p className={`text-xs mb-4 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
            {activeTab === 'register'
              ? 'New cadets should sign in/register first to create a local pilot profile. Stores your credentials locally and syncs flight records.'
              : activeTab === 'login'
              ? 'Already signed in previously? Log in with your registered email/callsign and password to resume your career.'
              : 'Don’t want a password right now? Enter a temporary username/callsign to start playing games immediately.'}
          </p>

          {/* Error Feedback */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Clearance Issue</p>
                <p className="mt-0.5">{errorMessage}</p>
                {activeTab === 'login' && errorMessage.includes('Sign In') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage(null);
                    }}
                    className="text-[#FF6A2A] underline font-bold mt-1 inline-block cursor-pointer"
                  >
                    Switch to Sign In (Register) now →
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Success Feedback */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-bold">{successMessage}</span>
            </motion.div>
          )}

          {/* ── Form: Quick Callsign (Guest) ────────────────────────── */}
          {activeTab === 'guest' ? (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="guestName"
                  className={`block text-xs font-bold mb-1.5 flex items-center justify-between ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  <span>Pilot Username / Callsign</span>
                  <span className="text-[10px] text-[#FF6A2A] font-extrabold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Printed on Certificate
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4 text-[#FF6A2A]" />
                  </div>
                  <input
                    id="guestName"
                    type="text"
                    maxLength={32}
                    placeholder="Enter callsign (e.g. Tanmay, Maverick)..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm focus:outline-none focus:border-[#FF6A2A] focus:ring-2 focus:ring-[#FF6A2A]/30 transition-all font-bold ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                        : 'bg-[#141720] border-white/10 text-white placeholder-zinc-500'
                    }`}
                    autoFocus
                  />
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl border text-[11px] flex items-center gap-2 ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-600'
                    : 'bg-white/03 border-white/08 text-zinc-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero password required. You can upgrade to a permanent account anytime from your Profile Drawer.</span>
              </div>

              <Button
                type="submit"
                variant="orange"
                size="lg"
                icon={<Play className="w-5 h-5 fill-current" />}
                className="w-full shadow-brand-orange py-4 text-sm sm:text-base font-extrabold tracking-wide"
              >
                START AS GUEST PILOT
              </Button>
            </form>
          ) : (
            /* ── Form: Register (Sign In) or Login ─────────────────── */
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {activeTab === 'register' && (
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 ${
                      isLight ? 'text-zinc-700' : 'text-zinc-300'
                    }`}
                  >
                    Pilot Name / Callsign
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FF6A2A]" />
                    <input
                      type="text"
                      placeholder="e.g. Tanmay Chandane"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={32}
                      className={`w-full pl-10 pr-3 py-3 rounded-2xl border text-sm font-bold focus:outline-none focus:border-[#FF6A2A] transition-all ${
                        isLight
                          ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                          : 'bg-[#141720] border-white/10 text-white placeholder-zinc-500'
                      }`}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  {activeTab === 'register' ? 'Email Address' : 'Email Address or Pilot Callsign'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FF6A2A]" />
                  <input
                    type={activeTab === 'register' ? 'email' : 'text'}
                    placeholder={
                      activeTab === 'register'
                        ? 'pilot@finquest.edu'
                        : 'Enter registered email or callsign...'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-10 pr-3 py-3 rounded-2xl border text-sm font-bold focus:outline-none focus:border-[#FF6A2A] transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                        : 'bg-[#141720] border-white/10 text-white placeholder-zinc-500'
                    }`}
                    autoFocus={activeTab === 'login'}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-[#FF6A2A]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                    className={`w-full pl-10 pr-3 py-3 rounded-2xl border text-sm font-bold focus:outline-none focus:border-[#FF6A2A] transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                        : 'bg-[#141720] border-white/10 text-white placeholder-zinc-500'
                    }`}
                  />
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-600'
                    : 'bg-white/03 border-white/08 text-zinc-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Stored securely on device (Local Engine)</span>
                </span>
                <span className="text-[10px] font-mono text-[#A7ABB4]">GD-01 Track</span>
              </div>

              <Button
                type="submit"
                variant="orange"
                size="lg"
                icon={
                  activeTab === 'login' ? (
                    <LogIn className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )
                }
                className="w-full shadow-brand-orange py-3.5 text-sm font-extrabold tracking-wide mt-1"
              >
                {activeTab === 'login'
                  ? 'LOG IN & ENTER COCKPIT'
                  : 'SIGN IN (CREATE ACCOUNT) & FLY'}
              </Button>
            </form>
          )}

          {/* Toggle Helper Footer */}
          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            {activeTab === 'register' ? (
              <p className={`text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Already registered previously?{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className="text-[#FF6A2A] font-bold hover:underline cursor-pointer"
                >
                  Log In here →
                </button>
              </p>
            ) : activeTab === 'login' ? (
              <p className={`text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                New to FinQuest? User must sign in first:{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-[#FF6A2A] font-bold hover:underline cursor-pointer"
                >
                  Sign In / Create Account →
                </button>
              </p>
            ) : (
              <p className={`text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Want to save your flight records permanently?{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-[#FF6A2A] font-bold hover:underline cursor-pointer"
                >
                  Sign In / Create Account →
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
