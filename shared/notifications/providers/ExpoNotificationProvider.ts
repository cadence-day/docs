import { SECRETS } from "@/shared/constants/SECRETS";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  NotificationMessage,
  NotificationPermissionStatus,
  NotificationProvider,
} from "../types";

export class ExpoNotificationProvider implements NotificationProvider {
  name = "ExpoNotificationProvider";
  private isInitialized = false;

  constructor() {
    this.setupNotificationHandler();
  }

  private setupNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.registerForPushNotificationsAsync();
      this.isInitialized = true;
    } catch (error) {
      GlobalErrorHandler.logError(error, "ExpoNotificationProvider.initialize");
      throw error;
    }
  }

  async sendNotification(notification: NotificationMessage): Promise<void> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported on this device");
    }

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: notification.id,
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.metadata || {},
          sound: "default",
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.sendNotification",
        { notificationId: notification.id },
      );
      throw error;
    }
  }

  async scheduleNotification(
    notification: NotificationMessage,
    scheduledFor: Date,
  ): Promise<void> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported on this device");
    }

    try {
      const delay = Math.max(0, scheduledFor.getTime() - Date.now());
      const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.ceil(delay / 1000),
      };

      await Notifications.scheduleNotificationAsync({
        identifier: notification.id,
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.metadata || {},
          sound: "default",
        },
        trigger,
      });
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.scheduleNotification",
        {
          notificationId: notification.id,
          scheduledFor: scheduledFor.toISOString(),
        },
      );
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.cancelNotification",
        { notificationId },
      );
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.cancelAllNotifications",
      );
      throw error;
    }
  }

  isSupported(): boolean {
    return (
      Device.isDevice && (Platform.OS === "ios" || Platform.OS === "android")
    );
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    const { status } = await Notifications.getPermissionsAsync();

    return {
      granted: status === "granted",
      canAskAgain: status !== "denied",
      status: status as "granted" | "denied" | "undetermined",
    };
  }

  async requestPermissions(): Promise<NotificationPermissionStatus> {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    return {
      granted: status === "granted",
      canAskAgain: status !== "denied",
      status: status as "granted" | "denied" | "undetermined",
    };
  }

  async getExpoPushToken(): Promise<string | null> {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: SECRETS.EXPO_PROJECT_ID,
      });
      return token.data;
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.getExpoPushToken",
      );
      return null;
    }
  }

  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.getScheduledNotifications",
      );
      return [];
    }
  }

  private async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!this.isSupported()) {
      const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;
      const message =
        "Push notifications are not supported in current environment (requires physical device with iOS/Android)";

      if (isDev) {
        GlobalErrorHandler.logDebug(
          message,
          "ExpoNotificationProvider.registerForPushNotificationsAsync",
        );
      } else {
        GlobalErrorHandler.logWarning(
          message,
          "ExpoNotificationProvider.registerForPushNotificationsAsync",
        );
      }
      return null;
    }

    const { status: existingStatus } = await Notifications
      .getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      GlobalErrorHandler.logWarning(
        "Push notification permissions not granted",
        "ExpoNotificationProvider.registerForPushNotificationsAsync",
      );
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: SECRETS.EXPO_PROJECT_ID,
      });
      return token.data;
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.registerForPushNotificationsAsync",
      );
      return null;
    }
  }

  // Helper method to schedule recurring notifications
  async scheduleRecurringNotification(
    notification: NotificationMessage,
    trigger: Notifications.TimeIntervalTriggerInput,
  ): Promise<void> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported on this device");
    }

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: notification.id,
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.metadata || {},
          sound: "default",
        },
        trigger,
      });
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ExpoNotificationProvider.scheduleRecurringNotification",
        { notificationId: notification.id },
      );
      throw error;
    }
  }

  // Helper method to create daily trigger
  createDailyTrigger(
    hour: number,
    minute: number,
  ): Notifications.TimeIntervalTriggerInput {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 1); // Next day
    }

    const delay = Math.max(0, target.getTime() - now.getTime());

    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.ceil(delay / 1000),
      repeats: true,
    };
  }

  // Helper method to create weekly trigger
  createWeeklyTrigger(
    weekday: number,
    hour: number,
    minute: number,
  ): Notifications.TimeIntervalTriggerInput {
    const now = new Date();
    const target = new Date();

    // Calculate days until target weekday
    const daysUntilTarget = (weekday - now.getDay() + 7) % 7;
    target.setDate(now.getDate() + daysUntilTarget);
    target.setHours(hour, minute, 0, 0);

    if (target <= now) {
      target.setDate(target.getDate() + 7); // Next week
    }

    const delay = Math.max(0, target.getTime() - now.getTime());

    return {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.ceil(delay / 1000),
      repeats: true,
    };
  }
}
