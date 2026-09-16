import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { formatCurrency, formatScore } from '../../utils/formatters';

interface AnimatedCounterProps {
  value: number;
  type?: 'currency' | 'score' | 'number';
  className?: string;
  showDelta?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  type = 'currency',
  className = '',
  showDelta = true,
}) => {
  const { current, delta } = useAnimatedCounter(value, 600);

  const formatValue = (val: number) => {
    if (type === 'currency') return formatCurrency(val);
    if (type === 'score') return formatScore(val);
    return val.toLocaleString();
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span className="font-numeric font-bold tracking-tight">
        {formatValue(current)}
      </span>

      {showDelta && (
        <AnimatePresence>
          {delta !== 0 && (
            <motion.span
              key={delta}
              initial={{ opacity: 0, y: 6, scale: 0.8 }}
              animate={{ opacity: 1, y: -14, scale: 1 }}
              exit={{ opacity: 0, y: -22, scale: 0.8 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`absolute -top-1 -right-3 sm:-right-4 translate-x-full px-1.5 py-0.5 rounded text-[11px] font-bold font-numeric shadow-sm pointer-events-none ${
                delta > 0
                  ? 'bg-fin-emerald/20 text-fin-emeraldGlow border border-fin-emerald/40'
                  : 'bg-fin-rose/20 text-rose-400 border border-fin-rose/40'
              }`}
            >
              {type === 'currency' ? formatCurrency(delta, true) : (delta > 0 ? `+${delta}` : delta)}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
