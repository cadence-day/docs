import useTranslation from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import {
  createNotificationId,
  createScheduledDate,
  createWeeklyScheduledDate,
} from "../index";
import { NotificationEngine } from "../NotificationEngine";
import { LocaleNotificationProvider } from "../providers/LocaleNotificationProvider";
import {
  NotificationEvent,
  NotificationMessage,
  NotificationPreferences,
} from "../types";
export interface SchedulerConfig {
  userId: string;
  preferences: NotificationPreferences;
  timezone?: string;
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
          "NotificationScheduler.scheduleAllNotifications"
        );
        return;
      }

      const schedulingPromises: Promise<void>[] = [];

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

      await Promise.allSettled(schedulingPromises);

      GlobalErrorHandler.logDebug(
        "All notifications scheduled successfully",
        "NotificationScheduler.scheduleAllNotifications",
        {
          userId: this.config.userId,
          rhythm: this.config.preferences.rhythm,
          streaksEnabled: this.config.preferences.streaksEnabled,
        }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleAllNotifications",
        {
          userId: this.config.userId,
        }
      );
      throw error;
    }
  }

  async scheduleMiddayReflections(): Promise<void> {
    try {
      const [hour, minute] = this.config.preferences.middayTime
        .split(":")
        .map(Number);

      // Schedule for the next 7 days
      for (let day = 0; day < 7; day++) {
        const scheduledDate = createScheduledDate(hour, minute, day);

        // Skip if the time has already passed today
        if (day === 0 && scheduledDate < new Date()) {
          continue;
        }

        const notification = LocaleNotificationProvider.createMiddayReflection(
          createNotificationId()
        );

        const event: NotificationEvent = {
          type: "midday-reflection",
          message: notification,
          deliveryMethod: this.getDeliveryMethods(),
          userId: this.config.userId,
        };

        await this.engine.schedule(event, scheduledDate);
      }

      GlobalErrorHandler.logDebug(
        "Midday reflections scheduled",
        "NotificationScheduler.scheduleMiddayReflections",
        { time: this.config.preferences.middayTime }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleMiddayReflections"
      );
      throw error;
    }
  }

  async scheduleEveningReflections(): Promise<void> {
    try {
      const [startHour, startMinute] = this.config.preferences.eveningTimeStart
        .split(":")
        .map(Number);
      const [endHour, endMinute] = this.config.preferences.eveningTimeEnd
        .split(":")
        .map(Number);

      // Schedule for the next 7 days
      for (let day = 0; day < 7; day++) {
        // Schedule within the evening window (randomly between start and end time)
        const randomMinutes =
          Math.random() *
          (endHour * 60 + endMinute - (startHour * 60 + startMinute));
        const totalMinutes = startHour * 60 + startMinute + randomMinutes;
        const hour = Math.floor(totalMinutes / 60);
        const minute = Math.floor(totalMinutes % 60);

        const scheduledDate = createScheduledDate(hour, minute, day);

        // Skip if the time has already passed today
        if (day === 0 && scheduledDate < new Date()) {
          continue;
        }

        const notification = LocaleNotificationProvider.createEveningReflection(
          createNotificationId()
        );

        const event: NotificationEvent = {
          type: "evening-reflection",
          message: notification,
          deliveryMethod: this.getDeliveryMethods(),
          userId: this.config.userId,
        };

        await this.engine.schedule(event, scheduledDate);
      }

      GlobalErrorHandler.logDebug(
        "Evening reflections scheduled",
        "NotificationScheduler.scheduleEveningReflections",
        {
          startTime: this.config.preferences.eveningTimeStart,
          endTime: this.config.preferences.eveningTimeEnd,
        }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleEveningReflections"
      );
      throw error;
    }
  }

  async scheduleStreakReminders(): Promise<void> {
    try {
      // Schedule for Sunday evenings (weekday 0 = Sunday)
      const scheduledDate = createWeeklyScheduledDate(0, 19, 0); // Sunday at 7 PM

      // TODO: Get actual streak count from user data
      const streakCount = await this.getUserStreakCount();

      const notification = LocaleNotificationProvider.createStreakReminder(
        createNotificationId(),
        streakCount
      );

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
        }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleStreakReminders"
      );
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await this.engine.cancelAllNotifications();
      GlobalErrorHandler.logDebug(
        "All notifications cancelled",
        "NotificationScheduler.cancelAllNotifications",
        { userId: this.config.userId }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.cancelAllNotifications"
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
      return 0; // Random streak between 1-30
    } catch (error) {
      GlobalErrorHandler.logWarning(
        "Failed to get user streak count, using default",
        "NotificationScheduler.getUserStreakCount"
      );
      return 0;
    }
  }

  // Static method to create a scheduler instance
  static create(
    engine: NotificationEngine,
    config: SchedulerConfig
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
    customMessage?: { title: string; body: string }
  ): Promise<void> {
    const { t } = useTranslation();
    try {
      let notification: NotificationMessage;

      switch (type) {
        case "midday-reflection":
          notification = LocaleNotificationProvider.createMiddayReflection(
            createNotificationId()
          );
          break;
        case "evening-reflection":
          notification = LocaleNotificationProvider.createEveningReflection(
            createNotificationId()
          );
          break;
        default:
          notification = {
            id: createNotificationId(),
            title: customMessage?.title || t("cadence-notification"),
            body: customMessage?.body || t("you-have-a-new-notification"),
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
        }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "NotificationScheduler.scheduleOneTimeNotification"
      );
      throw error;
    }
  }
}
