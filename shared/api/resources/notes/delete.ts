import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Note } from "@/shared/types/models";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/**
 * Deletes a note by its ID.
 * @param noteId - The ID of the note to delete.
 * @returns A promise that resolves to the deleted note or null if not found.
 */
export async function deleteNote(
    noteId: string,
): Promise<Note | null> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .delete()
                .eq("id", noteId)
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("deleteNote", error);
    }
}

/**
 * Deletes multiple notes by their IDs.
 * @param noteIds - An array of IDs of the notes to delete.
 * @returns A promise that resolves to an array of deleted notes.
 */
export async function deleteNotes(
    notesIds: string[],
): Promise<Note[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .delete()
                .in("id", notesIds)
                .select();
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("deleteNotes", error);
    }
}
