import { supabaseClient } from "@/shared/api/client/supabaseClient";
import type { Note } from "@/shared/types/models/";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import {
    decryptNoteMessage,
    decryptNotesMessages,
} from "@/shared/api/encryption/resources/notes";

/* Retrieves a note by its ID.
 * @param noteId - The ID of the note to retrieve.
 * @returns A promise that resolves to the retrieved note or null if not found.
 */
export async function getNoteById(noteId: string): Promise<Note | null> {
    try {
        const result = await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .select()
                .eq("id", noteId)
                .single();
            return { data, error };
        });

        // Decrypt the note message if result exists
        if (result) {
            return await decryptNoteMessage(result);
        }

        return result;
    } catch (error) {
        handleApiError("getNoteById", error);
    }
}

/* Retrieves all users notes.
 * @returns A promise that resolves to an array of all notes.
 */
export async function getUserNotes(userId: string): Promise<Note[]> {
    try {
        const result = await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .select()
                .eq("user_id", userId);
            return { data: data ?? [], error };
        });

        // Decrypt note messages
        return await decryptNotesMessages(result);
    } catch (error) {
        handleApiError("getUserNotes", error);
    }
}

// TODO: Update columns in the public notes view to include `created_at`
/* Retrieves all users notes within a timeframe.
 * @param userId - The ID of the user whose notes to retrieve.
 * @param startDate - The start date of the timeframe in Local time.
 * @param endDate - The end date of the timeframe in Local time.
 * @returns A promise that resolves to an array of notes within the specified timeframe.
 */
export async function getUserNotesWithinTimeframe(
    userId: string,
    startDate: Date,
    endDate: Date,
): Promise<Note[]> {
    try {
        const result = await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .select()
                .eq("user_id", userId)
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());
            return { data: data ?? [], error };
        });

        // Decrypt note messages
        return await decryptNotesMessages(result);
    } catch (error) {
        handleApiError("getUserNotesWithinTimeframe", error);
    }
}

/* Retrieves last X notes for a user.
 * @param userId - The ID of the user whose notes to retrieve.
 * @param limit - The maximum number of notes to retrieve.
 * @returns A promise that resolves to an array of the last X notes.
 */
export async function getLastXUserNotes(
    userId: string,
    limit: number,
): Promise<Note[]> {
    try {
        const result = await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("notes")
                .select()
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(limit);
            return { data: data ?? [], error };
        });

        // Decrypt note messages
        return await decryptNotesMessages(result);
    } catch (error) {
        handleApiError("getLastXUserNotes", error);
    }
}
