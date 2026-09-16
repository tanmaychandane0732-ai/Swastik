import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(
  targetValue: number,
  duration: number = 600
): { current: number; delta: number; isIncreasing: boolean; isDecreasing: boolean } {
  const [current, setCurrent] = useState(targetValue);
  const [delta, setDelta] = useState(0);
  const prevTargetRef = useRef(targetValue);

  useEffect(() => {
    const prev = prevTargetRef.current;
    if (prev === targetValue) return;

    const diff = targetValue - prev;
    setDelta(diff);
    prevTargetRef.current = targetValue;

    const startTime = performance.now();
    let animationFrameId: number;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(prev + diff * ease);

      setCurrent(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter);
      } else {
        setCurrent(targetValue);
        // Clear delta indicator after 2 seconds
        const timer = setTimeout(() => {
          setDelta(0);
        }, 2200);
        return () => clearTimeout(timer);
      }
    };

    animationFrameId = requestAnimationFrame(updateCounter);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration]);

  return {
    current,
    delta,
    isIncreasing: delta > 0,
    isDecreasing: delta < 0,
  };
}

