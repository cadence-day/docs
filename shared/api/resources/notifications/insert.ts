import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Notification } from "@/shared/types/models/notification";

/**
 * Insert new notification settings.
 */
export async function insertNotificationSettings(
    notification: Omit<Notification, "id" | "created_at" | "updated_at">,
): Promise<Notification | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .insert([notification])
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("insertNotificationSettings", error);
    }
}
