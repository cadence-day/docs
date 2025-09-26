import * as notificationsApi from "@/shared/api/resources/notifications";
import type { Notification } from "@/shared/types/models/notification";
import { getClerkInstance } from "@clerk/clerk-expo";
import { create } from "zustand";
import {
    type BaseStoreState,
    handleApiCall,
    handleGetApiCall,
    handleVoidApiCall,
    handleVoidApiCallWithResult,
} from "../utils/utils";

interface NotificationSettingsStore extends BaseStoreState {
    // Current user's notification settings
    notificationSettings: Notification | null;

    // CRUD operations for notification settings
    getNotificationSettings: (userId?: string) => Promise<Notification | null>;
    insertNotificationSettings: (
        settings: Omit<Notification, "id" | "created_at" | "updated_at">,
    ) => Promise<Notification | null>;
    updateNotificationSettings: (
        settings: Notification,
    ) => Promise<Notification | null>;
    upsertNotificationSettings: (
        settings:
            & Omit<Notification, "id" | "created_at" | "updated_at">
            & Partial<Pick<Notification, "id">>,
    ) => Promise<Notification | null>;
    deleteNotificationSettings: (id: string) => Promise<void>;

    // Convenience methods
    refresh: (userId?: string) => Promise<void>;
    initializeForCurrentUser: () => Promise<void>;

    // Utility functions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const useNotificationSettingsStore = create<NotificationSettingsStore>((
    set,
    _get,
) => ({
    notificationSettings: null,
    isLoading: false,
    error: null,

    getNotificationSettings: async (userId?: string) => {
        const targetUserId = userId || getClerkInstance().user?.id;
        if (!targetUserId) {
            throw new Error("User ID is required to get notification settings");
        }

        return handleGetApiCall(
            set,
            () => notificationsApi.getNotificationSettings(targetUserId),
            "get notification settings",
            null,
        );
    },

    insertNotificationSettings: async (settings) => {
        // Ensure user_id is set
        const userId = settings.user_id || getClerkInstance().user?.id;
        if (!userId) {
            throw new Error(
                "User must be authenticated to create notification settings",
            );
        }

        const settingsWithUserId = { ...settings, user_id: userId };

        return handleApiCall(
            set,
            () =>
                notificationsApi.insertNotificationSettings(settingsWithUserId),
            "create notification settings",
            null,
            (newSettings, state) => ({
                notificationSettings: newSettings || state.notificationSettings,
            }),
        );
    },

    updateNotificationSettings: async (settings) => {
        return handleApiCall(
            set,
            () => notificationsApi.updateNotificationSettings(settings),
            "update notification settings",
            null,
            (updatedSettings) => ({
                notificationSettings: updatedSettings,
            }),
        );
    },

    upsertNotificationSettings: async (settings) => {
        // Ensure user_id is set
        const userId = settings.user_id || getClerkInstance().user?.id;
        if (!userId) {
            throw new Error(
                "User must be authenticated to upsert notification settings",
            );
        }

        const settingsWithUserId = { ...settings, user_id: userId };

        return handleApiCall(
            set,
            () =>
                notificationsApi.upsertNotificationSettings(settingsWithUserId),
            "upsert notification settings",
            null,
            (upsertedSettings) => ({
                notificationSettings: upsertedSettings,
            }),
        );
    },

    deleteNotificationSettings: async (id) => {
        return handleVoidApiCall(
            set,
            () => notificationsApi.deleteNotificationSettings(id),
            "delete notification settings",
            () => ({
                notificationSettings: null,
            }),
        );
    },

    refresh: async (userId?: string) => {
        return handleVoidApiCallWithResult(
            set,
            async () => {
                const targetUserId = userId || getClerkInstance().user?.id;
                if (!targetUserId) {
                    throw new Error(
                        "User ID is required to refresh notification settings",
                    );
                }

                const settings = await notificationsApi.getNotificationSettings(
                    targetUserId,
                );
                return settings;
            },
            "refresh notification settings",
            (settings) => ({ notificationSettings: settings }),
        );
    },

    initializeForCurrentUser: async () => {
        const userId = getClerkInstance().user?.id;
        if (!userId) {
            throw new Error(
                "User must be authenticated to initialize notification settings",
            );
        }

        return handleVoidApiCallWithResult(
            set,
            async () => {
                // Try to get existing settings
                let settings = await notificationsApi.getNotificationSettings(
                    userId,
                );

                // If no settings exist, create default ones
                if (!settings) {
                    const defaultSettings = {
                        user_id: userId,
                        push_enabled: true,
                        email_enabled: false,
                        wake_up_time: "08:00:00",
                        sleep_time: "22:00:00",
                        timezone:
                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                        expo_push_token: null,
                        hours_of_reminders: [],
                        notification_type: [],
                    };

                    settings = await notificationsApi
                        .insertNotificationSettings(defaultSettings);
                }

                return settings;
            },
            "initialize notification settings for current user",
            (settings) => ({ notificationSettings: settings }),
        );
    },

    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    reset: () =>
        set({ notificationSettings: null, isLoading: false, error: null }),
}));

export default useNotificationSettingsStore;
