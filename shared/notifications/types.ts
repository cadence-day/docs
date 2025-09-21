export interface NotificationPreferences {
  rhythm: "morning-only" | "evening-only" | "both" | "disabled";
  middayTime: string;
  eveningTimeStart: string;
  eveningTimeEnd: string;
  streaksEnabled: boolean;
  lightTouch: boolean;
  locale?: string;
  timezone?: string;
  expoPushToken?: string;
}

export interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationEvent {
  type: NotificationType;
  message: NotificationMessage;
  deliveryMethod: NotificationDeliveryMethod[];
  userId?: string;
}

export type NotificationType =
  | "midday-reflection"
  | "evening-reflection"
  | "streak-reminder"
  | "achievement"
  | "reminder"
  | "system";

export type NotificationDeliveryMethod = "push" | "local" | "in-app";

export interface NotificationProvider {
  name: string;
  initialize(): Promise<void>;
  sendNotification(notification: NotificationMessage): Promise<void>;
  scheduleNotification(
    notification: NotificationMessage,
    scheduledFor: Date
  ): Promise<void>;
  cancelNotification(notificationId: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  isSupported(): boolean;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: "granted" | "denied" | "undetermined";
}

export interface NotificationEngineConfig {
  enabledProviders: NotificationDeliveryMethod[];
  defaultPreferences: NotificationPreferences;
  enableLogging: boolean;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: NotificationType;
  status: "scheduled" | "sent" | "failed" | "cancelled";
  sentAt?: Date;
  scheduledFor?: Date;
  deliveryMethod: NotificationDeliveryMethod;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSubscriber {
  onNotificationReceived?: (notification: NotificationMessage) => void;
  onNotificationSent?: (notification: NotificationMessage) => void;
  onNotificationFailed?: (
    notification: NotificationMessage,
    error: Error
  ) => void;
  onPermissionChanged?: (status: NotificationPermissionStatus) => void;
}
