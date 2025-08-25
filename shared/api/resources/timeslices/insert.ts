import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Timeslice } from "@/shared/types/models/timeslice";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Inserts a new timeslice into the database.
 * @param timeslice - The timeslice object to insert.
 * @returns A promise that resolves to the inserted timeslice or null if insertion fails.
 */
export async function insertTimeslice(
  timeslice: Omit<Timeslice, "id">
): Promise<Timeslice | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .insert(timeslice)
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("insertTimeslice", error);
  }
}

/**
 * Inserts multiple timeslices into the database.
 * @param timeslices - An array of timeslice objects to insert.
 * @returns A promise that resolves to an array of inserted timeslices.
 */
export async function insertTimeslices(
  timeslices: Omit<Timeslice, "id">[]
): Promise<Timeslice[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .insert(timeslices)
        .select();
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("insertTimeslices", error);
  }
}

/**
 * Upserts (inserts or updates) a timeslice in the database.
 * If a timeslice with the same primary key exists, it will be updated; otherwise, it will be inserted.
 *
 * Optional fields: state_id, note_ids
 *
 * @param timeslice - The timeslice object to upsert (state_id and notes are optional).
 * @returns A promise that resolves to the upserted timeslice or null if operation fails.
 */
export async function upsertTimeslice(
  timeslice: Omit<Timeslice, "id"> &
    Partial<Pick<Timeslice, "state_id" | "note_ids">>
): Promise<Timeslice | null> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .upsert(timeslice, { onConflict: "id" })
        .select()
        .single();
      return { data, error };
    });
  } catch (error) {
    handleApiError("upsertTimeslice", error);
  }
}

/**
 * Upserts (inserts or updates) multiple timeslices in the database.
 * If a timeslice with the same primary key exists, it will be updated; otherwise, it will be inserted.
 *
 * Optional fields: state_id, note_ids
 *
 * @param timeslices - An array of timeslice objects to upsert (state_id and notes are optional).
 * @returns A promise that resolves to an array of upserted timeslices.
 */
export async function upsertTimeslices(
  timeslices: (Omit<Timeslice, "id"> &
    Partial<Pick<Timeslice, "state_id" | "note_ids">>)[]
): Promise<Timeslice[]> {
  try {
    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .upsert(timeslices, { onConflict: "id" })
        .select();
      return { data: data ?? [], error };
    });
  } catch (error) {
    handleApiError("upsertTimeslices", error);
  }
}
