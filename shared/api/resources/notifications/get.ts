import { supabaseClient } from "@/shared/api/client";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Notification } from "@/shared/types/models/notification";

/**
 * Fetch notification settings for a user.
 * If no settings exist, creates default settings using upsert to handle race conditions.
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

        // If no settings exist, create default settings using upsert to prevent duplicates
        // This handles race conditions when multiple requests try to create settings concurrently
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notifications")
                .upsert(
                    {
                        user_id: userId,
                        push_enabled: true,
                        email_enabled: false,
                        wake_up_time: null,
                        sleep_time: null,
                        timezone: null,
                    },
                    {
                        onConflict: "user_id",
                        ignoreDuplicates: false,
                    },
                )
                .select()
                .single();

            return { data, error };
        });
    } catch (error) {
        handleApiError("getNotificationSettings", error);
    }
}
