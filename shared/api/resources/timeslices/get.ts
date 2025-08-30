import { Timeslice } from "@/shared/types/models";
import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Fetches a timeslice by its ID.
 * @param timesliceId - The ID of the timeslice to fetch.
 * @returns A promise that resolves to the timeslice or null if not found.
 */
export async function getTimeslice(
  timesliceId: string
): Promise<Timeslice | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .select("*")
        .eq("id", timesliceId)
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("getTimeslice", error);
  }
}

/**
 * Fetches multiple timeslices by their IDs.
 * @param timesliceIds - An array of IDs of the timeslices to fetch.
 * @returns A promise that resolves to an array of timeslices.
 */
export async function getTimeslices(
  timesliceIds: string[]
): Promise<Timeslice[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .select("*")
        .in("id", timesliceIds);
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getTimeslices", error);
  }
}

/**
 * Fetches all timeslices for a specific user.
 * @param userId - The ID of the user whose timeslices to fetch.
 * @returns A promise that resolves to an array of timeslices.
 */
export async function getUserTimeslices(userId: string): Promise<Timeslice[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .select("*")
        .eq("user_id", userId);
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getUserTimeslices", error);
  }
}

/**
 * Fetches all timeslices.
 * @returns A promise that resolves to an array of all timeslices.
 */
export async function getAllTimeslices(): Promise<Timeslice[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .select("*");
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getAllTimeslices", error);
  }
}
