import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';
import { BackgroundTaskManager } from '../services/BackgroundTaskManager';
import { NotificationScheduler, SchedulerConfig } from '../services/NotificationScheduler';
import { getNotificationEngineSingleton } from '../NotificationEngineSingleton';
import { NotificationPreferences } from '../types';
import { useNotificationPreferences } from './useNotificationPreferences';
import { useUser } from '@clerk/clerk-expo';

export function useBackgroundNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();
  const { preferences, loading: preferencesLoading } = useNotificationPreferences();

  useEffect(() => {
    if (!user || preferencesLoading || !preferences) return;

    const initializeBackgroundTasks = async () => {
      try {
        setIsProcessing(true);

        const taskManager = BackgroundTaskManager.getInstance();
        const config: SchedulerConfig = {
          userId: user.id,
          preferences,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        await taskManager.initialize(config);
        await taskManager.loadScheduledNotifications();

        const engine = await getNotificationEngineSingleton();
        const scheduler = NotificationScheduler.create(engine, config);

        if (preferences.rhythm !== 'disabled') {
          await scheduler.scheduleAllNotifications();
        }

        setIsInitialized(true);

        GlobalErrorHandler.logDebug(
          'Background notifications initialized',
          'useBackgroundNotifications',
          {
            userId: user.id,
            rhythm: preferences.rhythm,
            streaksEnabled: preferences.streaksEnabled,
          }
        );
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          'useBackgroundNotifications.initialize'
        );
      } finally {
        setIsProcessing(false);
      }
    };

    initializeBackgroundTasks();
  }, [user, preferences, preferencesLoading]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isInitialized) {
        checkAndProcessNotifications();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isInitialized]);

  const checkAndProcessNotifications = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const taskManager = BackgroundTaskManager.getInstance();
      await taskManager.checkAndProcessNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        'useBackgroundNotifications.checkAndProcessNotifications'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!isInitialized || isProcessing) return;

    try {
      setIsProcessing(true);
      const taskManager = BackgroundTaskManager.getInstance();
      await taskManager.updatePreferences(newPreferences);

      GlobalErrorHandler.logDebug(
        'Notification preferences updated',
        'useBackgroundNotifications.updatePreferences',
        { rhythm: newPreferences.rhythm }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        'useBackgroundNotifications.updatePreferences'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const scheduleTestNotification = async () => {
    if (!isInitialized || !user) return;

    try {
      setIsProcessing(true);
      const taskManager = BackgroundTaskManager.getInstance();

      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 10);

      await taskManager.scheduleNotification({
        id: `test-${Date.now()}`,
        type: 'test',
        scheduledFor: testDate,
        userId: user.id,
        title: '🎯 Test Notification',
        body: 'This is a test notification scheduled for 10 seconds from now.',
        data: { test: true },
      });

      GlobalErrorHandler.logDebug(
        'Test notification scheduled',
        'useBackgroundNotifications.scheduleTestNotification',
        { scheduledFor: testDate.toISOString() }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        'useBackgroundNotifications.scheduleTestNotification'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAllNotifications = async () => {
    if (!isInitialized) return;

    try {
      setIsProcessing(true);
      const taskManager = BackgroundTaskManager.getInstance();
      await taskManager.cancelAllNotifications();

      GlobalErrorHandler.logDebug(
        'All notifications cancelled',
        'useBackgroundNotifications.cancelAllNotifications'
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        'useBackgroundNotifications.cancelAllNotifications'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isInitialized,
    isProcessing,
    updatePreferences,
    scheduleTestNotification,
    cancelAllNotifications,
    checkAndProcessNotifications,
  };
}