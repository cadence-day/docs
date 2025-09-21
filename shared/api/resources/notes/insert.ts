import { supabaseClient } from "@/shared/api/client/supabaseClient";
import {
  decryptNoteMessage,
  encryptNoteForInsertion,
  encryptNotesForInsertion,
} from "@/shared/api/encryption/resources/notes";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { Note } from "@/shared/types/models/";
import { getClerkInstance } from "@clerk/clerk-expo";

/* Insert one note.
 * @param note - The note to insert without an ID.
 * @returns A promise that resolves to the inserted note.
 */
export async function insertNote(note: Omit<Note, "id">): Promise<Note> {
  try {
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create notes");
    }

    // Add user_id to the note
    const noteWithUserId = {
      ...note,
      user_id: currentUserId,
    };

    // Encrypt the note message before insertion
    const encryptedNote = await encryptNoteForInsertion(noteWithUserId);

    const result = await apiCall(async () => {
      const { data, error } = await supabaseClient
        .from("notes")
        .insert(encryptedNote)
        .select("*")
        .single();
      // data is guaranteed on success
      return { data, error };
    });

    // Decrypt the note message for return
    if (result) {
      return await decryptNoteMessage(result);
    }

    throw new Error("Failed to insert note: no data returned from database.");
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
    // Get current user ID from Clerk
    const clerk = getClerkInstance();
    const currentUserId = clerk.user?.id;

    if (!currentUserId) {
      throw new Error("User must be authenticated to create notes");
    }

    // Add user_id to all notes
    const notesWithUserId = notes.map((note) => ({
      ...note,
      user_id: currentUserId,
    }));

    // Encrypt note messages before insertion
    const encryptedNotes = await encryptNotesForInsertion(notesWithUserId);

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
