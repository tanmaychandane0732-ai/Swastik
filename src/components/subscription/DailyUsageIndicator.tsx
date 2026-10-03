import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Crown, AlertCircle, Sparkles } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';

interface DailyUsageIndicatorProps {
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const DailyUsageIndicator: React.FC<DailyUsageIndicatorProps> = ({
  compact = false,
  className = '',
  onClick,
}) => {
  const { isPremium, dailyUsage, openPaywall, openPricingModal } = useSubscription();
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';

  const handleClick = () => {
    soundManager.playClick();
    if (onClick) {
      onClick();
      return;
    }
    if (isPremium) {
      openPricingModal();
    } else if (dailyUsage && dailyUsage.gamesRemaining <= 0) {
      openPaywall("Today's flight training limit has been reached.");
    } else {
      openPricingModal();
    }
  };

  if (!dailyUsage) return null;

  // 1. Premium Member Chip
  if (isPremium) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-300 ${
          isLight
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 shadow-sm'
            : 'bg-[#FF6A2A]/15 border-[#FF6A2A]/40 text-[#FF6A2A] shadow-[0_0_12px_rgba(255,106,42,0.20)]'
        } ${className}`}
        title="Flight Commander Premium Member · Click to inspect benefits"
        aria-label="Flight Commander Premium Member"
      >
        <Crown className="w-3.5 h-3.5 fill-current" />
        <span className="font-display font-black tracking-wider text-[11px] uppercase">
          {compact ? 'COMMANDER' : 'COMMANDER · EXPANDED'}
        </span>
      </motion.button>
    );
  }

  // 2. Free User Flight Allowance Meter
  const { gamesRemaining, gamesLimit, gamesUsed } = dailyUsage;
  const isExhausted = gamesRemaining <= 0;
  const isNearlyExhausted = gamesRemaining === 1;

  const badgeColorClass = isExhausted
    ? isLight
      ? 'bg-rose-50 border-rose-300 text-rose-700'
      : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
    : isNearlyExhausted
    ? isLight
      ? 'bg-amber-50 border-amber-300 text-amber-800'
      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
    : isLight
    ? 'bg-black/04 border-black/10 text-zinc-700 hover:border-black/20'
    : 'bg-white/06 border-white/12 text-zinc-300 hover:border-white/25';

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-300 ${badgeColorClass} ${className}`}
      title={
        isExhausted
          ? 'Flight allowance complete for today · Upgrade for expanded access'
          : `${gamesRemaining} flight${gamesRemaining === 1 ? '' : 's'} remaining today`
      }
      aria-label="Daily flight allowance indicator"
    >
      {isExhausted ? (
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse flex-shrink-0" />
      ) : (
        <Plane className="w-3.5 h-3.5 text-[#FF6A2A] flex-shrink-0" />
      )}

      {compact ? (
        <span className="font-numeric font-bold text-[11px]">
          {isExhausted ? '0 FLIGHTS' : `${gamesRemaining} LEFT`}
        </span>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="font-numeric font-bold text-[11px]">
            {gamesUsed} / {gamesLimit}
          </span>
          <span className="text-[10px] opacity-75 uppercase tracking-wider hidden sm:inline">
            {isExhausted ? 'LIMIT REACHED' : 'FLIGHTS'}
          </span>
        </div>
      )}
    </motion.button>
  );
};
