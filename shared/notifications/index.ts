// Core engine
export { NotificationEngine } from "./NotificationEngine";

// Singleton
export {
  getNotificationEngineSingleton,
  notificationEngineSingleton,
} from "./NotificationEngineSingleton";

// Types
export * from "./types";

// Providers
export { ExpoNotificationProvider } from "./providers/ExpoNotificationProvider";
export { InAppNotificationProvider } from "./providers/InAppNotificationProvider";
export { LocaleNotificationProvider } from "./providers/LocaleNotificationProvider";

// Context and hooks
export {
  NotificationProvider,
  useNotifications,
} from "./context/NotificationContext";
export {
  useAutoNotificationScheduler,
  useNotificationScheduler,
} from "./hooks/useNotificationScheduler";

// Services
export { NotificationScheduler } from "./services/NotificationScheduler";

// Messages and defaults
export * from "./cadenceMessages";

// Utility functions for creating notifications
export * from "./utils";
