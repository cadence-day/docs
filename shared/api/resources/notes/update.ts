import { supabaseClient } from "@/shared/api/client/supabaseClient";
import {
  decryptNoteMessage,
  encryptNoteMessage,
} from "@/shared/api/encryption/resources/notes";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
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

    // Encrypt the note message before update
    const encryptedNote = await encryptNoteMessage(note);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("notes")
        .update(encryptedNote)
        .eq("id", id)
        .select()
        .single();
      return { data, error };
    });

    // Decrypt the note message for return
    if (result) {
      return await decryptNoteMessage(result);
    }

    throw new Error("Failed to update note: no data returned from database.");
  } catch (error) {
    handleApiError("updateNote", error);
  }
}

/* Update multiple notes.
 * @param notes - The list of notes to update.
 * @returns A promise that resolves to the updated notes.
 */
export async function updateNotes(notes: Note[]): Promise<Note[]> {
  if (!Array.isArray(notes) || notes.length === 0) {
    throw new Error("A list of notes is required for update.");
  }

  try {
    const updatedNotes: Note[] = [];

    for (const note of notes) {
      const updatedNote = await updateNote(note);
      if (updatedNote) {
        updatedNotes.push(updatedNote);
      }
    }

    return updatedNotes;
  } catch (error) {
    handleApiError("updateNotes", error);
  }
}
