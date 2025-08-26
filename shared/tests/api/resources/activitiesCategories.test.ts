import { getAllActivityCategories } from "../../../api/resources/activitiesCategories/get";

import { supabaseClient } from "../../../api/client/supabaseClient";
import * as apiHelpers from "../../../api/utils/apiHelpers";
import * as errorHandler from "../../../api/utils/errorHandler";
import type { ActivityCategory } from "../../../types/models";

// Mock dependencies
jest.mock("../../../api/client/supabaseClient", () => ({
  supabaseClient: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
    })),
  },
}));
jest.mock("../../../api/utils/apiHelpers");
jest.mock("../../../api/utils/errorHandler");

describe("Activities Categories API - Get Operations", () => {
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

  // Create mock activity category
  const createMockActivityCategory = (
    overrides: Partial<ActivityCategory> = {}
  ): ActivityCategory => ({
    id: "category-1",
    key: "work",
    color: "#FF0000",
    ...overrides,
  });

  describe("getAllActivityCategories", () => {
    it("should fetch all activity categories", async () => {
      const mockCategories = [
        createMockActivityCategory(),
        createMockActivityCategory({
          id: "category-2",
          key: "personal",
          color: "#00FF00",
        }),
      ];
      mockApiCall.mockResolvedValue(mockCategories);

      const result = await getAllActivityCategories();

      expect(mockApiCall).toHaveBeenCalledWith(expect.any(Function));
      expect(result).toEqual(mockCategories);
    });

    it("should return empty array if no categories found", async () => {
      mockApiCall.mockResolvedValue([]);

      const result = await getAllActivityCategories();

      expect(result).toEqual([]);
    });

    it("should handle API errors", async () => {
      const error = new Error("Database error");
      mockApiCall.mockRejectedValue(error);
      mockHandleApiError.mockImplementation((context, err) => {
        throw err;
      });

      await expect(getAllActivityCategories()).rejects.toThrow(
        "Database error"
      );
      expect(mockHandleApiError).toHaveBeenCalledWith(
        "getAllActivityCategories",
        error
      );
    });

    it("should call supabase with correct parameters", async () => {
      const mockCategories = [createMockActivityCategory()];
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: mockCategories,
          error: null,
        }),
      };

      mockSupabaseClient.from = jest.fn().mockReturnValue(mockQuery);

      // Mock apiCall to execute the function passed to it
      mockApiCall.mockImplementation(async (fn) => {
        const result = await fn();
        return result.data ?? [];
      });

      await getAllActivityCategories();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith(
        "activity_categories"
      );
      expect(mockQuery.select).toHaveBeenCalledWith("*");
    });
  });
});
