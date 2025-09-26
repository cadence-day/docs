import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Notification } from "@/shared/types/models/notification";

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
 */
export async function upsertNotificationSettings(
    notification: Omit<Notification, "id"> & Partial<Pick<Notification, "id">>,
): Promise<Notification | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .upsert(notification, { onConflict: "user_id" })
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("upsertNotificationSettings", error);
    }
}
