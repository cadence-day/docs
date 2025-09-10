import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Timeslice } from "@/shared/types/models/timeslice";
import { getClerkInstance } from "@clerk/clerk-expo";

/**
 * Inserts a new timeslice into the database.
 * @param timeslice - The timeslice object to insert.
 * @returns A promise that resolves to the inserted timeslice or null if insertion fails.
 */
export async function insertTimeslice(
  timeslice: Omit<Timeslice, "id">
): Promise<Timeslice | null> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create timeslices");
    }

    // Add user_id to the timeslice
    const timesliceWithUserId = {
      ...timeslice,
      user_id: currentUserId,
    };

    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .insert(timesliceWithUserId)
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
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create timeslices");
    }

    // Add user_id to all timeslices
    const timeslicesWithUserId = timeslices.map((timeslice) => ({
      ...timeslice,
      user_id: currentUserId,
    }));

    return await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("timeslices")
        .insert(timeslicesWithUserId)
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
 * @param timeslice - The timeslice object to upsert. Can include id for updates or omit id for inserts.
 * @returns A promise that resolves to the upserted timeslice or null if operation fails.
 */
export async function upsertTimeslice(
  timeslice:
    | Timeslice
    | (Omit<Timeslice, "id"> & Partial<Pick<Timeslice, "id">>)
): Promise<Timeslice | null> {
  try {
    // Get current user ID from Clerk (only add if not already present for updates)
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create/update timeslices");
    }

    // Add user_id if not already present (for new timeslices)
    const timesliceWithUserId = timeslice.user_id
      ? timeslice
      : {
          ...timeslice,
          user_id: currentUserId,
        };

    return await apiCall(async () => {
      // If we have an ID, this is an update operation
      if (timesliceWithUserId.id) {
        const { data, error } = await supabaseClient
          .from("timeslices")
          .update(timesliceWithUserId)
          .eq("id", timesliceWithUserId.id)
          .select()
          .single();
        return { data, error };
      } else {
        // If no ID, this is an insert operation
        const { data, error } = await supabaseClient
          .from("timeslices")
          .insert(timesliceWithUserId)
          .select()
          .single();
        return { data, error };
      }
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
 * @param timeslices - An array of timeslice objects to upsert. Can include id for updates or omit id for inserts.
 * @returns A promise that resolves to an array of upserted timeslices.
 */
export async function upsertTimeslices(
  timeslices: (
    | Timeslice
    | (Omit<Timeslice, "id"> & Partial<Pick<Timeslice, "id">>)
  )[]
): Promise<Timeslice[]> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create/update timeslices");
    }

    // Add user_id to timeslices that don't already have it
    const timeslicesWithUserId = timeslices.map((timeslice) =>
      timeslice.user_id
        ? timeslice
        : {
            ...timeslice,
            user_id: currentUserId,
          }
    );

    return await apiCall(async () => {
      // Separate timeslices into updates (with ID) and inserts (without ID)
      const toUpdate = timeslicesWithUserId.filter((t) => t.id);
      const toInsert = timeslicesWithUserId.filter((t) => !t.id);

      const results: Timeslice[] = [];

      // Handle updates
      for (const timeslice of toUpdate) {
        const { data, error } = await supabaseClient
          .from("timeslices")
          .update(timeslice)
          .eq("id", timeslice.id!)
          .select()
          .single();
        if (error) throw error;
        if (data) results.push(data);
      }

      // Handle inserts
      if (toInsert.length > 0) {
        const { data, error } = await supabaseClient
          .from("timeslices")
          .insert(toInsert)
          .select();
        if (error) throw error;
        if (data) results.push(...data);
      }

      return { data: results, error: null };
    });
  } catch (error) {
    handleApiError("upsertTimeslices", error);
  }
}
