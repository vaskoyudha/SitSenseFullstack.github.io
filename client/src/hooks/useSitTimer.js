import { useState, useEffect, useRef, useCallback } from 'react';
import { playAlert, formatDuration, toHumanMin } from '../utils/alerts';

/**
 * Hook untuk timer durasi duduk dengan threshold alerts
 */
export const useSitTimer = (thresholds = { soft: 30 * 60, hard: 60 * 60 }, muted = false) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lastSoftAt, setLastSoftAt] = useState(null);
  const [lastHardAt, setLastHardAt] = useState(null);
  
  const startAtRef = useRef(0);
  const carryRef = useRef(0);
  const tickIdRef = useRef(null);
  const listenersRef = useRef(new Set());
  
  const { soft, hard, repeatSoftSec = 15 * 60, repeatHardSec = 30 * 60 } = thresholds;

  // Calculate elapsed seconds
  const elapsedSec = useCallback(() => {
    if (!running) return Math.floor(carryRef.current / 1000);
    return Math.floor((Date.now() - startAtRef.current + carryRef.current) / 1000);
  }, [running]);

  // Check thresholds and trigger alerts
  const checkThresholds = useCallback(() => {
    const e = elapsedSec();
    
    // Hard threshold (prioritas tinggi)
    if (e >= hard) {
      const shouldFire = lastHardAt === null || (e - lastHardAt) >= repeatHardSec;
      if (shouldFire) {
        setLastHardAt(e);
        playAlert('hard', muted);
        listenersRef.current.forEach((fn) => {
          try {
            fn({ type: 'hard', elapsed: e });
          } catch (err) {
            console.error('Error in threshold listener:', err);
          }
        });
      }
      return; // Don't trigger soft after hard in same frame
    }
    
    // Soft threshold
    if (e >= soft) {
      const shouldFire = lastSoftAt === null || (e - lastSoftAt) >= repeatSoftSec;
      if (shouldFire) {
        setLastSoftAt(e);
        playAlert('soft', muted);
        listenersRef.current.forEach((fn) => {
          try {
            fn({ type: 'soft', elapsed: e });
          } catch (err) {
            console.error('Error in threshold listener:', err);
          }
        });
      }
    }
  }, [soft, hard, repeatSoftSec, repeatHardSec, lastSoftAt, lastHardAt, elapsedSec, muted]);

  // Tick function
  const tick = useCallback(() => {
    const e = elapsedSec();
    setElapsed(e);
    checkThresholds();
  }, [elapsedSec, checkThresholds]);

  // Start timer
  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    startAtRef.current = Date.now();
    if (tickIdRef.current) clearInterval(tickIdRef.current);
    tickIdRef.current = setInterval(tick, 1000);
    tick(); // Immediate update
  }, [running, tick]);

  // Stop timer
  const stop = useCallback(() => {
    if (!running) return;
    carryRef.current += Date.now() - startAtRef.current;
    setRunning(false);
    startAtRef.current = 0;
    if (tickIdRef.current) {
      clearInterval(tickIdRef.current);
      tickIdRef.current = null;
    }
  }, [running]);

  // Reset timer
  const reset = useCallback(() => {
    if (tickIdRef.current) {
      clearInterval(tickIdRef.current);
      tickIdRef.current = null;
    }
    setRunning(false);
    startAtRef.current = 0;
    carryRef.current = 0;
    setElapsed(0);
    setLastSoftAt(null);
    setLastHardAt(null);
  }, []);

  // Add threshold hit listener
  const onThresholdHit = useCallback((callback) => {
    if (typeof callback === 'function') {
      listenersRef.current.add(callback);
      return () => listenersRef.current.delete(callback);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickIdRef.current) {
        clearInterval(tickIdRef.current);
      }
    };
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!running) return;
      if (document.hidden) {
        // Keep running but interval may be throttled
        return;
      } else {
        // Force update when tab becomes visible
        tick();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [running, tick]);

  return {
    running,
    elapsed,
    formattedDuration: formatDuration(elapsed),
    softThresholdLabel: toHumanMin(soft),
    hardThresholdLabel: toHumanMin(hard),
    start,
    stop,
    reset,
    onThresholdHit,
  };
};

