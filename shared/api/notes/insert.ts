import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Note } from "@/shared/types/models/";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";

/* Insert one note.
 * @param note - The note to insert without an ID.
 * @returns A promise that resolves to the inserted note.
 */
export async function insertNote(note: Omit<Note, "id">): Promise<Note> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .insert(note)
                .single();
            // data is guaranteed on success
            return { data: data!, error };
        });
    } catch (error) {
        handleApiError("insertNote", error);
    }
}

/* Insert a batch of notes.
 * @param notes - The notes to insert without IDs.
 * @returns A promise that resolves to an array of the inserted notes.
 */
export async function insertNotes(notes: Omit<Note, "id">[]): Promise<Note[]> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .insert(notes)
                .select();
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("insertNotes", error);
    }
}
