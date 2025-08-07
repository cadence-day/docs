import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Note } from "@/shared/types/models/";

/* Update an existing note.
 * @param note - The note to update, including its ID.
 * @returns A promise that resolves to the updated note.
 */
export async function updateNote(note: Note): Promise<Note> {
    if (!note?.id) {
        throw new Error("Note ID is required for update.");
    }
    try {
        const id = note.id!;
        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .update(note)
                .eq("id", id)
                .select()
                .single();
            return { data: data!, error };
        });
    } catch (error) {
        handleApiError("updateNote", error);
    }
}
