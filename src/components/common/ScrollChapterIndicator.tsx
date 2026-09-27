import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChapterInfo {
  id: string;
  label: string;
  name: string;
  accent: string;
}

export const CHAPTERS: ChapterInfo[] = [
  { id: 'hero', label: '01', name: 'PRE-FLIGHT', accent: '#00D2FF' },
  { id: 'diagnostic', label: '02', name: 'IQ DIAGNOSTIC', accent: '#38BDF8' },
  { id: 'simulator', label: '03', name: 'FLIGHT ODYSSEY', accent: '#FF6A2A' },
  { id: 'drills', label: '04', name: 'COMBAT DECK', accent: '#A855F7' },
  { id: 'whatif', label: '05', name: 'TURBULENCE', accent: '#EF4444' },
  { id: 'certificate', label: '06', name: 'FLIGHT REPORT', accent: '#F59E0B' },
  { id: 'classroom', label: '07', name: 'CLASSROOM', accent: '#00D2FF' },
  { id: 'cta', label: '08', name: 'TAKEOFF', accent: '#FF6A2A' },
];

interface ScrollChapterIndicatorProps {
  /** Only render the indicator on the landing page */
  visible?: boolean;
  onActiveChapterChange?: (chapterId: string) => void;
}

export const ScrollChapterIndicator: React.FC<ScrollChapterIndicatorProps> = ({
  visible = true,
  onActiveChapterChange,
}) => {
  const [activeChapter, setActiveChapter] = useState<string>('hero');

  useEffect(() => {
    if (!visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id);
            onActiveChapterChange?.(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0,
      }
    );

    CHAPTERS.forEach((chapter) => {
      const el = document.getElementById(chapter.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [visible, onActiveChapterChange]);

  if (!visible) return null;

  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentChapter = CHAPTERS.find((c) => c.id === activeChapter) || CHAPTERS[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3 items-end select-none"
        aria-label="Narrative chapters"
        role="navigation"
      >
        {CHAPTERS.map((chapter) => {
          const isActive = activeChapter === chapter.id;
          return (
            <button
              key={chapter.id}
              onClick={() => scrollToChapter(chapter.id)}
              className="group flex items-center gap-2.5 focus:outline-none cursor-pointer"
              aria-label={`Jump to chapter ${chapter.label}: ${chapter.name}`}
            >
              {/* Chapter name — visible on active or hover */}
              <span
                className={`text-[10px] font-mono tracking-[0.14em] transition-all duration-300 ${
                  isActive
                    ? 'opacity-100 font-bold'
                    : 'opacity-0 group-hover:opacity-100 text-zinc-500'
                }`}
                style={{
                  color: isActive ? chapter.accent : undefined,
                }}
              >
                {chapter.label} {chapter.name}
              </span>

              {/* Dynamic Chapter Indicator Bar */}
              <motion.div
                animate={{
                  width: isActive ? 26 : 4,
                  backgroundColor: isActive ? chapter.accent : 'rgba(161, 161, 170, 0.35)',
                  boxShadow: isActive ? `0 0 12px ${chapter.accent}` : 'none',
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="h-[3px] rounded-full"
                style={{ width: 4 }}
              />
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};
