import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Activity } from "@/shared/types/models/activity";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import {
  decryptActivityName,
  encryptActivitiesForInsertion,
  encryptActivityForInsertion,
  encryptActivityName,
} from "@/shared/api/encryption/resources/activities";

/**
 * Inserts a new activity into the database.
 * @param activity - The activity object to insert.
 * @returns A promise that resolves to the inserted activity or null if insertion fails.
 */
export async function insertActivity(
  activity: Omit<Activity, "id">,
): Promise<Activity | null> {
  try {
    // Encrypt the activity name before insertion
    const encryptedActivity = await encryptActivityForInsertion(activity);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .insert(encryptedActivity)
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
    // Encrypt activity names before insertion
    const encryptedActivities = await encryptActivitiesForInsertion(activities);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .insert(encryptedActivities)
        .select();
      return { data: data ?? [], error };
    });

    // Decrypt activity names for return
    return await Promise.all(result.map(decryptActivityName));
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
    // Encrypt the activity name before upsert
    const encryptedActivity = await encryptActivityName(activity as Activity);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .upsert(encryptedActivity, { onConflict: "id" })
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
    // Encrypt activity names before upsert
    const encryptedActivities = await Promise.all(
      activities.map((activity) => encryptActivityName(activity as Activity)),
    );

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .upsert(encryptedActivities, { onConflict: "id" })
        .select();
      return { data: data ?? [], error };
    });

    // Decrypt activity names for return
    return await Promise.all(result.map(decryptActivityName));
  } catch (error) {
    handleApiError("upsertActivities", error);
  }
}
