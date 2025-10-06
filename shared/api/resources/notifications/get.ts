import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Notification } from "@/shared/types/models/notification";

/**
 * Fetch notification settings for a user.
 * Handles the case where there might be multiple rows (takes the most recent one)
 * or no rows (returns null).
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

            // Return the first row or null if no rows exist
            return { data: data ?? null, error };
        });
    } catch (error) {
        handleApiError("getNotificationSettings", error);
    }
}
