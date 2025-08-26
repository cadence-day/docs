import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import {
  decryptActivityName,
  encryptActivityName,
} from "@/shared/api/encryption/resources/activities";

/**
 * Updates an existing activity in the database.
 * @param activity - The activity object to update.
 * @returns A promise that resolves to the updated activity or null if update fails.
 */
export async function updateActivity(
  activity: Activity
): Promise<Activity | null> {
  if (!activity?.id) {
    throw new Error("Activity ID is required for update.");
  }
  try {
    const id = activity.id!; // guaranteed by earlier check

    // Encrypt the activity name before update
    const encryptedActivity = await encryptActivityName(activity);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .update(encryptedActivity)
        .eq("id", id)
        .select()
        .single();
      return { data, error };
    });

    // Decrypt the activity name for return
    if (result) {
      return await decryptActivityName(result);
    }

    return result;
  } catch (error) {
    handleApiError("updateActivity", error);
  }
}

/**
 * Updates a list of activities
 * @param activities - The list of activity objects to update.
 * @returns A promise that resolves to the updated activities or an error.
 */
export async function updateActivities(
  activities: Activity[]
): Promise<Activity[] | null> {
  if (!Array.isArray(activities) || activities.length === 0) {
    throw new Error("A list of activities is required for update.");
  }

  try {
    const updatedActivities: Activity[] = [];

    for (const activity of activities) {
      const updatedActivity = await updateActivity(activity);
      if (updatedActivity) {
        updatedActivities.push(updatedActivity);
      }
    }

    return updatedActivities;
  } catch (error) {
    handleApiError("updateActivities", error);
  }
}
