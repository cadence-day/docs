import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Soft deletes an activity by its ID by setting status to 'DELETED'.
 * @param activityId - The ID of the activity to soft delete.
 * @returns A promise that resolves to the updated activity or null if not found.
 */
export async function softDeleteActivity(
  activityId: string
): Promise<Activity | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .update({ status: "DELETED" })
        .eq("id", activityId)
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("softDeleteActivity", error);
  }
}

/**
 * Soft deletes multiple activities by their IDs by setting status to 'DELETED'.
 * @param activityIds - An array of IDs of the activities to soft delete.
 * @returns A promise that resolves to an array of updated activities.
 */
export async function softDeleteActivities(
  activityIds: string[]
): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .update({ status: "DELETED" })
        .in("id", activityIds)
        .select();
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("softDeleteActivities", error);
  }
}

/**
 * Disable an activity by its ID.
 * @param activityId - The ID of the activity to disable.
 * @returns A promise that resolves to the updated activity or null if not found.
 */
export async function disableActivity(
  activityId: string
): Promise<Activity | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .update({ status: "DISABLED" })
        .eq("id", activityId)
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("disableActivity", error);
  }
}

/**
 * Disables multiple activities by their IDs.
 * @param activityIds - An array of IDs of the activities to disable.
 * @returns A promise that resolves to an array of updated activities.
 */
export async function disableActivities(
  activityIds: string[]
): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .update({ status: "DISABLED" })
        .in("id", activityIds)
        .select();
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("disableActivities", error);
  }
}
