import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationScheduler } from '../services/NotificationScheduler';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';
import { useProfileStore } from '@/features/profile/stores/useProfileStore';

export interface UseNotificationSchedulerReturn {
  scheduler: NotificationScheduler | null;
  isScheduling: boolean;
  lastScheduledAt: Date | null;
  scheduleAllNotifications: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  scheduleOneTimeNotification: (
    type: 'midday-reflection' | 'evening-reflection' | 'achievement' | 'reminder',
    scheduledFor: Date,
    customMessage?: { title: string; body: string }
  ) => Promise<void>;
  error: string | null;
}

export const useNotificationScheduler = (userId?: string): UseNotificationSchedulerReturn => {
  const { engine, preferences, isInitialized } = useNotifications();
  const { settings } = useProfileStore();
  const [scheduler, setScheduler] = useState<NotificationScheduler | null>(null);
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
        'Notification scheduler initialized',
        'useNotificationScheduler',
        { userId }
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, 'useNotificationScheduler.initialize');
      setError('Failed to initialize notification scheduler');
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
      throw new Error('Scheduler not initialized');
    }

    try {
      setIsScheduling(true);
      setError(null);

      await scheduler.scheduleAllNotifications();
      setLastScheduledAt(new Date());

      GlobalErrorHandler.logDebug(
        'All notifications scheduled successfully',
        'useNotificationScheduler.scheduleAllNotifications',
        { userId }
      );
    } catch (error) {
      const errorMessage = 'Failed to schedule notifications';
      GlobalErrorHandler.logError(error, 'useNotificationScheduler.scheduleAllNotifications');
      setError(errorMessage);
      throw error;
    } finally {
      setIsScheduling(false);
    }
  }, [scheduler, userId]);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    if (!scheduler) {
      throw new Error('Scheduler not initialized');
    }

    try {
      setIsScheduling(true);
      setError(null);

      await scheduler.cancelAllNotifications();

      GlobalErrorHandler.logDebug(
        'All notifications cancelled successfully',
        'useNotificationScheduler.cancelAllNotifications',
        { userId }
      );
    } catch (error) {
      const errorMessage = 'Failed to cancel notifications';
      GlobalErrorHandler.logError(error, 'useNotificationScheduler.cancelAllNotifications');
      setError(errorMessage);
      throw error;
    } finally {
      setIsScheduling(false);
    }
  }, [scheduler, userId]);

  const scheduleOneTimeNotification = useCallback(async (
    type: 'midday-reflection' | 'evening-reflection' | 'achievement' | 'reminder',
    scheduledFor: Date,
    customMessage?: { title: string; body: string }
  ): Promise<void> => {
    if (!scheduler) {
      throw new Error('Scheduler not initialized');
    }

    try {
      setError(null);

      await scheduler.scheduleOneTimeNotification(type, scheduledFor, customMessage);

      GlobalErrorHandler.logDebug(
        'One-time notification scheduled',
        'useNotificationScheduler.scheduleOneTimeNotification',
        { userId, type, scheduledFor: scheduledFor.toISOString() }
      );
    } catch (error) {
      const errorMessage = 'Failed to schedule notification';
      GlobalErrorHandler.logError(error, 'useNotificationScheduler.scheduleOneTimeNotification');
      setError(errorMessage);
      throw error;
    }
  }, [scheduler, userId]);

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

  // Auto-reschedule when preferences change
  useEffect(() => {
    if (!userId) return;

    const scheduleWithDelay = setTimeout(async () => {
      try {
        await scheduleAllNotifications();
      } catch (error) {
        GlobalErrorHandler.logWarning(
          'Auto-scheduling failed',
          'useAutoNotificationScheduler',
          { userId }
        );
      }
    }, 1000); // Small delay to prevent rapid rescheduling

    return () => clearTimeout(scheduleWithDelay);
  }, [preferences, userId, scheduleAllNotifications]);

  return { error };
};