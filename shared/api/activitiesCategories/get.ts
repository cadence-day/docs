import { ActivityCategory } from "@/shared/types/models";
import { supabaseClient } from "@/shared/api/client/supabaseClient";

/**
 * Fetches all activity categories.
 * @returns A promise that resolves to an array of activity categories.
 */
export async function getAllActivityCategories(): Promise<ActivityCategory[]> {
    const { data, error } = await supabaseClient
        .from("activity_categories")
        .select("*");

    if (error) {
        console.error("Error fetching all activity categories:", error);
        throw new Error(
            `Failed to fetch all activity categories: ${error.message}`,
        );
    }

    return data as ActivityCategory[];
}
