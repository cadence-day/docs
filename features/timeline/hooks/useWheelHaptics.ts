import { Logger } from "@/shared/utils/errorHandler";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

/**
 * Hook that provides handlers for wheel-like haptics on horizontal scroll
 * Returns handlers that can be attached to a ScrollView: onScroll,
 * onScrollEndDrag, onMomentumScrollBegin, onMomentumScrollEnd.
 *
 * Enhanced: haptic intensity, pulse count and spacing fade as velocity decays
 */
export const useWheelHaptics = () => {
  const lastOffsetXRef = useRef(0);
  const lastHapticTimeRef = useRef(0);
  const lastTimeRef = useRef<number>(Date.now());
  const momentumIntervalRef = useRef<number | null>(null);
  const momentumTimeoutsRef = useRef<number[]>([]);

  const safeImpact = useCallback((style: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(style).catch((err) => {
      Logger.logWarning(
        "Wheel haptic impact failed",
        "WHEEL_HAPTICS",
        { error: err },
      );
    });
  }, []);

  const clearMomentumTimeouts = useCallback(() => {
    try {
      momentumTimeoutsRef.current.forEach((id) =>
        clearTimeout(id as unknown as number)
      );
      momentumTimeoutsRef.current = [];
    } catch {
      // ignore
    }
  }, []);

  const velocityToStyle = useCallback((absV: number) => {
    if (absV < 350) return Haptics.ImpactFeedbackStyle.Light;
    if (absV < 900) return Haptics.ImpactFeedbackStyle.Medium;
    return Haptics.ImpactFeedbackStyle.Heavy;
  }, []);

  const velocityToPulses = useCallback((absV: number) => {
    // More velocity => more pulses, up to 4
    return Math.min(4, Math.max(1, Math.floor(absV / 500)));
  }, []);

  const velocityToSpacing = useCallback((absV: number) => {
    // Higher velocity => tighter spacing (smaller ms)
    // Range roughly between 20ms (very fast) and 200ms (very slow)
    const computed = 200 - Math.min(180, Math.floor(absV / 6));
    return Math.max(20, computed);
  }, []);

  const triggerPulses = useCallback(
    (pulses: number, style: Haptics.ImpactFeedbackStyle, spacingMs: number) => {
      try {
        // Schedule pulses spaced out so they feel like fading when velocity reduces
        for (let i = 0; i < pulses; i++) {
          const timeoutId = setTimeout(() => {
            safeImpact(style);
          }, i * spacingMs) as unknown as number;
          momentumTimeoutsRef.current.push(timeoutId);
        }
      } catch {
        // ignore
      }
    },
    [safeImpact],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      try {
        const offsetX = event?.nativeEvent?.contentOffset?.x ?? 0;
        const delta = offsetX - lastOffsetXRef.current;
        const now = Date.now();
        const deltaMs = Math.max(1, now - lastTimeRef.current);
        const velocityPxPerSec = (delta / deltaMs) * 1000;
        lastOffsetXRef.current = offsetX;
        lastTimeRef.current = now;

        const absDelta = Math.abs(delta);
        const MIN_DELTA = 2; // pixels
        const MIN_INTERVAL_MS = 40; // ms between haptic pulses

        if (
          absDelta >= MIN_DELTA &&
          now - lastHapticTimeRef.current > MIN_INTERVAL_MS
        ) {
          const absV = Math.abs(velocityPxPerSec);
          const pulses = velocityToPulses(absV);
          const style = velocityToStyle(absV);
          const spacing = velocityToSpacing(absV);
          // Fire pulses in a spaced manner to make intensity feel like a fade as speed changes
          triggerPulses(pulses, style, spacing);
          lastHapticTimeRef.current = now;
        }
      } catch (err) {
        Logger.logWarning(
          "Wheel haptic failed during scroll",
          "WHEEL_HAPTICS",
          { error: err },
        );
      }
    },
    [triggerPulses, velocityToPulses, velocityToSpacing, velocityToStyle],
  );

  const startMomentumHaptics = useCallback(
    (initialVelocityPxPerSec: number) => {
      try {
        // clear existing interval & timeouts
        if (momentumIntervalRef.current) {
          clearInterval(momentumIntervalRef.current as unknown as number);
          momentumIntervalRef.current = null;
        }
        clearMomentumTimeouts();

        let v = initialVelocityPxPerSec;
        const DECAY = 0.85;
        const TICK_MS = 60;

        momentumIntervalRef.current = setInterval(() => {
          try {
            v = v * DECAY;
            const absV = Math.abs(v);
            if (absV < 150) {
              // fade out: schedule a very light final pulse and stop
              if (absV > 40) {
                const style = velocityToStyle(absV);
                const pulses = 1;
                const spacing = velocityToSpacing(absV);
                triggerPulses(pulses, style, spacing);
              }
              if (momentumIntervalRef.current) {
                clearInterval(momentumIntervalRef.current as unknown as number);
                momentumIntervalRef.current = null;
              }
              clearMomentumTimeouts();
              return;
            }

            const pulses = velocityToPulses(absV);
            const style = velocityToStyle(absV);
            const spacing = velocityToSpacing(absV);
            triggerPulses(pulses, style, spacing);
          } catch {
            // ignore internal errors
          }
        }, TICK_MS) as unknown as number;
      } catch (err) {
        Logger.logWarning(
          "Failed to start momentum haptics",
          "WHEEL_HAPTICS",
          { error: err },
        );
      }
    },
    [
      clearMomentumTimeouts,
      triggerPulses,
      velocityToPulses,
      velocityToSpacing,
      velocityToStyle,
    ],
  );

  const stopMomentumHaptics = useCallback(() => {
    try {
      if (momentumIntervalRef.current) {
        clearInterval(momentumIntervalRef.current as unknown as number);
        momentumIntervalRef.current = null;
      }
      clearMomentumTimeouts();
    } catch {
      // ignore
    }
  }, [clearMomentumTimeouts]);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      try {
        const nativeVel = event?.nativeEvent?.velocity?.x;
        if (typeof nativeVel === "number") {
          startMomentumHaptics(nativeVel);
          return;
        }

        const offsetX = event?.nativeEvent?.contentOffset?.x ??
          lastOffsetXRef.current;
        const now = Date.now();
        const delta = offsetX - lastOffsetXRef.current;
        const deltaMs = Math.max(1, now - lastTimeRef.current);
        const velocityPxPerSec = (delta / deltaMs) * 1000;
        if (Math.abs(velocityPxPerSec) >= 200) {
          startMomentumHaptics(velocityPxPerSec);
        }
      } catch {
        // ignore
      }
    },
    [startMomentumHaptics],
  );

  const handleMomentumScrollBegin = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      try {
        const nativeVel = event?.nativeEvent?.velocity?.x;
        if (typeof nativeVel === "number") startMomentumHaptics(nativeVel);
      } catch {
        // ignore
      }
    },
    [startMomentumHaptics],
  );

  const handleMomentumScrollEnd = useCallback(() => {
    stopMomentumHaptics();
  }, [stopMomentumHaptics]);

  useEffect(() => {
    return () => {
      try {
        if (momentumIntervalRef.current) {
          clearInterval(momentumIntervalRef.current as unknown as number);
          momentumIntervalRef.current = null;
        }
        clearMomentumTimeouts();
      } catch {
        // ignore
      }
    };
  }, [clearMomentumTimeouts]);

  return {
    handleScroll,
    handleScrollEndDrag,
    handleMomentumScrollBegin,
    handleMomentumScrollEnd,
    stopMomentumHaptics,
  } as const;
};

export default useWheelHaptics;
