import {
  insertState,
  insertStates,
  upsertState,
  upsertStates,
} from "../../../api/resources/states/insert";

import { updateState } from "../../../api/resources/states/update";

import {
  deleteState,
  deleteStates,
} from "../../../api/resources/states/delete";

import { supabaseClient } from "../../../api/client/supabaseClient";
import * as apiHelpers from "../../../api/utils/apiHelpers";
import * as errorHandler from "../../../api/utils/errorHandler";
import type { State } from "../../../types/models";

// Mock dependencies
jest.mock("../../../api/client/supabaseClient", () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));
jest.mock("../../../api/utils/apiHelpers");
jest.mock("../../../api/utils/errorHandler");

describe("States API - CRUD Operations", () => {
  const mockSupabaseClient = supabaseClient as jest.Mocked<
    typeof supabaseClient
  >;
  const mockApiCall = apiHelpers.apiCall as jest.MockedFunction<
    typeof apiHelpers.apiCall
  >;
  const mockHandleApiError = errorHandler.handleApiError as jest.MockedFunction<
    typeof errorHandler.handleApiError
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Create mock state helper
  const createMockState = (overrides: Partial<State> = {}): State => ({
    id: "state-1",
    energy: 8,
    mood: 7,
    timeslice_id: "timeslice-1",
    user_id: "user-1",
    ...overrides,
  });

  describe("Insert Operations", () => {
    describe("insertState", () => {
      it("should insert a single state successfully", async () => {
        const mockStateInput = {
          energy: 8,
          mood: 7,
          timeslice_id: "timeslice-1",
          user_id: "user-1",
        };
        const mockInsertedState = createMockState(mockStateInput);

        mockApiCall.mockResolvedValue(mockInsertedState);

        const result = await insertState(mockStateInput);

        expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
        expect(result).toEqual(mockInsertedState);
      });

      it("should call supabase with correct parameters", async () => {
        const mockStateInput = {
          energy: 8,
          mood: 7,
          timeslice_id: "timeslice-1",
          user_id: "user-1",
        };
        const mockInsertedState = createMockState(mockStateInput);
        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockInsertedState,
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data;
        });

        await insertState(mockStateInput);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("states");
        expect(mockQuery.insert).toHaveBeenCalledWith(mockStateInput);
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.single).toHaveBeenCalled();
      });
    });

    describe("insertStates", () => {
      it("should insert multiple states successfully", async () => {
        const mockStatesInput = [
          {
            energy: 8,
            mood: 7,
            timeslice_id: "timeslice-1",
            user_id: "user-1",
          },
          {
            energy: 6,
            mood: 8,
            timeslice_id: "timeslice-2",
            user_id: "user-1",
          },
        ];
        const mockInsertedStates = [
          createMockState({ id: "state-1", ...mockStatesInput[0] }),
          createMockState({ id: "state-2", ...mockStatesInput[1] }),
        ];

        mockApiCall.mockResolvedValue(mockInsertedStates);

        const result = await insertStates(mockStatesInput);

        expect(result).toEqual(mockInsertedStates);
      });
    });

    describe("upsertState", () => {
      it("should upsert a state successfully", async () => {
        const mockStateInput = {
          id: "state-1",
          energy: 8,
          mood: 7,
          timeslice_id: "timeslice-1",
          user_id: "user-1",
        };
        const mockUpsertedState = createMockState(mockStateInput);

        mockApiCall.mockResolvedValue(mockUpsertedState);

        const result = await upsertState(mockStateInput);

        expect(result).toEqual(mockUpsertedState);
      });

      it("should call supabase with correct upsert parameters", async () => {
        const mockStateInput = {
          energy: 8,
          mood: 7,
          timeslice_id: "timeslice-1",
          user_id: "user-1",
        };
        const mockUpsertedState = createMockState(mockStateInput);
        const mockQuery = {
          upsert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockUpsertedState,
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data;
        });

        await upsertState(mockStateInput);

        expect(mockQuery.upsert).toHaveBeenCalledWith(mockStateInput, {
          onConflict: "id",
        });
      });
    });
  });

  describe("Update Operations", () => {
    describe("updateState", () => {
      it("should update a state successfully", async () => {
        const mockState = createMockState();
        const mockUpdatedState = { ...mockState, energy: 9 };

        mockApiCall.mockResolvedValue(mockUpdatedState);

        const result = await updateState(mockUpdatedState);

        expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
        expect(result).toEqual(mockUpdatedState);
      });

      it("should throw error when state ID is missing", async () => {
        const mockState = {
          ...createMockState(),
          id: undefined,
        } as any;

        await expect(updateState(mockState)).rejects.toThrow(
          "State ID is required for update."
        );
      });

      it("should call supabase with correct update parameters", async () => {
        const mockState = createMockState();
        const mockQuery = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockState,
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data;
        });

        await updateState(mockState);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("states");
        expect(mockQuery.update).toHaveBeenCalledWith(mockState);
        expect(mockQuery.eq).toHaveBeenCalledWith("id", mockState.id);
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.single).toHaveBeenCalled();
      });
    });
  });

  describe("Delete Operations", () => {
    describe("deleteState", () => {
      it("should delete a state successfully", async () => {
        const mockState = createMockState();
        mockApiCall.mockResolvedValue(mockState);

        const result = await deleteState("state-1");

        expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
        expect(result).toEqual(mockState);
      });

      it("should call supabase with correct delete parameters", async () => {
        const mockState = createMockState();
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockState,
            error: null,
          }),
        };

        mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
        mockApiCall.mockImplementation(async (fn: any) => {
          const result = await fn();
          return result.data;
        });

        await deleteState("state-1");

        expect(mockSupabaseClient.from).toHaveBeenCalledWith("states");
        expect(mockQuery.delete).toHaveBeenCalled();
        expect(mockQuery.eq).toHaveBeenCalledWith("id", "state-1");
        expect(mockQuery.select).toHaveBeenCalled();
        expect(mockQuery.single).toHaveBeenCalled();
      });
    });

    describe("deleteStates", () => {
      it("should delete multiple states successfully", async () => {
        const mockStates = [
          createMockState({ id: "state-1" }),
          createMockState({ id: "state-2" }),
        ];
        mockApiCall.mockResolvedValue(mockStates);

        const result = await deleteStates(["state-1", "state-2"]);

        expect(result).toEqual(mockStates);
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

        await deleteStates(["state-1", "state-2"]);

        expect(mockQuery.delete).toHaveBeenCalled();
        expect(mockQuery.in).toHaveBeenCalledWith("id", ["state-1", "state-2"]);
      });
    });
  });
});
