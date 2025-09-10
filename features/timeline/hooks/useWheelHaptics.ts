import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";

/**
 * Hook that provides handlers for wheel-like haptics on horizontal scroll
 * Returns handlers that can be attached to a ScrollView: onScroll,
 * onScrollEndDrag, onMomentumScrollBegin, onMomentumScrollEnd.
 */
export const useWheelHaptics = () => {
  const lastOffsetXRef = useRef(0);
  const lastHapticTimeRef = useRef(0);
  const lastTimeRef = useRef<number>(Date.now());
  const momentumIntervalRef = useRef<number | null>(null);

  const safeImpact = useCallback((style: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(style).catch((err) => {
      GlobalErrorHandler.logWarning(
        "Wheel haptic impact failed",
        "WHEEL_HAPTICS",
        { error: err }
      );
    });
  }, []);

  const handleScroll = useCallback(
    (event: any) => {
      try {
        const offsetX = event?.nativeEvent?.contentOffset?.x ?? 0;
        const delta = offsetX - lastOffsetXRef.current;
        const now = Date.now();
        const deltaMs = Math.max(1, now - lastTimeRef.current);
        const velocityPxPerSec = (delta / deltaMs) * 1000;
        lastOffsetXRef.current = offsetX;
        lastTimeRef.current = now;

        const absDelta = Math.abs(delta);
        const MIN_DELTA = 6; // pixels
        const MIN_INTERVAL_MS = 32; // ms between haptic pulses

        if (
          absDelta >= MIN_DELTA &&
          now - lastHapticTimeRef.current > MIN_INTERVAL_MS
        ) {
          const pulses = Math.min(
            3,
            Math.max(1, Math.floor(Math.abs(velocityPxPerSec) / 700))
          );
          for (let i = 0; i < pulses; i++)
            safeImpact(Haptics.ImpactFeedbackStyle.Light);
          lastHapticTimeRef.current = now;
        }
      } catch (err) {
        GlobalErrorHandler.logWarning(
          "Wheel haptic failed during scroll",
          "WHEEL_HAPTICS",
          { error: err }
        );
      }
    },
    [safeImpact]
  );

  const startMomentumHaptics = useCallback(
    (initialVelocityPxPerSec: number) => {
      try {
        if (momentumIntervalRef.current) {
          clearInterval(momentumIntervalRef.current as unknown as number);
          momentumIntervalRef.current = null;
        }

        let v = initialVelocityPxPerSec;
        const DECAY = 0.85;
        const TICK_MS = 60;

        momentumIntervalRef.current = setInterval(() => {
          try {
            v = v * DECAY;
            const absV = Math.abs(v);
            if (absV < 150) {
              if (momentumIntervalRef.current) {
                clearInterval(momentumIntervalRef.current as unknown as number);
                momentumIntervalRef.current = null;
              }
              return;
            }

            const pulses = Math.min(4, Math.max(1, Math.floor(absV / 600)));
            for (let i = 0; i < pulses; i++)
              safeImpact(Haptics.ImpactFeedbackStyle.Light);
          } catch (err) {
            // ignore internal errors
          }
        }, TICK_MS) as unknown as number;
      } catch (err) {
        GlobalErrorHandler.logWarning(
          "Failed to start momentum haptics",
          "WHEEL_HAPTICS",
          { error: err }
        );
      }
    },
    [safeImpact]
  );

  const stopMomentumHaptics = useCallback(() => {
    try {
      if (momentumIntervalRef.current) {
        clearInterval(momentumIntervalRef.current as unknown as number);
        momentumIntervalRef.current = null;
      }
    } catch (err) {
      // ignore
    }
  }, []);

  const handleScrollEndDrag = useCallback(
    (event: any) => {
      try {
        const nativeVel = event?.nativeEvent?.velocity?.x;
        if (typeof nativeVel === "number") {
          startMomentumHaptics(nativeVel);
          return;
        }

        const offsetX =
          event?.nativeEvent?.contentOffset?.x ?? lastOffsetXRef.current;
        const now = Date.now();
        const delta = offsetX - lastOffsetXRef.current;
        const deltaMs = Math.max(1, now - lastTimeRef.current);
        const velocityPxPerSec = (delta / deltaMs) * 1000;
        if (Math.abs(velocityPxPerSec) >= 200)
          startMomentumHaptics(velocityPxPerSec);
      } catch (err) {
        // ignore
      }
    },
    [startMomentumHaptics]
  );

  const handleMomentumScrollBegin = useCallback(
    (event: any) => {
      try {
        const nativeVel = event?.nativeEvent?.velocity?.x;
        if (typeof nativeVel === "number") startMomentumHaptics(nativeVel);
      } catch (err) {
        // ignore
      }
    },
    [startMomentumHaptics]
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
      } catch (err) {
        // ignore
      }
    };
  }, []);

  return {
    handleScroll,
    handleScrollEndDrag,
    handleMomentumScrollBegin,
    handleMomentumScrollEnd,
    stopMomentumHaptics,
  } as const;
};

export default useWheelHaptics;
