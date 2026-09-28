import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'subtle' | 'default' | 'elevated';
  hoverEffect?: boolean;
  reflection?: boolean;
  glow?: 'none' | 'emerald' | 'indigo' | 'rose' | 'amber';
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  reflection = false,
  glow = 'none',
  className = '',
  ...props
}) => {
  const glowStyles = {
    none: '',
    emerald: 'shadow-neon-emerald border-emerald-500/30',
    indigo: 'shadow-neon-indigo border-indigo-500/30',
    rose: 'shadow-neon-rose border-rose-500/30',
    amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  };

  const variantClass = {
    subtle: 'glass-subtle',
    default: 'glass-card',
    elevated: 'glass-elevated',
  }[variant];

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`${variantClass} ${hoverEffect ? 'glass-card-hover cursor-pointer' : ''} ${reflection ? 'glass-reflection' : ''} rounded-2xl p-4 sm:p-6 transition-all duration-250 ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
