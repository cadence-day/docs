import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import { Timeslice } from "@/shared/types/models";

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

/**
 * Fetches all timeslices associated with a specific activity id.
 */
export async function getTimeslicesByActivityId(
  activityId: string
): Promise<Timeslice[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .select("*")
        .eq("activity_id", activityId);
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getTimeslicesByActivityId", error);
  }
}

/**
 * Fetches timeslices within a UTC date range (start inclusive, end exclusive).
 * @param startUtc - start Date (inclusive)
 * @param endUtc - end Date (exclusive)
 */
export async function getTimeslicesFromTo(
  startUtc: Date,
  endUtc: Date
): Promise<Timeslice[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .select("*")
        .gte("start_time", startUtc.toISOString())
        .lte("end_time", endUtc.toISOString());
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("getTimeslicesFromTo", error);
  }
}
