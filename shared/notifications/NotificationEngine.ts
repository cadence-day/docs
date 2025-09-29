import { ToastService } from "@/shared/context/ToastProvider";
import {
  getRandomEveningReflection,
  getRandomMiddayReflection,
  getRandomMorningMotivation,
  getRandomStreakMessage,
} from "@/shared/notifications/constants/CADENCE_MESSAGES";
import { useNotificationHandler } from "@/shared/notifications/services/useNotificationsHandler";
import type {
  NotificationMessage,
  NotificationType,
} from "@/shared/notifications/types";
import useNotificationSettingsStore from "@/shared/stores/resources/useNotificationsStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Notifications from "expo-notifications";
import { AppState, AppStateStatus } from "react-native";

export interface NotificationEngineConfig {
  enableLogging?: boolean;
}

export class NotificationEngine {
  private static instance: NotificationEngine;
  private config: NotificationEngineConfig;
  private appState: AppStateStatus = "active";
  private appStateSubscription: { remove: () => void } | null = null;

  private constructor(config: NotificationEngineConfig = {}) {
    this.config = {
      enableLogging: true,
      ...config,
    };
    this.setupAppStateMonitoring();
  }

  static getInstance(config?: NotificationEngineConfig): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine(config);
    }
    return NotificationEngine.instance;
  }

  private setupAppStateMonitoring(): void {
    // Get current app state
    this.appState = AppState.currentState;

    // Listen for app state changes
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange.bind(this),
    );

    if (this.config.enableLogging) {
      GlobalErrorHandler.logDebug(
        `NotificationEngine: App state monitoring initialized. Current state: ${this.appState}`,
        "NotificationEngine.setupAppStateMonitoring",
      );
    }
  }

  private handleAppStateChange(nextAppState: AppStateStatus): void {
    const previousState = this.appState;
    this.appState = nextAppState;

    // Update push token when app becomes active (foreground)
    if (nextAppState === "active" && previousState !== "active") {
      this.updatePushTokenIfNeeded();
    }

    if (this.config.enableLogging) {
      GlobalErrorHandler.logDebug(
        `NotificationEngine: App state changed: ${previousState} → ${nextAppState}`,
        "NotificationEngine.handleAppStateChange",
      );
    }
  }

  private isAppInForeground(): boolean {
    return this.appState === "active";
  }

  async scheduleQuoteNotification(
    scheduledTime: Date,
    type: NotificationType,
  ): Promise<void> {
    const message = this.getMessageForType(type);
    const notificationMessage: NotificationMessage = {
      id: `${type}-${Date.now()}`,
      title: this.getTitleForType(type),
      body: message,
      type,
      scheduledFor: scheduledTime,
    };

    if (this.isAppInForeground()) {
      this.deliverInApp(notificationMessage, type);
    } else {
      await this.scheduleExpoPushNotification(
        notificationMessage,
        type,
        scheduledTime,
      );
    }
  }

  // Force scheduling regardless of app state (useful for testing)
  async forceScheduleQuoteNotification(
    scheduledTime: Date,
    type: NotificationType,
  ): Promise<void> {
    const message = this.getMessageForType(type);
    const notificationMessage: NotificationMessage = {
      id: `${type}-${Date.now()}`,
      title: this.getTitleForType(type),
      body: message,
      type,
      scheduledFor: scheduledTime,
    };

    await this.scheduleExpoPushNotification(
      notificationMessage,
      type,
      scheduledTime,
    );
  }

  private deliverInApp(
    quote: NotificationMessage,
    type: NotificationType,
  ): void {
    // Show in-app notification/toast with quote
    ToastService.show({
      title: quote.title,
      body: quote.body,
      type: "info",
      duration: 5000,
    });

    if (this.config.enableLogging) {
      GlobalErrorHandler.logDebug(
        `NotificationEngine: Delivered in-app notification`,
        "NotificationEngine.deliverInApp",
        { quoteId: quote.id, type, message: quote.body.substring(0, 100) },
      );
    }
  }

  private async scheduleExpoPushNotification(
    quote: NotificationMessage,
    type: NotificationType,
    scheduledTime: Date,
  ): Promise<void> {
    try {
      // Calculate seconds from now to the scheduled time
      const now = new Date();
      const secondsUntilTrigger = Math.max(
        1,
        Math.ceil((scheduledTime.getTime() - now.getTime()) / 1000),
      );

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: quote.title,
          body: quote.body,
          data: {
            quoteId: quote.id,
            type,
            scheduledFor: scheduledTime.toISOString(),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilTrigger,
        },
      });

      if (this.config.enableLogging) {
        GlobalErrorHandler.logDebug(
          `NotificationEngine: Scheduled Expo push notification`,
          "NotificationEngine.scheduleExpoPushNotification",
          {
            notificationId,
            quoteId: quote.id,
            type,
            scheduledTime: scheduledTime.toISOString(),
            message: quote.body.substring(0, 100) +
              (quote.body.length > 100 ? "..." : ""),
          },
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.scheduleExpoPushNotification",
        {
          quoteId: quote.id,
          type,
          scheduledTime: scheduledTime.toISOString(),
        },
      );
      throw error;
    }
  }

  private getTitleForType(type: NotificationType): string {
    switch (type) {
      case "morning-motivation":
        return "Morning Inspiration";
      case "midday-reflection":
        return "Midday Pause";
      case "evening-reflection":
        return "Evening Reflection";
      case "streak-reminder":
        return "Weekly Progress";
      default:
        return "Cadence Reminder";
    }
  }

  private getBodyForType(type: NotificationType): string {
    switch (type) {
      case "morning-motivation":
        return "Start your day with intention";
      case "midday-reflection":
        return "Pause and reflect on your morning";
      case "evening-reflection":
        return "Tap to reflect on your day";
      case "streak-reminder":
        return "Check your weekly progress";
      default:
        return "Tap to open Cadence";
    }
  }

  private getMessageTypeForNotificationType(
    type: NotificationType,
  ): "morning" | "midday" | "evening" | "streak" | undefined {
    switch (type) {
      case "morning-motivation":
        return "morning";
      case "midday-reflection":
        return "midday";
      case "evening-reflection":
        return "evening";
      case "streak-reminder":
        return "streak";
      default:
        return undefined;
    }
  }

  // Schedule all notifications based on current preferences and timing
  async scheduleAllNotifications(): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      // Get current notification settings from store
      const store = useNotificationSettingsStore.getState();
      const settings = store.notificationSettings;

      if (!settings) {
        if (this.config.enableLogging) {
          GlobalErrorHandler.logWarning(
            "NotificationEngine: No notification settings found, skipping scheduling",
            "NotificationEngine.scheduleAllNotifications",
          );
        }
        return;
      }

      // Check if push notifications are enabled
      if (!settings.push_enabled) {
        if (this.config.enableLogging) {
          GlobalErrorHandler.logDebug(
            "NotificationEngine: Push notifications disabled, skipping scheduling",
            "NotificationEngine.scheduleAllNotifications",
          );
        }
        return;
      }

      // Check notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        if (this.config.enableLogging) {
          GlobalErrorHandler.logWarning(
            "NotificationEngine: Notification permissions not granted",
            "NotificationEngine.scheduleAllNotifications",
          );
        }
        return;
      }

      const scheduledNotifications: string[] = [];

      // Schedule notifications based on notification_type array
      if (
        settings.notification_type?.includes("morning-reminders") &&
        settings.wake_up_time
      ) {
        const morningTime = this.parseTimeString(settings.wake_up_time);
        await this.scheduleRecurringNotification(
          morningTime,
          "morning-motivation",
        );
        scheduledNotifications.push(`Morning at ${settings.wake_up_time}`);
      }

      if (settings.notification_type?.includes("midday-checkins")) {
        const middayTime = this.parseTimeString("12:00:00");
        await this.scheduleRecurringNotification(
          middayTime,
          "midday-reflection",
        );
        scheduledNotifications.push(`Midday at 12:00`);
      }

      if (
        settings.notification_type?.includes("evening-reminders") &&
        settings.sleep_time
      ) {
        const eveningTime = this.parseTimeString(settings.sleep_time);
        await this.scheduleRecurringNotification(
          eveningTime,
          "evening-reflection",
        );
        scheduledNotifications.push(`Evening at ${settings.sleep_time}`);
      }

      if (this.config.enableLogging) {
        GlobalErrorHandler.logDebug(
          `NotificationEngine: Scheduled ${scheduledNotifications.length} recurring notifications`,
          "NotificationEngine.scheduleAllNotifications",
          { scheduledNotifications },
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.scheduleAllNotifications",
        {},
      );
      throw error;
    }
  }

  private parseTimeString(
    timeString: string,
  ): { hour: number; minute: number } {
    // Handle both HH:MM and HH:MM:SS formats from database
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return { hour: hours, minute: minutes };
  }

  private getMessageForType(type: NotificationType): string {
    switch (type) {
      case "morning-motivation":
        return getRandomMorningMotivation();
      case "midday-reflection":
        return getRandomMiddayReflection();
      case "evening-reflection":
        return getRandomEveningReflection();
      case "streak-reminder":
        // For now, use a default streak count of 1
        return getRandomStreakMessage(1);
      default:
        return "Take a moment to reflect on your day.";
    }
  }

  private async updatePushTokenIfNeeded(): Promise<void> {
    try {
      // Check if we have permission first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      // Get the current Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      if (tokenData?.data) {
        // Update the token in the store
        await useNotificationHandler.updatePushToken(tokenData.data);

        if (this.config.enableLogging) {
          GlobalErrorHandler.logDebug(
            "NotificationEngine: Updated Expo push token",
            "NotificationEngine.updatePushTokenIfNeeded",
            { tokenPrefix: tokenData.data.substring(0, 20) + "..." },
          );
        }
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.updatePushTokenIfNeeded",
      );
    }
  }

  private async scheduleRecurringNotification(
    time: { hour: number; minute: number },
    type: NotificationType,
  ): Promise<void> {
    // For recurring notifications, we don't use a specific quote yet
    // The quote will be selected when the notification fires
    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getTitleForType(type),
        body: this.getBodyForType(type),
        data: { type },
      },
      trigger,
    });
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (this.config.enableLogging) {
        GlobalErrorHandler.logDebug(
          "NotificationEngine: Cancelled all scheduled notifications",
          "NotificationEngine.cancelAllNotifications",
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.cancelAllNotifications",
        {},
      );
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);

      if (this.config.enableLogging) {
        GlobalErrorHandler.logDebug(
          `NotificationEngine: Cancelled notification ${notificationId}`,
          "NotificationEngine.cancelNotification",
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.cancelNotification",
        { notificationId },
      );
      throw error;
    }
  }

  // Get the next quote for immediate delivery
  async deliverNotificationNow(type: NotificationType): Promise<void> {
    const message = this.getMessageForType(type);
    const notificationMessage: NotificationMessage = {
      id: `${type}-immediate-${Date.now()}`,
      title: this.getTitleForType(type),
      body: message,
      type,
      scheduledFor: new Date(),
    };

    if (this.isAppInForeground()) {
      this.deliverInApp(notificationMessage, type);
    } else {
      // For immediate delivery when app is in background, schedule for "now"
      await this.scheduleExpoPushNotification(
        notificationMessage,
        type,
        new Date(),
      );
    }
  }

  // Initialize the notification engine
  async initialize(): Promise<void> {
    try {
      // Set up notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Initialize notification settings for current user
      await useNotificationHandler.initialize();

      // Update push token if permissions are granted
      await this.updatePushTokenIfNeeded();

      if (this.config.enableLogging) {
        GlobalErrorHandler.logDebug(
          "NotificationEngine: Initialized successfully",
          "NotificationEngine.initialize",
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.initialize",
        {},
      );
      throw error;
    }
  }

  // Request permissions and update push token
  async requestPermissions(): Promise<boolean> {
    try {
      const granted = await useNotificationHandler.requestPermissions();

      if (granted) {
        // Update push token when permissions are granted
        await this.updatePushTokenIfNeeded();
      }

      return granted;
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.requestPermissions",
      );
      return false;
    }
  }

  // Clean up resources
  destroy(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.config.enableLogging) {
      GlobalErrorHandler.logDebug(
        "NotificationEngine: Destroyed",
        "NotificationEngine.destroy",
      );
    }
  }
}

// Export a default instance
export const notificationEngine = NotificationEngine.getInstance();
