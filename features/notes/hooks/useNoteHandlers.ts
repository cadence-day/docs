import useNotesStore from "@/shared/stores/resources/useNotesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import type { Timeslice } from "@/shared/types/models/timeslice";
import { Logger } from "@/shared/utils/errorHandler";
import { useCallback } from "react";
import type { NoteItem, NoteOperations, UseNoteHandlersProps } from "../types";

type TimesliceUpsertInput =
  & Omit<Timeslice, "id">
  & Partial<Pick<Timeslice, "state_id" | "note_ids">>;

export const useNoteHandlers = ({
  notes,
  setNotes,
  energy,
  mood,
  timeslice,
  noteIds,
  activeNoteIndex,
  setActiveNoteIndex,
}: UseNoteHandlersProps): NoteOperations => {
  const insertNote = useNotesStore((state) => state.insertNote);
  const insertNotes = useNotesStore((state) => state.insertNotes);
  const updateNote = useNotesStore((state) => state.updateNote);
  const updateNotes = useNotesStore((state) => state.updateNotes);
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
      const note = notes[index];

      try {
        // If the note has an ID, delete it from the backend
        if (note.id) {
          const deleteNote = useNotesStore.getState().deleteNote;
          await deleteNote(note.id);

          // Update timeslice to remove the note ID
          if (timeslice.id) {
            const updatedNoteIds = noteIds.filter((id) => id !== note.id);
            try {
              await upsertTimeslice({
                id: timeslice.id,
                note_ids: updatedNoteIds,
              } as unknown as TimesliceUpsertInput);
            } catch (timesliceError) {
              // Log but don't throw - note was deleted successfully
              Logger.logError(
                timesliceError,
                "updateTimesliceAfterDelete",
                {
                  timesliceId: timeslice.id,
                  deletedNoteId: note.id,
                },
              );
            }
          }
        }

        // Remove from local state
        setNotes((prev) => prev.filter((_, i) => i !== index));

        // Reset active note index if the deleted note was active
        if (activeNoteIndex === index) {
          setActiveNoteIndex(null);
        } else if (activeNoteIndex !== null && activeNoteIndex > index) {
          // Adjust active index if it's after the deleted note
          setActiveNoteIndex(activeNoteIndex - 1);
        }
      } catch (error) {
        Logger.logError(error, "deleteNoteAsync", {
          noteId: note.id,
          index,
        });
        throw error; // Re-throw so the UI can handle the error
      }
    },
    [
      notes,
      activeNoteIndex,
      setNotes,
      setActiveNoteIndex,
      timeslice.id,
      noteIds,
      upsertTimeslice,
    ],
  );

  const saveNote = useCallback(
    async (noteIndex: number): Promise<void> => {
      const note = notes[noteIndex];
      const ts_id = timeslice.id?.toString();

      // Only save if note has content
      if (!note.message?.trim()) {
        Logger.logError(
          new Error("Cannot save empty note"),
          "saveNote",
          { noteIndex, timesliceId: ts_id },
        );
        return;
      }

      if (!ts_id) {
        Logger.logError(
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
            user_id: null, // API will override with authenticated user's ID
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

            // NOTE: Database trigger automatically updates timeslice.note_ids when note is inserted
            // Removing manual timeslice update to prevent race conditions
          }
        }
      } catch (error) {
        Logger.logError(error, "saveNote", {
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
      insertNote,
      updateNote,
      setNotes,
    ],
  );

  const saveAllNotes = useCallback(async (): Promise<void> => {
    const ts_id = timeslice.id?.toString();
    if (!ts_id) {
      Logger.logError(
        new Error("No timeslice ID provided"),
        "saveAllNotes",
      );
      return;
    }

    try {
      const notesToSave = notes.filter(
        (note) => (note.message?.trim()?.length ?? 0) > 0,
      );

      // Separate new notes and existing notes for batch processing
      const newNotes = notesToSave.filter((note) => note.isNew);
      const existingNotes = notesToSave.filter((note) =>
        !note.isNew && note.id
      );

      // Batch insert new notes if available
      if (newNotes.length > 0) {
        const newNotesData = newNotes.map((note) => ({
          timeslice_id: ts_id,
          message: note.message,
          user_id: null, // Will be replaced by API with authenticated user's ID
        }));

        await insertNotes(newNotesData);
        // NOTE: Database trigger automatically updates timeslice.note_ids when notes are inserted
      }

      // Batch update existing notes if available
      if (existingNotes.length > 0) {
        const existingNotesData = existingNotes.map((note) => ({
          id: note.id!,
          message: note.message,
          timeslice_id: ts_id,
          user_id: note.user_id, // Use existing user_id from loaded note
        }));

        await updateNotes(existingNotesData);
      }

      // Handle energy and mood state (save if either > 0)
      if ((energy > 0 || mood > 0) && ts_id) {
        // First check if we have a state for this timeslice in local store
        let existingState = statesStore.states.find(
          (state) => state.timeslice_id === ts_id,
        );

        // If not found locally, try to fetch from database
        if (!existingState) {
          try {
            const fetchedState = await statesStore.getStateByTimeslice(ts_id);
            if (fetchedState) {
              existingState = fetchedState;
            }
          } catch (fetchError) {
            // If fetch fails, we'll create a new state below
            Logger.logError(fetchError, "saveAllNotes_fetchState", {
              timesliceId: ts_id,
            });
          }
        }

        if (existingState) {
          const updatedState = {
            ...existingState,
            energy,
            mood,
          };
          await updateState(updatedState);
        } else {
          // Insert new state - API will automatically add user_id from Clerk
          const newState = {
            timeslice_id: ts_id,
            energy,
            mood,
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

      // NOTE: Database trigger automatically handles timeslice.note_ids updates
      // No need to manually update timeslice - this prevents race conditions
    } catch (error) {
      Logger.logError(error, "saveAllNotes", {
        timesliceId: ts_id,
        notesCount: notes.length,
      });
      throw error;
    }
  }, [
    notes,
    energy,
    mood,
    timeslice,
    statesStore,
    insertNotes,
    updateNotes,
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
