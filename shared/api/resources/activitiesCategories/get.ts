import type { ActivityCategory } from "@/shared/types/models";
import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Fetches all activity categories.
 * @returns A promise that resolves to an array of activity categories.
 */
export async function getAllActivityCategories(): Promise<ActivityCategory[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("activity_categories")
                .select("*");
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("getAllActivityCategories", error);
    }
}
