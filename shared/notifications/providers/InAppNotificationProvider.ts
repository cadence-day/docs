import { NotificationProvider, NotificationMessage } from "../types";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export interface InAppNotificationDisplay {
  id: string;
  message: NotificationMessage;
  timestamp: Date;
  isRead: boolean;
  isVisible: boolean;
}

export interface InAppNotificationOptions {
  autoHideDuration?: number; // in milliseconds
  maxDisplayedNotifications?: number;
  persistNotifications?: boolean;
}

export class InAppNotificationProvider implements NotificationProvider {
  name = "InAppNotificationProvider";
  private notifications: Map<string, InAppNotificationDisplay> = new Map();
  private subscribers: Array<
    (notifications: InAppNotificationDisplay[]) => void
  > = [];
  private options: InAppNotificationOptions;

  constructor(options: InAppNotificationOptions = {}) {
    this.options = {
      autoHideDuration: 5000, // 5 seconds default
      maxDisplayedNotifications: 3,
      persistNotifications: true,
      ...options,
    };
  }

  async initialize(): Promise<void> {
    // In-app notifications don't require initialization
    GlobalErrorHandler.logDebug(
      "In-app notification provider initialized",
      "InAppNotificationProvider.initialize"
    );
  }

  async sendNotification(notification: NotificationMessage): Promise<void> {
    try {
      const display: InAppNotificationDisplay = {
        id: notification.id,
        message: notification,
        timestamp: new Date(),
        isRead: false,
        isVisible: true,
      };

      this.notifications.set(notification.id, display);
      this.notifySubscribers();

      // Auto-hide notification if configured
      if (this.options.autoHideDuration && this.options.autoHideDuration > 0) {
        setTimeout(() => {
          this.hideNotification(notification.id);
        }, this.options.autoHideDuration);
      }

      // Limit number of displayed notifications
      if (this.options.maxDisplayedNotifications) {
        this.enforceDisplayLimit();
      }

      GlobalErrorHandler.logDebug(
        `In-app notification sent: ${notification.title}`,
        "InAppNotificationProvider.sendNotification",
        { notificationId: notification.id }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "InAppNotificationProvider.sendNotification",
        {
          notificationId: notification.id,
        }
      );
      throw error;
    }
  }

  async scheduleNotification(
    notification: NotificationMessage,
    scheduledFor: Date
  ): Promise<void> {
    try {
      const delay = scheduledFor.getTime() - Date.now();

      if (delay <= 0) {
        // If scheduled time is in the past, send immediately
        await this.sendNotification(notification);
        return;
      }

      setTimeout(async () => {
        await this.sendNotification(notification);
      }, delay);

      GlobalErrorHandler.logDebug(
        `In-app notification scheduled for: ${scheduledFor.toISOString()}`,
        "InAppNotificationProvider.scheduleNotification",
        { notificationId: notification.id, delay }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "InAppNotificationProvider.scheduleNotification",
        {
          notificationId: notification.id,
          scheduledFor: scheduledFor.toISOString(),
        }
      );
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (this.notifications.has(notificationId)) {
        this.notifications.delete(notificationId);
        this.notifySubscribers();

        GlobalErrorHandler.logDebug(
          `In-app notification cancelled`,
          "InAppNotificationProvider.cancelNotification",
          { notificationId }
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "InAppNotificationProvider.cancelNotification",
        {
          notificationId,
        }
      );
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      this.notifications.clear();
      this.notifySubscribers();

      GlobalErrorHandler.logDebug(
        "All in-app notifications cancelled",
        "InAppNotificationProvider.cancelAllNotifications"
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "InAppNotificationProvider.cancelAllNotifications"
      );
      throw error;
    }
  }

  isSupported(): boolean {
    return true; // In-app notifications are always supported
  }

  // In-app specific methods

  subscribe(
    callback: (notifications: InAppNotificationDisplay[]) => void
  ): () => void {
    this.subscribers.push(callback);

    // Immediately call with current notifications
    callback(this.getVisibleNotifications());

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  getVisibleNotifications(): InAppNotificationDisplay[] {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.isVisible)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getAllNotifications(): InAppNotificationDisplay[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifySubscribers();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.isRead = true;
    });
    this.notifySubscribers();
  }

  hideNotification(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isVisible = false;
      this.notifySubscribers();

      // Remove from memory if not persisting
      if (!this.options.persistNotifications) {
        this.notifications.delete(notificationId);
      }
    }
  }

  hideAllNotifications(): void {
    this.notifications.forEach((notification) => {
      notification.isVisible = false;
    });
    this.notifySubscribers();

    // Remove from memory if not persisting
    if (!this.options.persistNotifications) {
      this.notifications.clear();
    }
  }

  getUnreadCount(): number {
    return Array.from(this.notifications.values()).filter(
      (notification) => !notification.isRead
    ).length;
  }

  clearHistory(): void {
    this.notifications.clear();
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    const visibleNotifications = this.getVisibleNotifications();
    this.subscribers.forEach((callback) => {
      try {
        callback(visibleNotifications);
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "InAppNotificationProvider.notifySubscribers"
        );
      }
    });
  }

  private enforceDisplayLimit(): void {
    if (!this.options.maxDisplayedNotifications) return;

    const visibleNotifications = this.getVisibleNotifications();
    if (visibleNotifications.length > this.options.maxDisplayedNotifications) {
      // Hide oldest notifications that exceed the limit
      const notificationsToHide = visibleNotifications.slice(
        this.options.maxDisplayedNotifications
      );

      notificationsToHide.forEach((notification) => {
        this.hideNotification(notification.id);
      });
    }
  }
}
