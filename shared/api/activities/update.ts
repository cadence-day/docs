import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";
import { ActivityIndicator } from "react-native";

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
  const { data, error } = await supabaseClient
    .from("activities")
    .update(activity)
    .eq("id", activity.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating activity:", error);
    throw new Error(`Failed to update activity: ${error.message}`);
  }

  return data as Activity | null;
}
