import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  Compass,
  Shield,
  HelpCircle,
  ChevronDown,
  TrendingUp,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { AIChatService, ChatSessionMessage } from '../../services/aiChatService';
import { soundManager } from '../../services/audioService';

const DEFAULT_SUGGESTIONS = [
  { icon: <CreditCard className="w-3.5 h-3.5" />, text: 'How do I boost my CIBIL score to 750+?' },
  { icon: <Compass className="w-3.5 h-3.5" />, text: 'Explain the 50/30/20 budget rule' },
  { icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />, text: 'How to spot fake Telegram scams?' },
  { icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />, text: 'What is an Index Fund SIP?' },
  { icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />, text: 'Emergency fund: How much runway?' },
];

export const CoPilotChatbot: React.FC = () => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatSessionMessage[]>([
    {
      id: 'welcome_1',
      sender: 'copilot',
      text: `Greetings, Cadet! I am your **FinQuest Flight Co-Pilot & Financial Instructor**. ✈️\n\nI can calculate your financial altitude, advise on budgeting, credit scores, emergency runways, and scan for cyber scams. What maneuver would you like to review?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'Flight Deck Co-Pilot',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    soundManager.playClick();
    setInputText('');

    const userMsg: ChatSessionMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const response = await AIChatService.sendMessage(query, updatedMessages, {
        stage: state.gameStage,
        financialHealth: state.financialHealth,
        netWorth: state.netWorth,
        score: state.score,
        playerName: state.player.name || 'Cadet',
      });

      const copilotMsg: ChatSessionMessage = {
        id: `copilot_${Date.now()}`,
        sender: 'copilot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: response.provider,
        suggestedPrompts: response.suggestedPrompts,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      soundManager.playSuccess();
    } catch {
      const errorMsg: ChatSessionMessage = {
        id: `err_${Date.now()}`,
        sender: 'copilot',
        text: 'Telemetry temporary glitch. Try asking another flight check question!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'Fallback Mode',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    soundManager.playClick();
    setMessages([
      {
        id: `reset_${Date.now()}`,
        sender: 'copilot',
        text: `Flight log cleared. Standing by for instructions, Cadet! What financial topic shall we navigate?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'Flight Deck Co-Pilot',
      },
    ]);
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON (Bottom-Left parallel to Cursor Companion) ── */}
      <div className="fixed bottom-[calc(1.75rem+env(safe-area-inset-bottom,0px))] left-7 z-40 flex items-center">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                soundManager.playClick();
                setIsOpen(true);
              }}
              className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full glass-elevated border border-[#FF6A2A]/40 shadow-[0_8px_32px_rgba(255,106,42,0.35)] text-white cursor-pointer hover:border-[#FF6A2A] transition-all"
              aria-label="Open Financial Co-Pilot AI Chatbot"
            >
              {/* Radar Pulse Effect */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A2A] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF6A2A]" />
              </span>

              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6A2A] to-[#FF8A50] flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>

              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight tracking-wide font-display text-white">
                  CO-PILOT <span className="text-[#FF6A2A]">AI</span>
                </p>
                <p className="text-[10px] text-zinc-300 font-mono">100% Free Chat</p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── EXPANDED CHAT PANEL (Opens from Bottom-Left) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 left-6 z-50 w-[94vw] sm:w-[440px] h-[640px] max-h-[88vh] rounded-3xl glass-elevated border shadow-2xl flex flex-col overflow-hidden ${
              isLight ? 'border-black/15 bg-white/85 text-zinc-900' : 'border-white/15 bg-[#0D1015]/90 text-white'
            }`}
            data-lenis-prevent="true"
          >
            {/* Header */}
            <div
              className={`px-5 py-4 flex items-center justify-between border-b ${
                isLight ? 'border-black/10 bg-black/03' : 'border-white/10 bg-white/03'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6A2A] to-[#FF8A50] flex items-center justify-center shadow-[0_0_15px_rgba(255,106,42,0.4)]">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0D1015] rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold tracking-wide font-display">
                      FINQUEST <span className="text-[#FF6A2A]">CO-PILOT</span>
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF6A2A]/15 text-[#FF6A2A] border border-[#FF6A2A]/30">
                      FREE
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Tactical Financial Flight Instructor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-black/06 text-zinc-500' : 'hover:bg-white/08 text-zinc-400'
                  }`}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-black/06 text-zinc-500' : 'hover:bg-white/08 text-zinc-400'
                  }`}
                  aria-label="Close Chatbot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Scroll Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-[#FF6A2A] text-white rounded-br-xs'
                          : isLight
                          ? 'bg-black/05 border border-black/08 text-zinc-800 rounded-bl-xs'
                          : 'bg-white/07 border border-white/10 text-zinc-100 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.text}</div>

                      <div
                        className={`mt-1.5 flex items-center justify-between gap-3 text-[10px] opacity-70 font-mono ${
                          isUser ? 'text-orange-100' : isLight ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        {!isUser && m.provider && (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-[#FF6A2A]" />
                            {m.provider}
                          </span>
                        )}
                        <span>{m.timestamp}</span>
                      </div>
                    </div>

                    {/* Follow-up Prompt Chips */}
                    {!isUser && m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                        {m.suggestedPrompts.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(chip)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all text-left border cursor-pointer ${
                              isLight
                                ? 'bg-black/04 border-black/10 hover:bg-[#FF6A2A]/10 hover:border-[#FF6A2A]/30 text-zinc-700'
                                : 'bg-white/05 border-white/10 hover:bg-[#FF6A2A]/15 hover:border-[#FF6A2A]/40 text-zinc-300'
                            }`}
                          >
                            💡 {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl w-fit glass-subtle text-xs">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF6A2A] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-[#FF6A2A] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#FF6A2A] animate-bounce" />
                  </div>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Co-Pilot calculating flight path...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Default Quick Prompt Carousel (if few messages) */}
            {messages.length <= 2 && (
              <div
                className={`px-4 py-2 border-t overflow-x-auto flex gap-2 no-scrollbar ${
                  isLight ? 'border-black/06 bg-black/02' : 'border-white/06 bg-white/02'
                }`}
              >
                {DEFAULT_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(item.text)}
                    className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-colors cursor-pointer flex-shrink-0 ${
                      isLight
                        ? 'bg-black/04 border-black/08 hover:border-[#FF6A2A]/40 hover:bg-[#FF6A2A]/08 text-zinc-700'
                        : 'bg-white/04 border-white/08 hover:border-[#FF6A2A]/40 hover:bg-[#FF6A2A]/10 text-zinc-300'
                    }`}
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div
              className={`p-3 border-t flex flex-col gap-1.5 ${
                isLight ? 'border-black/10 bg-white/90' : 'border-white/10 bg-[#0A0C0F]/90'
              }`}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask your Co-Pilot about budgeting, CIBIL, scams, SIPs..."
                  className={`flex-1 px-4 py-2.5 rounded-2xl text-xs outline-none border transition-colors ${
                    isLight
                      ? 'bg-black/04 border-black/10 text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF6A2A]'
                      : 'bg-white/06 border-white/10 text-white placeholder:text-zinc-500 focus:border-[#FF6A2A]'
                  }`}
                  disabled={isTyping}
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className={`p-2.5 rounded-2xl flex items-center justify-center transition-all ${
                    inputText.trim() && !isTyping
                      ? 'bg-[#FF6A2A] text-white shadow-[0_0_15px_rgba(255,106,42,0.4)] cursor-pointer hover:bg-[#FF7A3D]'
                      : isLight
                      ? 'bg-black/08 text-zinc-400 cursor-not-allowed'
                      : 'bg-white/08 text-zinc-600 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500 font-mono">
                <span>Free · Powered by FinQuest Indian Regulatory Engine</span>
                <span className="hidden sm:inline">Press Enter to send</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
