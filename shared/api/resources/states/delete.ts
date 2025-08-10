import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { State } from "@/shared/types/models/";

/**
 * Deletes a state by its ID.
 * @param stateId - The ID of the state to delete.
 * @returns A promise that resolves to the deleted state or null if not found.
 */
export async function deleteState(
    stateId: string,
): Promise<State | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("states")
                .delete()
                .eq("id", stateId)
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("deleteState", error);
    }
}

/**
 * Deletes multiple states by their IDs.
 * @param stateIds - An array of IDs of the states to delete.
 * @returns A promise that resolves to an array of deleted states.
 */
export async function deleteStates(
    stateIds: string[],
): Promise<State[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("states")
                .delete()
                .in("id", stateIds)
                .select();
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("deleteStates", error);
    }
}
