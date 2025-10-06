import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Delete notification settings by ID.
 */
export async function deleteNotificationSettings(
    notificationId: string,
): Promise<void> {
    try {
        await apiCall(async () => {
            const { error } = await supabaseClient
                .from("notifications")
                .delete()
                .eq("id", notificationId);
            return { data: null, error };
        });
    } catch (error) {
        handleApiError("deleteNotificationSettings", error);
    }
}
