import useNotificationStore from "@/shared/stores/resources/useNotificationsStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

const NOTIFICATION_TASK_NAME = "CADENCE_NOTIFICATION_TASK";
const CHECK_INTERVAL_MINUTES = 10; // Check every 10 minutes

interface ScheduledNotification {
  id: string;
  type: string;
  scheduledFor: Date;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  private isRegistered = false;
  private scheduledNotifications: ScheduledNotification[] = [];

  private constructor() {}

  static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.registerBackgroundTask();
      await this.scheduleBackgroundTask();

      GlobalErrorHandler.logDebug(
        "Background task manager initialized",
        "BackgroundTaskManager.initialize",
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.initialize",
      );
      throw error;
    }
  }

  private async registerBackgroundTask(): Promise<void> {
    try {
      const isTaskDefined = await TaskManager.isTaskDefined(
        NOTIFICATION_TASK_NAME,
      );

      if (!isTaskDefined) {
        TaskManager.defineTask(NOTIFICATION_TASK_NAME, async () => {
          try {
            await this.processScheduledNotifications();
            return BackgroundTask.BackgroundTaskResult.Success;
          } catch (error) {
            GlobalErrorHandler.logError(
              error,
              "BackgroundTaskManager.backgroundTask",
            );
            return BackgroundTask.BackgroundTaskResult.Failed;
          }
        });
      }

      this.isRegistered = true;

      GlobalErrorHandler.logDebug(
        "Background task registered successfully",
        "BackgroundTaskManager.registerBackgroundTask",
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.registerBackgroundTask",
      );
      throw error;
    }
  }

  private async scheduleBackgroundTask(): Promise<void> {
    try {
      await BackgroundTask.registerTaskAsync(NOTIFICATION_TASK_NAME, {
        minimumInterval: CHECK_INTERVAL_MINUTES * 60, // in seconds
      });

      const status = await BackgroundTask.getStatusAsync();

      GlobalErrorHandler.logDebug(
        `Background fetch scheduled with status: ${status}`,
        "BackgroundTaskManager.scheduleBackgroundTask",
        {
          minimumInterval: CHECK_INTERVAL_MINUTES,
          status,
        },
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.scheduleBackgroundTask",
      );
      throw error;
    }
  }

  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      const notifications = await this.getScheduledNotifications();

      for (const notification of notifications) {
        if (new Date(notification.scheduledFor) <= now) {
          await this.sendNotification(notification);
          await this.removeScheduledNotification(notification.id);
        }
      }

      GlobalErrorHandler.logDebug(
        `Processed ${notifications.length} scheduled notifications`,
        "BackgroundTaskManager.processScheduledNotifications",
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.processScheduledNotifications",
      );
      throw error;
    }
  }

  /**
   * Public wrapper to get a copy of scheduled notifications.
   * Returns a shallow copy to avoid external mutation of internal array.
   */
  async listScheduledNotifications(): Promise<ScheduledNotification[]> {
    return [...this.scheduledNotifications];
  }

  /**
   * Public method to remove a scheduled notification by id.
   */
  async removeScheduledNotificationById(id: string): Promise<void> {
    await this.removeScheduledNotification(id);
  }

  /**
   * Trigger a scheduled notification immediately and remove it from storage.
   */
  async triggerScheduledNotificationNow(id: string): Promise<void> {
    try {
      const notification = this.scheduledNotifications.find((n) => n.id === id);
      if (!notification) return;
      await this.sendNotification(notification);
      await this.removeScheduledNotification(id);
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.triggerScheduledNotificationNow",
        { notificationId: id },
      );
      throw error;
    }
  }

  async scheduleNotification(
    notification: ScheduledNotification,
  ): Promise<void> {
    try {
      const scheduledFor = new Date(notification.scheduledFor);

      if (scheduledFor <= new Date()) {
        await this.sendNotification(notification);
        return;
      }

      const timeDiff = scheduledFor.getTime() - Date.now();
      const minutesUntilNotification = Math.floor(timeDiff / 60000);

      if (minutesUntilNotification <= CHECK_INTERVAL_MINUTES * 2) {
        const triggerInput: Notifications.TimeIntervalTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(
            1,
            Math.ceil((scheduledFor.getTime() - Date.now()) / 1000),
          ),
        };

        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body,
            data: notification.data || {},
          },
          trigger: triggerInput,
        });

        GlobalErrorHandler.logDebug(
          "Notification scheduled using Expo Notifications",
          "BackgroundTaskManager.scheduleNotification",
          {
            notificationId: notification.id,
            scheduledFor: scheduledFor.toISOString(),
            minutesUntilNotification,
          },
        );
      } else {
        this.scheduledNotifications.push(notification);
        await this.persistScheduledNotifications();

        GlobalErrorHandler.logDebug(
          "Notification stored for background processing",
          "BackgroundTaskManager.scheduleNotification",
          {
            notificationId: notification.id,
            scheduledFor: scheduledFor.toISOString(),
            minutesUntilNotification,
          },
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.scheduleNotification",
        { notificationId: notification.id },
      );
      throw error;
    }
  }

  private async sendNotification(
    notification: ScheduledNotification,
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger: null,
      });

      GlobalErrorHandler.logDebug(
        "Notification sent successfully",
        "BackgroundTaskManager.sendNotification",
        { notificationId: notification.id },
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.sendNotification",
        { notificationId: notification.id },
      );
      throw error;
    }
  }

  async updatePreferences(): Promise<void> {
    try {
      const notificationStore = useNotificationStore.getState();
      const { notificationSettings } = notificationStore;

      // Check if notifications are disabled (using database structure)
      if (!notificationSettings?.push_enabled) {
        await this.cancelAllNotifications();
        await this.unregisterBackgroundTask();
      } else {
        if (!this.isRegistered) {
          await this.registerBackgroundTask();
          await this.scheduleBackgroundTask();
        }

        // Scheduler removed - notifications now managed by unified store
      }

      GlobalErrorHandler.logDebug(
        "Preferences updated successfully",
        "BackgroundTaskManager.updatePreferences",
        {
          pushEnabled: notificationSettings?.push_enabled,
          emailEnabled: notificationSettings?.email_enabled,
          wakeUpTime: notificationSettings?.wake_up_time,
          sleepTime: notificationSettings?.sleep_time,
        },
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.updatePreferences",
      );
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications = [];
      await this.persistScheduledNotifications();

      // Scheduler removed - notifications now managed by unified store

      GlobalErrorHandler.logDebug(
        "All notifications cancelled",
        "BackgroundTaskManager.cancelAllNotifications",
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.cancelAllNotifications",
      );
      throw error;
    }
  }

  private async unregisterBackgroundTask(): Promise<void> {
    try {
      await BackgroundTask.unregisterTaskAsync(NOTIFICATION_TASK_NAME);
      this.isRegistered = false;

      GlobalErrorHandler.logDebug(
        "Background task unregistered",
        "BackgroundTaskManager.unregisterBackgroundTask",
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.unregisterBackgroundTask",
      );
    }
  }

  private async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    return this.scheduledNotifications;
  }

  private async removeScheduledNotification(id: string): Promise<void> {
    this.scheduledNotifications = this.scheduledNotifications.filter(
      (n) => n.id !== id,
    );
    await this.persistScheduledNotifications();
  }

  private async persistScheduledNotifications(): Promise<void> {
    try {
      const AsyncStorage =
        (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem(
        "CADENCE_SCHEDULED_NOTIFICATIONS",
        JSON.stringify(this.scheduledNotifications),
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.persistScheduledNotifications",
      );
    }
  }

  async loadScheduledNotifications(): Promise<void> {
    try {
      const AsyncStorage =
        (await import("@react-native-async-storage/async-storage")).default;
      const data = await AsyncStorage.getItem(
        "CADENCE_SCHEDULED_NOTIFICATIONS",
      );

      if (data) {
        this.scheduledNotifications = JSON.parse(data);
        GlobalErrorHandler.logDebug(
          `Loaded ${this.scheduledNotifications.length} scheduled notifications`,
          "BackgroundTaskManager.loadScheduledNotifications",
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.loadScheduledNotifications",
      );
    }
  }

  async checkAndProcessNotifications(): Promise<void> {
    try {
      await this.loadScheduledNotifications();
      await this.processScheduledNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "BackgroundTaskManager.checkAndProcessNotifications",
      );
    }
  }
}
