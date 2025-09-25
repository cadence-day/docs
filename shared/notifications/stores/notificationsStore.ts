import { notificationStorage } from "@/shared/storage/notifications";
import type { BaseStoreState } from "@/shared/stores/utils/utils";
import { handleApiCall, handleVoidApiCall } from "@/shared/stores/utils/utils";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Notifications from "expo-notifications";
import { AppState, AppStateStatus } from "react-native";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface CadenceMessage {
  id: string;
  text: string;
  type: "midday" | "evening" | "streak";
}

export type NotificationType =
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
  getNextQuote: () => CadenceMessage;
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

// Convert existing cadence messages to the new format
const CADENCE_MIDDAY_REFLECTIONS = [
  "How has time shaped your morning?",
  "The morning's behind you. Want to catch its trace?",
  "Time's been moving quietly. What have you moved through?",
  "The day has a rhythm. How did yours begin?",
  "A soft checkpoint. What filled your morning hours?",
  "Half the clock turned. Want to mark what's passed?",
  "Before the afternoon stretches out—how did you arrive here?",
  "Make a midday pause to remember the morning.",
  "Your morning made a pattern. Want to glimpse it?",
  "The day's unwinding. Want to press pause and look back?",
];

const CADENCE_EVENING_REFLECTIONS = [
  '"Forever is composed of nows." — Emily Dickinson',
  '"Moments of their life together that no one else would ever know..." — James Joyce',
  '"Time is a river which carries me along..." — Jorge Luis Borges',
  '"Let everything happen to you... No feeling is final." — Rainer Maria Rilke',
  '"For now she need not think of anybody." — Virginia Woolf',
  '"All that you touch, you change." — Octavia Butler',
  '"What we call the beginning is often the end." — T.S. Eliot',
  '"I only achieve simplicity with enormous effort." — Clarice Lispector',
  '"Sometimes just to say your own name out loud is a comfort." — Anne Carson',
  '"Tell me, what is it you plan to do with your one wild and precious life?" — Mary Oliver',
  '"In the stillness, I watch the world rearrange itself." — Ocean Vuong',
  '"The years teach much which the days never know." — Ralph Waldo Emerson',
  '"Every day is a journey, and the journey itself is home." — Matsuo Basho',
  '"Nothing is ever really lost to us as long as we remember it." — L.M. Montgomery',
  '"Time is the longest distance between two places." — Tennessee Williams',
  '"Be patient toward all that is unsolved in your heart." — Rainer Maria Rilke',
  '"It is the time you have wasted for your rose that makes your rose so important." — Antoine de Saint-Exupery',
  '"The present was an egg laid by the past that had the future inside its shell." — Zora Neale Hurston',
  '"We do not remember days, we remember moments." — Cesare Pavese',
  '"I am made of hours, and just a little sand." — Federico Garcia Lorca',
  '"Each day is a stone you hold, or let slip past." — Carl Phillips',
  '"The sky is a daily reminder that we are held by something vast." — Lora Mathis',
  '"We are all composed of loops and returns." — Bhanu Kapil',
  '"I speak to you from the quiet edge of this day." — Traci Brimhall',
  '"We turn the hours into meaning, or they pass through us unnoticed." — Ada Limon',
  '"Even the clock holds its breath sometimes." — Ocean Vuong',
  '"To notice is to begin remembering." — Margaret Atwood',
];

const CADENCE_STREAK_MESSAGES = [
  "You logged {{streakCount}} days this week—your week looks like a constellation.",
  "Your rhythm is taking shape. {{streakCount}} days of awareness.",
  "Time becomes visible when you pay attention. Day {{streakCount}}.",
  "Another day in your timeline. The pattern grows stronger.",
  "Your week is painting itself. {{streakCount}} brushstrokes so far.",
];

// Create unified cadenceMessages array
export const cadenceMessages: CadenceMessage[] = [
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
          // Auto-reschedule notifications when preferences change
          await get().scheduleNotifications();
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
          // Auto-reschedule notifications when timing changes
          await get().scheduleNotifications();
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
          // Morning reminders can use midday quotes for motivation
          const morningTime = timing.morningTime || "08:00"; // Fallback if undefined
          notifications.push({
            type: "midday-reflection" as NotificationType,
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
              body: "Tap to reflect on your day",
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

    getNextQuote: (): CadenceMessage => {
      const { usedQuoteIds, nextQuoteIndex } = get();
      const availableQuotes = cadenceMessages.filter(
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

        return cadenceMessages[0];
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

        const nextQuoteIndex =
          nextQuoteIndexResult.success &&
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
