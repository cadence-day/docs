import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DEFAULT_CADENCE_PREFERENCES } from "../cadenceMessages";
import { NotificationEngine } from "../NotificationEngine";
import { ExpoNotificationProvider } from "../providers/ExpoNotificationProvider";
import {
  InAppNotificationDisplay,
  InAppNotificationProvider,
} from "../providers/InAppNotificationProvider";
import { LocaleNotificationProvider } from "../providers/LocaleNotificationProvider";
import {
  NotificationEngineConfig,
  NotificationEvent,
  NotificationLog,
  NotificationMessage,
  NotificationPermissionStatus,
  NotificationPreferences,
} from "../types";

interface NotificationContextType {
  // Engine instance
  engine: NotificationEngine | null;

  // Preferences
  preferences: NotificationPreferences;
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void;

  // Permissions
  permissionStatus: NotificationPermissionStatus;
  requestPermissions: () => Promise<NotificationPermissionStatus>;

  // In-app notifications
  inAppNotifications: InAppNotificationDisplay[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  hideNotification: (notificationId: string) => void;
  clearNotificationHistory: () => void;

  // Notification actions
  sendNotification: (notification: NotificationMessage) => Promise<void>;
  scheduleNotification: (
    notification: NotificationMessage,
    scheduledFor: Date
  ) => Promise<void>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;

  // Settings
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Logs
  getLogs: (limit?: number) => NotificationLog[];
  clearLogs: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
  config?: Partial<NotificationEngineConfig>;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  config,
}) => {
  const { settings, updateSettings } = useProfileStore();
  const [engine, setEngine] = useState<NotificationEngine | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    ...DEFAULT_CADENCE_PREFERENCES,
    ...settings.notifications,
  });
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>({
      granted: false,
      canAskAgain: true,
      status: "undetermined",
    });
  const [inAppNotifications, setInAppNotifications] = useState<
    InAppNotificationDisplay[]
  >([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize notification engine
  // Memoize engine configuration to avoid creating a new object on every render
  // Use individual config properties as dependencies to avoid re-renders from object reference changes
  const engineConfig = React.useMemo<NotificationEngineConfig>(
    () => ({
      enabledProviders: config?.enabledProviders ?? ["push", "local", "in-app"],
      defaultPreferences: config?.defaultPreferences ?? DEFAULT_CADENCE_PREFERENCES,
      enableLogging: config?.enableLogging ?? true,
    }),
    [config?.enabledProviders, config?.defaultPreferences, config?.enableLogging]
  );

  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return;

    let mounted = true;
    let notificationEngine: NotificationEngine | null = null;
    let inAppUnsubscribe: (() => void) | null = null;

    const initializeEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);

        notificationEngine = new NotificationEngine(engineConfig);

        // Create providers
        const expoProvider = new ExpoNotificationProvider();
        const inAppProvider = new InAppNotificationProvider({
          autoHideDuration: 5000,
          maxDisplayedNotifications: 3,
          persistNotifications: true,
        });

        // Wrap providers with locale support
        const localeExpoProvider = new LocaleNotificationProvider(expoProvider);
        const localeInAppProvider = new LocaleNotificationProvider(
          inAppProvider
        );

        // Register providers
        notificationEngine.registerProvider("push", localeExpoProvider);
        notificationEngine.registerProvider("local", localeExpoProvider);
        notificationEngine.registerProvider("in-app", localeInAppProvider);

        // Subscribe to in-app notifications
        inAppUnsubscribe = inAppProvider.subscribe(setInAppNotifications);

        // Initialize engine
        await notificationEngine.initialize();

        // Check permissions
        if (expoProvider.getPermissionStatus) {
          const permStatus = await expoProvider.getPermissionStatus();
          if (mounted) setPermissionStatus(permStatus);
        }

        if (mounted) {
          setEngine(notificationEngine);
          setIsInitialized(true);
          GlobalErrorHandler.logDebug(
            "Notification engine initialized successfully",
            "NotificationProvider"
          );
        }
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "NotificationProvider.initializeEngine"
        );
        if (mounted) setError("Failed to initialize notification system");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeEngine();

    return () => {
      mounted = false;
      // Clean up subscribers and engine state
      try {
        if (inAppUnsubscribe) inAppUnsubscribe();
      } catch (e) {
        GlobalErrorHandler.logError(
          e,
          "NotificationProvider.cleanup.unsubscribe"
        );
      }
      try {
        if (notificationEngine) {
          // best-effort cleanup if provider exposes any teardown in the future
          notificationEngine.clearLogs();
        }
      } catch (e) {
        GlobalErrorHandler.logError(e, "NotificationProvider.cleanup.engine");
      }
    };
  }, [engineConfig, isInitialized]);

  // Sync preferences with profile store
  useEffect(() => {
    const newPreferences = {
      ...DEFAULT_CADENCE_PREFERENCES,
      ...settings.notifications,
    };
    setPreferences(newPreferences);
  }, [settings.notifications]);

  const updatePreferences = useCallback(
    (newPreferences: Partial<NotificationPreferences>) => {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      // Update profile store
      updateSettings({
        notifications: {
          morningReminders:
            updatedPreferences.rhythm === "morning-only" ||
            updatedPreferences.rhythm === "both",
          eveningReminders:
            updatedPreferences.rhythm === "evening-only" ||
            updatedPreferences.rhythm === "both",
          weeklyStreaks: updatedPreferences.streaksEnabled,
        },
      });
    },
    [preferences, updateSettings]
  );

  const requestPermissions =
    useCallback(async (): Promise<NotificationPermissionStatus> => {
      if (!engine) {
        throw new Error("Notification engine not initialized");
      }

      try {
        const expoProvider = engine.getProvider(
          "push"
        ) as LocaleNotificationProvider;
        if (
          expoProvider &&
          (expoProvider as any).wrappedProvider?.requestPermissions
        ) {
          const status = await (
            expoProvider as any
          ).wrappedProvider.requestPermissions();
          setPermissionStatus(status);
          return status;
        }

        throw new Error("Permission request not supported");
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "NotificationProvider.requestPermissions"
        );
        throw error;
      }
    }, [engine]);

  const sendNotification = useCallback(
    async (notification: NotificationMessage): Promise<void> => {
      if (!engine) {
        throw new Error("Notification engine not initialized");
      }

      const event: NotificationEvent = {
        type: notification.type,
        message: notification,
        deliveryMethod: ["in-app", "push"],
      };

      await engine.emit(event);
    },
    [engine]
  );

  const scheduleNotification = useCallback(
    async (
      notification: NotificationMessage,
      scheduledFor: Date
    ): Promise<void> => {
      if (!engine) {
        throw new Error("Notification engine not initialized");
      }

      const event: NotificationEvent = {
        type: notification.type,
        message: notification,
        deliveryMethod: ["push", "local"],
      };

      await engine.schedule(event, scheduledFor);
    },
    [engine]
  );

  const cancelNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      if (!engine) {
        throw new Error("Notification engine not initialized");
      }

      await engine.cancelNotification(notificationId);
    },
    [engine]
  );

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    if (!engine) {
      throw new Error("Notification engine not initialized");
    }

    await engine.cancelAllNotifications();
  }, [engine]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      const inAppProvider = engine?.getProvider(
        "in-app"
      ) as LocaleNotificationProvider;
      if (inAppProvider && (inAppProvider as any).wrappedProvider?.markAsRead) {
        (inAppProvider as any).wrappedProvider.markAsRead(notificationId);
      }
    },
    [engine]
  );

  const markAllAsRead = useCallback(() => {
    const inAppProvider = engine?.getProvider(
      "in-app"
    ) as LocaleNotificationProvider;
    if (
      inAppProvider &&
      (inAppProvider as any).wrappedProvider?.markAllAsRead
    ) {
      (inAppProvider as any).wrappedProvider.markAllAsRead();
    }
  }, [engine]);

  const hideNotification = useCallback(
    (notificationId: string) => {
      const inAppProvider = engine?.getProvider(
        "in-app"
      ) as LocaleNotificationProvider;
      if (
        inAppProvider &&
        (inAppProvider as any).wrappedProvider?.hideNotification
      ) {
        (inAppProvider as any).wrappedProvider.hideNotification(notificationId);
      }
    },
    [engine]
  );

  const clearNotificationHistory = useCallback(() => {
    const inAppProvider = engine?.getProvider(
      "in-app"
    ) as LocaleNotificationProvider;
    if (inAppProvider && (inAppProvider as any).wrappedProvider?.clearHistory) {
      (inAppProvider as any).wrappedProvider.clearHistory();
    }
  }, [engine]);

  const getLogs = useCallback(
    (limit?: number): NotificationLog[] => {
      if (!engine) return [];
      return engine.getLogs(undefined, limit);
    },
    [engine]
  );

  const clearLogs = useCallback(() => {
    if (!engine) return;
    engine.clearLogs();
  }, [engine]);

  const unreadCount = inAppNotifications.filter((n) => !n.isRead).length;

  const contextValue: NotificationContextType = {
    engine,
    preferences,
    updatePreferences,
    permissionStatus,
    requestPermissions,
    inAppNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    hideNotification,
    clearNotificationHistory,
    sendNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    isInitialized,
    isLoading,
    error,
    getLogs,
    clearLogs,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
