import React from 'react';
import teamLogoImg from '../../assets/team_logo.jpg';

interface TeamLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  size = 'sm',
  showText = false,
  className = '',
}) => {
  const sizeStyles = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-11 w-auto',
    lg: 'h-16 w-auto',
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="relative overflow-hidden rounded-lg bg-black flex items-center justify-center p-0.5 border border-[#27272A] shrink-0">
        <img
          src={teamLogoImg}
          alt="Team Swastik Logo"
          className={`${sizeStyles[size]} object-contain`}
          loading="eager"
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
            Developed By
          </span>
          <span className="text-xs font-black tracking-wider text-white">
            Team Swastik
          </span>
        </div>
      )}
    </div>
  );
};
