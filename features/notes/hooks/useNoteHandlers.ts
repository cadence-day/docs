import useNotesStore from "@/shared/stores/resources/useNotesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import type { Timeslice } from "@/shared/types/models/timeslice";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useCallback } from "react";
import type { NoteItem, NoteOperations, UseNoteHandlersProps } from "../types";

type TimesliceUpsertInput =
  & Omit<Timeslice, "id">
  & Partial<Pick<Timeslice, "state_id" | "note_ids">>;

export const useNoteHandlers = ({
  notes,
  setNotes,
  deletedNoteIds,
  setDeletedNoteIds,
  energy,
  timeslice,
  noteIds,
  activeNoteIndex,
  setActiveNoteIndex,
  onClose,
}: UseNoteHandlersProps): NoteOperations => {
  const insertNote = useNotesStore((state) => state.insertNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const deleteNotes = useNotesStore((state) => state.deleteNotes);
  const insertState = useStatesStore((state) => state.insertState);
  const updateState = useStatesStore((state) => state.updateState);
  const upsertTimeslice = useTimeslicesStore((state) => state.upsertTimeslice);
  const statesStore = useStatesStore();

  const addNote = useCallback(() => {
    setNotes((prev) => [
      ...prev,
      {
        id: null,
        timeslice_id: timeslice.id || null,
        user_id: null, // Will be set when saving
        message: "",
        isNew: true,
        isSaving: false,
        hasError: false,
        isPinned: false,
      } as NoteItem,
    ]);
  }, [setNotes, timeslice.id]);

  const updateNoteMessage = useCallback(
    (index: number, message: string) => {
      setNotes((prev) => {
        const updated = prev.map((note, i) =>
          i === index ? { ...note, message } : note
        );
        return updated;
      });
    },
    [setNotes],
  );

  const deleteNoteAsync = useCallback(
    async (index: number) => {
      const noteToDelete = notes[index];

      // Remove from local state first
      setNotes((prev) => prev.filter((_, i) => i !== index));

      // Reset active note index if the deleted note was active
      if (activeNoteIndex === index) {
        setActiveNoteIndex(null);
      } else if (activeNoteIndex !== null && activeNoteIndex > index) {
        // Adjust active index if it's after the deleted note
        setActiveNoteIndex(activeNoteIndex - 1);
      }
    },
    [notes, activeNoteIndex, setNotes, setDeletedNoteIds, setActiveNoteIndex],
  );

  const saveNote = useCallback(
    async (noteIndex: number): Promise<void> => {
      const note = notes[noteIndex];
      const ts_id = timeslice.id?.toString();

      // Only save if note has content
      if (!note.message?.trim()) {
        GlobalErrorHandler.logError(
          new Error("Cannot save empty note"),
          "saveNote",
          { noteIndex, timesliceId: ts_id },
        );
        return;
      }

      if (!ts_id) {
        GlobalErrorHandler.logError(
          new Error("No timeslice ID provided"),
          "saveNote",
          { noteIndex },
        );
        return;
      }

      try {
        // Mark note as saving
        setNotes((prev) =>
          prev.map((n, i) =>
            i === noteIndex ? { ...n, isSaving: true, hasError: false } : n
          )
        );

        if (!note.isNew && note.id) {
          // Update existing note - preserve the existing user_id from the loaded note
          const noteData = {
            id: note.id,
            message: note.message,
            timeslice_id: ts_id,
            user_id: note.user_id, // Use existing user_id from loaded note
          };

          const updatedNote = await updateNote(noteData);
          if (updatedNote) {
            setNotes((prev) =>
              prev.map((n, i) =>
                i === noteIndex ? { ...n, isSaving: false, hasError: false } : n
              )
            );
          }
        } else if (note.isNew) {
          // Insert new note - API will automatically add user_id from Clerk
          const newNoteData = {
            timeslice_id: ts_id,
            message: note.message,
            user_id: null, // Will be replaced by API with authenticated user's ID
          };

          const createdNote = await insertNote(newNoteData);
          if (createdNote?.id) {
            // Update local state with created note
            setNotes((prev) =>
              prev.map((n, i) =>
                i === noteIndex
                  ? {
                    ...n,
                    id: createdNote.id,
                    user_id: createdNote.user_id, // Use the user_id returned from API
                    isNew: false,
                    isSaving: false,
                    hasError: false,
                  }
                  : n
              )
            );

            // Update timeslice with new note ID
            const updatedNoteIds = [...noteIds, createdNote.id];
            await upsertTimeslice({
              id: timeslice.id!,
              note_ids: updatedNoteIds,
            } as unknown as TimesliceUpsertInput);
          }
        }
      } catch (error) {
        GlobalErrorHandler.logError(error, "saveNote", {
          noteIndex,
          noteId: note.id,
          timesliceId: ts_id,
        });

        // Mark note as having error
        setNotes((prev) =>
          prev.map((n, i) =>
            i === noteIndex ? { ...n, isSaving: false, hasError: true } : n
          )
        );
      }
    },
    [
      notes,
      timeslice,
      noteIds,
      insertNote,
      updateNote,
      upsertTimeslice,
      setNotes,
    ],
  );

  const saveAllNotes = useCallback(async (): Promise<void> => {
    const ts_id = timeslice.id?.toString();
    if (!ts_id) {
      GlobalErrorHandler.logError(
        new Error("No timeslice ID provided"),
        "saveAllNotes",
      );
      return;
    }

    try {
      const notesToSave = notes.filter(
        (note) => (note.message?.trim()?.length ?? 0) > 0,
      );
      const updatedNoteIds = [...noteIds];

      // Save all notes with content
      for (let i = 0; i < notesToSave.length; i++) {
        const note = notesToSave[i];
        if (note.isNew) {
          // Insert new note - API will automatically add user_id from Clerk
          const newNoteData = {
            timeslice_id: ts_id,
            message: note.message,
            user_id: null, // Will be replaced by API with authenticated user's ID
          };

          const createdNote = await insertNote(newNoteData);
          if (createdNote?.id) {
            updatedNoteIds.push(createdNote.id);
          }
        } else if (note.id) {
          // Update existing note - preserve existing user_id
          const noteData = {
            id: note.id,
            message: note.message,
            timeslice_id: ts_id,
            user_id: note.user_id, // Use existing user_id from loaded note
          };
          await updateNote(noteData);
        }
      }

      // Handle energy state (simplified - only save if energy > 0)
      if (energy > 0 && ts_id) {
        const existingState = statesStore.states.find(
          (state) => state.timeslice_id === ts_id,
        );

        if (existingState) {
          const updatedState = {
            ...existingState,
            energy,
          };
          await updateState(updatedState);
        } else {
          // Insert new state - API will automatically add user_id from Clerk
          const newState = {
            timeslice_id: ts_id,
            energy,
            mood: null,
            user_id: null, // Will be replaced by API with authenticated user's ID
          };
          const createdState = await insertState(newState);
          if (createdState?.id) {
            await upsertTimeslice({
              id: ts_id,
              state_id: createdState.id,
            } as unknown as TimesliceUpsertInput);
          }
        }
      }

      // Update timeslice with final note IDs if changed
      if (updatedNoteIds.length !== noteIds.length) {
        await upsertTimeslice({
          id: ts_id,
          note_ids: updatedNoteIds,
        } as unknown as TimesliceUpsertInput);
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "saveAllNotes", {
        timesliceId: ts_id,
        notesCount: notes.length,
      });
      throw error;
    }
  }, [
    notes,
    energy,
    timeslice,
    noteIds,
    statesStore.states,
    insertNote,
    updateNote,
    insertState,
    updateState,
    upsertTimeslice,
  ]);

  const setActiveNote = useCallback(
    (index: number | null) => {
      setActiveNoteIndex(index);
    },
    [setActiveNoteIndex],
  );

  // Pin/unpin operations (local only for now)
  const pinNote = useCallback(
    (index: number) => {
      setNotes((prev) =>
        prev.map((note, i) => i === index ? { ...note, isPinned: true } : note)
      );
    },
    [setNotes],
  );

  const unpinNote = useCallback(
    (index: number) => {
      setNotes((prev) =>
        prev.map((note, i) => i === index ? { ...note, isPinned: false } : note)
      );
    },
    [setNotes],
  );

  return {
    addNote,
    updateNote: updateNoteMessage,
    // Keep the external API key `deleteNote` while using a clearer internal name
    deleteNote: deleteNoteAsync,
    saveNote,
    saveAllNotes,
    setActiveNote,
    pinNote,
    unpinNote,
  };
};
