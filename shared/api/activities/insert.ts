import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Inserts a new activity into the database.
 * @param activity - The activity object to insert.
 * @returns A promise that resolves to the inserted activity or null if insertion fails.
 */
export async function insertActivity(
  activity: Omit<Activity, "id">,
): Promise<Activity | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .insert(activity)
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("insertActivity", error);
  }
}

/**
 * Inserts multiple activities into the database.
 * @param activities - An array of activity objects to insert.
 * @returns A promise that resolves to an array of inserted activities.
 */
export async function insertActivities(
  activities: Omit<Activity, "id">[],
): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .insert(activities)
        .select();
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("insertActivities", error);
  }
}

/**
 * Upserts (inserts or updates) an activity in the database.
 * If an activity with the same primary key exists, it will be updated; otherwise, it will be inserted.
 *
 * Optional field: id
 *
 * @param activity - The activity object to upsert (id is optional).
 * @returns A promise that resolves to the upserted activity or null if operation fails.
 */
export async function upsertActivity(
  activity: Omit<Activity, "id"> & Partial<Pick<Activity, "id">>,
): Promise<Activity | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .upsert(activity, { onConflict: "id" })
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("upsertActivity", error);
  }
}

/**
 * Upserts (inserts or updates) multiple activities in the database.
 * If an activity with the same primary key exists, it will be updated; otherwise, it will be inserted.
 *
 * Optional field: id
 *
 * @param activities - An array of activity objects to upsert (id is optional).
 * @returns A promise that resolves to an array of upserted activities.
 */
export async function upsertActivities(
  activities: (Omit<Activity, "id"> & Partial<Pick<Activity, "id">>)[],
): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .upsert(activities, { onConflict: "id" })
        .select();
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("upsertActivities", error);
  }
}
