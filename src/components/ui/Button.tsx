import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { soundManager } from '../../services/audioService';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'orange' | 'emerald' | 'indigo' | 'secondary' | 'danger' | 'ghost' | 'dark' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  muteSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'orange',
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

  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    orange: 'bg-[#FF6A2A] hover:bg-[#E04E15] text-white shadow-brand-orange border border-[#FF6A2A]/50 focus-visible:ring-[#FF6A2A]',
    dark: 'bg-[#0A0A0C] hover:bg-[#18181D] text-white border border-[#27272A] focus-visible:ring-[#FF6A2A]',
    emerald: 'bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-discord border border-[#22C55E]/40 focus-visible:ring-[#22C55E]',
    indigo: 'bg-[#FF6A2A] hover:bg-[#E04E15] text-white shadow-brand-orange border border-[#FF6A2A]/40 focus-visible:ring-[#FF6A2A]',
    secondary: 'glass-subtle hover:bg-white/10 text-[#F5F5F2] border border-white/15 focus-visible:ring-[#FF6A2A]',
    glass: 'glass-subtle hover:bg-white/12 text-[#F5F5F2] border border-white/15 focus-visible:ring-[#FF6A2A]',
    danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-discord border border-[#EF4444]/40 focus-visible:ring-[#EF4444]',
    ghost: 'hover:bg-white/06 text-zinc-300 hover:text-white focus-visible:ring-[#FF6A2A]',
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
