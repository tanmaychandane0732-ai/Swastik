import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Sliders, X, Check, Film, Eye, Sparkles } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../ui/Button';

export interface VideoPreset {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: 'cyber',
    name: 'Cyber Financial Grid',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31627-large.mp4',
    description: 'Dynamic financial data screens and glowing graphs',
  },
  {
    id: 'particles',
    name: 'Orange Floating Particles',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-golden-particles-floating-slowly-in-space-40615-large.mp4',
    description: 'Ambient warm orange particles drifting through space',
  },
  {
    id: 'minimal',
    name: 'Digital Network Nodes',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-digital-animation-31625-large.mp4',
    description: 'Clean dark nodes pulsing with technological energy',
  },
];

interface LiveVideoBackgroundProps {
  isConfigOpen?: boolean;
  onCloseConfig?: () => void;
}

export const LiveVideoBackground: React.FC<LiveVideoBackgroundProps> = ({
  isConfigOpen = false,
  onCloseConfig,
}) => {
  const { state, dispatch } = useGame();

  const videoSettings = state.settings.videoBackground || {
    enabled: true,
    url: '/hero.mp4',
    preset: 'cyber',
    opacity: 0.35,
  };

  return (
    <>
      {/* Video Customization Configuration Modal */}
      <AnimatePresence>
        {isConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseConfig}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-7 border border-[#27272A] shadow-2xl z-10 my-auto text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#27272A] mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF5E1E]/20 text-[#FF5E1E] flex items-center justify-center font-bold">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Live Video Background
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Ambient high-definition looping backgrounds
                    </p>
                  </div>
                </div>

                <button
                  onClick={onCloseConfig}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#18181D] border border-[#27272A] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Master Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#18181D] border border-[#27272A] mb-5">
                <div>
                  <span className="text-sm font-bold text-white block">
                    Background Video Playback
                  </span>
                  <span className="text-xs text-zinc-400">
                    {videoSettings.enabled ? 'Streaming ambient video in background' : 'Disabled (using clean solid canvas)'}
                  </span>
                </div>

                <button
                  onClick={() => dispatch({ type: 'TOGGLE_VIDEO_BACKGROUND' })}
                  className={`w-12 h-7 rounded-full transition-colors relative p-1 cursor-pointer ${
                    videoSettings.enabled ? 'bg-[#FF5E1E]' : 'bg-zinc-700'
                  }`}
                  role="switch"
                  aria-checked={videoSettings.enabled}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      videoSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Curated Video Presets */}
              <div className="space-y-3 mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Visual Preset
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {VIDEO_PRESETS.map((preset) => {
                    const isSelected = videoSettings.preset === preset.id;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          dispatch({
                            type: 'SET_VIDEO_BACKGROUND',
                            payload: {
                              enabled: true,
                              preset: preset.id as any,
                              url: preset.url,
                            },
                          });
                        }}
                        className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#FF5E1E]/15 border-[#FF5E1E] text-white shadow-sm'
                            : 'bg-[#18181D]/60 hover:bg-[#18181D] border-[#27272A] text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Film className={`w-4 h-4 ${isSelected ? 'text-[#FF5E1E]' : 'text-zinc-500'}`} />
                          <div>
                            <span className="text-sm font-bold block">{preset.name}</span>
                            <span className="text-[11px] text-zinc-400">{preset.description}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#FF5E1E] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Video URL Input */}
              <div className="space-y-2 mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Or Paste Custom Video URL (.mp4, .webm)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={videoSettings.url}
                    onChange={(e) => {
                      dispatch({
                        type: 'SET_VIDEO_BACKGROUND',
                        payload: {
                          url: e.target.value,
                          preset: 'custom',
                        },
                      });
                    }}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[#18181D] text-white border border-[#27272A] focus:outline-none focus:border-[#FF5E1E]"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  Supports any direct MP4 / WebM video link or cloud asset.
                </span>
              </div>

              {/* Video Opacity / Contrast Slider */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Video Visibility (Intensity)
                  </label>
                  <span className="text-xs font-bold font-numeric text-[#FF5E1E]">
                    {Math.round(videoSettings.opacity * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={videoSettings.opacity}
                  onChange={(e) => {
                    dispatch({
                      type: 'SET_VIDEO_BACKGROUND',
                      payload: {
                        opacity: parseFloat(e.target.value),
                      },
                    });
                  }}
                  className="w-full accent-[#FF5E1E] cursor-pointer"
                />
              </div>

              {/* Action Button */}
              <Button
                variant="orange"
                size="md"
                className="w-full"
                onClick={onCloseConfig}
              >
                Done
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

