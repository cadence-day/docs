import type { State } from "@/shared/types/models";
import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Fetches a state by its ID.
 * @param stateId - The ID of the state to fetch.
 * @returns A promise that resolves to the state or null if not found.
 */
export async function getState(stateId: string): Promise<State | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("states")
        .select("*")
        .eq("id", stateId)
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("getState", error);
  }
}

/**
 * Fetches multiple states by their IDs.
 * @param stateIds - An array of IDs of the states to fetch.
 * @returns A promise that resolves to an array of states.
 */
export async function getStates(stateIds: string[]): Promise<State[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("states")
        .select("*")
        .in("id", stateIds);
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getStates", error);
  }
}

/**
 * Fetches all states for a specific user.
 * @param userId - The ID of the user whose states to fetch.
 * @returns A promise that resolves to an array of states.
 */
export async function getUserStates(userId: string): Promise<State[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("states")
        .select("*")
        .eq("user_id", userId);
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getUserStates", error);
  }
}

/**
 * Fetches all states.
 * @returns A promise that resolves to an array of all states.
 */
export async function getAllStates(): Promise<State[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient.from("states").select("*");
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getAllStates", error);
  }
}
