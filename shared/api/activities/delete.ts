import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";

/**
 * Deletes an activity by its ID.
 * @param activityId - The ID of the activity to delete.
 * @returns A promise that resolves to the deleted activity or null if not found.
 */
export async function deleteActivity(
    activityId: string,
): Promise<Activity | null> {
    const { data, error } = await supabaseClient
        .from("activities")
        .delete()
        .eq("id", activityId)
        .select()
        .single();

    if (error) {
        console.error("Error deleting activity:", error);
        throw new Error(`Failed to delete activity: ${error.message}`);
    }

    return data as Activity | null;
}

/**
 * Deletes multiple activities by their IDs.
 * @param activityIds - An array of IDs of the activities to delete.
 * @returns A promise that resolves to an array of deleted activities.
 */
export async function deleteActivities(
    activityIds: string[],
): Promise<Activity[]> {
    const { data, error } = await supabaseClient
        .from("activities")
        .delete()
        .in("id", activityIds)
        .select();

    if (error) {
        console.error("Error deleting activities:", error);
        throw new Error(`Failed to delete activities: ${error.message}`);
    }

    return data as Activity[];
}
