import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glow?: 'none' | 'emerald' | 'indigo' | 'rose';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  hoverEffect = false,
  glow = 'none',
  className = '',
  ...props
}) => {
  const glowStyles = {
    none: '',
    emerald: 'shadow-neon-emerald border-emerald-500/30',
    indigo: 'shadow-neon-indigo border-indigo-500/30',
    rose: 'shadow-neon-rose border-rose-500/30',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -3, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`glass-card rounded-2xl p-4 sm:p-6 transition-all duration-200 ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
