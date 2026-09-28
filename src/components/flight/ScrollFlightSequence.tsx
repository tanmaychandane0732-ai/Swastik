import React, { useEffect, useRef, useCallback } from 'react';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface ScrollFlightSequenceProps {
  isLight?: boolean;
}

const TOTAL_FRAMES = 240;
const INITIAL_PRELOAD_COUNT = 25;
const BATCH_SIZE = 12;
const BATCH_INTERVAL_MS = 50;

/**
 * ScrollFlightSequence — Cinematic Final Section Scroll-Linked Aircraft Background
 *
 * Core Capabilities:
 * - 240-frame sequence (30 FPS source) linked directly to the scroll of the final flight section.
 * - Progress 0.0 -> Frame 1 (ezgif-frame-001.jpg), Progress 1.0 -> Frame 240 (ezgif-frame-240.jpg).
 * - Smooth crossfade in the first 10-15% of the final section (forest fades out, aircraft fades in).
 * - Full HTML5 Canvas with DPR / Retina scaling and object-fit cover math.
 * - Single persistent requestAnimationFrame loop with smooth interpolation (lerp = 0.085).
 * - Completely reversible on scroll up and down.
 * - Holds at exact frame when scrolling stops, and holds Frame 240 at 100% progress.
 * - Glowing financial flight trajectory line with telemetry waypoints connecting aircraft to finance.
 * - Pointer-events-none background layer allowing full interactivity with glass cards & buttons.
 * - Accessibility: respects prefers-reduced-motion.
 */
export const ScrollFlightSequence: React.FC<ScrollFlightSequenceProps> = ({
  isLight = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
  const progressRef = useRef<number>(0);
  const crossfadeRef = useRef<number>(0);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Frame path generator with primary and secondary fallback
  const getFrameSrc = useCallback((index: number) => {
    const num = Math.max(1, Math.min(TOTAL_FRAMES, index + 1));
    const padded = String(num).padStart(3, '0');
    return `/media/ezgif-8a2638a45bbfd09a-jpg/ezgif-frame-${padded}.jpg`;
  }, []);

  // Preload a single frame
  const preloadFrame = useCallback(
    (index: number, onLoaded?: () => void) => {
      if (index < 0 || index >= TOTAL_FRAMES) return;
      if (loadedRef.current[index] && imagesRef.current[index]) {
        onLoaded?.();
        return;
      }

      const img = new Image();
      img.src = getFrameSrc(index);
      img.decoding = 'async';

      img.onload = () => {
        imagesRef.current[index] = img;
        loadedRef.current[index] = true;
        onLoaded?.();
      };

      img.onerror = () => {
        // Handle error gracefully - getNearestLoadedFrame will supply closest valid frame
        console.warn(`[ScrollFlightSequence] Failed to load frame ${index + 1}`);
      };
    },
    [getFrameSrc]
  );

  // Find nearest loaded frame for zero-blank fallback
  const getNearestLoadedFrame = useCallback((targetIndex: number): HTMLImageElement | null => {
    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, targetIndex));
    if (loadedRef.current[clamped] && imagesRef.current[clamped]) {
      return imagesRef.current[clamped];
    }
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

  // Draw glowing financial flight trajectory curve connecting aircraft to finance
  const drawFlightTrajectory = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
      ctx.save();

      // Trajectory curve coordinates (anchored in lower quadrant to frame airplane above)
      const startX = width * 0.08;
      const startY = height * 0.82;
      const cp1X = width * 0.38;
      const cp1Y = height * 0.86;
      const cp2X = width * 0.68;
      const cp2Y = height * 0.54;
      const endX = width * 0.92;
      const endY = height * 0.38;

      // 1. Draw Faint Planned Corridor (Dashed guide)
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.25)' : 'rgba(0, 210, 255, 0.20)';
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Draw Active Flown Path up to current progress using parametric curve sampling
      const activePoints: { x: number; y: number }[] = [];
      const steps = 60;
      const maxT = Math.max(0.01, Math.min(1, progress));

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * maxT;
        const mt = 1 - t;
        // Cubic bezier formula: B(t) = (1-t)^3*P0 + 3*(1-t)^2*t*P1 + 3*(1-t)*t^2*P2 + t^3*P3
        const x =
          mt * mt * mt * startX +
          3 * mt * mt * t * cp1X +
          3 * mt * t * t * cp2X +
          t * t * t * endX;
        const y =
          mt * mt * mt * startY +
          3 * mt * mt * t * cp1Y +
          3 * mt * t * t * cp2Y +
          t * t * t * endY;
        activePoints.push({ x, y });
      }

      if (activePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(activePoints[0].x, activePoints[0].y);
        for (let i = 1; i < activePoints.length; i++) {
          ctx.lineTo(activePoints[i].x, activePoints[i].y);
        }

        // Luminous cyan-amber-gold gradient
        const lineGrad = ctx.createLinearGradient(startX, startY, endX, endY);
        lineGrad.addColorStop(0, '#00D2FF');
        lineGrad.addColorStop(0.55, '#FF6A2A');
        lineGrad.addColorStop(1, '#F59E0B');

        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00D2FF';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Current Flight Head Beacon (pulsing waypoint at leading point)
        const head = activePoints[activePoints.length - 1];
        ctx.beginPath();
        ctx.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF6A2A';
        ctx.shadowBlur = 16;
        ctx.fill();

        // Outer beacon ring
        ctx.beginPath();
        ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 106, 42, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. Milestone Telemetry Waypoints
      const waypoints = [
        { t: 0.25, label: 'WP-01 DEBT DEFENSE', color: '#00D2FF' },
        { t: 0.50, label: 'WP-02 CASH RUNWAY', color: '#22C55E' },
        { t: 0.75, label: 'WP-03 WEALTH SUPERCRUISE', color: '#F59E0B' },
        { t: 1.00, label: 'DEST: FINANCIAL FREEDOM', color: '#FF6A2A' },
      ];

      waypoints.forEach((wp) => {
        const t = wp.t;
        const mt = 1 - t;
        const wx =
          mt * mt * mt * startX +
          3 * mt * mt * t * cp1X +
          3 * mt * t * t * cp2X +
          t * t * t * endX;
        const wy =
          mt * mt * mt * startY +
          3 * mt * mt * t * cp1Y +
          3 * mt * t * t * cp2Y +
          t * t * t * endY;

        const isReached = progress >= t - 0.02;

        ctx.beginPath();
        ctx.arc(wx, wy, isReached ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isReached ? wp.color : 'rgba(255, 255, 255, 0.25)';
        if (isReached) {
          ctx.shadowColor = wp.color;
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above waypoint
        ctx.font = '700 9px monospace';
        ctx.fillStyle = isReached ? (isLight ? '#0C2D6B' : '#FFFFFF') : 'rgba(167, 171, 180, 0.4)';
        ctx.fillText(wp.label, wx + 6, wy - 6);
      });

      // 4. Subtle Telemetry Strip in Corner
      ctx.font = '600 10px monospace';
      ctx.fillStyle = isLight ? 'rgba(12, 45, 107, 0.7)' : 'rgba(167, 171, 180, 0.6)';
      const telemetryText = `FLIGHT: FINQUEST-01 • TRAJECTORY: EXPONENTIAL • DESTINATION: ${Math.round(progress * 100)}% COMPLETE`;
      ctx.fillText(telemetryText, width * 0.08, height * 0.94);

      ctx.restore();
    },
    [isLight]
  );

  // Draw frame on canvas with responsive cover scaling & luxury atmosphere
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = getNearestLoadedFrame(frameIndex);
      if (!img) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Ensure canvas internal resolution matches device pixel ratio
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth || 1696;
      const imgHeight = img.naturalHeight || 956;

      // Aspect-ratio cover math: no stretching, perfect center crop
      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      // Draw active airplane frame
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // ── Cinematic Sky & Luxury Vignette Overlay ─────────────────────────
      // Feathers boundary cleanly while letting the bright airplane shine through
      const maxDim = Math.max(canvasWidth, canvasHeight);
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const radialGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        maxDim * 0.18,
        centerX,
        centerY,
        maxDim * 0.74
      );

      if (isLight) {
        radialGrad.addColorStop(0, 'rgba(244, 241, 236, 0.08)');
        radialGrad.addColorStop(0.5, 'rgba(244, 241, 236, 0.38)');
        radialGrad.addColorStop(0.85, 'rgba(244, 241, 236, 0.85)');
        radialGrad.addColorStop(1, '#F4F1EC');
      } else {
        radialGrad.addColorStop(0, 'rgba(10, 12, 15, 0.15)');
        radialGrad.addColorStop(0.5, 'rgba(10, 12, 15, 0.48)');
        radialGrad.addColorStop(0.82, 'rgba(10, 12, 15, 0.82)');
        radialGrad.addColorStop(1, '#0A0C0F');
      }

      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Subtle atmospheric tint (Sky Cyan & Warm Golden Sunlight Highlights)
      const linearGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      if (isLight) {
        linearGrad.addColorStop(0, 'rgba(0, 210, 255, 0.06)');
        linearGrad.addColorStop(0.6, 'rgba(255, 106, 42, 0.04)');
        linearGrad.addColorStop(1, 'rgba(244, 241, 236, 0.60)');
      } else {
        linearGrad.addColorStop(0, 'rgba(0, 210, 255, 0.04)');
        linearGrad.addColorStop(0.5, 'rgba(10, 12, 15, 0.20)');
        linearGrad.addColorStop(1, 'rgba(10, 12, 15, 0.65)');
      }

      ctx.fillStyle = linearGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw the Signature Glowing Financial Flight Trajectory
      drawFlightTrajectory(ctx, canvasWidth, canvasHeight, progressRef.current);

      lastRenderedIndexRef.current = frameIndex;
    },
    [getNearestLoadedFrame, isLight, drawFlightTrajectory]
  );

  // Progressive background preloader
  useEffect(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    // 1. Immediately preload frame 0 and first batch for instant initial paint
    for (let i = 0; i < INITIAL_PRELOAD_COUNT; i++) {
      preloadFrame(i, () => {
        if (i === 0) {
          drawFrame(0);
        }
      });
    }

    // 2. Preload the final frames early so the touchdown finish is always ready
    for (let i = TOTAL_FRAMES - 10; i < TOTAL_FRAMES; i++) {
      preloadFrame(i);
    }

    // 3. Progressively preload remaining frames in non-blocking batches
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

    timerId = setTimeout(loadNextBatch, 100);

    return () => {
      clearTimeout(timerId);
    };
  }, [preloadFrame, drawFrame]);

  // Recalculate scroll target continuously based on final section viewport position
  const updateScrollProgress = useCallback(() => {
    const finalSection = document.getElementById('final-flight-section') || document.getElementById('certificate');
    if (!finalSection) return;

    const rect = finalSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Start transitioning as the final section enters the viewport
    const scrollStart = rect.top + scrollY - windowHeight * 0.8;
    const scrollEnd = document.documentElement.scrollHeight - windowHeight;

    if (scrollY < scrollStart) {
      progressRef.current = 0;
      crossfadeRef.current = 0;
      targetFrameRef.current = 0;
      if (containerRef.current) {
        containerRef.current.style.opacity = '0';
      }
      return;
    }

    const totalRange = Math.max(1, scrollEnd - scrollStart);
    const rawProgress = (scrollY - scrollStart) / totalRange;
    const progress = Math.min(1, Math.max(0, rawProgress));
    progressRef.current = progress;

    // 10-15% smooth crossfade ramp from 0 to 1
    const crossfade = Math.min(1, Math.max(0, progress / 0.14));
    crossfadeRef.current = crossfade;

    if (containerRef.current) {
      containerRef.current.style.opacity = String(crossfade);
    }

    // Map 0% scroll -> Frame 0 (ezgif-frame-001.jpg), 100% scroll -> Frame 239 (ezgif-frame-240.jpg)
    const newTarget = progress * (TOTAL_FRAMES - 1);
    targetFrameRef.current = newTarget;

    // Dynamically prioritize preloading a buffer window around current target frame
    const centerIndex = Math.round(newTarget);
    for (let i = Math.max(0, centerIndex - 10); i <= Math.min(TOTAL_FRAMES - 1, centerIndex + 10); i++) {
      if (!loadedRef.current[i]) {
        preloadFrame(i);
      }
    }
  }, [preloadFrame]);

  // Persistent requestAnimationFrame Lerp Loop
  useEffect(() => {
    const lerpFactor = prefersReducedMotion ? 1 : 0.085;

    const loop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const delta = target - current;

      if (Math.abs(delta) > 0.005) {
        currentFrameRef.current += delta * lerpFactor;
        drawFrame(Math.round(currentFrameRef.current));
      } else if (Math.abs(delta) > 0) {
        currentFrameRef.current = target;
        drawFrame(Math.round(target));
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [drawFrame, prefersReducedMotion]);

  // Sync with Lenis smooth-scroll & standard scroll events
  useEffect(() => {
    updateScrollProgress();

    if (lenis) {
      lenis.on('scroll', updateScrollProgress);
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });

    return () => {
      if (lenis) {
        lenis.off('scroll', updateScrollProgress);
      }
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, [lenis, updateScrollProgress]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] transition-opacity duration-300 select-none overflow-hidden"
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block"
      />
    </div>
  );
};
