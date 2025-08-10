import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { State } from "@/shared/types/models/state";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Inserts a new state into the database.
 * @param state - The state object to insert.
 * @returns A promise that resolves to the inserted state or null if insertion fails.
 */
export async function insertState(
    state: Omit<State, "id">,
): Promise<State | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("states")
                .insert(state)
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("insertState", error);
    }
}

/**
 * Inserts multiple states into the database.
 * @param states - An array of state objects to insert.
 * @returns A promise that resolves to an array of inserted states.
 */
export async function insertStates(
    states: Omit<State, "id">[],
): Promise<State[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("states")
                .insert(states)
                .select();
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("insertStates", error);
    }
}

/**
 * Upserts (inserts or updates) a state in the database.
 * If a state with the same primary key exists, it will be updated; otherwise, it will be inserted.
 *
 * Optional field: id
 *
 * @param state - The state object to upsert (id is optional).
 * @returns A promise that resolves to the upserted state or null if operation fails.
 */
export async function upsertState(
    state: Omit<State, "id"> & Partial<Pick<State, "id">>,
): Promise<State | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("states")
                .upsert(state, { onConflict: "id" })
                .select()
                .single();
            if (data == null) {
                throw new Error(
                    "Failed to upsert state: no data returned from database.",
                );
            }
            return { data, error };
        });
    } catch (error) {
        handleApiError("upsertState", error);
    }
}

/**
 * Upserts (inserts or updates) multiple states in the database.
 * If a state with the same primary key exists, it will be updated; otherwise, it will be inserted.
 *
 * Optional field: id
 *
 * @param states - An array of state objects to upsert (id is optional).
 * @returns A promise that resolves to an array of upserted states.
 */
export async function upsertStates(
    states: (Omit<State, "id"> & Partial<Pick<State, "id">>)[],
): Promise<State[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("states")
                .upsert(states, { onConflict: "id" })
                .select();
            if (data == null) {
                throw new Error(
                    "Failed to upsert states: no data returned from database.",
                );
            }
            return { data, error };
        });
    } catch (error) {
        handleApiError("upsertStates", error);
    }
}
