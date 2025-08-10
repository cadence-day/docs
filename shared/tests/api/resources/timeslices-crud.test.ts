import {
    insertTimeslice,
    insertTimeslices,
    upsertTimeslice,
    upsertTimeslices,
} from "../../../api/resources/timeslices/insert";

import { updateTimeslice } from "../../../api/resources/timeslices/update";

import {
    deleteTimeslice,
    deleteTimeslices,
} from "../../../api/resources/timeslices/delete";

import { supabaseClient } from "../../../api/client/supabaseClient";
import * as apiHelpers from "../../../api/utils/apiHelpers";
import * as errorHandler from "../../../api/utils/errorHandler";
import type { Timeslice } from "../../../types/models";

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

describe("Timeslices API - CRUD Operations", () => {
    const mockSupabaseClient = supabaseClient as jest.Mocked<
        typeof supabaseClient
    >;
    const mockApiCall = apiHelpers.apiCall as jest.MockedFunction<
        typeof apiHelpers.apiCall
    >;
    const mockHandleApiError = errorHandler
        .handleApiError as jest.MockedFunction<
            typeof errorHandler.handleApiError
        >;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Create mock timeslice helper
    const createMockTimeslice = (
        overrides: Partial<Timeslice> = {},
    ): Timeslice => ({
        id: "timeslice-1",
        activity_id: "activity-1",
        start_time: "2023-01-01T10:00:00Z",
        end_time: "2023-01-01T11:00:00Z",
        state_id: "state-1",
        note_ids: ["note-1"],
        user_id: "user-1",
        ...overrides,
    });

    describe("Insert Operations", () => {
        describe("insertTimeslice", () => {
            it("should insert a single timeslice successfully", async () => {
                const mockTimesliceInput = {
                    activity_id: "activity-1",
                    start_time: "2023-01-01T10:00:00Z",
                    end_time: "2023-01-01T11:00:00Z",
                    state_id: "state-1",
                    note_ids: ["note-1"],
                    user_id: "user-1",
                };
                const mockInsertedTimeslice = createMockTimeslice(
                    mockTimesliceInput,
                );

                mockApiCall.mockResolvedValue(mockInsertedTimeslice);

                const result = await insertTimeslice(mockTimesliceInput);

                expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
                expect(result).toEqual(mockInsertedTimeslice);
            });

            it("should call supabase with correct parameters", async () => {
                const mockTimesliceInput = {
                    activity_id: "activity-1",
                    start_time: "2023-01-01T10:00:00Z",
                    end_time: "2023-01-01T11:00:00Z",
                    state_id: "state-1",
                    note_ids: ["note-1"],
                    user_id: "user-1",
                };
                const mockInsertedTimeslice = createMockTimeslice(
                    mockTimesliceInput,
                );
                const mockQuery = {
                    insert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockInsertedTimeslice,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });

                await insertTimeslice(mockTimesliceInput);

                expect(mockSupabaseClient.from).toHaveBeenCalledWith(
                    "timeslices",
                );
                expect(mockQuery.insert).toHaveBeenCalledWith(
                    mockTimesliceInput,
                );
                expect(mockQuery.select).toHaveBeenCalled();
                expect(mockQuery.single).toHaveBeenCalled();
            });
        });

        describe("insertTimeslices", () => {
            it("should insert multiple timeslices successfully", async () => {
                const mockTimeslicesInput = [
                    {
                        activity_id: "activity-1",
                        start_time: "2023-01-01T10:00:00Z",
                        end_time: "2023-01-01T11:00:00Z",
                        state_id: "state-1",
                        note_ids: ["note-1"],
                        user_id: "user-1",
                    },
                    {
                        activity_id: "activity-2",
                        start_time: "2023-01-01T11:00:00Z",
                        end_time: "2023-01-01T12:00:00Z",
                        state_id: "state-2",
                        note_ids: ["note-2"],
                        user_id: "user-1",
                    },
                ];
                const mockInsertedTimeslices = [
                    createMockTimeslice({
                        id: "timeslice-1",
                        ...mockTimeslicesInput[0],
                    }),
                    createMockTimeslice({
                        id: "timeslice-2",
                        ...mockTimeslicesInput[1],
                    }),
                ];

                mockApiCall.mockResolvedValue(mockInsertedTimeslices);

                const result = await insertTimeslices(mockTimeslicesInput);

                expect(result).toEqual(mockInsertedTimeslices);
            });
        });

        describe("upsertTimeslice", () => {
            it("should upsert a timeslice successfully", async () => {
                const mockTimesliceInput = {
                    activity_id: "activity-1",
                    start_time: "2023-01-01T10:00:00Z",
                    end_time: "2023-01-01T11:00:00Z",
                    user_id: "user-1",
                    state_id: null,
                    note_ids: null,
                };
                const mockUpsertedTimeslice = createMockTimeslice(
                    mockTimesliceInput,
                );

                mockApiCall.mockResolvedValue(mockUpsertedTimeslice);

                const result = await upsertTimeslice(mockTimesliceInput);

                expect(result).toEqual(mockUpsertedTimeslice);
            });

            it("should call supabase with correct upsert parameters", async () => {
                const mockTimesliceInput = {
                    activity_id: "activity-1",
                    start_time: "2023-01-01T10:00:00Z",
                    end_time: "2023-01-01T11:00:00Z",
                    user_id: "user-1",
                    state_id: null,
                    note_ids: null,
                };
                const mockUpsertedTimeslice = createMockTimeslice(
                    mockTimesliceInput,
                );
                const mockQuery = {
                    upsert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockUpsertedTimeslice,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });

                await upsertTimeslice(mockTimesliceInput);

                expect(mockQuery.upsert).toHaveBeenCalledWith(
                    mockTimesliceInput,
                    { onConflict: "id" },
                );
            });
        });
    });

    describe("Update Operations", () => {
        describe("updateTimeslice", () => {
            it("should update a timeslice successfully", async () => {
                const mockTimeslice = createMockTimeslice();
                const mockUpdatedTimeslice = {
                    ...mockTimeslice,
                    end_time: "2023-01-01T12:00:00Z",
                };

                mockApiCall.mockResolvedValue(mockUpdatedTimeslice);

                const result = await updateTimeslice(mockUpdatedTimeslice);

                expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
                expect(result).toEqual(mockUpdatedTimeslice);
            });

            it("should throw error when timeslice ID is missing", async () => {
                const mockTimeslice = {
                    ...createMockTimeslice(),
                    id: undefined,
                } as any;

                await expect(updateTimeslice(mockTimeslice)).rejects.toThrow(
                    "Timeslice ID is required for update.",
                );
            });

            it("should call supabase with correct update parameters", async () => {
                const mockTimeslice = createMockTimeslice();
                const mockQuery = {
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockTimeslice,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });

                await updateTimeslice(mockTimeslice);

                expect(mockSupabaseClient.from).toHaveBeenCalledWith(
                    "timeslices",
                );
                expect(mockQuery.update).toHaveBeenCalledWith(mockTimeslice);
                expect(mockQuery.eq).toHaveBeenCalledWith(
                    "id",
                    mockTimeslice.id,
                );
                expect(mockQuery.select).toHaveBeenCalled();
                expect(mockQuery.single).toHaveBeenCalled();
            });
        });
    });

    describe("Delete Operations", () => {
        describe("deleteTimeslice", () => {
            it("should delete a timeslice successfully", async () => {
                const mockTimeslice = createMockTimeslice();
                mockApiCall.mockResolvedValue(mockTimeslice);

                const result = await deleteTimeslice("timeslice-1");

                expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
                expect(result).toEqual(mockTimeslice);
            });

            it("should call supabase with correct delete parameters", async () => {
                const mockTimeslice = createMockTimeslice();
                const mockQuery = {
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockTimeslice,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });

                await deleteTimeslice("timeslice-1");

                expect(mockSupabaseClient.from).toHaveBeenCalledWith(
                    "timeslices",
                );
                expect(mockQuery.delete).toHaveBeenCalled();
                expect(mockQuery.eq).toHaveBeenCalledWith("id", "timeslice-1");
                expect(mockQuery.select).toHaveBeenCalled();
                expect(mockQuery.single).toHaveBeenCalled();
            });
        });

        describe("deleteTimeslices", () => {
            it("should delete multiple timeslices successfully", async () => {
                const mockTimeslices = [
                    createMockTimeslice({ id: "timeslice-1" }),
                    createMockTimeslice({ id: "timeslice-2" }),
                ];
                mockApiCall.mockResolvedValue(mockTimeslices);

                const result = await deleteTimeslices([
                    "timeslice-1",
                    "timeslice-2",
                ]);

                expect(result).toEqual(mockTimeslices);
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

                await deleteTimeslices(["timeslice-1", "timeslice-2"]);

                expect(mockQuery.delete).toHaveBeenCalled();
                expect(mockQuery.in).toHaveBeenCalledWith("id", [
                    "timeslice-1",
                    "timeslice-2",
                ]);
            });
        });
    });
});
