import type { Note } from "@/shared/types/models";
import type { NoteItem } from "../types";

/**
 * Utility functions for note operations
 */

/**
 * Validates if a note has meaningful content
 */
export const isValidNote = (note: NoteItem): boolean => {
  return (note.message?.trim()?.length ?? 0) > 0;
};

/**
 * Checks if a note has content - alias for isValidNote
 */
export const hasNoteContent = (note: NoteItem): boolean => {
  return isValidNote(note);
};

/**
 * Alias for hasNoteContent - for API consistency
 */
export const hasValidNoteContent = hasNoteContent;

/**
 * Filters notes to only include those with content
 */
export const getNotesWithContent = (notes: NoteItem[]): NoteItem[] => {
  return notes.filter(hasNoteContent);
};

/**
 * Counts the number of notes with content
 */
export const countNotesWithContent = (notes: NoteItem[]): number => {
  return getNotesWithContent(notes).length;
};

/**
 * Alias for countNotesWithContent - for API consistency
 */
export const getContentfulNotesCount = countNotesWithContent;

/**
 * Checks if any notes have content
 */
export const hasAnyNoteContent = (notes: NoteItem[]): boolean => {
  return notes.some(hasNoteContent);
};

/**
 * Check if any notes in the array have unsaved changes
 */
export const hasUnsavedChanges = (notes: NoteItem[]): boolean => {
  return notes.some((note) => note.isNew && hasNoteContent(note));
};

/**
 * Creates a new empty note
 */
export const createEmptyNote = (): NoteItem => ({
  id: null,
  timeslice_id: null,
  user_id: null,
  message: "",
  isNew: true,
  isSaving: false,
  hasError: false,
  isPinned: false,
});

/**
 * Alias for createEmptyNote - for API consistency
 */
export const createEmptyNoteItem = createEmptyNote;

/**
 * Convert a database Note to a NoteItem for use in the UI
 */
export const noteToNoteItem = (note: Note): NoteItem => {
  return {
    ...note,
    message: note.message || "",
    isNew: false,
    isSaving: false,
    hasError: false,
    isPinned: false,
  };
};

/**
 * Convert multiple database Notes to NoteItems
 */
export const notesToNoteItems = (notes: Note[]): NoteItem[] => {
  return notes.filter(Boolean).map(noteToNoteItem);
};

/**
 * Checks if a note is currently being edited (has content but is new)
 */
export const isNoteBeingEdited = (note: NoteItem): boolean => {
  return note.isNew && hasNoteContent(note);
};

/**
 * Gets the word count for a note
 */
export const getNoteWordCount = (note: NoteItem): number => {
  return note.message?.trim()?.split(/\s+/)?.filter(Boolean)?.length ?? 0;
};

/**
 * Gets the character count for a note
 */
export const getNoteCharCount = (note: NoteItem): number => {
  return note.message?.length ?? 0;
};

/**
 * Truncates a note message to a specified length
 */
export const truncateNoteMessage = (
  message: string,
  maxLength: number = 100
): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength - 3) + "...";
};

/**
 * Formats a note for display in previews
 */
export const formatNotePreview = (
  note: NoteItem,
  maxLength?: number
): string => {
  const content = note.message?.trim() ?? "";
  if (!content) return "Empty note";

  // Replace line breaks with spaces for preview
  const singleLine = content.replace(/\n+/g, " ");

  return maxLength ? truncateNoteMessage(singleLine, maxLength) : singleLine;
};

/**
 * Validate energy level (0-5, where 0 means no energy set)
 */
export const isValidEnergyLevel = (energy: number): boolean => {
  return Number.isInteger(energy) && energy >= 0 && energy <= 5;
};

/**
 * Format energy level for display
 */
export const formatEnergyLevel = (energy: number): string => {
  if (!isValidEnergyLevel(energy) || energy === 0) {
    return "No energy set";
  }

  const levels = ["", "Very Low", "Low", "Medium", "High", "Very High"];
  return levels[energy] || "Unknown";
};
