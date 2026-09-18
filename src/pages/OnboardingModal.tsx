import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, User, X, Award, CheckCircle2, KeyRound, Mail, AlertCircle, LogIn, UserPlus, Play } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui/Button';
import { AuthApi } from '../services/api/authApi';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'guest' | 'login' | 'register'>('guest');
  const [name, setName] = useState(state.player.name || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'FinQuester';
    dispatch({ type: 'SET_PLAYER_NAME', payload: finalName });
    dispatch({ type: 'SET_STAGE', payload: 'dashboard' });

    // Non-blocking background telemetry credentials
    AuthApi.guest(finalName).catch(() => {});
    onClose();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await AuthApi.login(email, password);
        if (res.success && res.data?.user) {
          dispatch({ type: 'SET_PLAYER_NAME', payload: res.data.user.name });
          dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
          onClose();
        } else {
          setErrorMessage(res.message || 'Invalid credentials.');
        }
      } else if (activeTab === 'register') {
        const res = await AuthApi.register(name || 'Cadet Aviator', email, password);
        if (res.success && res.data?.user) {
          dispatch({ type: 'SET_PLAYER_NAME', payload: res.data.user.name });
          dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
          onClose();
        } else {
          setErrorMessage(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please try guest mode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-[#27272A] shadow-2xl z-10 my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#FF5E1E] flex items-center justify-center mb-4 shadow-brand-orange text-black font-black">
            <Compass className="w-6 h-6" />
          </div>

          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5E1E] px-2.5 py-0.5 rounded-full bg-[#FF5E1E]/15 border border-[#FF5E1E]/40 inline-block">
              Career Flight Registration
            </span>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#18181D] p-0.5 rounded-lg border border-[#27272A] text-[10px] font-bold">
              <button
                type="button"
                onClick={() => { setActiveTab('guest'); setErrorMessage(null); }}
                className={`px-2 py-0.5 rounded ${activeTab === 'guest' ? 'bg-[#FF5E1E] text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Instant Play
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
                className={`px-2 py-0.5 rounded ${activeTab === 'login' ? 'bg-[#FF5E1E] text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
                className={`px-2 py-0.5 rounded ${activeTab === 'register' ? 'bg-[#FF5E1E] text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
            {activeTab === 'guest' ? 'What is your name?' : activeTab === 'login' ? 'Pilot Flight Deck Login' : 'Register Pilot Credentials'}
          </h3>

          <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
            {activeTab === 'guest'
              ? 'Enter your name to launch immediately. Your name will appear across your flight cockpit and will be printed on your official Certificate of Financial Competence.'
              : activeTab === 'login'
              ? 'Sign in to access your cloud telemetry, previous flight black box logs, and verified certificates.'
              : 'Create a permanent pilot flight account to sync your simulator records and compete on national leaderboards.'}
          </p>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'guest' ? (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label htmlFor="playerName" className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Enter Your Full Name</span>
                  <span className="text-[10px] text-[#FF5E1E] font-extrabold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Printed on Certificate
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4 text-[#FF5E1E]" />
                  </div>
                  <input
                    id="playerName"
                    type="text"
                    maxLength={32}
                    placeholder="e.g. Tanmay Chandane, Alex Trader"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#18181D] border border-[#27272A] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#FF5E1E] focus:ring-2 focus:ring-[#FF5E1E]/30 transition-all font-bold"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#18181D] border border-[#27272A] text-[11px] text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <span>Certified under Team Swastik • GD-01 Track</span>
              </div>

              <Button
                type="submit"
                variant="orange"
                size="lg"
                icon={<Play className="w-5 h-5 fill-white" />}
                className="w-full shadow-brand-orange py-4 text-base tracking-wide"
              >
                Launch Financial Flight Simulator
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {activeTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-[#FF5E1E]" />
                    <input
                      type="text"
                      placeholder="Pilot Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18181D] border border-[#27272A] text-white text-sm focus:outline-none focus:border-[#FF5E1E]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-[#FF5E1E]" />
                  <input
                    type="email"
                    placeholder="pilot@finquest.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18181D] border border-[#27272A] text-white text-sm focus:outline-none focus:border-[#FF5E1E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-4 h-4 text-[#FF5E1E]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18181D] border border-[#27272A] text-white text-sm focus:outline-none focus:border-[#FF5E1E]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="orange"
                size="lg"
                disabled={isLoading}
                icon={activeTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                className="w-full shadow-brand-orange py-3 text-sm font-bold tracking-wide mt-2"
              >
                {isLoading ? 'Authorizing Flight Deck...' : activeTab === 'login' ? 'Sign In & Fly' : 'Register & Fly'}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
