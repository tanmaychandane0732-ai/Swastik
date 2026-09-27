import React from 'react';
import { motion, Variants } from 'framer-motion';

export type RevealVariant =
  | 'hero'
  | 'data'
  | 'flight'
  | 'turbulence'
  | 'investigation'
  | 'radar'
  | 'graduation'
  | 'default';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  className?: string;
  delay?: number;
  chapterBadge?: {
    number: string;
    label: string;
    accentColor?: string;
  };
  transitionTagline?: string;
}

const cubicEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'default',
  className = '',
  delay = 0,
  chapterBadge,
  transitionTagline,
}) => {
  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Custom animation variants matching each section's environment
  const getVariants = (): Variants => {
    if (prefersReducedMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
      };
    }

    switch (variant) {
      case 'hero':
        return {
          hidden: { opacity: 0, y: 30, scale: 0.97 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.7,
              ease: cubicEase,
              delay,
            },
          },
        };

      case 'data':
        // Financial IQ: emerges with crisp precision and upward trajectory
        return {
          hidden: { opacity: 0, y: 38, scale: 0.96, filter: 'blur(6px)' },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
              duration: 0.75,
              ease: cubicEase,
              delay,
            },
          },
        };

      case 'flight':
        // Flight Simulator: slides with aeronautical momentum
        return {
          hidden: { opacity: 0, y: 44, scale: 0.98 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.8,
              ease: cubicEase,
              delay,
            },
          },
        };

      case 'turbulence':
        // Turbulence: energetic entrance with directional kinetic presence
        return {
          hidden: { opacity: 0, y: 35, x: -10, scale: 0.97 },
          visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
              duration: 0.65,
              type: 'spring',
              stiffness: 260,
              damping: 24,
              delay,
            },
          },
        };

      case 'investigation':
        // Scam Detective: scan emergence with subtle scale
        return {
          hidden: { opacity: 0, y: 40, scale: 0.95, filter: 'blur(8px)' },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
              duration: 0.7,
              ease: cubicEase,
              delay,
            },
          },
        };

      case 'radar':
        // Risk Radar: radial expansion from central origin
        return {
          hidden: { opacity: 0, scale: 0.92, filter: 'blur(6px)' },
          visible: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
              duration: 0.8,
              ease: cubicEase,
              delay,
            },
          },
        };

      case 'graduation':
        // Certificate & Report: warm luminous reveal
        return {
          hidden: { opacity: 0, y: 40, scale: 0.96 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.85,
              ease: cubicEase,
              delay,
            },
          },
        };

      case 'default':
      default:
        return {
          hidden: { opacity: 0, y: 32, scale: 0.98 },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 0.65,
              ease: cubicEase,
              delay,
            },
          },
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={variants}
      className={`relative w-full ${className}`}
    >
      {/* Optional Cinematic Chapter Transition Header */}
      {chapterBadge && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: delay * 0.4 }}
          className="flex flex-col items-center justify-center mb-5 space-y-1.5 text-center relative z-10"
        >
          {/* Subtle Ambient Chapter Halo */}
          <div
            className="absolute -top-6 w-32 h-12 rounded-full blur-xl pointer-events-none opacity-40"
            style={{ backgroundColor: chapterBadge.accentColor || '#FF6A2A' }}
          />

          <div
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-sm backdrop-blur-md transition-all duration-300"
            style={{
              borderColor: `${chapterBadge.accentColor || '#FF6A2A'}40`,
              backgroundColor: `${chapterBadge.accentColor || '#FF6A2A'}12`,
            }}
          >
            <span
              className="font-numeric font-black text-xs tracking-wider"
              style={{ color: chapterBadge.accentColor || '#FF6A2A' }}
            >
              {chapterBadge.number}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: chapterBadge.accentColor || '#FF6A2A' }}
            />
            <span className="label-telemetry text-[10px] tracking-[0.2em] font-bold uppercase opacity-90">
              {chapterBadge.label}
            </span>
          </div>

          {transitionTagline && (
            <p className="label-telemetry text-[10px] text-zinc-400 dark:text-zinc-400 opacity-80 tracking-widest uppercase">
              {transitionTagline}
            </p>
          )}
        </motion.div>
      )}

      {children}
    </motion.div>
  );
};
