import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Notification } from "@/shared/types/models/notification";

/**
 * Fetch notification settings for a user.
 * If no settings exist, creates default settings.
 * Handles the case where there might be multiple rows (takes the most recent one).
 */
export async function getNotificationSettings(
    userId: string,
): Promise<Notification | null> {
    try {
        // First, try to get existing settings
        const existing = await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            // maybeSingle() returns null if no rows, or the single row if exactly one
            // limit(1) ensures we don't get multiple rows error
            return { data: data ?? null, error };
        });

        // If settings exist, return them
        if (existing) {
            return existing;
        }

        // If no settings exist, create default settings
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .insert([
                    {
                        user_id: userId,
                        push_enabled: true,
                        email_enabled: false,
                        wake_up_time: null,
                        sleep_time: null,
                        timezone: null,
                    },
                ])
                .select()
                .single();

            return { data, error };
        });
    } catch (error) {
        handleApiError("getNotificationSettings", error);
    }
}
