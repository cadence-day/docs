import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Updates an existing activity in the database.
 * @param activity - The activity object to update.
 * @returns A promise that resolves to the updated activity or null if update fails.
 */
export async function updateActivity(
  activity: Activity,
): Promise<Activity | null> {
  if (!activity?.id) {
    throw new Error("Activity ID is required for update.");
  }
  try {
    const id = activity.id!; // guaranteed by earlier check
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .update(activity)
        .eq("id", id)
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("updateActivity", error);
  }
}
