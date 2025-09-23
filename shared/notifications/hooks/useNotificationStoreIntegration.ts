import { useProfileStore } from "@/features/profile/stores/useProfileStore";
import { useNotificationStore } from "@/shared/stores/resources/useNotificationStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useCallback, useEffect } from "react";
import { useNotificationScheduler } from "./useNotificationScheduler";

export interface UseNotificationStoreIntegrationReturn {
    // Store state
    timing: ReturnType<typeof useNotificationStore>["timing"];
    preferences: ReturnType<typeof useNotificationStore>["preferences"];
    scheduleStatus: ReturnType<typeof useNotificationStore>["scheduleStatus"];
    isLoading: boolean;
    error: string | null;

    // Store operations
    updateTiming: ReturnType<typeof useNotificationStore>["updateTiming"];
    updatePreferences: ReturnType<
        typeof useNotificationStore
    >["updatePreferences"];
    setMiddayTime: ReturnType<typeof useNotificationStore>["setMiddayTime"];
    setEveningWindow: ReturnType<
        typeof useNotificationStore
    >["setEveningWindow"];
    setAutomaticTiming: ReturnType<
        typeof useNotificationStore
    >["setAutomaticTiming"];

    // Toggle operations
    toggleMorningReminders: ReturnType<
        typeof useNotificationStore
    >["toggleMorningReminders"];
    toggleEveningReminders: ReturnType<
        typeof useNotificationStore
    >["toggleEveningReminders"];
    toggleWeeklyStreaks: ReturnType<
        typeof useNotificationStore
    >["toggleWeeklyStreaks"];
    toggleMiddayReflection: ReturnType<
        typeof useNotificationStore
    >["toggleMiddayReflection"];

    // Integrated operations that affect both store and scheduler
    rescheduleNotifications: () => Promise<void>;
    loadNotificationSettings: () => Promise<void>;
    resetNotificationSettings: () => void;
}

/**
 * Hook that integrates the notification store with the notification scheduler
 * Provides unified access to notification settings and automatic rescheduling
 */
export const useNotificationStoreIntegration = (
    userId?: string,
): UseNotificationStoreIntegrationReturn => {
    // Get notification store state and actions
    const {
        timing,
        preferences,
        scheduleStatus,
        isLoading: storeLoading,
        error: storeError,
        updateTiming,
        updatePreferences,
        setMiddayTime,
        setEveningWindow,
        setAutomaticTiming,
        toggleMorningReminders,
        toggleEveningReminders,
        toggleWeeklyStreaks,
        toggleMiddayReflection,
        loadFromStorage,
        reset,
    } = useNotificationStore();

    // Get profile store for automatic timing calculation
    const { settings: profileSettings } = useProfileStore();

    // Get notification scheduler
    const {
        scheduleAllNotifications,
        error: schedulerError,
        isScheduling,
    } = useNotificationScheduler(userId);

    // Combined loading and error states
    const isLoading = storeLoading || isScheduling;
    const error = storeError || schedulerError;

    // Load notification settings from storage on mount
    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    // Auto-update timing when profile settings change (if timing is automatic)
    useEffect(() => {
        if (
            timing.isAutomatic && profileSettings.wakeTime &&
            profileSettings.sleepTime
        ) {
            const notificationStore = useNotificationStore.getState();
            const newTiming = notificationStore.getTimingForDate(
                profileSettings.wakeTime,
                profileSettings.sleepTime,
            );

            // Only update if the calculated timing is different
            if (
                newTiming.middayTime !== timing.middayTime ||
                newTiming.eveningTimeStart !== timing.eveningTimeStart ||
                newTiming.eveningTimeEnd !== timing.eveningTimeEnd
            ) {
                updateTiming(newTiming);

                GlobalErrorHandler.logDebug(
                    "Auto-updated notification timing based on profile changes",
                    "useNotificationStoreIntegration",
                    {
                        oldTiming: timing,
                        newTiming,
                        wakeTime: profileSettings.wakeTime,
                        sleepTime: profileSettings.sleepTime,
                    },
                );
            }
        }
    }, [
        profileSettings.wakeTime,
        profileSettings.sleepTime,
        timing.isAutomatic,
        timing.middayTime,
        timing.eveningTimeStart,
        timing.eveningTimeEnd,
        updateTiming,
    ]);

    // Auto-reschedule notifications when notification preferences change
    useEffect(() => {
        if (!userId) return;

        const timeoutId = setTimeout(async () => {
            try {
                await scheduleAllNotifications();
                GlobalErrorHandler.logDebug(
                    "Auto-rescheduled notifications after preference change",
                    "useNotificationStoreIntegration",
                    { userId, preferences },
                );
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "useNotificationStoreIntegration.autoReschedule",
                    { userId, preferences },
                );
            }
        }, 1000); // Debounce to prevent rapid rescheduling

        return () => clearTimeout(timeoutId);
    }, [
        preferences.morningReminders,
        preferences.eveningReminders,
        preferences.weeklyStreaks,
        preferences.middayReflection,
        userId,
        scheduleAllNotifications,
    ]);

    // Auto-reschedule notifications when timing changes
    useEffect(() => {
        if (!userId) return;

        const timeoutId = setTimeout(async () => {
            try {
                await scheduleAllNotifications();
                GlobalErrorHandler.logDebug(
                    "Auto-rescheduled notifications after timing change",
                    "useNotificationStoreIntegration",
                    { userId, timing },
                );
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "useNotificationStoreIntegration.autoRescheduleTimig",
                    { userId, timing },
                );
            }
        }, 1000); // Debounce to prevent rapid rescheduling

        return () => clearTimeout(timeoutId);
    }, [
        timing.middayTime,
        timing.eveningTimeStart,
        timing.eveningTimeEnd,
        userId,
        scheduleAllNotifications,
    ]);

    // Manually reschedule notifications
    const rescheduleNotifications = useCallback(async (): Promise<void> => {
        if (!userId) {
            throw new Error("User ID is required to reschedule notifications");
        }

        try {
            await scheduleAllNotifications();
            GlobalErrorHandler.logDebug(
                "Manually rescheduled notifications",
                "useNotificationStoreIntegration.rescheduleNotifications",
                { userId },
            );
        } catch (error) {
            GlobalErrorHandler.logError(
                error,
                "useNotificationStoreIntegration.rescheduleNotifications",
                { userId },
            );
            throw error;
        }
    }, [userId, scheduleAllNotifications]);

    // Load notification settings from storage
    const loadNotificationSettings = useCallback(async (): Promise<void> => {
        try {
            await loadFromStorage();
            GlobalErrorHandler.logDebug(
                "Loaded notification settings from storage",
                "useNotificationStoreIntegration.loadNotificationSettings",
            );
        } catch (error) {
            GlobalErrorHandler.logError(
                error,
                "useNotificationStoreIntegration.loadNotificationSettings",
            );
            throw error;
        }
    }, [loadFromStorage]);

    // Reset notification settings
    const resetNotificationSettings = useCallback((): void => {
        reset();
        GlobalErrorHandler.logDebug(
            "Reset notification settings to defaults",
            "useNotificationStoreIntegration.resetNotificationSettings",
        );
    }, [reset]);

    return {
        // Store state
        timing,
        preferences,
        scheduleStatus,
        isLoading,
        error,

        // Store operations
        updateTiming,
        updatePreferences,
        setMiddayTime,
        setEveningWindow,
        setAutomaticTiming,

        // Toggle operations
        toggleMorningReminders,
        toggleEveningReminders,
        toggleWeeklyStreaks,
        toggleMiddayReflection,

        // Integrated operations
        rescheduleNotifications,
        loadNotificationSettings,
        resetNotificationSettings,
    };
};
