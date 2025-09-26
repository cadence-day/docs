import { ToastService } from "@/shared/context/ToastProvider";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Notifications from "expo-notifications";
import { AppState, AppStateStatus } from "react-native";
import {
  CadenceMessage,
  NotificationType,
  useNotificationStore,
} from "./stores/notificationsStore";

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

    // Update the store's app state
    useNotificationStore.getState()._updateAppState(nextAppState);

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
    const messageType = this.getMessageTypeForNotificationType(type);
    const quote = useNotificationStore.getState().getNextQuote(messageType);

    if (this.isAppInForeground()) {
      // Deliver in-app immediately if time matches
      this.deliverInApp(quote, type);
    } else {
      // Schedule via Expo Push Notification
      await this.scheduleExpoPushNotification(quote, type, scheduledTime);
    }

    useNotificationStore.getState().markQuoteUsed(quote.id);
  }

  // Force scheduling regardless of app state (useful for testing)
  async forceScheduleQuoteNotification(
    scheduledTime: Date,
    type: NotificationType,
  ): Promise<void> {
    const messageType = this.getMessageTypeForNotificationType(type);
    const quote = useNotificationStore.getState().getNextQuote(messageType);

    // Always schedule the notification, regardless of app state
    await this.scheduleExpoPushNotification(quote, type, scheduledTime);

    useNotificationStore.getState().markQuoteUsed(quote.id);
  }

  private deliverInApp(quote: CadenceMessage, type: NotificationType): void {
    // Show in-app notification/toast with quote
    const title = this.getTitleForType(type);
    const body = quote.text;

    // Use ToastService for immediate display
    ToastService.show({
      title,
      body,
      type: "info",
      duration: 5000,
    });

    useNotificationStore.getState().deliverNotification(quote, type);

    if (this.config.enableLogging) {
      GlobalErrorHandler.logDebug(
        `NotificationEngine: Delivered in-app notification`,
        "NotificationEngine.deliverInApp",
        { quoteId: quote.id, type, text: quote.text },
      );
    }
  }

  private async scheduleExpoPushNotification(
    quote: CadenceMessage,
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
          title: this.getTitleForType(type),
          body: quote.text,
          data: { quoteId: quote.id, type },
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
            text: quote.text.substring(0, 100) +
              (quote.text.length > 100 ? "..." : ""),
          },
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationEngine.scheduleExpoPushNotification",
        { quoteId: quote.id, type, scheduledTime: scheduledTime.toISOString() },
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
      case "weekly-streaks":
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
      case "weekly-streaks":
        return "Check your weekly progress";
      default:
        return "Tap to open Cadence";
    }
  }

  private getMessageTypeForNotificationType(type: NotificationType): "morning" | "midday" | "evening" | "streak" | undefined {
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
    const store = useNotificationStore.getState();
    const { preferences, timing, permissionStatus } = store;

    if (permissionStatus !== "granted") {
      if (this.config.enableLogging) {
        GlobalErrorHandler.logWarning(
          "NotificationEngine: Cannot schedule notifications without permissions",
          "NotificationEngine.scheduleAllNotifications",
        );
      }
      return;
    }

    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      const scheduledNotifications = [];

      // Schedule morning reminders (using dedicated morning motivation messages)
      if (preferences.morningReminders) {
        const morningTime = this.parseTimeString(timing.morningTime);
        await this.scheduleRecurringNotification(
          morningTime,
          "morning-motivation",
        );
        scheduledNotifications.push(`Morning at ${timing.morningTime}`);
      }

      // Schedule midday reflections
      if (preferences.middayReflection) {
        const middayTime = this.parseTimeString(timing.middayTime);
        await this.scheduleRecurringNotification(
          middayTime,
          "midday-reflection",
        );
        scheduledNotifications.push(`Midday at ${timing.middayTime}`);
      }

      // Schedule evening reflections
      if (preferences.eveningReminders) {
        const eveningTime = this.parseTimeString(timing.eveningTime);
        await this.scheduleRecurringNotification(
          eveningTime,
          "evening-reflection",
        );
        scheduledNotifications.push(`Evening at ${timing.eveningTime}`);
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
        { preferences, timing },
      );
      throw error;
    }
  }

  private parseTimeString(
    timeString: string,
  ): { hour: number; minute: number } {
    const [hours, minutes] = timeString.split(":").map(Number);
    return { hour: hours, minute: minutes };
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
    const messageType = this.getMessageTypeForNotificationType(type);
    const quote = useNotificationStore.getState().getNextQuote(messageType);

    if (this.isAppInForeground()) {
      this.deliverInApp(quote, type);
    } else {
      // For immediate delivery when app is in background, schedule for "now"
      await this.scheduleExpoPushNotification(quote, type, new Date());
    }

    useNotificationStore.getState().markQuoteUsed(quote.id);
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
