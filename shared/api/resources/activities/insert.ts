import { supabaseClient } from "@/shared/api/client/supabaseClient";
import {
  decryptActivityName,
  encryptActivitiesForInsertion,
  encryptActivityForInsertion,
  encryptActivityName,
} from "@/shared/api/encryption/resources/activities";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Activity } from "@/shared/types/models/activity";
import { getClerkInstance } from "@clerk/clerk-expo";

/**
 * Inserts a new activity into the database.
 * @param activity - The activity object to insert.
 * @returns A promise that resolves to the inserted activity or null if insertion fails.
 */
export async function insertActivity(
  activity: Omit<Activity, "id">
): Promise<Activity | null> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create activities");
    }

    // Add user_id to the activity
    const activityWithUserId = {
      ...activity,
      user_id: currentUserId,
    };

    // Encrypt the activity name before insertion
    const encryptedActivity =
      await encryptActivityForInsertion(activityWithUserId);

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
  activities: Omit<Activity, "id">[]
): Promise<Activity[]> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create activities");
    }

    // Add user_id to all activities
    const activitiesWithUserId = activities.map((activity) => ({
      ...activity,
      user_id: currentUserId,
    }));

    // Encrypt activity names before insertion
    const encryptedActivities =
      await encryptActivitiesForInsertion(activitiesWithUserId);

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
  activity: Omit<Activity, "id"> & Partial<Pick<Activity, "id">>
): Promise<Activity | null> {
  try {
    // Get current user ID from Clerk (only add if not already present for updates)
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create/update activities");
    }

    // Add user_id if not already present (for new activities)
    const activityWithUserId = activity.user_id
      ? activity
      : {
          ...activity,
          user_id: currentUserId,
        };

    // Encrypt the activity name before upsert
    const encryptedActivity = await encryptActivityName(
      activityWithUserId as Activity
    );

    const result = await apiCall(async () => {
      // If we have an ID, this is an update operation
      if (encryptedActivity.id) {
        const { data, error } = await supabaseClient
          .from("activities")
          .update(encryptedActivity)
          .eq("id", encryptedActivity.id)
          .select()
          .single();
        return { data, error };
      } else {
        // If no ID, this is an insert operation
        const { data, error } = await supabaseClient
          .from("activities")
          .insert(encryptedActivity)
          .select()
          .single();
        return { data, error };
      }
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
  activities: (Omit<Activity, "id"> & Partial<Pick<Activity, "id">>)[]
): Promise<Activity[]> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create/update activities");
    }

    // Add user_id to activities that don't already have it
    const activitiesWithUserId = activities.map((activity) =>
      activity.user_id
        ? activity
        : {
            ...activity,
            user_id: currentUserId,
          }
    );

    // Encrypt activity names before upsert
    const encryptedActivities = await Promise.all(
      activitiesWithUserId.map((activity) =>
        encryptActivityName(activity as Activity)
      )
    );

    const result = await apiCall(async () => {
      // Separate activities into updates (with ID) and inserts (without ID)
      const toUpdate = encryptedActivities.filter((a) => a.id);
      const toInsert = encryptedActivities.filter((a) => !a.id);

      const results: Activity[] = [];

      // Handle updates
      for (const activity of toUpdate) {
        const { data, error } = await supabaseClient
          .from("activities")
          .update(activity)
          .eq("id", activity.id!)
          .select()
          .single();
        if (error) throw error;
        if (data) results.push(data);
      }

      // Handle inserts
      if (toInsert.length > 0) {
        const { data, error } = await supabaseClient
          .from("activities")
          .insert(toInsert)
          .select();
        if (error) throw error;
        if (data) results.push(...data);
      }

      return { data: results, error: null };
    });

    // Decrypt activity names for return
    return await Promise.all(result.map(decryptActivityName));
  } catch (error) {
    handleApiError("upsertActivities", error);
  }
}
