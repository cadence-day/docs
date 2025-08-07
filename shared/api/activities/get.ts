import type { Activity } from "@/shared/types/models";
import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Fetches an activity by its ID.
 * @param activityId - The ID of the activity to fetch.
 * @returns A promise that resolves to the activity or null if not found.
 */
export async function getActivity(
  activityId: string,
): Promise<Activity | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .eq("id", activityId)
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("getActivity", error);
  }
}

/**
 * Fetches multiple activities by their IDs.
 * @param activityIds - An array of IDs of the activities to fetch.
 * @returns A promise that resolves to an array of activities.
 */
export async function getActivities(
  activityIds: string[],
): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .in("id", activityIds);
      // Ensure array return type
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getActivities", error);
  }
}

/**
 * Fetches all active (ENABLED) activities for a specific user.
 * @param userId - The ID of the user whose activities to fetch.
 * @returns A promise that resolves to an array of activities.
 */
export async function getEnabledUserActivities(
  userId: string,
): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "ENABLED");
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getEnabledUserActivities", error);
  }
}

/**
 * Fetches all activities.
 * @returns A promise that resolves to an array of all activities.
 */
export async function getAllEnabledActivities(): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .eq("status", "ENABLED");
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getAllEnabledActivities", error);
  }
}

/**
 * Fetches all disabled activities
 * @returns A promise that resolves to an array of disabled activities.
 */
export async function getAllDisabledActivities(): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .eq("status", "DISABLED");
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getAllDisabledActivities", error);
  }
}

/**
 * Fetches all deleted activities.
 * @returns A promise that resolves to an array of deleted activities.
 */
export async function getAllDeletedActivities(): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .eq("status", "DELETED");
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getAllDeletedActivities", error);
  }
}

/**
 * Fetches all enabled activities for a specific activityCategory.
 * @param activityCategoryId - The id of the category of activities to fetch.
 * @returns A promise that resolves to an array of enabled activities in the specified category.
 */
export async function getEnabledActivitiesByCategory(
  activityCategoryId: string,
): Promise<Activity[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activities")
        .select("*")
        .eq("category_id", activityCategoryId)
        .eq("status", "ENABLED");
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getEnabledActivitiesByCategory", error);
  }
}
