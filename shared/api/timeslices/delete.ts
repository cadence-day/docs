import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Timeslice } from "@/shared/types/models/";
import { apiCall } from "../utils/apiHelpers";
import { handleApiError } from "../utils/errorHandler";

/**
 * Deletes a timeslice by its ID.
 * @param timesliceId - The ID of the timeslice to delete.
 * @returns A promise that resolves to the deleted timeslice or null if not found.
 */
export async function deleteTimeslice(
    timesliceId: string,
): Promise<Timeslice | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("timeslices")
                .delete()
                .eq("id", timesliceId)
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("deleteTimeslice", error);
    }
}

/**
 * Deletes multiple timeslices by their IDs.
 * @param timesliceIds - An array of IDs of the timeslices to delete.
 * @returns A promise that resolves to an array of deleted timeslices.
 */
export async function deleteTimeslices(
    timesliceIds: string[],
): Promise<Timeslice[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("timeslices")
                .delete()
                .in("id", timesliceIds)
                .select();
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("deleteTimeslices", error);
    }
}
