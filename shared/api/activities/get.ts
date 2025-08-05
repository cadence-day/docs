import { Activity } from "@/shared/types/models";
import { supabaseClient } from "@/shared/api/client/supabaseClient";

/**
 * Fetches an activity by its ID.
 * @param activityId - The ID of the activity to fetch.
 * @returns A promise that resolves to the activity or null if not found.
 */
export async function getActivity(
  activityId: string,
): Promise<Activity | null> {
  const { data, error } = await supabaseClient
    .from("activities")
    .select("*")
    .eq("id", activityId)
    .single();

  if (error) {
    console.error("Error fetching activity:", error);
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }

  return data as Activity | null;
}

/**
 * Fetches multiple activities by their IDs.
 * @param activityIds - An array of IDs of the activities to fetch.
 * @returns A promise that resolves to an array of activities.
 */
export async function getActivities(
  activityIds: string[],
): Promise<Activity[]> {
  const { data, error } = await supabaseClient
    .from("activities")
    .select("*")
    .in("id", activityIds);

  if (error) {
    console.error("Error fetching activities:", error);
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  return data as Activity[];
}

/**
 * Fetches all activities for a specific user.
 * @param userId - The ID of the user whose activities to fetch.
 * @returns A promise that resolves to an array of activities.
 */
export async function getUserActivities(
  userId: string,
): Promise<Activity[]> {
  const { data, error } = await supabaseClient
    .from("activities")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user activities:", error);
    throw new Error(`Failed to fetch user activities: ${error.message}`);
  }

  return data as Activity[];
}

/**
 * Fetches all activities.
 * @returns A promise that resolves to an array of all activities.
 */
export async function getAllActivities(): Promise<Activity[]> {
  const { data, error } = await supabaseClient
    .from("activities")
    .select("*");

  if (error) {
    console.error("Error fetching all activities:", error);
    throw new Error(`Failed to fetch all activities: ${error.message}`);
  }

  return data as Activity[];
}
