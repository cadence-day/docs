import {
  apiCall,
  convertDatesToLocal,
  convertDatesToUTC,
  getSingle,
  getSupabaseErrorMessage,
} from "../../../api/utils/apiHelpers";
import { apiCache } from "../../../api/utils/cache";
import { handleApiErrorWithRetry } from "../../../api/utils/errorHandler";

// Mock dependencies
jest.mock("../../../api/utils/cache");
jest.mock("../../../api/utils/errorHandler");

describe("API Helpers", () => {
  const mockApiCache = apiCache as jest.Mocked<typeof apiCache>;
  const mockHandleApiErrorWithRetry =
    handleApiErrorWithRetry as jest.MockedFunction<
      typeof handleApiErrorWithRetry
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiCache.get.mockReturnValue(null);
    mockApiCache.set.mockImplementation(() => {});

    // Mock handleApiErrorWithRetry to just execute the function passed to it
    mockHandleApiErrorWithRetry.mockImplementation(
      async (context, fn, options) => {
        return await fn();
      }
    );
  });

  describe("getSupabaseErrorMessage", () => {
    it("should return error message from error object", () => {
      const error = { message: "Database connection failed" };
      expect(getSupabaseErrorMessage(error)).toBe("Database connection failed");
    });

    it("should return error_description if message is not available", () => {
      const error = { error_description: "Invalid credentials" };
      expect(getSupabaseErrorMessage(error)).toBe("Invalid credentials");
    });

    it("should return string error as is", () => {
      expect(getSupabaseErrorMessage("Network error")).toBe("Network error");
    });

    it("should return default message for null/undefined", () => {
      expect(getSupabaseErrorMessage(null)).toBe("Unknown error");
      expect(getSupabaseErrorMessage(undefined)).toBe("Unknown error");
    });

    it("should return custom default message", () => {
      expect(getSupabaseErrorMessage(null, "Custom default")).toBe(
        "Custom default"
      );
    });

    it("should return default message for objects without message or error_description", () => {
      const error = { code: 500, details: "Internal error" };
      expect(getSupabaseErrorMessage(error)).toBe("Unknown error");
    });
  });

  describe("getSingle", () => {
    it("should return data when no error", () => {
      const data = { id: "1", name: "Test" };
      expect(getSingle(data, null)).toBe(data);
    });

    it("should return null when data is null", () => {
      expect(getSingle(null, null)).toBeNull();
    });

    it("should throw error when error exists", () => {
      const error = { message: "Not found" };
      expect(() => getSingle(null, error)).toThrow("Not found");
    });

    it("should throw error with custom message", () => {
      const error = { error_description: "Access denied" };
      expect(() => getSingle(null, error)).toThrow("Access denied");
    });
  });

  describe("convertDatesToLocal", () => {
    it("should convert ISO date strings to Date objects", () => {
      const data = {
        created_at: "2023-01-01T12:00:00.000Z",
        updated_at: "2023-01-02T15:30:00.000Z",
        name: "Test Activity",
      };

      const result = convertDatesToLocal(data) as any;

      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      expect(result.name).toBe("Test Activity");
      expect(result.created_at.toISOString()).toBe("2023-01-01T12:00:00.000Z");
    });

    it("should handle arrays", () => {
      const data = [
        { created_at: "2023-01-01T12:00:00.000Z", name: "Item 1" },
        { created_at: "2023-01-02T12:00:00.000Z", name: "Item 2" },
      ];

      const result = convertDatesToLocal(data);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].created_at).toBeInstanceOf(Date);
      expect(result[1].created_at).toBeInstanceOf(Date);
    });

    it("should handle nested objects", () => {
      const data = {
        activity: {
          created_at: "2023-01-01T12:00:00.000Z",
          notes: [
            {
              created_at: "2023-01-01T13:00:00.000Z",
              content: "Note 1",
            },
          ],
        },
      };

      const result = convertDatesToLocal(data);

      expect(result.activity.created_at).toBeInstanceOf(Date);
      expect(result.activity.notes[0].created_at).toBeInstanceOf(Date);
    });

    it("should not convert non-ISO date strings", () => {
      const data = {
        date_string: "2023-01-01",
        invalid_date: "not-a-date",
        number: 12345,
      };

      const result = convertDatesToLocal(data);

      expect(result.date_string).toBe("2023-01-01");
      expect(result.invalid_date).toBe("not-a-date");
      expect(result.number).toBe(12345);
    });

    it("should handle primitive values", () => {
      expect(convertDatesToLocal("test")).toBe("test");
      expect(convertDatesToLocal(123)).toBe(123);
      expect(convertDatesToLocal(true)).toBe(true);
      expect(convertDatesToLocal(null)).toBeNull();
    });
  });

  describe("convertDatesToUTC", () => {
    it("should convert Date objects to ISO strings", () => {
      const date1 = new Date("2023-01-01T12:00:00.000Z");
      const date2 = new Date("2023-01-02T15:30:00.000Z");

      const data = {
        created_at: date1,
        updated_at: date2,
        name: "Test Activity",
      };

      const result = convertDatesToUTC(data);

      expect(result.created_at).toBe("2023-01-01T12:00:00.000Z");
      expect(result.updated_at).toBe("2023-01-02T15:30:00.000Z");
      expect(result.name).toBe("Test Activity");
    });

    it("should handle arrays", () => {
      const data = [
        {
          created_at: new Date("2023-01-01T12:00:00.000Z"),
          name: "Item 1",
        },
        {
          created_at: new Date("2023-01-02T12:00:00.000Z"),
          name: "Item 2",
        },
      ];

      const result = convertDatesToUTC(data);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].created_at).toBe("2023-01-01T12:00:00.000Z");
      expect(result[1].created_at).toBe("2023-01-02T12:00:00.000Z");
    });

    it("should handle nested objects", () => {
      const data = {
        activity: {
          created_at: new Date("2023-01-01T12:00:00.000Z"),
          notes: [
            {
              created_at: new Date("2023-01-01T13:00:00.000Z"),
              content: "Note 1",
            },
          ],
        },
      };

      const result = convertDatesToUTC(data);

      expect(result.activity.created_at).toBe("2023-01-01T12:00:00.000Z");
      expect(result.activity.notes[0].created_at).toBe(
        "2023-01-01T13:00:00.000Z"
      );
    });

    it("should not convert non-Date objects", () => {
      const data = {
        date_string: "2023-01-01T12:00:00.000Z",
        number: 12345,
        boolean: true,
      };

      const result = convertDatesToUTC(data);

      expect(result.date_string).toBe("2023-01-01T12:00:00.000Z");
      expect(result.number).toBe(12345);
      expect(result.boolean).toBe(true);
    });
  });

  describe("apiCall", () => {
    it("should execute function and return data", async () => {
      const mockFn = jest.fn().mockResolvedValue({
        data: { id: "1", name: "Test" },
        error: null,
      });

      const result = await apiCall(mockFn);

      expect(result).toEqual({ id: "1", name: "Test" });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should throw error when function returns error", async () => {
      const mockFn = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // The mockHandleApiErrorWithRetry will execute the function, which will then throw the error
      mockHandleApiErrorWithRetry.mockImplementation(
        async (context, fn, options) => {
          const result = await fn();
          return result;
        }
      );

      await expect(apiCall(mockFn)).rejects.toThrow("Database error");
    });

    it("should use cache when enabled and key exists", async () => {
      const cachedData = { id: "cached", name: "Cached Item" };
      mockApiCache.get.mockReturnValue(cachedData);

      const mockFn = jest.fn();
      const result = await apiCall(mockFn, {
        useCache: true,
        cacheKey: "test-key",
      });

      expect(result).toBe(cachedData);
      expect(mockFn).not.toHaveBeenCalled();
      expect(mockApiCache.get).toHaveBeenCalledWith("test-key");
    });

    it("should fetch and cache when cache is enabled but no cached data", async () => {
      mockApiCache.get.mockReturnValue(null);

      const mockData = { id: "1", name: "Test" };
      const mockFn = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await apiCall(mockFn, {
        useCache: true,
        cacheKey: "test-key",
        cacheTtl: 300000,
      });

      expect(result).toEqual(mockData);
      expect(mockApiCache.get).toHaveBeenCalledWith("test-key");
      expect(mockApiCache.set).toHaveBeenCalledWith(
        "test-key",
        mockData,
        300000
      );
    });

    it("should not use cache when disabled", async () => {
      const mockData = { id: "1", name: "Test" };
      const mockFn = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await apiCall(mockFn, { useCache: false });

      expect(result).toEqual(mockData);
      expect(mockApiCache.get).not.toHaveBeenCalled();
      expect(mockApiCache.set).not.toHaveBeenCalled();
    });

    it("should convert dates in response data", async () => {
      const mockData = {
        id: "1",
        created_at: "2023-01-01T12:00:00.000Z",
        name: "Test",
      };

      const mockFn = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = (await apiCall(mockFn)) as any;

      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.created_at.toISOString()).toBe("2023-01-01T12:00:00.000Z");
    });

    it("should handle function that throws error", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Network error"));

      // Mock handleApiErrorWithRetry to just pass through the error
      mockHandleApiErrorWithRetry.mockImplementation(
        async (context, fn, options) => {
          return await fn();
        }
      );

      await expect(apiCall(mockFn)).rejects.toThrow("Network error");
    });

    it("should use default cache options", async () => {
      const mockData = { id: "1", name: "Test" };
      const mockFn = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      await apiCall(mockFn, {
        useCache: true,
        cacheKey: "test-key",
        // No cacheTtl specified, should use default
      });

      expect(mockApiCache.set).toHaveBeenCalledWith(
        "test-key",
        mockData,
        300000
      ); // 5 minutes default
    });

    it("should not cache when cacheKey is missing", async () => {
      const mockData = { id: "1", name: "Test" };
      const mockFn = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await apiCall(mockFn, { useCache: true });

      expect(result).toEqual(mockData);
      expect(mockApiCache.get).not.toHaveBeenCalled();
      expect(mockApiCache.set).not.toHaveBeenCalled();
    });
  });
});
