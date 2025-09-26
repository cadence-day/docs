import { notificationStorage } from "@/shared/storage/notifications";
import {
  BaseStoreState,
  handleApiCall,
  handleVoidApiCall,
} from "@/shared/stores/utils/utils";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Notifications from "expo-notifications";
import { AppState, AppStateStatus } from "react-native";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  CADENCE_EVENING_REFLECTIONS,
  CADENCE_MIDDAY_REFLECTIONS,
  CADENCE_MORNING_MOTIVATIONS,
  CADENCE_STREAK_MESSAGES,
} from "../constants/CADENCE_MESSAGES";

export interface CadenceMessage {
  id: string;
  text: string;
  type: "morning" | "midday" | "evening" | "streak";
}

export type NotificationType =
  | "morning-motivation"
  | "midday-reflection"
  | "evening-reflection"
  | "weekly-streaks";

export interface NotificationPreferences {
  morningReminders: boolean;
  eveningReminders: boolean;
  middayReflection: boolean;
  weeklyStreaks: boolean;
}

export interface NotificationTiming {
  morningTime: string; // "07:00"
  middayTime: string; // "12:00"
  eveningTime: string; // "19:00"
}

export interface NotificationStore extends BaseStoreState {
  // Settings
  preferences: NotificationPreferences;
  timing: NotificationTiming;

  // Permission state
  permissionStatus: "granted" | "denied" | "undetermined";
  isPermissionLoading: boolean;

  // Quote backlog system
  usedQuoteIds: string[];
  nextQuoteIndex: number;

  // Notification engine state
  isInApp: boolean;

  // CRUD Actions
  createPreference: (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => Promise<void>;
  readPreferences: () => Promise<NotificationPreferences>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>,
  ) => Promise<void>;
  deletePreference: (key: keyof NotificationPreferences) => Promise<void>;

  createTiming: (key: keyof NotificationTiming, value: string) => Promise<void>;
  readTiming: () => Promise<NotificationTiming>;
  updateTiming: (timing: Partial<NotificationTiming>) => Promise<void>;
  deleteTiming: (key: keyof NotificationTiming) => Promise<void>;

  // Additional Actions
  requestPermissions: () => Promise<boolean>;
  scheduleNotifications: () => Promise<void>;
  getNextQuote: (
    messageType?: "morning" | "midday" | "evening" | "streak",
  ) => CadenceMessage;
  markQuoteUsed: (quoteId: string) => void;
  resetQuoteBacklog: () => void;
  deliverNotification: (quote: CadenceMessage, type: NotificationType) => void;

  // Bulk operations
  resetAllPreferences: () => Promise<void>;
  resetAllTiming: () => Promise<void>;
  clearAllNotificationData: () => Promise<void>;

  // Debug/repair methods
  repairTiming: () => Promise<void>;

  // Internal methods
  _initialize: () => Promise<void>;
  _updateAppState: (state: AppStateStatus) => void;
}

// Create unified cadenceMessages array
export const cadenceMessages: CadenceMessage[] = [
  ...CADENCE_MORNING_MOTIVATIONS.map((text, index) => ({
    id: `morning_${index}`,
    text,
    type: "morning" as const,
  })),
  ...CADENCE_MIDDAY_REFLECTIONS.map((text, index) => ({
    id: `midday_${index}`,
    text,
    type: "midday" as const,
  })),
  ...CADENCE_EVENING_REFLECTIONS.map((text, index) => ({
    id: `evening_${index}`,
    text,
    type: "evening" as const,
  })),
  ...CADENCE_STREAK_MESSAGES.map((text, index) => ({
    id: `streak_${index}`,
    text,
    type: "streak" as const,
  })),
];

const initialPreferences: NotificationPreferences = {
  morningReminders: true,
  eveningReminders: false,
  middayReflection: true,
  weeklyStreaks: true,
};

const initialTiming: NotificationTiming = {
  morningTime: "08:00",
  middayTime: "12:00",
  eveningTime: "18:00",
};

// Helper function for notification titles
const getTitleForType = (type: NotificationType): string => {
  switch (type) {
    case "morning-motivation":
      return "Morning Inspiration";
    case "midday-reflection":
      return "Midday Pause";
    case "evening-reflection":
      return "Evening Reflection";
    case "weekly-streaks":
      return "Weekly Progress";
    default:
      return "Cadence Reminder";
  }
};

// Helper function for notification body text
const getBodyForType = (type: NotificationType): string => {
  switch (type) {
    case "morning-motivation":
      return "Start your day with intention";
    case "midday-reflection":
      return "Pause and reflect on your morning";
    case "evening-reflection":
      return "Tap to reflect on your day";
    case "weekly-streaks":
      return "Check your weekly progress";
    default:
      return "Tap to open Cadence";
  }
};

export const useNotificationStore = create<NotificationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    preferences: initialPreferences,
    timing: initialTiming,
    permissionStatus: "undetermined",
    isPermissionLoading: false,
    usedQuoteIds: [],
    nextQuoteIndex: 0,
    isInApp: true, // Default to in-app, will be updated on app state changes
    isLoading: false,
    error: null,

    // CRUD Actions for Preferences
    createPreference: async (
      key: keyof NotificationPreferences,
      value: boolean,
    ) => {
      return handleVoidApiCall(
        set,
        async () => {
          await notificationStorage.updatePreferenceField(key, value);
        },
        "create notification preference",
        (state) => ({
          preferences: { ...state.preferences, [key]: value },
        }),
      );
    },

    readPreferences: async (): Promise<NotificationPreferences> => {
      return handleApiCall(
        set,
        async () => {
          const result = await notificationStorage.getPreferences();
          return result.success ? result.data! : initialPreferences;
        },
        "read notification preferences",
        initialPreferences,
        (preferences) => ({ preferences }),
      );
    },

    updatePreferences: async (
      newPreferences: Partial<NotificationPreferences>,
    ) => {
      return handleVoidApiCall(
        set,
        async () => {
          const updatedPreferences = {
            ...get().preferences,
            ...newPreferences,
          };
          await notificationStorage.setPreferences(updatedPreferences);
          // Note: Notification scheduling is now handled by NotificationEngine
        },
        "update notification preferences",
        (state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        }),
      );
    },

    deletePreference: async (key: keyof NotificationPreferences) => {
      return handleVoidApiCall(
        set,
        async () => {
          await notificationStorage.removePreferenceField(key);
        },
        "delete notification preference",
        (state) => {
          const defaults = {
            morningReminders: true,
            eveningReminders: false,
            weeklyStreaks: true,
            middayReflection: true,
          };
          return {
            preferences: { ...state.preferences, [key]: defaults[key] },
          };
        },
      );
    },

    // CRUD Actions for Timing
    createTiming: async (key: keyof NotificationTiming, value: string) => {
      return handleVoidApiCall(
        set,
        async () => {
          await notificationStorage.updateTimingField(key, value);
        },
        "create notification timing",
        (state) => ({
          timing: { ...state.timing, [key]: value },
        }),
      );
    },

    readTiming: async (): Promise<NotificationTiming> => {
      return handleApiCall(
        set,
        async () => {
          const result = await notificationStorage.getTiming();
          return result.success ? result.data! : initialTiming;
        },
        "read notification timing",
        initialTiming,
        (timing) => ({ timing }),
      );
    },

    updateTiming: async (newTiming: Partial<NotificationTiming>) => {
      return handleVoidApiCall(
        set,
        async () => {
          const updatedTiming = { ...get().timing, ...newTiming };
          await notificationStorage.setTiming(updatedTiming);
          // Note: Notification scheduling is now handled by NotificationEngine
        },
        "update notification timing",
        (state) => ({
          timing: { ...state.timing, ...newTiming },
        }),
      );
    },

    deleteTiming: async (key: keyof NotificationTiming) => {
      return handleVoidApiCall(
        set,
        async () => {
          await notificationStorage.removeTimingField(key);
        },
        "delete notification timing",
        (state) => {
          const defaults = {
            morningTime: "08:00",
            middayTime: "12:00",
            eveningTime: "18:00",
          };
          return { timing: { ...state.timing, [key]: defaults[key] } };
        },
      );
    },

    // Bulk operations
    resetAllPreferences: async () => {
      return handleVoidApiCall(
        set,
        async () => {
          await notificationStorage.resetPreferences();
        },
        "reset all notification preferences",
        () => ({ preferences: initialPreferences }),
      );
    },

    resetAllTiming: async () => {
      return handleVoidApiCall(
        set,
        async () => {
          await notificationStorage.resetTiming();
        },
        "reset all notification timing",
        () => ({ timing: initialTiming }),
      );
    },

    clearAllNotificationData: async () => {
      return handleVoidApiCall(
        set,
        async () => {
          await notificationStorage.clearAll();
          await Notifications.cancelAllScheduledNotificationsAsync();
        },
        "clear all notification data",
        () => ({
          preferences: initialPreferences,
          timing: initialTiming,
          usedQuoteIds: [],
          nextQuoteIndex: 0,
          permissionStatus: "undetermined" as const,
        }),
      );
    },

    // Actions (keeping existing ones but improved)
    requestPermissions: async (): Promise<boolean> => {
      set({ isPermissionLoading: true, error: null });

      try {
        const { status } = await Notifications.requestPermissionsAsync();
        const granted = status === "granted";

        let permissionStatus: "granted" | "denied" | "undetermined";
        if (status === "granted") {
          permissionStatus = "granted";
        } else if (status === "denied") {
          permissionStatus = "denied";
        } else {
          permissionStatus = "undetermined";
        }

        set({
          permissionStatus,
          isPermissionLoading: false,
        });

        GlobalErrorHandler.logDebug(
          `Notification permissions ${granted ? "granted" : "denied"}`,
          "useNotificationStore.requestPermissions",
        );

        return granted;
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useNotificationStore.requestPermissions",
          {},
        );

        set({
          permissionStatus: "denied",
          isPermissionLoading: false,
          error: error instanceof Error
            ? error.message
            : "Failed to request permissions",
        });

        return false;
      }
    },

    /**
     * @deprecated Use NotificationEngine.scheduleAllNotifications() instead
     * This method will be removed to avoid duplicate notifications
     */
    scheduleNotifications: async (): Promise<void> => {
      const { preferences, timing, permissionStatus } = get();

      if (permissionStatus !== "granted") {
        GlobalErrorHandler.logWarning(
          "Cannot schedule notifications without permissions",
          "useNotificationStore.scheduleNotifications",
        );
        return;
      }

      try {
        // Cancel existing notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Log the timing data for debugging
        GlobalErrorHandler.logDebug(
          "Scheduling notifications with timing data",
          "useNotificationStore.scheduleNotifications",
          { preferences, timing },
        );

        const notifications = [];

        // Schedule morning reminders
        if (preferences.morningReminders) {
          // Morning reminders now use dedicated morning motivation messages
          const morningTime = timing.morningTime || "08:00"; // Fallback if undefined
          notifications.push({
            type: "morning-motivation" as NotificationType,
            time: morningTime,
          });
        }

        // Schedule midday reflections
        if (preferences.middayReflection) {
          const middayTime = timing.middayTime || "12:00"; // Fallback if undefined
          notifications.push({
            type: "midday-reflection" as NotificationType,
            time: middayTime,
          });
        }

        // Schedule evening reflections
        if (preferences.eveningReminders) {
          const eveningTime = timing.eveningTime || "18:00"; // Fallback if undefined
          notifications.push({
            type: "evening-reflection" as NotificationType,
            time: eveningTime,
          });
        }

        // Schedule each notification
        for (const notification of notifications) {
          // Add safety check for time property
          if (!notification.time) {
            GlobalErrorHandler.logError(
              new Error(
                `Invalid notification time: ${JSON.stringify(notification)}`,
              ),
              "useNotificationStore.scheduleNotifications",
              { notification, preferences, timing },
            );
            continue; // Skip this notification
          }

          const [hours, minutes] = notification.time.split(":").map(Number);
          const trigger: Notifications.CalendarTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour: hours,
            minute: minutes,
            repeats: true,
          };

          await Notifications.scheduleNotificationAsync({
            content: {
              title: getTitleForType(notification.type),
              body: getBodyForType(notification.type),
              data: { type: notification.type },
            },
            trigger,
          });
        }

        GlobalErrorHandler.logDebug(
          `Scheduled ${notifications.length} notifications`,
          "useNotificationStore.scheduleNotifications",
          { notifications },
        );
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useNotificationStore.scheduleNotifications",
          { preferences, timing },
        );

        set({
          error: error instanceof Error
            ? error.message
            : "Failed to schedule notifications",
        });
      }
    },

    getNextQuote: (
      messageType?: "morning" | "midday" | "evening" | "streak",
    ): CadenceMessage => {
      const { usedQuoteIds, nextQuoteIndex } = get();

      // Filter by message type if provided, otherwise use all messages
      const typedMessages = messageType
        ? cadenceMessages.filter((msg) => msg.type === messageType)
        : cadenceMessages;

      const availableQuotes = typedMessages.filter(
        (quote) => !usedQuoteIds.includes(quote.id),
      );

      // Reset backlog if all quotes used
      if (availableQuotes.length === 0) {
        set({ usedQuoteIds: [], nextQuoteIndex: 0 });

        // Persist reset to storage
        Promise.all([
          notificationStorage.resetUsedQuoteIds(),
          notificationStorage.setNextQuoteIndex(0),
        ]).catch((error) => {
          GlobalErrorHandler.logError(
            error,
            "useNotificationStore.getNextQuote.reset",
          );
        });

        return typedMessages[0] || cadenceMessages[0];
      }

      // Return next unused quote
      const selectedQuote =
        availableQuotes[nextQuoteIndex % availableQuotes.length];
      const newNextQuoteIndex = nextQuoteIndex + 1;

      set({ nextQuoteIndex: newNextQuoteIndex });

      // Persist index to storage
      notificationStorage.setNextQuoteIndex(newNextQuoteIndex).catch(
        (error) => {
          GlobalErrorHandler.logError(
            error,
            "useNotificationStore.getNextQuote.persistIndex",
            { nextQuoteIndex: newNextQuoteIndex },
          );
        },
      );

      return selectedQuote;
    },

    markQuoteUsed: (quoteId: string) => {
      const currentUsedIds = get().usedQuoteIds;
      if (!currentUsedIds.includes(quoteId)) {
        const updatedIds = [...currentUsedIds, quoteId];
        set({ usedQuoteIds: updatedIds });

        // Persist to storage
        notificationStorage.addUsedQuoteId(quoteId).catch((error) => {
          GlobalErrorHandler.logError(
            error,
            "useNotificationStore.markQuoteUsed",
            { quoteId },
          );
        });
      }
    },

    resetQuoteBacklog: () => {
      set({ usedQuoteIds: [], nextQuoteIndex: 0 });

      // Persist to storage
      Promise.all([
        notificationStorage.resetUsedQuoteIds(),
        notificationStorage.setNextQuoteIndex(0),
      ]).catch((error) => {
        GlobalErrorHandler.logError(
          error,
          "useNotificationStore.resetQuoteBacklog",
        );
      });
    },

    // Debug/repair function to fix timing data structure
    repairTiming: async () => {
      const { timing } = get();

      // Ensure all required timing properties exist with defaults
      const repairedTiming: NotificationTiming = {
        morningTime: timing.morningTime || "08:00",
        middayTime: timing.middayTime || "12:00",
        eveningTime: timing.eveningTime || "18:00",
      };

      set({ timing: repairedTiming });

      // Save repaired timing to storage
      try {
        await notificationStorage.setTiming(repairedTiming);
        GlobalErrorHandler.logDebug(
          "Timing data repaired and saved",
          "useNotificationStore.repairTiming",
          { originalTiming: timing, repairedTiming },
        );
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useNotificationStore.repairTiming",
          { timing: repairedTiming },
        );
      }
    },

    deliverNotification: (quote: CadenceMessage, type: NotificationType) => {
      // This will be handled by the NotificationEngine singleton
      // For now, we just mark the quote as used
      get().markQuoteUsed(quote.id);

      GlobalErrorHandler.logDebug(
        "Notification delivered",
        "useNotificationStore.deliverNotification",
        { quoteId: quote.id, type },
      );
    },

    // Internal methods
    _initialize: async () => {
      try {
        // Load stored preferences, timing, and quote data
        const [
          preferencesResult,
          timingResult,
          usedQuoteIdsResult,
          nextQuoteIndexResult,
        ] = await Promise.all([
          notificationStorage.getPreferences(),
          notificationStorage.getTiming(),
          notificationStorage.getUsedQuoteIds(),
          notificationStorage.getNextQuoteIndex(),
        ]);

        // Update store with loaded data or defaults
        const preferences = preferencesResult.success && preferencesResult.data
          ? preferencesResult.data
          : initialPreferences;

        const timing = timingResult.success && timingResult.data
          ? timingResult.data
          : initialTiming;

        const usedQuoteIds =
          usedQuoteIdsResult.success && usedQuoteIdsResult.data
            ? usedQuoteIdsResult.data
            : [];

        const nextQuoteIndex = nextQuoteIndexResult.success &&
            nextQuoteIndexResult.data !== undefined
          ? nextQuoteIndexResult.data
          : 0;

        set({
          preferences,
          timing,
          usedQuoteIds,
          nextQuoteIndex,
        });

        GlobalErrorHandler.logDebug(
          "Notification store initialized from storage",
          "useNotificationStore._initialize",
          {
            preferences,
            timing,
            usedQuotesCount: usedQuoteIds.length,
            nextQuoteIndex,
          },
        );
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useNotificationStore._initialize",
          {
            message: "Failed to load notification data, using defaults",
          },
        );

        // Use defaults on error
        set({
          preferences: initialPreferences,
          timing: initialTiming,
          usedQuoteIds: [],
          nextQuoteIndex: 0,
        });
      }

      // Set up app state listener
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        get()._updateAppState(nextAppState);
      };

      AppState.addEventListener("change", handleAppStateChange);

      // Set initial app state
      get()._updateAppState(AppState.currentState);
    },

    _updateAppState: (state: AppStateStatus) => {
      const isInApp = state === "active";
      set({ isInApp });

      GlobalErrorHandler.logDebug(
        `App state changed: ${state}, isInApp: ${isInApp}`,
        "useNotificationStore._updateAppState",
      );
    },
  })),
);

// Initialize the store
(async () => {
  try {
    await useNotificationStore.getState()._initialize();
  } catch (error) {
    GlobalErrorHandler.logError(
      error,
      "useNotificationStore initialization",
      { message: "Failed to initialize notification store" },
    );
  }
})();

// Export default for consistency
export default useNotificationStore;
