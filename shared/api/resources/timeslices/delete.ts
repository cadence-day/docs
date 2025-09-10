import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Timeslice } from "@/shared/types/models/";
import { apiCall } from "../../utils/apiHelpers";
import { handleApiError } from "../../utils/errorHandler";

/**
 * Deletes a timeslice by its ID.
 * @param timesliceId - The ID of the timeslice to delete.
 * @returns A promise that resolves to the deleted timeslice or null if not found.
 */
export async function deleteTimeslice(
  timesliceId: string
): Promise<Timeslice | null> {
  try {
    console.log(`[deleteTimeslice] Starting deletion for ID: ${timesliceId}`);

    const result = await apiCall(
      async () => {
        const { data, error } = await supabaseClient
          .from("timeslices")
          .delete()
          .eq("id", timesliceId)
          .select()
          .single();

        console.log(`[deleteTimeslice] Database response:`, { data, error });
        return { data, error };
      },
      {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
      }
    );

    console.log(`[deleteTimeslice] Completed for ID: ${timesliceId}`, result);
    return result;
  } catch (error) {
    console.error(
      `[deleteTimeslice] Error deleting timeslice ${timesliceId}:`,
      error
    );
    handleApiError("deleteTimeslice", error);
  }
}

/**
 * Deletes multiple timeslices by their IDs.
 * @param timesliceIds - An array of IDs of the timeslices to delete.
 * @returns A promise that resolves to an array of deleted timeslices.
 */
export async function deleteTimeslices(
  timesliceIds: string[]
): Promise<Timeslice[]> {
  try {
    console.log(`[deleteTimeslices] Starting deletion for IDs:`, timesliceIds);

    const result = await apiCall(
      async () => {
        const { data, error } = await supabaseClient
          .from("timeslices")
          .delete()
          .in("id", timesliceIds)
          .select();

        console.log(`[deleteTimeslices] Database response:`, { data, error });
        return { data: data ?? [], error };
      },
      {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
      }
    );

    console.log(`[deleteTimeslices] Completed for IDs:`, timesliceIds, result);
    return result;
  } catch (error) {
    console.error(`[deleteTimeslices] Error deleting timeslices:`, error);
    handleApiError("deleteTimeslices", error);
  }
}
