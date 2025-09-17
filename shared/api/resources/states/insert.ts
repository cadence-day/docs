import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { State } from "@/shared/types/models/state";
import { getClerkInstance } from "@clerk/clerk-expo";

/**
 * Inserts a new state into the database.
 * @param state - The state object to insert.
 * @returns A promise that resolves to the inserted state or null if insertion fails.
 */
export async function insertState(
  state: Omit<State, "id">
): Promise<State | null> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create states");
    }

    // Add user_id to the state
    const stateWithUserId = {
      ...state,
      user_id: currentUserId,
    };

    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("states")
        .insert(stateWithUserId)
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
  states: Omit<State, "id">[]
): Promise<State[]> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create states");
    }

    // Add user_id to all states
    const statesWithUserId = states.map((state) => ({
      ...state,
      user_id: currentUserId,
    }));

    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("states")
        .insert(statesWithUserId)
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
  state: Omit<State, "id"> & Partial<Pick<State, "id">>
): Promise<State | null> {
  try {
    // Get current user ID from Clerk (only add if not already present for updates)
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create/update states");
    }

    // Add user_id if not already present (for new states)
    const stateWithUserId = state.user_id
      ? state
      : {
          ...state,
          user_id: currentUserId,
        };

    return await apiCall(async () => {
      // If we have an ID, this is an update operation
      if (stateWithUserId.id) {
        const { data, error } = await supabaseClient
          .from("states")
          .update(stateWithUserId)
          .eq("id", stateWithUserId.id)
          .select()
          .single();
        return { data, error };
      } else {
        // If no ID, this is an insert operation
        const { data, error } = await supabaseClient
          .from("states")
          .insert(stateWithUserId)
          .select()
          .single();
        return { data, error };
      }
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
  states: (Omit<State, "id"> & Partial<Pick<State, "id">>)[]
): Promise<State[]> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create/update states");
    }

    // Add user_id to states that don't already have it
    const statesWithUserId = states.map((state) =>
      state.user_id
        ? state
        : {
            ...state,
            user_id: currentUserId,
          }
    );

    return await apiCall(async () => {
      // Separate states into updates (with ID) and inserts (without ID)
      const toUpdate = statesWithUserId.filter((s) => s.id);
      const toInsert = statesWithUserId.filter((s) => !s.id);

      const results: State[] = [];

      // Handle updates
      for (const state of toUpdate) {
        const { data, error } = await supabaseClient
          .from("states")
          .update(state)
          .eq("id", state.id!)
          .select()
          .single();
        if (error) throw error;
        if (data) results.push(data);
      }

      // Handle inserts
      if (toInsert.length > 0) {
        const { data, error } = await supabaseClient
          .from("states")
          .insert(toInsert)
          .select();
        if (error) throw error;
        if (data) results.push(...data);
      }

      return { data: results, error: null };
    });
  } catch (error) {
    handleApiError("upsertStates", error);
  }
}
