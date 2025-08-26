import { insertNote, insertNotes } from "../../../api/resources/notes/insert";

import { updateNote, updateNotes } from "../../../api/resources/notes/update";

import { deleteNote, deleteNotes } from "../../../api/resources/notes/delete";

import { supabaseClient } from "../../../api/client/supabaseClient";
import * as apiHelpers from "../../../api/utils/apiHelpers";
import * as errorHandler from "../../../api/utils/errorHandler";
import * as encryptionNotes from "../../../api/encryption/resources/notes";
import type { Note } from "../../../types/models";

// Mock dependencies
jest.mock("../../../api/client/supabaseClient", () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));
jest.mock("../../../api/utils/apiHelpers");
jest.mock("../../../api/utils/errorHandler");
jest.mock("../../../api/encryption/resources/notes");

describe("Notes API - CRUD Operations", () => {
  const mockSupabaseClient = supabaseClient as jest.Mocked<
    typeof supabaseClient
  >;
  const mockApiCall = apiHelpers.apiCall as jest.MockedFunction<
    typeof apiHelpers.apiCall
  >;
  const mockHandleApiError = errorHandler.handleApiError as jest.MockedFunction<
    typeof errorHandler.handleApiError
  >;
  const mockDecryptNoteMessage =
    encryptionNotes.decryptNoteMessage as jest.MockedFunction<
      typeof encryptionNotes.decryptNoteMessage
    >;
  const mockEncryptNoteForInsertion =
    encryptionNotes.encryptNoteForInsertion as jest.MockedFunction<
      typeof encryptionNotes.encryptNoteForInsertion
    >;
  const mockEncryptNotesForInsertion =
    encryptionNotes.encryptNotesForInsertion as jest.MockedFunction<
      typeof encryptionNotes.encryptNotesForInsertion
    >;
  const mockEncryptNoteMessage =
    encryptionNotes.encryptNoteMessage as jest.MockedFunction<
      typeof encryptionNotes.encryptNoteMessage
    >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Create mock note helper
  const createMockNote = (overrides: Partial<Note> = {}): Note => ({
    id: "note-1",
    message: "Test note message",
    user_id: "user-1",
    timeslice_id: "timeslice-1",
    ...overrides,
  });

  describe("Insert Operations", () => {
    describe("insertNote", () => {
      it("should insert a single note successfully", async () => {
        const mockNoteInput = {
          message: "Test note message",
          user_id: "user-1",
          timeslice_id: "timeslice-1",
        };
        const mockInsertedNote = createMockNote(mockNoteInput);
        const mockEncryptedNote = {
          ...mockNoteInput,
          message: "encrypted-message",
        };

        mockEncryptNoteForInsertion.mockResolvedValue(mockEncryptedNote);
        mockApiCall.mockResolvedValue(mockInsertedNote);
        mockDecryptNoteMessage.mockResolvedValue(mockInsertedNote);

        const result = await insertNote(mockNoteInput);

        expect(mockEncryptNoteForInsertion).toHaveBeenCalledWith(mockNoteInput);
        expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
        expect(mockDecryptNoteMessage).toHaveBeenCalledWith(mockInsertedNote);
        expect(result).toEqual(mockInsertedNote);
      });

      it("should call supabase with correct parameters", async () => {
        const mockNoteInput = {
          message: "Test note message",
          user_id: "user-1",
          timeslice_id: "timeslice-1",
        };
        const mockInsertedNote = createMockNote(mockNoteInput);
        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockInsertedNote,
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockEncryptNoteForInsertion.mockResolvedValue(mockNoteInput);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data;
        });
        mockDecryptNoteMessage.mockResolvedValue(mockInsertedNote);

        await insertNote(mockNoteInput);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("notes");
        expect(mockQuery.insert).toHaveBeenCalledWith(mockNoteInput);
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.single).toHaveBeenCalled();
      });
    });

    describe("insertNotes", () => {
      it("should insert multiple notes successfully", async () => {
        const mockNotesInput = [
          {
            message: "Note 1",
            user_id: "user-1",
            timeslice_id: "timeslice-1",
          },
          {
            message: "Note 2",
            user_id: "user-1",
            timeslice_id: "timeslice-2",
          },
        ];
        const mockInsertedNotes = [
          createMockNote({ id: "note-1", ...mockNotesInput[0] }),
          createMockNote({ id: "note-2", ...mockNotesInput[1] }),
        ];

        mockEncryptNotesForInsertion.mockResolvedValue(mockNotesInput);
        mockApiCall.mockResolvedValue(mockInsertedNotes);
        mockDecryptNoteMessage
          .mockResolvedValueOnce(mockInsertedNotes[0])
          .mockResolvedValueOnce(mockInsertedNotes[1]);

        const result = await insertNotes(mockNotesInput);

        expect(mockEncryptNotesForInsertion).toHaveBeenCalledWith(
          mockNotesInput
        );
        expect(result).toEqual(mockInsertedNotes);
      });
    });
  });

  describe("Update Operations", () => {
    describe("updateNote", () => {
      it("should update a note successfully", async () => {
        const mockNote = createMockNote();
        const mockUpdatedNote = {
          ...mockNote,
          message: "Updated message",
        };

        mockEncryptNoteMessage.mockResolvedValue(mockUpdatedNote);
        mockApiCall.mockResolvedValue(mockUpdatedNote);
        mockDecryptNoteMessage.mockResolvedValue(mockUpdatedNote);

        const result = await updateNote(mockUpdatedNote);

        expect(mockEncryptNoteMessage).toHaveBeenCalledWith(mockUpdatedNote);
        expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
        expect(mockDecryptNoteMessage).toHaveBeenCalledWith(mockUpdatedNote);
        expect(result).toEqual(mockUpdatedNote);
      });

      it("should throw error when note ID is missing", async () => {
        const mockNote = { ...createMockNote(), id: undefined } as any;

        await expect(updateNote(mockNote)).rejects.toThrow(
          "Note ID is required for update."
        );
      });

      it("should call supabase with correct update parameters", async () => {
        const mockNote = createMockNote();
        const mockQuery = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockNote,
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockEncryptNoteMessage.mockResolvedValue(mockNote);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data;
        });
        mockDecryptNoteMessage.mockResolvedValue(mockNote);

        await updateNote(mockNote);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("notes");
        expect(mockQuery.update).toHaveBeenCalledWith(mockNote);
        expect(mockQuery.eq).toHaveBeenCalledWith("id", mockNote.id);
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.single).toHaveBeenCalled();
      });
    });

    describe("updateNotes", () => {
      it("should update multiple notes successfully", async () => {
        const mockNotes = [
          createMockNote({ id: "note-1" }),
          createMockNote({ id: "note-2" }),
        ];

        mockEncryptNoteMessage
          .mockResolvedValueOnce(mockNotes[0])
          .mockResolvedValueOnce(mockNotes[1]);
        mockApiCall
          .mockResolvedValueOnce(mockNotes[0])
          .mockResolvedValueOnce(mockNotes[1]);
        mockDecryptNoteMessage
          .mockResolvedValueOnce(mockNotes[0])
          .mockResolvedValueOnce(mockNotes[1]);

        const result = await updateNotes(mockNotes);

        expect(result).toEqual(mockNotes);
      });

      it("should throw error when notes array is empty", async () => {
        await expect(updateNotes([])).rejects.toThrow(
          "A list of notes is required for update."
        );
      });
    });
  });

  describe("Delete Operations", () => {
    describe("deleteNote", () => {
      it("should delete a note successfully", async () => {
        const mockNote = createMockNote();
        mockApiCall.mockResolvedValue(mockNote);

        const result = await deleteNote("note-1");

        expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
        expect(result).toEqual(mockNote);
      });

      it("should call supabase with correct delete parameters", async () => {
        const mockNote = createMockNote();
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockNote,
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data;
        });

        await deleteNote("note-1");

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("notes");
        expect(mockQuery.delete).toHaveBeenCalled();
        expect(mockQuery.eq).toHaveBeenCalledWith("id", "note-1");
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.single).toHaveBeenCalled();
      });
    });

    describe("deleteNotes", () => {
      it("should delete multiple notes successfully", async () => {
        const mockNotes = [
          createMockNote({ id: "note-1" }),
          createMockNote({ id: "note-2" }),
        ];
        mockApiCall.mockResolvedValue(mockNotes);

        const result = await deleteNotes(["note-1", "note-2"]);

        expect(result).toEqual(mockNotes);
      });

      it("should call supabase with correct parameters for multiple deletes", async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data ?? [];
        });

        await deleteNotes(["note-1", "note-2"]);

        expect(mockQuery.delete).toHaveBeenCalled();
        expect(mockQuery.in).toHaveBeenCalledWith("id", ["note-1", "note-2"]);
      });
    });
  });
});
