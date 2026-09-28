import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  badge?: string;
}

const FINQUEST_FAQS: FAQItem[] = [
  {
    id: 'simulator-metaphor',
    question: 'What is FinQuest and why is it structured as a Flight Simulator?',
    badge: 'Aviation Core',
    answer:
      'Pilots do not fly commercial aircraft with passengers without logging hundreds of simulator hours. Similarly, FinQuest trains young adults to manage volatile cash flow, conquer predatory debt traps, and intercept cyber fraud with zero real-world financial risk before entering the modern economy.',
  },
  {
    id: 'real-money',
    question: 'Is any real money or personal banking data required to play?',
    badge: 'Zero Risk',
    answer:
      'Zero real money or bank credentials are ever required. FinQuest is 100% simulated. All salaries (e.g. ₹60,000/month baseline), credit lines, festive sales, and medical emergencies are calculated locally within the simulation engine, allowing you to test aggressive or conservative financial strategies in total safety.',
  },
  {
    id: 'decision-iq',
    question: 'What does Financial Decision IQ and the CIBIL Credit Score measure?',
    badge: 'Scoring Engine',
    answer:
      'Financial Decision IQ measures your cognitive decision quality across 6 key pillars: emergency runway, debt drag, lifestyle creep, volatility resilience, scam interception speed, and compound growth. The simulated CIBIL score (300–850) dynamically updates based on credit utilization and timely debt settlements.',
  },
  {
    id: 'scam-detective',
    question: 'How does the Scam Detective drill train digital fraud interception?',
    badge: 'Scam Radar',
    answer:
      'The Scam Detective simulates authentic Indian fraud vectors—including deceptive OLX UPI QR codes ("Enter PIN to receive money"), fake courier delivery APK download links, lottery phishing, and remote desktop takeover requests. Players learn to spot high-pressure psychological triggers and tactical technical red flags.',
  },
  {
    id: 'classroom-educators',
    question: 'Can schools, colleges, and coaching hubs use FinQuest for students?',
    badge: 'NEP 2020',
    answer:
      'Yes. The FinQuest Classroom & Educator Cockpit aligns directly with NEP 2020 financial literacy guidelines. Teachers can monitor cohort failure traps (such as discovering that 68% of students fall for No-Cost EMIs), assign targeted scenario packs, and host competence-based flight leagues.',
  },
  {
    id: 'certificate-verification',
    question: 'How do I claim my official Certificate of Financial Competence?',
    badge: 'Credential',
    answer:
      'Complete the core training deck drills or complete the 6-Month Life Odyssey. Your pilot call sign, verified Decision IQ delta, final Net Worth, and earned achievement badges are dynamically generated onto a printable A4 certificate with an official FQ-2026-GD01 credential ID.',
  },
];

export const ExpandableFAQ: React.FC = () => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';
  const [openId, setOpenId] = useState<string | null>('simulator-metaphor');

  const toggleItem = (id: string) => {
    soundManager.playClick();
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A2A]/10 text-[#FF6A2A] border border-[#FF6A2A]/30 text-xs font-bold font-numeric">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>PILOT BRIEFING & FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h3 className={`font-display text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
          Everything You Need to Know Before Takeoff
        </h3>
        <p className={`text-xs sm:text-sm max-w-lg mx-auto ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Common questions about the flight simulator mechanics, financial literacy curriculum, and certification.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-2.5">
        {FINQUEST_FAQS.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? isLight
                    ? 'bg-white border-[#FF6A2A]/40 shadow-md'
                    : 'bg-white/06 border-[#FF6A2A]/40 shadow-[0_4px_24px_rgba(255,106,42,0.1)]'
                  : isLight
                  ? 'bg-black/02 border-black/08 hover:bg-black/04'
                  : 'bg-white/03 border-white/08 hover:bg-white/05'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A2A] gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {faq.badge && (
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                        isOpen
                          ? 'bg-[#FF6A2A] text-white'
                          : isLight
                          ? 'bg-black/06 text-zinc-600'
                          : 'bg-white/08 text-zinc-400'
                      }`}
                    >
                      {faq.badge}
                    </span>
                  )}
                  <span
                    className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                      isOpen
                        ? 'text-[#FF6A2A]'
                        : isLight
                        ? 'text-zinc-900'
                        : 'text-zinc-100'
                    }`}
                  >
                    {faq.question}
                  </span>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className={`p-1.5 rounded-xl shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-[#FF6A2A]/15 text-[#FF6A2A]'
                      : isLight
                      ? 'text-zinc-400 bg-black/04'
                      : 'text-zinc-400 bg-white/06'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${faq.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm leading-relaxed border-t ${
                        isLight
                          ? 'text-zinc-700 border-black/06'
                          : 'text-zinc-300 border-white/06'
                      }`}
                    >
                      <p className="pt-3">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
