import useNotesStore from "@/shared/stores/resources/useNotesStore";
import { tool } from "ai";
import { format } from "date-fns";
import { z } from "zod";

export const getUserNotesTool = tool({
  description:
    "Get all notes for the current user. Returns a list of all user notes with their content, timestamps, and associated timeslices.",
  inputSchema: z.object({
    limit: z.number().optional().describe(
      "Maximum number of notes to return. If not provided, returns all notes.",
    ),
  }),
  execute: async ({ limit }) => {
    try {
      const store = useNotesStore.getState();
      const notes = store.notes;

      if (!notes || notes.length === 0) {
        return {
          success: false,
          message: "No notes found",
          data: [],
        };
      }

      const sortedNotes = [...notes].sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Most recent first
      });

      const limitedNotes = limit ? sortedNotes.slice(0, limit) : sortedNotes;

      return {
        success: true,
        message: `Found ${limitedNotes.length} note${
          limitedNotes.length !== 1 ? "s" : ""
        }`,
        data: limitedNotes.map((note) => ({
          id: note.id,
          content: note.content,
          timesliceId: note.timeslice_id,
          createdAt: note.created_at
            ? format(new Date(note.created_at), "yyyy-MM-dd HH:mm:ss")
            : null,
        })),
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching notes: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: [],
      };
    }
  },
});

export const getNoteByIdTool = tool({
  description: "Get a specific note by its ID",
  inputSchema: z.object({
    noteId: z.string().describe("The ID of the note to fetch"),
  }),
  execute: async ({ noteId }) => {
    try {
      const store = useNotesStore.getState();
      const note = await store.getNote(noteId);

      if (!note) {
        return {
          success: false,
          message: `Note with ID ${noteId} not found`,
          data: null,
        };
      }

      return {
        success: true,
        message: "Note found",
        data: {
          id: note.id,
          content: note.content,
          timesliceId: note.timeslice_id,
          createdAt: note.created_at
            ? format(new Date(note.created_at), "yyyy-MM-dd HH:mm:ss")
            : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error fetching note: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        data: null,
      };
    }
  },
});
