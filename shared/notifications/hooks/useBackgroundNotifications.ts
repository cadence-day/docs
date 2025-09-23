import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { getNotificationEngineSingleton } from "../NotificationEngineSingleton";
import { DEFAULT_CADENCE_PREFERENCES } from "../cadenceMessages";
import { BackgroundTaskManager } from "../services/BackgroundTaskManager";
import {
  mapProfileSettingsToNotificationPreferences,
  NotificationScheduler,
  SchedulerConfig,
} from "../services/NotificationScheduler";

export function useBackgroundNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();
  const { settings } = useProfileStore();

  useEffect(() => {
    if (!user || !settings) return;

    const initializeBackgroundTasks = async () => {
      try {
        setIsProcessing(true);

        // Map profile settings to notification preferences
        const mappedPreferences = mapProfileSettingsToNotificationPreferences(
          settings,
        );
        const preferences = {
          ...DEFAULT_CADENCE_PREFERENCES,
          ...mappedPreferences,
        };

        const taskManager = BackgroundTaskManager.getInstance();
        const config: SchedulerConfig = {
          userId: user.id,
          preferences,
          profileSettings: settings,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const engine = await getNotificationEngineSingleton();
        await taskManager.initialize(config, engine);
        await taskManager.loadScheduledNotifications();
        const scheduler = NotificationScheduler.create(engine, config);

        if (preferences.rhythm !== "disabled") {
          await scheduler.scheduleAllNotifications();
        }

        setIsInitialized(true);

        GlobalErrorHandler.logDebug(
          "Background notifications initialized",
          "useBackgroundNotifications",
          {
            userId: user.id,
            rhythm: preferences.rhythm,
            streaksEnabled: preferences.streaksEnabled,
          },
        );
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useBackgroundNotifications.initialize",
        );
      } finally {
        setIsProcessing(false);
      }
    };

    initializeBackgroundTasks();
  }, [user, settings]);

  const checkAndProcessNotifications = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      const taskManager = BackgroundTaskManager.getInstance();
      await taskManager.checkAndProcessNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "useBackgroundNotifications.checkAndProcessNotifications",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && isInitialized) {
        checkAndProcessNotifications();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [isInitialized, checkAndProcessNotifications]);

  const scheduleTestNotification = async () => {
    if (!isInitialized || !user) return;

    try {
      setIsProcessing(true);
      const taskManager = BackgroundTaskManager.getInstance();

      const testDate = new Date();
      testDate.setSeconds(testDate.getSeconds() + 10);

      await taskManager.scheduleNotification({
        id: `test-${Date.now()}`,
        type: "test",
        scheduledFor: testDate,
        userId: user.id,
        title: "🎯 Test Notification",
        body: "This is a test notification scheduled for 10 seconds from now.",
        data: { test: true },
      });

      GlobalErrorHandler.logDebug(
        "Test notification scheduled",
        "useBackgroundNotifications.scheduleTestNotification",
        { scheduledFor: testDate.toISOString() },
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "useBackgroundNotifications.scheduleTestNotification",
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
        "All notifications cancelled",
        "useBackgroundNotifications.cancelAllNotifications",
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "useBackgroundNotifications.cancelAllNotifications",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isInitialized,
    isProcessing,
    scheduleTestNotification,
    cancelAllNotifications,
    checkAndProcessNotifications,
  };
}
