import { notificationStorage } from "@/shared/storage/notifications";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { BaseStoreState } from "../utils/utils";

export interface NotificationTiming {
    /** Time string in HH:MM format for midday reflection */
    middayTime: string;
    /** Time string in HH:MM format for evening reflection */
    eveningTime: string;
    /** Start time string in HH:MM format for evening reflection window (deprecated) */
    eveningTimeStart: string;
    /** End time string in HH:MM format for evening reflection window (deprecated) */
    eveningTimeEnd: string;
    /** Whether timing is automatically calculated or manually set */
    isAutomatic: boolean;
}

export interface NotificationPreferences {
    /** Enable morning cadence reminders */
    morningReminders: boolean;
    /** Enable evening reflection reminders */
    eveningReminders: boolean;
    /** Enable weekly streak notifications */
    weeklyStreaks: boolean;
    /** Enable midday reflection reminders */
    middayReflection: boolean;
}

export interface NotificationScheduleStatus {
    /** Last time notifications were scheduled */
    lastScheduled: string | null;
    /** Whether notifications are currently scheduled */
    isScheduled: boolean;
    /** Number of pending notifications */
    pendingCount: number;
}

interface NotificationStore extends BaseStoreState {
    // State
    timing: NotificationTiming;
    preferences: NotificationPreferences;
    scheduleStatus: NotificationScheduleStatus;

    // Timing operations
    updateTiming: (timing: Partial<NotificationTiming>) => void;
    setMiddayTime: (time: string) => void;
    setEveningTime: (time: string) => void;
    setEveningWindow: (startTime: string, endTime: string) => void;
    setAutomaticTiming: (isAutomatic: boolean) => void;

    // Preference operations
    updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
    toggleMorningReminders: () => void;
    toggleEveningReminders: () => void;
    toggleWeeklyStreaks: () => void;
    toggleMiddayReflection: () => void;

    // Schedule status operations
    updateScheduleStatus: (status: Partial<NotificationScheduleStatus>) => void;
    markAsScheduled: (pendingCount: number) => void;
    markAsUnscheduled: () => void;

    // Persistence operations
    loadFromStorage: () => Promise<void>;
    saveToStorage: () => Promise<void>;
    saveTimingToStorage: () => Promise<void>;
    savePreferencesToStorage: () => Promise<void>;
    saveScheduleStatusToStorage: () => Promise<void>;

    // Utility operations
    getTimingForDate: (
        wakeTime: string,
        sleepTime: string,
    ) => NotificationTiming;
    reset: () => void;
}

const initialTiming: NotificationTiming = {
    middayTime: "12:00",
    eveningTime: "20:00",
    eveningTimeStart: "20:00",
    eveningTimeEnd: "21:30",
    isAutomatic: true,
};

const initialPreferences: NotificationPreferences = {
    morningReminders: true,
    eveningReminders: false,
    weeklyStreaks: true,
    middayReflection: true,
};

const initialScheduleStatus: NotificationScheduleStatus = {
    lastScheduled: null,
    isScheduled: false,
    pendingCount: 0,
};

/**
 * Calculate automatic timing based on wake and sleep times
 */
function calculateAutomaticTiming(
    wakeTime: string,
    sleepTime: string,
): NotificationTiming {
    try {
        const wakeDate = new Date(`1970-01-01T${wakeTime}:00`);
        const sleepDate = new Date(`1970-01-01T${sleepTime}:00`);

        // If sleep time is before wake time, it's next day
        if (sleepDate < wakeDate) {
            sleepDate.setDate(sleepDate.getDate() + 1);
        }

        // Midday: 3-4 hours after wake time (default to 3.5 hours)
        const middayDate = new Date(
            wakeDate.getTime() + (3.5 * 60 * 60 * 1000),
        );

        // Evening window: 2-3 hours before sleep time
        const eveningEndDate = new Date(
            sleepDate.getTime() - (2 * 60 * 60 * 1000),
        );
        const eveningStartDate = new Date(
            sleepDate.getTime() - (3 * 60 * 60 * 1000),
        );

        // Format times
        const formatTime = (date: Date): string => {
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
        };

        return {
            middayTime: formatTime(middayDate),
            eveningTime: formatTime(eveningEndDate),
            eveningTimeStart: formatTime(eveningStartDate),
            eveningTimeEnd: formatTime(eveningEndDate),
            isAutomatic: true,
        };
    } catch (error) {
        GlobalErrorHandler.logError(error, "NOTIFICATION_TIMING_CALCULATION", {
            wakeTime,
            sleepTime,
        });

        // Return safe defaults
        return {
            middayTime: "12:00",
            eveningTime: "20:00",
            eveningTimeStart: "20:00",
            eveningTimeEnd: "21:30",
            isAutomatic: true,
        };
    }
}

export const useNotificationStore = create<NotificationStore>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        timing: initialTiming,
        preferences: initialPreferences,
        scheduleStatus: initialScheduleStatus,
        isLoading: false,
        error: null,

        // Timing operations
        updateTiming: (newTiming: Partial<NotificationTiming>) => {
            set((state) => ({
                timing: { ...state.timing, ...newTiming },
            }));
            // Auto-save timing changes
            get().saveTimingToStorage();
        },

        setMiddayTime: (time: string) => {
            set((state) => ({
                timing: {
                    ...state.timing,
                    middayTime: time,
                    isAutomatic: false,
                },
            }));
            get().saveTimingToStorage();
        },

        setEveningTime: (time: string) => {
            set((state) => ({
                timing: {
                    ...state.timing,
                    eveningTime: time,
                    eveningTimeStart: time, // Keep for backward compatibility
                    isAutomatic: false,
                },
            }));
            get().saveTimingToStorage();
        },

        setEveningWindow: (startTime: string, endTime: string) => {
            set((state) => ({
                timing: {
                    ...state.timing,
                    eveningTimeStart: startTime,
                    eveningTimeEnd: endTime,
                    isAutomatic: false,
                },
            }));
            get().saveTimingToStorage();
        },

        setAutomaticTiming: (isAutomatic: boolean) => {
            set((state) => ({
                timing: { ...state.timing, isAutomatic },
            }));
            get().saveTimingToStorage();
        },

        // Preference operations
        updatePreferences: (
            newPreferences: Partial<NotificationPreferences>,
        ) => {
            set((state) => ({
                preferences: { ...state.preferences, ...newPreferences },
            }));
            // Auto-save preference changes
            get().savePreferencesToStorage();
        },

        toggleMorningReminders: () => {
            set((state) => ({
                preferences: {
                    ...state.preferences,
                    morningReminders: !state.preferences.morningReminders,
                },
            }));
            get().savePreferencesToStorage();
        },

        toggleEveningReminders: () => {
            set((state) => ({
                preferences: {
                    ...state.preferences,
                    eveningReminders: !state.preferences.eveningReminders,
                },
            }));
            get().savePreferencesToStorage();
        },

        toggleWeeklyStreaks: () => {
            set((state) => ({
                preferences: {
                    ...state.preferences,
                    weeklyStreaks: !state.preferences.weeklyStreaks,
                },
            }));
            get().savePreferencesToStorage();
        },

        toggleMiddayReflection: () => {
            set((state) => ({
                preferences: {
                    ...state.preferences,
                    middayReflection: !state.preferences.middayReflection,
                },
            }));
            get().savePreferencesToStorage();
        },

        // Schedule status operations
        updateScheduleStatus: (
            newStatus: Partial<NotificationScheduleStatus>,
        ) => {
            set((state) => ({
                scheduleStatus: { ...state.scheduleStatus, ...newStatus },
            }));
            // Auto-save status changes
            get().saveScheduleStatusToStorage();
        },

        markAsScheduled: (pendingCount: number) => {
            set({
                scheduleStatus: {
                    lastScheduled: new Date().toISOString(),
                    isScheduled: true,
                    pendingCount,
                },
            });
            get().saveScheduleStatusToStorage();
        },

        markAsUnscheduled: () => {
            set((state) => ({
                scheduleStatus: {
                    ...state.scheduleStatus,
                    isScheduled: false,
                    pendingCount: 0,
                },
            }));
            get().saveScheduleStatusToStorage();
        },

        // Utility operations
        getTimingForDate: (
            wakeTime: string,
            sleepTime: string,
        ): NotificationTiming => {
            const { timing } = get();

            if (timing.isAutomatic) {
                return calculateAutomaticTiming(wakeTime, sleepTime);
            }

            return timing;
        },

        // Persistence operations
        loadFromStorage: async () => {
            set({ isLoading: true, error: null });

            try {
                const result = await notificationStorage.getAllData();

                if (result.success && result.data) {
                    set({
                        timing: result.data.timing,
                        preferences: result.data.preferences,
                        scheduleStatus: result.data.scheduleStatus,
                        isLoading: false,
                    });

                    GlobalErrorHandler.logDebug(
                        "Notification data loaded from storage",
                        "NOTIFICATION_STORAGE_LOAD",
                        { hasData: true },
                    );
                } else {
                    GlobalErrorHandler.logError(
                        new Error(
                            result.error || "Failed to load notification data",
                        ),
                        "NOTIFICATION_STORAGE_LOAD_ERROR",
                        { error: result.error },
                    );

                    set({
                        isLoading: false,
                        error: result.error ||
                            "Failed to load notification settings",
                    });
                }
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "NOTIFICATION_STORAGE_LOAD_EXCEPTION",
                    {},
                );
                set({
                    isLoading: false,
                    error: error instanceof Error
                        ? error.message
                        : "Unknown storage error",
                });
            }
        },

        saveToStorage: async () => {
            const { timing, preferences, scheduleStatus } = get();

            try {
                const result = await notificationStorage.setAllData({
                    timing,
                    preferences,
                    scheduleStatus,
                });

                if (!result.success) {
                    GlobalErrorHandler.logError(
                        new Error(
                            result.error || "Failed to save notification data",
                        ),
                        "NOTIFICATION_STORAGE_SAVE_ERROR",
                        { error: result.error },
                    );

                    set({
                        error: result.error ||
                            "Failed to save notification settings",
                    });
                } else {
                    GlobalErrorHandler.logDebug(
                        "Notification data saved to storage",
                        "NOTIFICATION_STORAGE_SAVE",
                        { success: true },
                    );
                }
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "NOTIFICATION_STORAGE_SAVE_EXCEPTION",
                    {},
                );
                set({
                    error: error instanceof Error
                        ? error.message
                        : "Unknown storage error",
                });
            }
        },

        saveTimingToStorage: async () => {
            const { timing } = get();

            try {
                const result = await notificationStorage.setTiming(timing);

                if (!result.success) {
                    set({
                        error: result.error || "Failed to save timing settings",
                    });
                }
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "NOTIFICATION_TIMING_SAVE_ERROR",
                    {},
                );
                set({
                    error: error instanceof Error
                        ? error.message
                        : "Unknown storage error",
                });
            }
        },

        savePreferencesToStorage: async () => {
            const { preferences } = get();

            try {
                const result = await notificationStorage.setPreferences(
                    preferences,
                );

                if (!result.success) {
                    set({
                        error: result.error ||
                            "Failed to save notification preferences",
                    });
                }
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "NOTIFICATION_PREFERENCES_SAVE_ERROR",
                    {},
                );
                set({
                    error: error instanceof Error
                        ? error.message
                        : "Unknown storage error",
                });
            }
        },

        saveScheduleStatusToStorage: async () => {
            const { scheduleStatus } = get();

            try {
                const result = await notificationStorage.setScheduleStatus(
                    scheduleStatus,
                );

                if (!result.success) {
                    set({
                        error: result.error || "Failed to save schedule status",
                    });
                }
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "NOTIFICATION_SCHEDULE_SAVE_ERROR",
                    {},
                );
                set({
                    error: error instanceof Error
                        ? error.message
                        : "Unknown storage error",
                });
            }
        },

        reset: () =>
            set({
                timing: initialTiming,
                preferences: initialPreferences,
                scheduleStatus: initialScheduleStatus,
                isLoading: false,
                error: null,
            }),
    })),
);

// Export default for consistency with other stores
export default useNotificationStore;
