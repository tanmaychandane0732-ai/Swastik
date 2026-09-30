import React, { useEffect, useRef, useCallback } from 'react';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface ScrollImageSequenceCanvasProps {
  isLight?: boolean;
}

const TOTAL_FRAMES = 300;
const INITIAL_PRELOAD_COUNT = 20;
const BATCH_SIZE = 6;
const BATCH_INTERVAL_MS = 200;

/**
 * ScrollImageSequenceCanvas — Cinematic Apple-Style Scroll-Linked Image Sequence
 *
 * Performance-optimized:
 * - Full-screen sticky/fixed HTML5 Canvas pinned behind hero & landing page.
 * - On-demand requestAnimationFrame: only runs while scrolling / lerping, 0% CPU at rest.
 * - Frame-deduplication: skips redundant redraws when rounded frame index has not changed.
 * - Cached radial and linear gradients: created once per canvas dimension/theme change.
 * - Non-blocking frame preloading: prioritizes active viewport window, gentle background batches.
 * - Full Retina / DPR support with zero distortion cover scaling.
 * - Accessibility-ready: respects prefers-reduced-motion.
 */
export const ScrollImageSequenceCanvas: React.FC<ScrollImageSequenceCanvasProps> = ({
  isLight = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { lenis } = useSmoothScroll();

  // Frame caches
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const isPreloadingRef = useRef<boolean>(false);

  // Animation & Interpolation tracking
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const lastRenderedIndexRef = useRef<number>(-1);
  const rafIdRef = useRef<number>(0);
  const isLoopRunningRef = useRef<boolean>(false);

  // Cached dimensions & gradients
  const sizeRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 1 });
  const radialGradRef = useRef<CanvasGradient | null>(null);
  const linearGradRef = useRef<CanvasGradient | null>(null);
  const lastThemeRef = useRef<boolean>(isLight);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Frame path generator
  const getFrameSrc = useCallback((index: number) => {
    const padded = String(Math.max(0, Math.min(TOTAL_FRAMES - 1, index))).padStart(3, '0');
    return `/media/frames/frame_${padded}.webp`;
  }, []);

  // Preload a single frame
  const preloadFrame = useCallback(
    (index: number, onLoaded?: () => void) => {
      if (index < 0 || index >= TOTAL_FRAMES) return;
      if (loadedRef.current[index] && imagesRef.current[index]) {
        onLoaded?.();
        return;
      }
      if (imagesRef.current[index]) return; // already loading

      const img = new Image();
      img.src = getFrameSrc(index);
      img.onload = () => {
        loadedRef.current[index] = true;
        imagesRef.current[index] = img;
        onLoaded?.();
      };
      img.onerror = () => {
        // Retry once after brief delay
        setTimeout(() => {
          if (!loadedRef.current[index]) {
            const retryImg = new Image();
            retryImg.src = getFrameSrc(index);
            retryImg.onload = () => {
              loadedRef.current[index] = true;
              imagesRef.current[index] = retryImg;
              onLoaded?.();
            };
          }
        }, 2000);
      };
      imagesRef.current[index] = img;
    },
    [getFrameSrc]
  );

  // Find nearest loaded frame to prevent black frames or freezing
  const getNearestLoadedFrame = useCallback((index: number): HTMLImageElement | null => {
    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    if (loadedRef.current[clamped] && imagesRef.current[clamped]) {
      return imagesRef.current[clamped];
    }
    // Search outwards from target
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const down = clamped - offset;
      if (down >= 0 && loadedRef.current[down] && imagesRef.current[down]) {
        return imagesRef.current[down];
      }
      const up = clamped + offset;
      if (up < TOTAL_FRAMES && loadedRef.current[up] && imagesRef.current[up]) {
        return imagesRef.current[up];
      }
    }
    return null;
  }, []);

  // Update canvas sizing and cached gradients
  const updateCanvasDimensions = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      const physicalWidth = Math.floor(width * dpr);
      const physicalHeight = Math.floor(height * dpr);

      const needsResize =
        sizeRef.current.width !== physicalWidth ||
        sizeRef.current.height !== physicalHeight ||
        sizeRef.current.dpr !== dpr ||
        lastThemeRef.current !== isLight;

      if (needsResize) {
        sizeRef.current = { width: physicalWidth, height: physicalHeight, dpr };
        lastThemeRef.current = isLight;

        if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
          canvas.width = physicalWidth;
          canvas.height = physicalHeight;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        }

        // Rebuild cached gradients
        const maxDim = Math.max(physicalWidth, physicalHeight);
        const centerX = physicalWidth / 2;
        const centerY = physicalHeight / 2;

        const radialGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          maxDim * 0.2,
          centerX,
          centerY,
          maxDim * 0.72
        );

        if (isLight) {
          radialGrad.addColorStop(0, 'rgba(244, 241, 236, 0.15)');
          radialGrad.addColorStop(0.5, 'rgba(244, 241, 236, 0.45)');
          radialGrad.addColorStop(0.85, 'rgba(244, 241, 236, 0.88)');
          radialGrad.addColorStop(1, '#F4F1EC');
        } else {
          radialGrad.addColorStop(0, 'rgba(10, 12, 15, 0.22)');
          radialGrad.addColorStop(0.5, 'rgba(10, 12, 15, 0.55)');
          radialGrad.addColorStop(0.82, 'rgba(10, 12, 15, 0.88)');
          radialGrad.addColorStop(1, '#0A0C0F');
        }
        radialGradRef.current = radialGrad;

        const linearGrad = ctx.createLinearGradient(0, 0, 0, physicalHeight);
        if (isLight) {
          linearGrad.addColorStop(0, 'rgba(255, 235, 204, 0.10)');
          linearGrad.addColorStop(1, 'rgba(244, 241, 236, 0.65)');
        } else {
          linearGrad.addColorStop(0, 'rgba(255, 170, 42, 0.04)');
          linearGrad.addColorStop(0.5, 'rgba(10, 12, 15, 0.25)');
          linearGrad.addColorStop(1, 'rgba(10, 12, 15, 0.60)');
        }
        linearGradRef.current = linearGrad;
      }
    },
    [isLight]
  );

  // Draw frame on canvas with responsive cover scaling & luxury vignette
  const drawFrame = useCallback(
    (frameIndex: number, forceRedraw = false) => {
      const targetIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));

      // Skip redundant repaints if same frame is already visible
      if (!forceRedraw && targetIndex === lastRenderedIndexRef.current) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = getNearestLoadedFrame(targetIndex);
      if (!img) return;

      updateCanvasDimensions(canvas, ctx);

      const canvasWidth = sizeRef.current.width;
      const canvasHeight = sizeRef.current.height;
      const imgWidth = img.naturalWidth || 800;
      const imgHeight = img.naturalHeight || 450;

      // Aspect-ratio cover math: no stretching, perfect center crop
      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      // Draw active frame image
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Vignette Overlay
      if (radialGradRef.current) {
        ctx.fillStyle = radialGradRef.current;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Linear atmospheric tint
      if (linearGradRef.current) {
        ctx.fillStyle = linearGradRef.current;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      lastRenderedIndexRef.current = targetIndex;
    },
    [getNearestLoadedFrame, updateCanvasDimensions]
  );

  // Start lerp loop on-demand (only runs while moving)
  const startAnimationLoop = useCallback(() => {
    if (isLoopRunningRef.current) return;
    isLoopRunningRef.current = true;

    const lerpFactor = prefersReducedMotion ? 1 : 0.085;

    const loop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const delta = target - current;

      if (Math.abs(delta) > 0.02) {
        currentFrameRef.current += delta * lerpFactor;
        drawFrame(currentFrameRef.current);
        rafIdRef.current = requestAnimationFrame(loop);
      } else {
        currentFrameRef.current = target;
        drawFrame(target);
        isLoopRunningRef.current = false;
      }
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [drawFrame, prefersReducedMotion]);

  // Progressive background preloader
  useEffect(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    // 1. Immediately preload initial batch for instant paint
    for (let i = 0; i < INITIAL_PRELOAD_COUNT; i++) {
      preloadFrame(i, () => {
        if (i === 0) {
          drawFrame(0, true);
        }
      });
    }

    // 2. Progressively preload remaining frames in non-blocking batches
    let currentBatchStart = INITIAL_PRELOAD_COUNT;
    let timerId: ReturnType<typeof setTimeout>;

    const loadNextBatch = () => {
      if (currentBatchStart >= TOTAL_FRAMES) return;

      const batchEnd = Math.min(TOTAL_FRAMES, currentBatchStart + BATCH_SIZE);
      for (let i = currentBatchStart; i < batchEnd; i++) {
        preloadFrame(i);
      }
      currentBatchStart = batchEnd;

      if (currentBatchStart < TOTAL_FRAMES) {
        timerId = setTimeout(loadNextBatch, BATCH_INTERVAL_MS);
      }
    };

    timerId = setTimeout(loadNextBatch, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [preloadFrame, drawFrame]);

  // Recalculate scroll target
  const updateScrollProgress = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    const newTarget = progress * (TOTAL_FRAMES - 1);
    targetFrameRef.current = newTarget;

    // Prioritize preloading a buffer window around current target frame
    const centerIndex = Math.round(newTarget);
    for (let i = Math.max(0, centerIndex - 12); i <= Math.min(TOTAL_FRAMES - 1, centerIndex + 12); i++) {
      if (!loadedRef.current[i]) {
        preloadFrame(i);
      }
    }

    startAnimationLoop();
  }, [preloadFrame, startAnimationLoop]);

  // Bind scroll listeners (Lenis and native fallback)
  useEffect(() => {
    if (lenis) {
      const handleLenisScroll = (e: { progress: number; scroll: number }) => {
        const rawProgress = typeof e.progress === 'number' ? e.progress : 0;
        const progress = Math.min(1, Math.max(0, rawProgress));
        targetFrameRef.current = progress * (TOTAL_FRAMES - 1);

        const center = Math.round(targetFrameRef.current);
        for (let i = Math.max(0, center - 12); i <= Math.min(TOTAL_FRAMES - 1, center + 12); i++) {
          if (!loadedRef.current[i]) {
            preloadFrame(i);
          }
        }

        startAnimationLoop();
      };

      lenis.on('scroll', handleLenisScroll);
      updateScrollProgress();

      return () => {
        lenis.off('scroll', handleLenisScroll);
        cancelAnimationFrame(rafIdRef.current);
        isLoopRunningRef.current = false;
      };
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      cancelAnimationFrame(rafIdRef.current);
      isLoopRunningRef.current = false;
    };
  }, [lenis, updateScrollProgress, preloadFrame, startAnimationLoop]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      drawFrame(currentFrameRef.current, true);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawFrame]);

  // Theme change triggers gradient refresh
  useEffect(() => {
    drawFrame(currentFrameRef.current, true);
  }, [isLight, drawFrame]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700"
      style={{
        backgroundColor: isLight ? '#F4F1EC' : '#0A0C0F',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block"
      />
    </div>
  );
};
