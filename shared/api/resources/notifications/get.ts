import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Notification } from "@/shared/types/models/notification";

/**
 * Fetch notification settings for a user.
 */
export async function getNotificationSettings(
    userId: string,
): Promise<Notification | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("getNotificationSettings", error);
    }
}

/**
 * Fetch all notification settings.
 */
export async function getAllNotificationSettings(): Promise<Notification[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .select("*");
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("getAllNotificationSettings", error);
    }
}
