import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { NotificationScheduler } from "../services/NotificationScheduler";

export interface UseNotificationSchedulerReturn {
  scheduler: NotificationScheduler | null;
  isScheduling: boolean;
  lastScheduledAt: Date | null;
  scheduleAllNotifications: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  scheduleOneTimeNotification: (
    type:
      | "midday-reflection"
      | "evening-reflection"
      | "achievement"
      | "reminder",
    scheduledFor: Date,
    customMessage?: { title: string; body: string }
  ) => Promise<void>;
  error: string | null;
}

export const useNotificationScheduler = (
  userId?: string
): UseNotificationSchedulerReturn => {
  const { engine, preferences, isInitialized } = useNotifications();
  const { settings } = useProfileStore();
  const [scheduler, setScheduler] = useState<NotificationScheduler | null>(
    null
  );
  const [isScheduling, setIsScheduling] = useState(false);
  const [lastScheduledAt, setLastScheduledAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize scheduler when engine and user data are available
  useEffect(() => {
    if (!isInitialized || !engine || !userId) {
      return;
    }

    try {
      const schedulerInstance = NotificationScheduler.create(engine, {
        userId,
        preferences,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setScheduler(schedulerInstance);
      setError(null);

      GlobalErrorHandler.logDebug(
        "Notification scheduler initialized",
        "useNotificationScheduler",
        { userId }
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, "useNotificationScheduler.initialize");
      setError("Failed to initialize notification scheduler");
    }
  }, [isInitialized, engine, userId, preferences]);

  // Update scheduler config when preferences change
  useEffect(() => {
    if (scheduler && userId) {
      scheduler.updateConfig({
        userId,
        preferences,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  }, [scheduler, userId, preferences]);

  const scheduleAllNotifications = useCallback(async (): Promise<void> => {
    if (!scheduler) {
      throw new Error("Scheduler not initialized");
    }

    try {
      setIsScheduling(true);
      setError(null);

      await scheduler.scheduleAllNotifications();
      setLastScheduledAt(new Date());

      GlobalErrorHandler.logDebug(
        "All notifications scheduled successfully",
        "useNotificationScheduler.scheduleAllNotifications",
        { userId }
      );
    } catch (error) {
      const errorMessage = "Failed to schedule notifications";
      GlobalErrorHandler.logError(
        error,
        "useNotificationScheduler.scheduleAllNotifications"
      );
      setError(errorMessage);
      throw error;
    } finally {
      setIsScheduling(false);
    }
  }, [scheduler, userId]);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    if (!scheduler) {
      throw new Error("Scheduler not initialized");
    }

    try {
      setIsScheduling(true);
      setError(null);

      await scheduler.cancelAllNotifications();

      GlobalErrorHandler.logDebug(
        "All notifications cancelled successfully",
        "useNotificationScheduler.cancelAllNotifications",
        { userId }
      );
    } catch (error) {
      const errorMessage = "Failed to cancel notifications";
      GlobalErrorHandler.logError(
        error,
        "useNotificationScheduler.cancelAllNotifications"
      );
      setError(errorMessage);
      throw error;
    } finally {
      setIsScheduling(false);
    }
  }, [scheduler, userId]);

  const scheduleOneTimeNotification = useCallback(
    async (
      type:
        | "midday-reflection"
        | "evening-reflection"
        | "achievement"
        | "reminder",
      scheduledFor: Date,
      customMessage?: { title: string; body: string }
    ): Promise<void> => {
      if (!scheduler) {
        throw new Error("Scheduler not initialized");
      }

      try {
        setError(null);

        await scheduler.scheduleOneTimeNotification(
          type,
          scheduledFor,
          customMessage
        );

        GlobalErrorHandler.logDebug(
          "One-time notification scheduled",
          "useNotificationScheduler.scheduleOneTimeNotification",
          { userId, type, scheduledFor: scheduledFor.toISOString() }
        );
      } catch (error) {
        const errorMessage = "Failed to schedule notification";
        GlobalErrorHandler.logError(
          error,
          "useNotificationScheduler.scheduleOneTimeNotification"
        );
        setError(errorMessage);
        throw error;
      }
    },
    [scheduler, userId]
  );

  return {
    scheduler,
    isScheduling,
    lastScheduledAt,
    scheduleAllNotifications,
    cancelAllNotifications,
    scheduleOneTimeNotification,
    error,
  };
};

// Hook for automatic scheduling based on preference changes
export const useAutoNotificationScheduler = (userId?: string) => {
  const { scheduleAllNotifications, error } = useNotificationScheduler(userId);
  const { preferences } = useNotifications();
  const schedulingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isSchedulingRef = useRef(false);

  // Auto-reschedule when preferences change with debouncing and race condition prevention
  useEffect(() => {
    if (!userId) return;

    // Clear any existing timeout to prevent overlapping operations
    if (schedulingTimeoutRef.current) {
      clearTimeout(schedulingTimeoutRef.current);
      schedulingTimeoutRef.current = null;
    }

    // Debounced scheduling with race condition protection
    schedulingTimeoutRef.current = setTimeout(async () => {
      // Prevent concurrent scheduling operations
      if (isSchedulingRef.current) {
        GlobalErrorHandler.logDebug(
          "Skipping auto-scheduling: operation already in progress",
          "useAutoNotificationScheduler",
          { userId }
        );
        return;
      }

      try {
        isSchedulingRef.current = true;
        await scheduleAllNotifications();

        GlobalErrorHandler.logDebug(
          "Auto-scheduling completed successfully",
          "useAutoNotificationScheduler",
          { userId }
        );
      } catch (error) {
        GlobalErrorHandler.logWarning(
          "Auto-scheduling failed",
          "useAutoNotificationScheduler",
          { userId, error }
        );
      } finally {
        isSchedulingRef.current = false;
        schedulingTimeoutRef.current = null;
      }
    }, 1000); // Debounce delay to prevent rapid rescheduling

    // Cleanup function to clear timeout and reset scheduling flag
    return () => {
      if (schedulingTimeoutRef.current) {
        clearTimeout(schedulingTimeoutRef.current);
        schedulingTimeoutRef.current = null;
      }
      isSchedulingRef.current = false;
    };
  }, [preferences, userId, scheduleAllNotifications]);

  return { error };
};
