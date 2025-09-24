import { ProfileSettings } from "@/features/profile/types";
import { useNotificationStore } from "@/shared/stores/resources/useNotificationStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useTimeslicesStore } from "../../stores";
import { Timeslice } from "../../types/models";
import {
  getRandomEveningReflection,
  getRandomMiddayReflection,
  getRandomStreakMessage,
} from "../cadenceMessages";
import { NotificationEngine } from "../NotificationEngine";
import {
  NotificationEvent,
  NotificationMessage,
  NotificationPreferences,
} from "../types";
import {
  createNotificationId,
  createScheduledDate,
  createWeeklyScheduledDate,
} from "../utils";

export interface SchedulerConfig {
  userId: string;
  timezone?: string;
}

// Helper function to map profile settings to notification preferences
export function mapProfileSettingsToNotificationPreferences(
  profileSettings: ProfileSettings,
): Partial<NotificationPreferences> {
  const { notifications, wakeTime, sleepTime } = profileSettings;

  // Determine rhythm based on profile settings
  let rhythm: NotificationPreferences["rhythm"] = "disabled";
  if (notifications.morningReminders && notifications.eveningReminders) {
    rhythm = "both";
  } else if (notifications.morningReminders) {
    rhythm = "morning-only";
  } else if (notifications.eveningReminders) {
    rhythm = "evening-only";
  }

  // Get timing from notification store without updating it
  const notificationStore = useNotificationStore.getState();
  const timing = notificationStore.getTimingForDate(wakeTime, sleepTime);

  return {
    rhythm,
    middayTime: timing.middayTime,
    eveningTime: timing.eveningTime || timing.eveningTimeStart,
    eveningTimeStart: timing.eveningTimeStart,
    eveningTimeEnd: timing.eveningTimeEnd,
    streaksEnabled: notifications.weeklyStreaks,
    lightTouch: true,
    soundEnabled: true,
    vibrationEnabled: true,
  };
}

// Helper function to update timing based on profile settings
export function updateTimingFromProfileSettings(
  profileSettings: ProfileSettings,
): void {
  const { wakeTime, sleepTime } = profileSettings;
  const notificationStore = useNotificationStore.getState();
  const timing = notificationStore.getTimingForDate(wakeTime, sleepTime);

  // Update store timing if it's set to automatic
  if (timing.isAutomatic) {
    notificationStore.updateTiming(timing);
  }
}

export class NotificationScheduler {
  private engine: NotificationEngine;
  private config: SchedulerConfig;

  constructor(engine: NotificationEngine, config: SchedulerConfig) {
    this.engine = engine;
    this.config = config;
  }

  async scheduleAllNotifications(): Promise<void> {
    try {
      // Get preferences and timing from store
      const { preferences } = useNotificationStore.getState();

      // Cancel existing notifications first
      await this.engine.cancelAllNotifications();

      // Clear scheduled notification tracking when rescheduling
      await this.clearScheduledNotificationTracking();

      // Clean up old tracking data
      await this.cleanupOldScheduledNotifications();

      // Check if notifications are disabled
      if (!preferences.morningReminders && !preferences.eveningReminders) {
        GlobalErrorHandler.logDebug(
          "Notifications disabled, skipping scheduling",
          "NotificationScheduler.scheduleAllNotifications",
        );

        useNotificationStore.getState().markAsUnscheduled();
        return;
      }

      const schedulingPromises: Promise<boolean>[] = [];

      // Schedule midday reflections
      if (preferences.middayReflection) {
        schedulingPromises.push(this.scheduleMiddayReflections());
      }

      // Schedule evening reflections
      if (preferences.eveningReminders) {
        schedulingPromises.push(this.scheduleEveningReflections());
      }

      // Schedule streak reminders
      if (preferences.weeklyStreaks) {
        schedulingPromises.push(this.scheduleStreakReminders());
      }

      const results = await Promise.allSettled(schedulingPromises);
      const totalScheduled = results.filter((result) =>
        result.status === "fulfilled" && result.value === true
      ).length;

      // Update notification store status
      useNotificationStore.getState().markAsScheduled(totalScheduled);

      GlobalErrorHandler.logDebug(
        "All notifications scheduled successfully",
        "NotificationScheduler.scheduleAllNotifications",
        {
          userId: this.config.userId,
          middayReflection: preferences.middayReflection,
          eveningReminders: preferences.eveningReminders,
          weeklyStreaks: preferences.weeklyStreaks,
          totalScheduled,
        },
      );
    } catch (error) {
      // Mark as unscheduled on error
      useNotificationStore.getState().markAsUnscheduled();

      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleAllNotifications",
        {
          userId: this.config.userId,
        },
      );
      throw error;
    }
  }

  async scheduleMiddayReflections(): Promise<boolean> {
    try {
      const { timing } = useNotificationStore.getState();
      const [hour, minute] = timing.middayTime
        .split(":")
        .map(Number);

      let scheduledCount = 0;

      // Schedule for the next 3 days
      for (let day = 0; day < 3; day++) {
        const scheduledDate = createScheduledDate(hour, minute, day);

        // Skip if the time has already passed (only for today)
        if (day === 0 && scheduledDate < new Date()) {
          GlobalErrorHandler.logDebug(
            "Midday reflection time has already passed today, skipping today",
            "NotificationScheduler.scheduleMiddayReflections",
            { time: timing.middayTime },
          );
          continue;
        }

        // Check for double scheduling using simple tracking
        const scheduledDateKey =
          `midday-${scheduledDate.toDateString()}-${hour}:${minute}`;

        if (await this.isNotificationAlreadyScheduled(scheduledDateKey)) {
          GlobalErrorHandler.logDebug(
            "Midday reflection already scheduled for this date/time, skipping",
            "NotificationScheduler.scheduleMiddayReflections",
            { scheduledDate: scheduledDate.toISOString() },
          );
          continue;
        }

        // Create notification with a single random message
        const notification: NotificationMessage = {
          id: createNotificationId(),
          title: "Midday Reflection",
          body: getRandomMiddayReflection(), // Single random message
          type: "midday-reflection",
        };

        const event: NotificationEvent = {
          type: "midday-reflection",
          message: notification,
          deliveryMethod: this.getDeliveryMethods(),
          userId: this.config.userId,
        };

        await this.engine.schedule(event, scheduledDate);
        await this.markNotificationAsScheduled(scheduledDateKey);
        scheduledCount++;
      }

      GlobalErrorHandler.logDebug(
        "Midday reflections scheduled",
        "NotificationScheduler.scheduleMiddayReflections",
        {
          time: timing.middayTime,
          scheduledCount,
          daysAhead: 3,
        },
      );
      return scheduledCount > 0;
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleMiddayReflections",
      );
      throw error;
    }
  }

  async scheduleEveningReflections(): Promise<boolean> {
    try {
      const { timing } = useNotificationStore.getState();
      // Use the specific evening time from store
      const eveningTime = timing.eveningTime;
      const [hour, minute] = eveningTime.split(":").map(Number);

      let scheduledCount = 0;

      // Schedule for the next 3 days
      for (let day = 0; day < 3; day++) {
        const scheduledDate = createScheduledDate(hour, minute, day);

        // Skip if the time has already passed (only for today)
        if (day === 0 && scheduledDate < new Date()) {
          GlobalErrorHandler.logDebug(
            "Evening reflection time has already passed today, skipping today",
            "NotificationScheduler.scheduleEveningReflections",
            {
              eveningTime: eveningTime,
            },
          );
          continue;
        }

        // Check for double scheduling using simple tracking
        const scheduledDateKey = `evening-${scheduledDate.toDateString()}`;

        if (await this.isNotificationAlreadyScheduled(scheduledDateKey)) {
          GlobalErrorHandler.logDebug(
            "Evening reflection already scheduled for this date, skipping",
            "NotificationScheduler.scheduleEveningReflections",
            { scheduledDate: scheduledDate.toISOString() },
          );
          continue;
        }

        // Create notification with a single random message
        const notification: NotificationMessage = {
          id: createNotificationId(),
          title: "Evening Reflection",
          body: getRandomEveningReflection(), // Single random message
          type: "evening-reflection",
        };

        const event: NotificationEvent = {
          type: "evening-reflection",
          message: notification,
          deliveryMethod: this.getDeliveryMethods(),
          userId: this.config.userId,
        };

        await this.engine.schedule(event, scheduledDate);
        await this.markNotificationAsScheduled(scheduledDateKey);
        scheduledCount++;
      }

      GlobalErrorHandler.logDebug(
        "Evening reflections scheduled",
        "NotificationScheduler.scheduleEveningReflections",
        {
          eveningTime: eveningTime,
          scheduledCount,
          daysAhead: 3,
        },
      );
      return scheduledCount > 0;
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleEveningReflections",
      );
      throw error;
    }
  }

  async scheduleStreakReminders(): Promise<boolean> {
    try {
      // Schedule for Sunday evenings (weekday 0 = Sunday)
      const scheduledDate = createWeeklyScheduledDate(0, 19, 0); // Sunday at 7 PM

      // TODO: Get actual streak count from user data
      const streakCount = await this.getUserStreakCount();

      // Create notification with a single random message
      const notification: NotificationMessage = {
        id: createNotificationId(),
        title: "Weekly Progress",
        body: getRandomStreakMessage(streakCount), // Single random message
        type: "streak-reminder",
        metadata: { streakCount },
      };

      const event: NotificationEvent = {
        type: "streak-reminder",
        message: notification,
        deliveryMethod: this.getDeliveryMethods(),
        userId: this.config.userId,
      };

      await this.engine.schedule(event, scheduledDate);

      GlobalErrorHandler.logDebug(
        "Streak reminder scheduled",
        "NotificationScheduler.scheduleStreakReminders",
        {
          scheduledDate: scheduledDate.toISOString(),
          streakCount,
        },
      );
      return true;
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleStreakReminders",
      );
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await this.engine.cancelAllNotifications();

      // Clear scheduled notification tracking
      await this.clearScheduledNotificationTracking();

      // Update notification store status
      useNotificationStore.getState().markAsUnscheduled();

      GlobalErrorHandler.logDebug(
        "All notifications cancelled",
        "NotificationScheduler.cancelAllNotifications",
        { userId: this.config.userId },
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.cancelAllNotifications",
      );
      throw error;
    }
  }

  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private getDeliveryMethods(): ("push" | "local" | "in-app")[] {
    // For Cadence notifications, use both push and in-app
    return ["push", "in-app"];
  }

  private async getUserStreakCount(): Promise<number> {
    // This should integrate with the existing streak calculation logic
    try {
      const timeslices = await useTimeslicesStore.getState()
        .getTimeslicesFromTo(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(),
        );

      const uniqueDays = new Set<string>(
        (timeslices as Timeslice[])
          .filter((ts: Timeslice) => {
            if (!ts.start_time) return false;
            const tsDate: Date = new Date(ts.start_time);
            const oneWeekAgo: Date = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return tsDate >= oneWeekAgo;
          })
          .map((ts: Timeslice) =>
            new Date(ts.start_time as string).toDateString()
          ),
      );

      return uniqueDays.size;
    } catch {
      GlobalErrorHandler.logWarning(
        "Failed to get user streak count, using default",
        "NotificationScheduler.getUserStreakCount",
      );
      return 1;
    }
  }

  // Static method to create a scheduler instance
  static create(
    engine: NotificationEngine,
    config: SchedulerConfig,
  ): NotificationScheduler {
    return new NotificationScheduler(engine, config);
  }

  // Method to schedule a one-time notification
  async scheduleOneTimeNotification(
    type:
      | "midday-reflection"
      | "evening-reflection"
      | "achievement"
      | "reminder",
    scheduledFor: Date,
    customMessage?: { title: string; body: string },
  ): Promise<void> {
    try {
      let notification: NotificationMessage;

      switch (type) {
        case "midday-reflection":
          notification = {
            id: createNotificationId(),
            title: "Midday Reflection",
            body: getRandomMiddayReflection(),
            type: "midday-reflection",
          };
          break;
        case "evening-reflection":
          notification = {
            id: createNotificationId(),
            title: "Evening Reflection",
            body: getRandomEveningReflection(),
            type: "evening-reflection",
          };
          break;
        default:
          notification = {
            id: createNotificationId(),
            title: customMessage?.title || "Cadence Notification",
            body: customMessage?.body || "You have a new notification",
            type,
          };
      }

      const event: NotificationEvent = {
        type,
        message: notification,
        deliveryMethod: this.getDeliveryMethods(),
        userId: this.config.userId,
      };

      await this.engine.schedule(event, scheduledFor);

      GlobalErrorHandler.logDebug(
        "One-time notification scheduled",
        "NotificationScheduler.scheduleOneTimeNotification",
        {
          type,
          scheduledFor: scheduledFor.toISOString(),
          notificationId: notification.id,
        },
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleOneTimeNotification",
      );
      throw error;
    }
  }

  // Helper methods for double scheduling prevention
  private async isNotificationAlreadyScheduled(key: string): Promise<boolean> {
    try {
      const AsyncStorage =
        (await import("@react-native-async-storage/async-storage")).default;
      const scheduledNotifications = JSON.parse(
        await AsyncStorage.getItem("SCHEDULED_NOTIFICATIONS") || "{}",
      );
      return !!scheduledNotifications[key];
    } catch (error) {
      GlobalErrorHandler.logWarning(
        "Failed to check scheduled notification tracking",
        "NotificationScheduler.isNotificationAlreadyScheduled",
        { key, error },
      );
      return false;
    }
  }

  private async markNotificationAsScheduled(key: string): Promise<void> {
    try {
      const AsyncStorage =
        (await import("@react-native-async-storage/async-storage")).default;
      const scheduledNotifications = JSON.parse(
        await AsyncStorage.getItem("SCHEDULED_NOTIFICATIONS") || "{}",
      );

      scheduledNotifications[key] = {
        scheduledAt: new Date().toISOString(),
        userId: this.config.userId,
      };

      await AsyncStorage.setItem(
        "SCHEDULED_NOTIFICATIONS",
        JSON.stringify(scheduledNotifications),
      );
    } catch (error) {
      GlobalErrorHandler.logWarning(
        "Failed to mark notification as scheduled",
        "NotificationScheduler.markNotificationAsScheduled",
        { key, error },
      );
    }
  }

  private async clearScheduledNotificationTracking(): Promise<void> {
    try {
      const AsyncStorage =
        (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.removeItem("SCHEDULED_NOTIFICATIONS");
    } catch (error) {
      GlobalErrorHandler.logWarning(
        "Failed to clear scheduled notification tracking",
        "NotificationScheduler.clearScheduledNotificationTracking",
        { error },
      );
    }
  }

  // Method to clean up old scheduled notification tracking
  private async cleanupOldScheduledNotifications(): Promise<void> {
    try {
      const AsyncStorage =
        (await import("@react-native-async-storage/async-storage")).default;
      const scheduledNotifications = JSON.parse(
        await AsyncStorage.getItem("SCHEDULED_NOTIFICATIONS") || "{}",
      );

      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));

      const cleanedNotifications: Record<string, any> = {};

      Object.entries(scheduledNotifications).forEach(
        ([key, value]: [string, any]) => {
          const scheduledDate = new Date(value.scheduledAt);
          if (scheduledDate > threeDaysAgo) {
            cleanedNotifications[key] = value;
          }
        },
      );

      await AsyncStorage.setItem(
        "SCHEDULED_NOTIFICATIONS",
        JSON.stringify(cleanedNotifications),
      );
    } catch (error) {
      GlobalErrorHandler.logWarning(
        "Failed to cleanup old scheduled notifications",
        "NotificationScheduler.cleanupOldScheduledNotifications",
        { error },
      );
    }
  }
}
