import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { ActivityCategory } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

/**
 * Fetches all activity categories.
 * @returns A promise that resolves to an array of activity categories.
 */
export async function getAllActivityCategories(): Promise<ActivityCategory[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("activity_categories")
        .select("*");
      GlobalErrorHandler.logDebug(
        "getAllActivityCategories",
        "Fetched activity categories",
        { count: data?.length ?? 0, error }
      );
      if (error) {
        throw error;
      }
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getAllActivityCategories", error);
  }
}
