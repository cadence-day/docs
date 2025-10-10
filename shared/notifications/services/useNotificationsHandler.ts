// Database-backed notification settings store
// Replaces the complex AsyncStorage-based notification system

import useNotificationSettingsStore from "@/shared/stores/resources/useNotificationsStore";
import type { Notification } from "@/shared/types/models/notification";
import { Logger } from "@/shared/utils/errorHandler";
import { getClerkInstance } from "@clerk/clerk-expo";
import * as Notifications from "expo-notifications";

// Re-export the store and types for backward compatibility
export { default as useNotificationSettingsStore } from "@/shared/stores/resources/useNotificationsStore";
export type { Notification } from "@/shared/types/models/notification";

// Helper functions for notification management
export class useNotificationHandler {
  private static store = useNotificationSettingsStore;

  /**
   * Initialize notification settings for the current user
   */
  static async initialize(): Promise<void> {
    try {
      await this.store.getState().initializeForCurrentUser();
      Logger.logDebug(
        "Notification settings initialized",
        "NotificationManager.initialize",
      );
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.initialize",
      );
    }
  }
  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";

      Logger.logDebug(
        `Notification permissions ${granted ? "granted" : "denied"}`,
        "NotificationManager.requestPermissions",
      );

      return granted;
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.requestPermissions",
      );
      return false;
    }
  }

  /**
   * Update push token in settings
   */
  static async updatePushToken(token: string): Promise<void> {
    try {
      // Check if user is authenticated first
      if (!getClerkInstance().user?.id) {
        Logger.logDebug(
          "User not authenticated yet, deferring push token update",
          "useNotificationHandler.updatePushToken",
        );
        return;
      }

      const currentSettings = this.store.getState().notificationSettings;
      if (currentSettings) {
        await this.store.getState().updateNotificationSettings({
          ...currentSettings,
          expo_push_token: token,
        });
      } else {
        // Initialize with token if no settings exist
        await this.store.getState().initializeForCurrentUser();
        const newSettings = this.store.getState().notificationSettings;
        if (newSettings) {
          await this.store.getState().updateNotificationSettings({
            ...newSettings,
            expo_push_token: token,
          });
        }
      }

      Logger.logDebug(
        "Push token updated in notification settings",
        "NotificationManager.updatePushToken",
        { token: token.substring(0, 10) + "..." },
      );
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.updatePushToken",
        { token: token?.substring(0, 10) + "..." },
      );
    }
  }

  /**
   * Get current user's notification settings
   */
  static async getCurrentUserSettings(): Promise<Notification | null> {
    try {
      const userId = getClerkInstance().user?.id;
      if (!userId) {
        throw new Error("User must be authenticated");
      }

      return await this.store.getState().getNotificationSettings(userId);
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.getCurrentUserSettings",
      );
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  static async updatePreferences(preferences: {
    push_enabled?: boolean;
    email_enabled?: boolean;
    wake_up_time?: string;
    sleep_time?: string;
    timezone?: string;
  }): Promise<void> {
    try {
      const currentSettings = this.store.getState().notificationSettings;
      if (!currentSettings) {
        // Initialize first
        await this.store.getState().initializeForCurrentUser();
        const newSettings = this.store.getState().notificationSettings;
        if (newSettings) {
          await this.store.getState().updateNotificationSettings({
            ...newSettings,
            ...preferences,
          });
        }
      } else {
        await this.store.getState().updateNotificationSettings({
          ...currentSettings,
          ...preferences,
        });
      }

      Logger.logDebug(
        "Notification preferences updated",
        "NotificationManager.updatePreferences",
        preferences,
      );
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.updatePreferences",
        preferences,
      );
    }
  }

  /**
   * Check if push notifications are enabled for current user
   */
  static async isPushEnabled(): Promise<boolean> {
    try {
      const settings = await this.getCurrentUserSettings();
      return settings?.push_enabled ?? false;
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.isPushEnabled",
      );
      return false;
    }
  }

  /**
   * Schedule notifications based on current settings
   */
  static async scheduleNotifications(): Promise<void> {
    try {
      const settings = await this.getCurrentUserSettings();
      if (!settings?.push_enabled) {
        Logger.logDebug(
          "Push notifications disabled, skipping scheduling",
          "NotificationManager.scheduleNotifications",
        );
        return;
      }

      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule wake up notification if time is set
      if (settings.wake_up_time) {
        await this.scheduleTimeBasedNotification(
          settings.wake_up_time,
          "Good morning!",
          "Start your day with Cadence",
          { type: "morning-reminder" },
        );
      }

      // Schedule sleep time notification if time is set
      if (settings.sleep_time) {
        await this.scheduleTimeBasedNotification(
          settings.sleep_time,
          "Wind down time",
          "Reflect on your day with Cadence",
          { type: "evening-reminder" },
        );
      }

      Logger.logDebug(
        "Notifications scheduled successfully",
        "NotificationManager.scheduleNotifications",
        {
          wakeUpTime: settings.wake_up_time,
          sleepTime: settings.sleep_time,
        },
      );
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.scheduleNotifications",
      );
    }
  }

  static async scheduleTimeBasedNotification(
    time: string,
    title: string,
    body: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const [hours, minutes] = time.split(":").map(Number);

      const trigger: Notifications.CalendarTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      await Notifications.scheduleNotificationAsync({
        content: { title, body, data },
        trigger,
      });
    } catch (error) {
      Logger.logError(
        error,
        "NotificationManager.scheduleTimeBasedNotification",
        { time, title, body, data },
      );
    }
  }
}

// Legacy export for backward compatibility
export const useNotificationStore = useNotificationSettingsStore;

// Auto-initialize when imported (like the original)
(async () => {
  try {
    await useNotificationHandler.initialize();
  } catch (error) {
    Logger.logError(
      error,
      "notificationsStore auto-initialization",
    );
  }
})();
