import { ProfileSettings } from "@/features/profile/types";
import { useNotificationStore } from "@/shared/stores/resources/useNotificationStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import {
  getRandomEveningReflection,
  getRandomMiddayReflection,
  getRandomStreakMessage,
} from "../cadenceMessages";
import {
  createNotificationId,
  createScheduledDate,
  createWeeklyScheduledDate,
} from "../utils";
import { NotificationEngine } from "../NotificationEngine";
import {
  NotificationEvent,
  NotificationMessage,
  NotificationPreferences,
} from "../types";

export interface SchedulerConfig {
  userId: string;
  preferences: NotificationPreferences;
  profileSettings?: ProfileSettings;
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

  // Get timing from notification store
  const notificationStore = useNotificationStore.getState();
  const timing = notificationStore.getTimingForDate(wakeTime, sleepTime);

  // Update store timing if it's set to automatic
  if (timing.isAutomatic) {
    notificationStore.updateTiming(timing);
  }

  return {
    rhythm,
    middayTime: timing.middayTime,
    eveningTimeStart: timing.eveningTimeStart,
    eveningTimeEnd: timing.eveningTimeEnd,
    streaksEnabled: notifications.weeklyStreaks,
    lightTouch: true,
    soundEnabled: true,
    vibrationEnabled: true,
  };
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
      // Cancel existing notifications first
      await this.engine.cancelAllNotifications();

      if (this.config.preferences.rhythm === "disabled") {
        GlobalErrorHandler.logDebug(
          "Notifications disabled, skipping scheduling",
          "NotificationScheduler.scheduleAllNotifications",
        );

        // Update notification store status
        const notificationStore = useNotificationStore.getState();
        notificationStore.markAsUnscheduled();
        return;
      }

      const schedulingPromises: Promise<boolean>[] = [];

      // Schedule midday reflections
      if (this.shouldScheduleMidday()) {
        schedulingPromises.push(this.scheduleMiddayReflections());
      }

      // Schedule evening reflections
      if (this.shouldScheduleEvening()) {
        schedulingPromises.push(this.scheduleEveningReflections());
      }

      // Schedule streak reminders
      if (this.config.preferences.streaksEnabled) {
        schedulingPromises.push(this.scheduleStreakReminders());
      }

      const results = await Promise.allSettled(schedulingPromises);
      const totalScheduled = results.filter(result =>
        result.status === 'fulfilled' && result.value === true
      ).length;

      // Update notification store status
      const notificationStore = useNotificationStore.getState();
      notificationStore.markAsScheduled(totalScheduled);

      GlobalErrorHandler.logDebug(
        "All notifications scheduled successfully",
        "NotificationScheduler.scheduleAllNotifications",
        {
          userId: this.config.userId,
          rhythm: this.config.preferences.rhythm,
          streaksEnabled: this.config.preferences.streaksEnabled,
          totalScheduled,
        },
      );
    } catch (error) {
      // Mark as unscheduled on error
      const notificationStore = useNotificationStore.getState();
      notificationStore.markAsUnscheduled();

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
      const [hour, minute] = this.config.preferences.middayTime
        .split(":")
        .map(Number);

      // Schedule only for today
      const scheduledDate = createScheduledDate(hour, minute, 0);

      // Skip if the time has already passed today
      if (scheduledDate < new Date()) {
        GlobalErrorHandler.logDebug(
          "Midday reflection time has already passed today, skipping",
          "NotificationScheduler.scheduleMiddayReflections",
          { time: this.config.preferences.middayTime },
        );
        return false;
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

      GlobalErrorHandler.logDebug(
        "Midday reflections scheduled",
        "NotificationScheduler.scheduleMiddayReflections",
        { time: this.config.preferences.middayTime },
      );
      return true;
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
      const [startHour, startMinute] = this.config.preferences.eveningTimeStart
        .split(":")
        .map(Number);
      const [endHour, endMinute] = this.config.preferences.eveningTimeEnd
        .split(":")
        .map(Number);

      // Schedule only for today within the evening window (randomly between start and end time)
      const randomMinutes = Math.random() *
        (endHour * 60 + endMinute - (startHour * 60 + startMinute));
      const totalMinutes = startHour * 60 + startMinute + randomMinutes;
      const hour = Math.floor(totalMinutes / 60);
      const minute = Math.floor(totalMinutes % 60);

      const scheduledDate = createScheduledDate(hour, minute, 0);

      // Skip if the time has already passed today
      if (scheduledDate < new Date()) {
        GlobalErrorHandler.logDebug(
          "Evening reflection time has already passed today, skipping",
          "NotificationScheduler.scheduleEveningReflections",
          {
            startTime: this.config.preferences.eveningTimeStart,
            endTime: this.config.preferences.eveningTimeEnd,
          },
        );
        return false;
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

      GlobalErrorHandler.logDebug(
        "Evening reflections scheduled",
        "NotificationScheduler.scheduleEveningReflections",
        {
          startTime: this.config.preferences.eveningTimeStart,
          endTime: this.config.preferences.eveningTimeEnd,
        },
      );
      return true;
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

      // Update notification store status
      const notificationStore = useNotificationStore.getState();
      notificationStore.markAsUnscheduled();

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

  private shouldScheduleMidday(): boolean {
    return (
      this.config.preferences.rhythm === "morning-only" ||
      this.config.preferences.rhythm === "both"
    );
  }

  private shouldScheduleEvening(): boolean {
    return (
      this.config.preferences.rhythm === "evening-only" ||
      this.config.preferences.rhythm === "both"
    );
  }

  private getDeliveryMethods(): ("push" | "local" | "in-app")[] {
    // For Cadence notifications, use both push and in-app
    return ["push", "in-app"];
  }

  private async getUserStreakCount(): Promise<number> {
    // TODO: Implement actual streak calculation from user data
    // This should integrate with the existing streak calculation logic
    try {
      // Placeholder implementation
      // In a real implementation, this would call the streak calculation service
      return Math.floor(Math.random() * 30) + 1; // Random streak between 1-30
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
}
