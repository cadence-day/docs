import type { Note } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { decryptString, encryptString } from "../core";

/**
 * Encrypts the message field of a note
 * @param note - The note object to encrypt
 * @returns Promise<Note> - The note with encrypted message
 */
export async function encryptNoteMessage(note: Note): Promise<Note> {
  if (!note.message) {
    return note;
  }

  try {
    const encryptedMessage = await encryptString(note.message);
    return {
      ...note,
      message: encryptedMessage,
    };
  } catch (error) {
    // If encryption fails, return original note
    GlobalErrorHandler.logError(error, "ENCRYPTION_NOTE_MESSAGE", {
      noteId: note.id,
      operation: "encrypt",
      fallbackBehavior: "return_original",
    });
    return note;
  }
}

/**
 * Decrypts the message field of a note
 * @param note - The note object to decrypt
 * @returns Promise<Note> - The note with decrypted message
 */
export async function decryptNoteMessage(note: Note): Promise<Note> {
  if (!note.message) {
    return note;
  }

  try {
    const decryptedMessage = await decryptString(note.message);
    return {
      ...note,
      message: decryptedMessage,
    };
  } catch (error) {
    // If decryption fails, return original note
    GlobalErrorHandler.logError(error, "DECRYPTION_NOTE_MESSAGE", {
      noteId: note.id,
      operation: "decrypt",
      fallbackBehavior: "return_original",
    });
    return note;
  }
}

/**
 * Encrypts the message field of multiple notes
 * @param notes - Array of note objects to encrypt
 * @returns Promise<Note[]> - Array of notes with encrypted messages
 */
export async function encryptNotesMessages(notes: Note[]): Promise<Note[]> {
  return Promise.all(notes.map(encryptNoteMessage));
}

/**
 * Decrypts the message field of multiple notes
 * @param notes - Array of note objects to decrypt
 * @returns Promise<Note[]> - Array of notes with decrypted messages
 */
export async function decryptNotesMessages(notes: Note[]): Promise<Note[]> {
  return Promise.all(notes.map(decryptNoteMessage));
}

/**
 * Encrypts a note for insertion (message field only)
 * @param note - The note object to encrypt for insertion
 * @returns Promise<Omit<Note, "id">> - The note ready for insertion with encrypted message
 */
export async function encryptNoteForInsertion(
  note: Omit<Note, "id">
): Promise<Omit<Note, "id">> {
  if (!note.message) {
    return note;
  }

  try {
    const encryptedMessage = await encryptString(note.message);
    return {
      ...note,
      message: encryptedMessage,
    };
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_NOTE_INSERTION", {
      operation: "encrypt_for_insertion",
      fallbackBehavior: "return_original",
    });
    return note;
  }
}

/**
 * Encrypts multiple notes for insertion (message field only)
 * @param notes - Array of note objects to encrypt for insertion
 * @returns Promise<Omit<Note, "id">[]> - Array of notes ready for insertion with encrypted messages
 */
export async function encryptNotesForInsertion(
  notes: Omit<Note, "id">[]
): Promise<Omit<Note, "id">[]> {
  return Promise.all(notes.map(encryptNoteForInsertion));
}
