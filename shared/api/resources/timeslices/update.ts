import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Timeslice } from "@/shared/types/models/timeslice";

/**
 * Updates an existing timeslice in the database.
 * @param timeslice - The timeslice object to update.
 * @returns A promise that resolves to the updated timeslice or null if update fails.
 */
export async function updateTimeslice(
  timeslice: Timeslice
): Promise<Timeslice | null> {
  if (!timeslice?.id) {
    throw new Error("Timeslice ID is required for update.");
  }
  try {
    const id = timeslice.id!;
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .update(timeslice)
        .eq("id", id)
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("updateTimeslice", error);
  }
}

/**
 * Bulk reassigns a list of timeslices to a new activity id.
 * Returns the updated timeslices.
 */
export async function reassignTimeslicesActivity(
  timesliceIds: string[],
  newActivityId: string
): Promise<Timeslice[]> {
  if (!Array.isArray(timesliceIds) || timesliceIds.length === 0) {
    return [];
  }
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .update({ activity_id: newActivityId })
        .in("id", timesliceIds)
        .select();
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("reassignTimeslicesActivity", error);
  }
}
