// New unified notification system
export { NotificationEngine, notificationEngine } from "./NotificationEngine";

// Import notification store from shared stores
export { default as useNotificationStore } from "@/shared/stores/resources/useNotificationsStore";

// Types
export * from "./types";

// Providers (keep useful ones)
export { ExpoNotificationProvider } from "./providers/ExpoNotificationProvider";
export { InAppNotificationProvider } from "./providers/InAppNotificationProvider";

// Context (if still needed)
export {
  NotificationProvider,
  useNotifications,
} from "./context/NotificationContext";

// Services (keep useful ones)
export { BackgroundTaskManager } from "./services/BackgroundTaskManager";

// Messages and defaults
export * from "./constants/CADENCE_MESSAGES";

// Re-export utilities
export * from "./utils";
