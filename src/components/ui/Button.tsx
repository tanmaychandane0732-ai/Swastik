import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { soundManager } from '../../services/audioService';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'emerald' | 'indigo' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  muteSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'indigo',
  size = 'md',
  icon,
  iconPosition = 'left',
  muteSound = false,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !muteSound) {
      soundManager.playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-colors duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-fin-bg';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-neon-emerald border border-emerald-400/30 focus-visible:ring-emerald-400',
    indigo: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-neon-indigo border border-indigo-400/30 focus-visible:ring-indigo-400',
    secondary: 'glass-card hover:bg-slate-700/70 text-slate-100 border border-slate-700/60 focus-visible:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-neon-rose border border-rose-400/30 focus-visible:ring-rose-400',
    ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-white focus-visible:ring-slate-400',
  };

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </motion.button>
  );
};

