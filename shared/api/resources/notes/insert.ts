import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Note } from "@/shared/types/models/";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import {
  decryptNoteMessage,
  encryptNoteForInsertion,
  encryptNotesForInsertion,
} from "@/shared/api/encryption/resources/notes";

/* Insert one note.
 * @param note - The note to insert without an ID.
 * @returns A promise that resolves to the inserted note.
 */
export async function insertNote(note: Omit<Note, "id">): Promise<Note> {
  try {
    // Encrypt the note message before insertion
    const encryptedNote = await encryptNoteForInsertion(note);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("notes")
        .insert(encryptedNote)
        .select()
        .single();
      if (data == null) {
        throw new Error(
          "Failed to insert note: no data returned from database."
        );
      }
      // data is guaranteed on success
      return { data, error };
    });

    // Decrypt the note message for return
    return await decryptNoteMessage(result);
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
    // Encrypt note messages before insertion
    const encryptedNotes = await encryptNotesForInsertion(notes);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("notes")
        .insert(encryptedNotes)
        .select();
      return { data: data ?? [], error };
    });

    // Decrypt note messages for return
    return await Promise.all(result.map(decryptNoteMessage));
  } catch (error) {
    handleApiError("insertNotes", error);
  }
}
