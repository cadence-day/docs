import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as Notifications from "expo-notifications";
import { AppState, AppStateStatus } from "react-native";
import type { BaseStoreState } from "@/shared/stores/utils/utils";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export interface CadenceMessage {
  id: string;
  text: string;
  type: "midday" | "evening" | "streak";
}

export type NotificationType = "midday-reflection" | "evening-reflection" | "weekly-streaks";

export interface NotificationPreferences {
  morningReminders: boolean;
  eveningReminders: boolean;
  middayReflection: boolean;
  weeklyStreaks: boolean;
}

export interface NotificationTiming {
  morningTime: string; // "07:00"
  middayTime: string;  // "12:00"
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

  // Actions
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateTiming: (timing: Partial<NotificationTiming>) => void;
  requestPermissions: () => Promise<boolean>;
  scheduleNotifications: () => Promise<void>;
  getNextQuote: () => CadenceMessage;
  markQuoteUsed: (quoteId: string) => void;
  resetQuoteBacklog: () => void;
  deliverNotification: (quote: CadenceMessage, type: NotificationType) => void;

  // Internal methods
  _initialize: () => void;
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
  morningTime: "07:00",
  middayTime: "12:00",
  eveningTime: "19:00",
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

    // Actions
    updatePreferences: (newPreferences: Partial<NotificationPreferences>) => {
      set((state) => ({
        preferences: { ...state.preferences, ...newPreferences },
      }));

      // Auto-reschedule notifications when preferences change
      get().scheduleNotifications();
    },

    updateTiming: (newTiming: Partial<NotificationTiming>) => {
      set((state) => ({
        timing: { ...state.timing, ...newTiming },
      }));

      // Auto-reschedule notifications when timing changes
      get().scheduleNotifications();
    },

    requestPermissions: async (): Promise<boolean> => {
      set({ isPermissionLoading: true, error: null });

      try {
        const { status } = await Notifications.requestPermissionsAsync();
        const granted = status === "granted";

        set({
          permissionStatus: status === "granted" ? "granted" :
                           status === "denied" ? "denied" : "undetermined",
          isPermissionLoading: false,
        });

        GlobalErrorHandler.logDebug(
          `Notification permissions ${granted ? "granted" : "denied"}`,
          "useNotificationStore.requestPermissions"
        );

        return granted;
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useNotificationStore.requestPermissions",
          {}
        );

        set({
          permissionStatus: "denied",
          isPermissionLoading: false,
          error: error instanceof Error ? error.message : "Failed to request permissions",
        });

        return false;
      }
    },

    scheduleNotifications: async (): Promise<void> => {
      const { preferences, timing, permissionStatus } = get();

      if (permissionStatus !== "granted") {
        GlobalErrorHandler.logWarning(
          "Cannot schedule notifications without permissions",
          "useNotificationStore.scheduleNotifications"
        );
        return;
      }

      try {
        // Cancel existing notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        const notifications = [];

        // Schedule morning reminders
        if (preferences.morningReminders) {
          // Morning reminders can use midday quotes for motivation
          notifications.push({
            type: "midday-reflection" as NotificationType,
            time: timing.morningTime,
          });
        }

        // Schedule midday reflections
        if (preferences.middayReflection) {
          notifications.push({
            type: "midday-reflection" as NotificationType,
            time: timing.middayTime,
          });
        }

        // Schedule evening reflections
        if (preferences.eveningReminders) {
          notifications.push({
            type: "evening-reflection" as NotificationType,
            time: timing.eveningTime,
          });
        }

        // Schedule each notification
        for (const notification of notifications) {
          const [hours, minutes] = notification.time.split(":").map(Number);
          const trigger = {
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
          { notifications }
        );

      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "useNotificationStore.scheduleNotifications",
          { preferences, timing }
        );

        set({
          error: error instanceof Error ? error.message : "Failed to schedule notifications",
        });
      }
    },

    getNextQuote: (): CadenceMessage => {
      const { usedQuoteIds, nextQuoteIndex } = get();
      const availableQuotes = cadenceMessages.filter(
        (quote) => !usedQuoteIds.includes(quote.id)
      );

      // Reset backlog if all quotes used
      if (availableQuotes.length === 0) {
        set({ usedQuoteIds: [], nextQuoteIndex: 0 });
        return cadenceMessages[0];
      }

      // Return next unused quote
      const selectedQuote =
        availableQuotes[nextQuoteIndex % availableQuotes.length];
      set({ nextQuoteIndex: nextQuoteIndex + 1 });

      return selectedQuote;
    },

    markQuoteUsed: (quoteId: string) => {
      set((state) => ({
        usedQuoteIds: [...state.usedQuoteIds, quoteId],
      }));
    },

    resetQuoteBacklog: () => {
      set({ usedQuoteIds: [], nextQuoteIndex: 0 });
    },

    deliverNotification: (quote: CadenceMessage, type: NotificationType) => {
      // This will be handled by the NotificationEngine singleton
      // For now, we just mark the quote as used
      get().markQuoteUsed(quote.id);

      GlobalErrorHandler.logDebug(
        "Notification delivered",
        "useNotificationStore.deliverNotification",
        { quoteId: quote.id, type }
      );
    },

    // Internal methods
    _initialize: () => {
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
        "useNotificationStore._updateAppState"
      );
    },
  }))
);

// Initialize the store
useNotificationStore.getState()._initialize();

// Export default for consistency
export default useNotificationStore;