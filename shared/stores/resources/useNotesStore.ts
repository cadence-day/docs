import * as notesApi from "@/shared/api/resources/notes";
import type { Note } from "@/shared/types/models";
import { create } from "zustand";
import {
  type BaseStoreState,
  handleApiCall,
  handleGetApiCall,
  handleVoidApiCall,
  handleVoidApiCallWithResult,
} from "../utils/utils";

interface NotesStore extends BaseStoreState {
  // State
  notes: Note[];

  // Core operations
  // Insert operations
  insertNote: (note: Omit<Note, "id">) => Promise<Note | null>;
  insertNotes: (notes: Omit<Note, "id">[]) => Promise<Note[]>;

  // Update operations
  updateNote: (note: Note) => Promise<Note | null>;
  updateNotes: (notes: Note[]) => Promise<Note[] | null>;

  // Delete operations
  deleteNote: (id: string) => Promise<void>;
  deleteNotes: (ids: string[]) => Promise<void>;

  refresh: (userId: string) => Promise<void>;

  // Get operations
  getNote: (id: string) => Promise<Note | null>;
  getNotes: (ids: string[]) => Promise<Note[]>;
  getUserNotes: (userId: string) => Promise<Note[]>;
  getLastXNotes: (userId: string, x: number) => Promise<Note[]>;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useNotesStore = create<NotesStore>((set) => ({
  // Initial state
  notes: [],
  isLoading: false,
  error: null,

  // Core operations
  insertNote: async (note: Omit<Note, "id">) => {
    return handleApiCall(
      set,
      () => notesApi.insertNote(note),
      "create note",
      null,
      (newNote, state) =>
        newNote
          ? {
            notes: [...state.notes, newNote],
          }
          : {},
    );
  },

  insertNotes: async (notes: Omit<Note, "id">[]) => {
    return handleApiCall(
      set,
      () => notesApi.insertNotes(notes),
      "create notes",
      [],
      (newNotes, state) =>
        newNotes.length > 0
          ? {
            notes: [...state.notes, ...newNotes],
          }
          : {},
    );
  },

  updateNote: async (note: Note) => {
    return handleApiCall(
      set,
      () => notesApi.updateNote(note),
      "update note",
      null,
      (updatedNote, state) =>
        updatedNote
          ? {
            notes: state.notes.map((n) =>
              n.id === updatedNote.id ? updatedNote : n
            ),
          }
          : {},
    );
  },

  updateNotes: async (notes: Note[]) => {
    return handleApiCall(
      set,
      () => notesApi.updateNotes(notes),
      "update notes",
      null,
      (updatedNotes, state) =>
        updatedNotes && updatedNotes.length > 0
          ? {
            notes: state.notes.map((n) => {
              const updated = updatedNotes.find((un) => un.id === n.id);
              return updated || n;
            }),
          }
          : {},
    );
  },

  deleteNote: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => notesApi.deleteNote(id),
      "delete note",
      (state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      }),
    );
  },

  deleteNotes: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => notesApi.deleteNotes(ids),
      "delete notes",
      (state) => ({
        notes: state.notes.filter((n) => n.id && !ids.includes(n.id)),
      }),
    );
  },

  refresh: async (userId: string) => {
    return handleVoidApiCallWithResult(
      set,
      async () => {
        // Fetch notes for the user from remote database
        const fetchedNotes = await notesApi.getUserNotes(userId);
        return fetchedNotes;
      },
      "refresh notes",
      (fetchedNotes, state) => ({
        notes: state.notes.concat(fetchedNotes),
      }),
    );
  },

  // Get operations
  getNote: async (id: string) => {
    return handleGetApiCall(
      set,
      () => notesApi.getNoteById(id),
      "get note",
      null,
    );
  },

  getNotes: async (ids: string[]) => {
    return handleGetApiCall(
      set,
      async () => {
        const results = await Promise.all(
          ids.map((id) => notesApi.getNoteById(id)),
        );
        return results.filter(Boolean) as Note[];
      },
      "get notes",
      [],
    );
  },

  getUserNotes: async (userId: string) => {
    return handleGetApiCall(
      set,
      () => notesApi.getUserNotes(userId),
      "get user notes",
      [],
    );
  },

  getLastXNotes: async (userId: string, limit: number) => {
    return handleGetApiCall(
      set,
      () => notesApi.getLastXUserNotes(userId, limit),
      "get last notes",
      [],
    );
  },

  // Utility functions
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ notes: [], isLoading: false, error: null }),
}));

export default useNotesStore;
