import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { State } from "@/shared/types/models/state";

/**
 * Updates an existing state in the database.
 * @param state - The state object to update.
 * @returns A promise that resolves to the updated state or null if update fails.
 */
export async function updateState(
    state: State,
): Promise<State | null> {
    if (!state?.id) {
        throw new Error("State ID is required for update.");
    }
    try {
        const id = state.id!;
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("states")
                .update(state)
                .eq("id", id)
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("updateState", error);
    }
}
