import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Notification } from "@/shared/types/models/notification";
import { Logger } from "@/shared/utils/errorHandler";

/**
 * Update notification settings for a user.
 */
export async function updateNotificationSettings(
    notification: Notification,
): Promise<Notification | null> {
    if (!notification?.id) {
        throw new Error("Notification ID is required for update.");
    }
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .update(notification)
                .eq("id", notification.id as string)
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("updateNotificationSettings", error);
    }
}

/**
 * Upsert notification settings for a user.
 * Handles potential duplicate rows by first cleaning up and then inserting/updating.
 */
export async function upsertNotificationSettings(
    notification: Omit<Notification, "id"> & Partial<Pick<Notification, "id">>,
): Promise<Notification | null> {
    try {
        return await apiCall(async () => {
            // If there's no ID, we need to handle potential duplicates
            if (!notification.id && notification.user_id) {
                // First, delete any existing rows for this user to prevent duplicates
                const { error: deleteError } = await supabaseClient
                    .from("notifications")
                    .delete()
                    .eq("user_id", notification.user_id);

                if (deleteError) {
                    Logger.logWarning(
                        "Failed to clean up duplicate notification settings",
                        "upsertNotificationSettings_cleanup",
                        deleteError,
                    );
                }
            }

            // Now perform the upsert
            const { data, error } = await supabaseClient
                .from("notifications")
                .upsert(notification, { onConflict: "user_id" })
                .select()
                .single();

            // Return the first row or null
            return { data: data ?? null, error };
        });
    } catch (error) {
        handleApiError("upsertNotificationSettings", error);
    }
}
