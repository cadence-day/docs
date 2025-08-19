import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";

/**
 * Inserts a new activity into the database.
 * @param activity - The activity object to insert.
 * @returns A promise that resolves to the inserted activity or null if insertion fails.
 */
export async function insertActivity(
  activity: Omit<Activity, "id">,
): Promise<Activity | null> {
  const { data, error } = await supabaseClient
    .from("activities")
    .insert(activity)
    .select()
    .single();

  if (error) {
    console.error("Error inserting activity:", error);
    throw new Error(`Failed to insert activity: ${error.message}`);
  }

  return data as Activity | null;
}

/**
 * Inserts multiple activities into the database.
 * @param activities - An array of activity objects to insert.
 * @returns A promise that resolves to an array of inserted activities.
 */

export async function insertActivities(
  activities: Omit<Activity, "id">[],
): Promise<Activity[]> {
  const { data, error } = await supabaseClient
    .from("activities")
    .insert(activities)
    .select();

  if (error) {
    console.error("Error inserting activities:", error);
    throw new Error(`Failed to insert activities: ${error.message}`);
  }

  return data as Activity[];
}
