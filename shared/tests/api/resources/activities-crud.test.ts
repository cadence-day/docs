import {
    insertActivities,
    insertActivity,
    upsertActivities,
    upsertActivity,
} from "../../../api/resources/activities/insert";

import {
    updateActivities,
    updateActivity,
} from "../../../api/resources/activities/update";

import {
    disableActivities,
    disableActivity,
    softDeleteActivities,
    softDeleteActivity,
} from "../../../api/resources/activities/delete";

import { supabaseClient } from "../../../api/client/supabaseClient";
import * as apiHelpers from "../../../api/utils/apiHelpers";
import * as errorHandler from "../../../api/utils/errorHandler";
import * as encryptionActivities from "../../../api/encryption/resources/activities";
import type { Activity } from "../../../types/models";

// Mock dependencies
jest.mock("../../../api/client/supabaseClient", () => ({
    supabaseClient: {
        from: jest.fn(() => ({
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
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
jest.mock("../../../api/encryption/resources/activities");

describe("Activities API - CRUD Operations", () => {
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
    const mockDecryptActivityName = encryptionActivities
        .decryptActivityName as jest.MockedFunction<
            typeof encryptionActivities.decryptActivityName
        >;
    const mockEncryptActivityForInsertion = encryptionActivities
        .encryptActivityForInsertion as jest.MockedFunction<
            typeof encryptionActivities.encryptActivityForInsertion
        >;
    const mockEncryptActivitiesForInsertion = encryptionActivities
        .encryptActivitiesForInsertion as jest.MockedFunction<
            typeof encryptionActivities.encryptActivitiesForInsertion
        >;
    const mockEncryptActivityName = encryptionActivities
        .encryptActivityName as jest.MockedFunction<
            typeof encryptionActivities.encryptActivityName
        >;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Create mock activity helper
    const createMockActivity = (
        overrides: Partial<Activity> = {},
    ): Activity => ({
        id: "activity-1",
        name: "Test Activity",
        user_id: "user-1",
        activity_category_id: "cat-1",
        status: "ENABLED",
        color: "#FF0000",
        parent_activity_id: null,
        weight: 1,
        ...overrides,
    });

    describe("Insert Operations", () => {
        describe("insertActivity", () => {
            it("should insert a single activity successfully", async () => {
                const mockActivityInput = {
                    name: "Test Activity",
                    user_id: "user-1",
                    activity_category_id: "cat-1",
                    status: "ENABLED" as const,
                    color: "#FF0000",
                    parent_activity_id: null,
                    weight: 1,
                };
                const mockInsertedActivity = createMockActivity(
                    mockActivityInput,
                );
                const mockEncryptedActivity = {
                    ...mockActivityInput,
                    name: "encrypted-name",
                };

                mockEncryptActivityForInsertion.mockResolvedValue(
                    mockEncryptedActivity,
                );
                mockApiCall.mockResolvedValue(mockInsertedActivity);
                mockDecryptActivityName.mockResolvedValue(mockInsertedActivity);

                const result = await insertActivity(mockActivityInput);

                expect(mockEncryptActivityForInsertion).toHaveBeenCalledWith(
                    mockActivityInput,
                );
                expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
                expect(mockDecryptActivityName).toHaveBeenCalledWith(
                    mockInsertedActivity,
                );
                expect(result).toEqual(mockInsertedActivity);
            });

            it("should handle insertion failure", async () => {
                const mockActivityInput = {
                    name: "Test Activity",
                    user_id: "user-1",
                    activity_category_id: "cat-1",
                    status: "ENABLED" as const,
                    color: "#FF0000",
                    parent_activity_id: null,
                    weight: 1,
                };

                mockEncryptActivityForInsertion.mockResolvedValue(
                    mockActivityInput,
                );
                mockApiCall.mockResolvedValue(null);

                const result = await insertActivity(mockActivityInput);

                expect(result).toBeNull();
                expect(mockDecryptActivityName).not.toHaveBeenCalled();
            });

            it("should call supabase with correct parameters", async () => {
                const mockActivityInput = {
                    name: "Test Activity",
                    user_id: "user-1",
                    activity_category_id: "cat-1",
                    status: "ENABLED" as const,
                    color: "#FF0000",
                    parent_activity_id: null,
                    weight: 1,
                };
                const mockInsertedActivity = createMockActivity(
                    mockActivityInput,
                );
                const mockQuery = {
                    insert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockInsertedActivity,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockEncryptActivityForInsertion.mockResolvedValue(
                    mockActivityInput,
                );
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });
                mockDecryptActivityName.mockResolvedValue(mockInsertedActivity);

                await insertActivity(mockActivityInput);

                expect(mockSupabaseClient.from).toHaveBeenCalledWith(
                    "activities",
                );
                expect(mockQuery.insert).toHaveBeenCalledWith(
                    mockActivityInput,
                );
                expect(mockQuery.select).toHaveBeenCalled();
                expect(mockQuery.single).toHaveBeenCalled();
            });
        });

        describe("insertActivities", () => {
            it("should insert multiple activities successfully", async () => {
                const mockActivitiesInput = [
                    {
                        name: "Activity 1",
                        user_id: "user-1",
                        activity_category_id: "cat-1",
                        status: "ENABLED" as const,
                        color: "#FF0000",
                        parent_activity_id: null,
                        weight: 1,
                    },
                    {
                        name: "Activity 2",
                        user_id: "user-1",
                        activity_category_id: "cat-1",
                        status: "ENABLED" as const,
                        color: "#00FF00",
                        parent_activity_id: null,
                        weight: 2,
                    },
                ];
                const mockInsertedActivities = [
                    createMockActivity({
                        id: "activity-1",
                        ...mockActivitiesInput[0],
                    }),
                    createMockActivity({
                        id: "activity-2",
                        ...mockActivitiesInput[1],
                    }),
                ];

                mockEncryptActivitiesForInsertion.mockResolvedValue(
                    mockActivitiesInput,
                );
                mockApiCall.mockResolvedValue(mockInsertedActivities);
                mockDecryptActivityName
                    .mockResolvedValueOnce(mockInsertedActivities[0])
                    .mockResolvedValueOnce(mockInsertedActivities[1]);

                const result = await insertActivities(mockActivitiesInput);

                expect(mockEncryptActivitiesForInsertion).toHaveBeenCalledWith(
                    mockActivitiesInput,
                );
                expect(result).toEqual(mockInsertedActivities);
            });
        });

        describe("upsertActivity", () => {
            it("should upsert an activity successfully", async () => {
                const mockActivityInput = {
                    id: "activity-1",
                    name: "Test Activity",
                    user_id: "user-1",
                    activity_category_id: "cat-1",
                    status: "ENABLED" as const,
                    color: "#FF0000",
                    parent_activity_id: null,
                    weight: 1,
                };
                const mockUpsertedActivity = createMockActivity(
                    mockActivityInput,
                );

                mockEncryptActivityName.mockResolvedValue(mockActivityInput);
                mockApiCall.mockResolvedValue(mockUpsertedActivity);
                mockDecryptActivityName.mockResolvedValue(mockUpsertedActivity);

                const result = await upsertActivity(mockActivityInput);

                expect(mockEncryptActivityName).toHaveBeenCalledWith(
                    mockActivityInput,
                );
                expect(result).toEqual(mockUpsertedActivity);
            });

            it("should call supabase with correct upsert parameters", async () => {
                const mockActivityInput = {
                    name: "Test Activity",
                    user_id: "user-1",
                    activity_category_id: "cat-1",
                    status: "ENABLED" as const,
                    color: "#FF0000",
                    parent_activity_id: null,
                    weight: 1,
                };
                const mockUpsertedActivity = createMockActivity(
                    mockActivityInput,
                );
                const mockQuery = {
                    upsert: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockUpsertedActivity,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockEncryptActivityName.mockResolvedValue(mockUpsertedActivity);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });
                mockDecryptActivityName.mockResolvedValue(mockUpsertedActivity);

                await upsertActivity(mockActivityInput);

                expect(mockQuery.upsert).toHaveBeenCalledWith(
                    mockUpsertedActivity,
                    { onConflict: "id" },
                );
            });
        });
    });

    describe("Update Operations", () => {
        describe("updateActivity", () => {
            it("should update an activity successfully", async () => {
                const mockActivity = createMockActivity();
                const mockUpdatedActivity = {
                    ...mockActivity,
                    name: "Updated Activity",
                };

                mockEncryptActivityName.mockResolvedValue(mockUpdatedActivity);
                mockApiCall.mockResolvedValue(mockUpdatedActivity);
                mockDecryptActivityName.mockResolvedValue(mockUpdatedActivity);

                const result = await updateActivity(mockUpdatedActivity);

                expect(mockEncryptActivityName).toHaveBeenCalledWith(
                    mockUpdatedActivity,
                );
                expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
                expect(mockDecryptActivityName).toHaveBeenCalledWith(
                    mockUpdatedActivity,
                );
                expect(result).toEqual(mockUpdatedActivity);
            });

            it("should throw error when activity ID is missing", async () => {
                const mockActivity = {
                    ...createMockActivity(),
                    id: undefined,
                } as any;

                await expect(updateActivity(mockActivity)).rejects.toThrow(
                    "Activity ID is required for update.",
                );
            });

            it("should call supabase with correct update parameters", async () => {
                const mockActivity = createMockActivity();
                const mockQuery = {
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockActivity,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockEncryptActivityName.mockResolvedValue(mockActivity);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });
                mockDecryptActivityName.mockResolvedValue(mockActivity);

                await updateActivity(mockActivity);

                expect(mockSupabaseClient.from).toHaveBeenCalledWith(
                    "activities",
                );
                expect(mockQuery.update).toHaveBeenCalledWith(mockActivity);
                expect(mockQuery.eq).toHaveBeenCalledWith(
                    "id",
                    mockActivity.id,
                );
                expect(mockQuery.select).toHaveBeenCalled();
                expect(mockQuery.single).toHaveBeenCalled();
            });
        });

        describe("updateActivities", () => {
            it("should update multiple activities successfully", async () => {
                const mockActivities = [
                    createMockActivity({ id: "activity-1" }),
                    createMockActivity({ id: "activity-2" }),
                ];

                mockEncryptActivityName
                    .mockResolvedValueOnce(mockActivities[0])
                    .mockResolvedValueOnce(mockActivities[1]);
                mockApiCall
                    .mockResolvedValueOnce(mockActivities[0])
                    .mockResolvedValueOnce(mockActivities[1]);
                mockDecryptActivityName
                    .mockResolvedValueOnce(mockActivities[0])
                    .mockResolvedValueOnce(mockActivities[1]);

                const result = await updateActivities(mockActivities);

                expect(result).toEqual(mockActivities);
            });

            it("should throw error when activities array is empty", async () => {
                await expect(updateActivities([])).rejects.toThrow(
                    "A list of activities is required for update.",
                );
            });
        });
    });

    describe("Delete Operations", () => {
        describe("softDeleteActivity", () => {
            it("should soft delete an activity successfully", async () => {
                const mockActivity = createMockActivity({ status: "DELETED" });
                mockApiCall.mockResolvedValue(mockActivity);

                const result = await softDeleteActivity("activity-1");

                expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
                expect(result).toEqual(mockActivity);
            });

            it("should call supabase with correct soft delete parameters", async () => {
                const mockActivity = createMockActivity({ status: "DELETED" });
                const mockQuery = {
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockActivity,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });

                await softDeleteActivity("activity-1");

                expect(mockSupabaseClient.from).toHaveBeenCalledWith(
                    "activities",
                );
                expect(mockQuery.update).toHaveBeenCalledWith({
                    status: "DELETED",
                });
                expect(mockQuery.eq).toHaveBeenCalledWith("id", "activity-1");
                expect(mockQuery.select).toHaveBeenCalled();
                expect(mockQuery.single).toHaveBeenCalled();
            });
        });

        describe("softDeleteActivities", () => {
            it("should soft delete multiple activities successfully", async () => {
                const mockActivities = [
                    createMockActivity({ id: "activity-1", status: "DELETED" }),
                    createMockActivity({ id: "activity-2", status: "DELETED" }),
                ];
                mockApiCall.mockResolvedValue(mockActivities);

                const result = await softDeleteActivities([
                    "activity-1",
                    "activity-2",
                ]);

                expect(result).toEqual(mockActivities);
            });

            it("should call supabase with correct parameters for multiple deletes", async () => {
                const mockQuery = {
                    update: jest.fn().mockReturnThis(),
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

                await softDeleteActivities(["activity-1", "activity-2"]);

                expect(mockQuery.update).toHaveBeenCalledWith({
                    status: "DELETED",
                });
                expect(mockQuery.in).toHaveBeenCalledWith("id", [
                    "activity-1",
                    "activity-2",
                ]);
            });
        });

        describe("disableActivity", () => {
            it("should disable an activity successfully", async () => {
                const mockActivity = createMockActivity({ status: "DISABLED" });
                mockApiCall.mockResolvedValue(mockActivity);

                const result = await disableActivity("activity-1");

                expect(result).toEqual(mockActivity);
            });

            it("should call supabase with correct disable parameters", async () => {
                const mockQuery = {
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    select: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                };

                mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);
                mockApiCall.mockImplementation(async (fn: any) => {
                    const result = await fn();
                    return result.data;
                });

                await disableActivity("activity-1");

                expect(mockQuery.update).toHaveBeenCalledWith({
                    status: "DISABLED",
                });
                expect(mockQuery.eq).toHaveBeenCalledWith("id", "activity-1");
            });
        });

        describe("disableActivities", () => {
            it("should disable multiple activities successfully", async () => {
                const mockActivities = [
                    createMockActivity({
                        id: "activity-1",
                        status: "DISABLED",
                    }),
                    createMockActivity({
                        id: "activity-2",
                        status: "DISABLED",
                    }),
                ];
                mockApiCall.mockResolvedValue(mockActivities);

                const result = await disableActivities([
                    "activity-1",
                    "activity-2",
                ]);

                expect(result).toEqual(mockActivities);
            });
        });
    });
});
