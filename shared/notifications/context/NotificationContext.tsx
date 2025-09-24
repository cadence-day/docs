import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { useNotificationStore } from "@/shared/stores/resources/useNotificationStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useBackgroundNotifications } from "../hooks/useBackgroundNotifications";
import { DEFAULT_CADENCE_PREFERENCES } from "../cadenceMessages";
import { NotificationEngine } from "../NotificationEngine";
import {
  getNotificationEngineSingleton,
  notificationEngineSingleton,
} from "../NotificationEngineSingleton";
import { InAppNotificationDisplay } from "../providers/InAppNotificationProvider";
import { LocaleNotificationProvider } from "../providers/LocaleNotificationProvider";
import { mapProfileSettingsToNotificationPreferences, updateTimingFromProfileSettings } from "../services/NotificationScheduler";
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

  // Initialize background notifications
  useBackgroundNotifications();

  // Initialize notification engine
  // Memoize engine configuration to avoid creating a new object on every render
  // Use individual config properties as dependencies to avoid re-renders from object reference changes
  const engineConfig = React.useMemo<NotificationEngineConfig>(
    () => ({
      enabledProviders: config?.enabledProviders ?? ["push", "local", "in-app"],
      defaultPreferences:
        config?.defaultPreferences ?? DEFAULT_CADENCE_PREFERENCES,
      enableLogging: config?.enableLogging ?? true,
    }),
    [
      config?.enabledProviders,
      config?.defaultPreferences,
      config?.enableLogging,
    ]
  );

  // Initialize notification engine using singleton
  useEffect(() => {
    let mounted = true;
    let unsubscribeFromSingleton: (() => void) | null = null;
    let unsubscribeFromInApp: (() => void) | null = null;

    const initializeEngine = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get engine instance from singleton
        const engineInstance =
          await getNotificationEngineSingleton(engineConfig);

        if (!mounted) return;

        // Subscribe to engine changes from singleton
        unsubscribeFromSingleton = notificationEngineSingleton.subscribe(
          (newEngine) => {
            if (mounted) {
              setEngine(newEngine);
              setIsInitialized(!!newEngine);
            }
          }
        );

        // Subscribe to in-app notifications
        const inAppProvider = notificationEngineSingleton.getInAppProvider();
        if (inAppProvider) {
          unsubscribeFromInApp = inAppProvider.subscribe(setInAppNotifications);
        }

        // Check permissions from the expo provider
        const expoProvider = engineInstance.getProvider(
          "push"
        ) as LocaleNotificationProvider;
        if (
          expoProvider &&
          (expoProvider as any).wrappedProvider?.getPermissionStatus
        ) {
          const permStatus = await (
            expoProvider as any
          ).wrappedProvider.getPermissionStatus();
          if (mounted) setPermissionStatus(permStatus);
        }

        if (mounted) {
          setEngine(engineInstance);
          setIsInitialized(true);
          GlobalErrorHandler.logDebug(
            "Notification engine singleton connected successfully",
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
      if (unsubscribeFromSingleton) {
        unsubscribeFromSingleton();
      }
      if (unsubscribeFromInApp) {
        unsubscribeFromInApp();
      }
      // Clean up engine resources
      if (engine) {
        engine.destroy();
      }
    };
  }, [engineConfig, engine]);

  // Initialize notification store on mount
  useEffect(() => {
    useNotificationStore.getState().loadFromStorage();
  }, []);

  // One-time sync on initialization only
  const hasInitialized = React.useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      // Do initial sync from profile settings to notification store
      const mappedPreferences = mapProfileSettingsToNotificationPreferences(settings);

      const store = useNotificationStore.getState();
      const newPreferences = {
        morningReminders: mappedPreferences.rhythm === "morning-only" || mappedPreferences.rhythm === "both",
        eveningReminders: mappedPreferences.rhythm === "evening-only" || mappedPreferences.rhythm === "both",
        weeklyStreaks: mappedPreferences.streaksEnabled || false,
        middayReflection: true,
      };

      // Initial sync without triggering re-renders
      store.updatePreferences(newPreferences);

      // Update timing once on initialization
      updateTimingFromProfileSettings(settings);
    }
  }, [settings]);

  const updatePreferences = useCallback(
    (newPreferences: Partial<NotificationPreferences>) => {
      // Update the Zustand store
      const store = useNotificationStore.getState();
      const updatedPrefs = {
        morningReminders: newPreferences.rhythm === "morning-only" || newPreferences.rhythm === "both",
        eveningReminders: newPreferences.rhythm === "evening-only" || newPreferences.rhythm === "both",
        weeklyStreaks: newPreferences.streaksEnabled || false,
        middayReflection: store.preferences.middayReflection,
      };

      store.updatePreferences(updatedPrefs);

      // Update profile store with reverse mapping
      updateSettings({
        notifications: {
          morningReminders: updatedPrefs.morningReminders,
          eveningReminders: updatedPrefs.eveningReminders,
          weeklyStreaks: updatedPrefs.weeklyStreaks,
        },
      });
    },
    [updateSettings]
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
        deliveryMethod: [], // Empty array allows smart routing based on app state
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

  // Use the hook selectively to avoid re-renders
  const storePreferences = useNotificationStore((state) => state.preferences);
  const storeTiming = useNotificationStore((state) => state.timing);

  // Create a combined preferences object that matches the expected interface
  const preferences: NotificationPreferences = {
    rhythm: storePreferences.morningReminders && storePreferences.eveningReminders
      ? "both"
      : storePreferences.morningReminders
        ? "morning-only"
        : storePreferences.eveningReminders
          ? "evening-only"
          : "disabled",
    middayTime: storeTiming.middayTime,
    eveningTime: storeTiming.eveningTime,
    eveningTimeStart: storeTiming.eveningTimeStart,
    eveningTimeEnd: storeTiming.eveningTimeEnd,
    streaksEnabled: storePreferences.weeklyStreaks,
    lightTouch: true,
    soundEnabled: true,
    vibrationEnabled: true,
  };

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
