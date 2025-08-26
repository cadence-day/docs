import * as timeslicesApi from "../../api/resources/timeslices";
import useTimeslicesStore from "../../stores/resources/useTimeslicesStore";
import type { Timeslice } from "../../types/models";

// Mock the timeslices API
jest.mock("../../api/resources/timeslices", () => ({
  insertTimeslice: jest.fn(),
  insertTimeslices: jest.fn(),
  upsertTimeslice: jest.fn(),
  upsertTimeslices: jest.fn(),
  updateTimeslice: jest.fn(),
  deleteTimeslice: jest.fn(),
  deleteTimeslices: jest.fn(),
  getTimeslice: jest.fn(),
  getTimeslices: jest.fn(),
  getUserTimeslices: jest.fn(),
  getAllTimeslices: jest.fn(),
}));

describe("useTimeslicesStore", () => {
  const mockTimeslicesApi = timeslicesApi as jest.Mocked<typeof timeslicesApi>;

  // Helper function to create mock timeslice
  const createMockTimeslice = (
    overrides: Partial<Timeslice> = {}
  ): Timeslice => ({
    id: "timeslice-1",
    user_id: "user-1",
    activity_id: "activity-1",
    start_time: "2023-01-01T10:00:00Z",
    end_time: "2023-01-01T11:00:00Z",
    state_id: "state-1",
    note_ids: ["note-1"],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useTimeslicesStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useTimeslicesStore.getState();

      expect(store.timeslices).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe("insert operations", () => {
    it("should insert a single timeslice successfully", async () => {
      const newTimesliceInput = {
        user_id: "user-1",
        activity_id: "activity-1",
        start_time: "2023-01-01T10:00:00Z",
        end_time: "2023-01-01T11:00:00Z",
        state_id: "state-1",
        note_ids: ["note-1"],
      };
      const mockNewTimeslice = createMockTimeslice(newTimesliceInput);
      mockTimeslicesApi.insertTimeslice.mockResolvedValue(mockNewTimeslice);

      const store = useTimeslicesStore.getState();
      const result = await store.insertTimeslice(newTimesliceInput);

      expect(result).toEqual(mockNewTimeslice);
      expect(mockTimeslicesApi.insertTimeslice).toHaveBeenCalledWith(
        newTimesliceInput
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toContain(mockNewTimeslice);
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });

    it("should insert multiple timeslices successfully", async () => {
      const newTimeslicesInput = [
        {
          user_id: "user-1",
          activity_id: "activity-1",
          start_time: "2023-01-01T10:00:00Z",
          end_time: "2023-01-01T11:00:00Z",
          state_id: "state-1",
          note_ids: ["note-1"],
        },
        {
          user_id: "user-1",
          activity_id: "activity-2",
          start_time: "2023-01-01T11:00:00Z",
          end_time: "2023-01-01T12:00:00Z",
          state_id: "state-2",
          note_ids: ["note-2"],
        },
      ];
      const mockNewTimeslices = [
        createMockTimeslice({ id: "timeslice-1", ...newTimeslicesInput[0] }),
        createMockTimeslice({ id: "timeslice-2", ...newTimeslicesInput[1] }),
      ];
      mockTimeslicesApi.insertTimeslices.mockResolvedValue(mockNewTimeslices);

      const store = useTimeslicesStore.getState();
      const result = await store.insertTimeslices(newTimeslicesInput);

      expect(result).toEqual(mockNewTimeslices);
      expect(mockTimeslicesApi.insertTimeslices).toHaveBeenCalledWith(
        newTimeslicesInput
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toHaveLength(2);
      expect(updatedStore.timeslices).toEqual(
        expect.arrayContaining(mockNewTimeslices)
      );
    });

    it("should handle upsert operation correctly", async () => {
      const existingTimeslice = createMockTimeslice();
      const updatedTimesliceInput = {
        ...existingTimeslice,
        end_time: "2023-01-01T12:00:00Z",
      };
      mockTimeslicesApi.upsertTimeslice.mockResolvedValue(
        updatedTimesliceInput
      );

      // Set initial state
      useTimeslicesStore.setState({ timeslices: [existingTimeslice] });

      const store = useTimeslicesStore.getState();
      const result = await store.upsertTimeslice(updatedTimesliceInput);

      expect(result).toEqual(updatedTimesliceInput);
      expect(mockTimeslicesApi.upsertTimeslice).toHaveBeenCalledWith(
        updatedTimesliceInput
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toHaveLength(1);
      expect(updatedStore.timeslices[0].end_time).toBe("2023-01-01T12:00:00Z");
    });
  });

  describe("update operations", () => {
    it("should update a timeslice successfully", async () => {
      const existingTimeslice = createMockTimeslice();
      const updatedTimeslice = {
        ...existingTimeslice,
        end_time: "2023-01-01T12:00:00Z",
      };
      mockTimeslicesApi.updateTimeslice.mockResolvedValue(updatedTimeslice);

      // Set initial state
      useTimeslicesStore.setState({ timeslices: [existingTimeslice] });

      const store = useTimeslicesStore.getState();
      const result = await store.updateTimeslice(updatedTimeslice);

      expect(result).toEqual(updatedTimeslice);
      expect(mockTimeslicesApi.updateTimeslice).toHaveBeenCalledWith(
        updatedTimeslice
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices[0].end_time).toBe("2023-01-01T12:00:00Z");
    });
  });

  describe("delete operations", () => {
    it("should delete a timeslice successfully", async () => {
      const timesliceToDelete = createMockTimeslice();
      mockTimeslicesApi.deleteTimeslice.mockResolvedValue(timesliceToDelete);

      // Set initial state
      useTimeslicesStore.setState({ timeslices: [timesliceToDelete] });

      const store = useTimeslicesStore.getState();
      await store.deleteTimeslice(timesliceToDelete.id!);

      expect(mockTimeslicesApi.deleteTimeslice).toHaveBeenCalledWith(
        timesliceToDelete.id
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toHaveLength(0);
    });

    it("should delete multiple timeslices successfully", async () => {
      const timeslicesToDelete = [
        createMockTimeslice({ id: "timeslice-1" }),
        createMockTimeslice({ id: "timeslice-2" }),
      ];
      const idsToDelete = ["timeslice-1", "timeslice-2"];
      mockTimeslicesApi.deleteTimeslices.mockResolvedValue(timeslicesToDelete);

      // Set initial state
      useTimeslicesStore.setState({ timeslices: timeslicesToDelete });

      const store = useTimeslicesStore.getState();
      await store.deleteTimeslices(idsToDelete);

      expect(mockTimeslicesApi.deleteTimeslices).toHaveBeenCalledWith(
        idsToDelete
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toHaveLength(0);
    });
  });

  describe("get operations", () => {
    it("should get a single timeslice", async () => {
      const mockTimeslice = createMockTimeslice();
      mockTimeslicesApi.getTimeslice.mockResolvedValue(mockTimeslice);

      const store = useTimeslicesStore.getState();
      const timeslice = await store.getTimeslice("timeslice-1");

      expect(timeslice).toEqual(mockTimeslice);
      expect(mockTimeslicesApi.getTimeslice).toHaveBeenCalledWith(
        "timeslice-1"
      );
    });

    it("should get multiple timeslices", async () => {
      const mockTimeslices = [
        createMockTimeslice({ id: "timeslice-1" }),
        createMockTimeslice({ id: "timeslice-2" }),
      ];
      mockTimeslicesApi.getTimeslices.mockResolvedValue(mockTimeslices);

      const store = useTimeslicesStore.getState();
      const timeslices = await store.getTimeslices([
        "timeslice-1",
        "timeslice-2",
      ]);

      expect(timeslices).toEqual(mockTimeslices);
      expect(mockTimeslicesApi.getTimeslices).toHaveBeenCalledWith([
        "timeslice-1",
        "timeslice-2",
      ]);
    });

    it("should get user timeslices", async () => {
      const mockTimeslices = [
        createMockTimeslice(),
        createMockTimeslice({ id: "timeslice-2" }),
      ];
      mockTimeslicesApi.getUserTimeslices.mockResolvedValue(mockTimeslices);

      const store = useTimeslicesStore.getState();
      const timeslices = await store.getUserTimeslices("user-1");

      expect(timeslices).toEqual(mockTimeslices);
      expect(mockTimeslicesApi.getUserTimeslices).toHaveBeenCalledWith(
        "user-1"
      );
    });

    it("should get all timeslices", async () => {
      const mockTimeslices = [
        createMockTimeslice(),
        createMockTimeslice({ id: "timeslice-2" }),
      ];
      mockTimeslicesApi.getAllTimeslices.mockResolvedValue(mockTimeslices);

      const store = useTimeslicesStore.getState();
      const timeslices = await store.getAllTimeslices();

      expect(timeslices).toEqual(mockTimeslices);
      expect(mockTimeslicesApi.getAllTimeslices).toHaveBeenCalled();
    });
  });

  describe("refresh operation", () => {
    it("should refresh user timeslices successfully", async () => {
      const existingTimeslices = [createMockTimeslice({ id: "timeslice-1" })];
      const fetchedTimeslices = [createMockTimeslice({ id: "timeslice-2" })];
      mockTimeslicesApi.getUserTimeslices.mockResolvedValue(fetchedTimeslices);

      // Set initial state
      useTimeslicesStore.setState({ timeslices: existingTimeslices });

      const store = useTimeslicesStore.getState();
      await store.refresh("user-1");

      expect(mockTimeslicesApi.getUserTimeslices).toHaveBeenCalledWith(
        "user-1"
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toHaveLength(2);
      expect(updatedStore.timeslices).toEqual(
        expect.arrayContaining([...existingTimeslices, ...fetchedTimeslices])
      );
    });
  });

  describe("utility functions", () => {
    it("should set loading state", () => {
      const store = useTimeslicesStore.getState();
      store.setLoading(true);

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.isLoading).toBe(true);
    });

    it("should set error state", () => {
      const store = useTimeslicesStore.getState();
      store.setError("Test error");

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.error).toBe("Test error");
    });

    it("should reset store state", () => {
      // Set some state first
      useTimeslicesStore.setState({
        timeslices: [createMockTimeslice()],
        isLoading: true,
        error: "Some error",
      });

      const store = useTimeslicesStore.getState();
      store.reset();

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toEqual([]);
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should handle API errors gracefully", async () => {
      const errorMessage = "API Error";
      mockTimeslicesApi.insertTimeslice.mockRejectedValue(
        new Error(errorMessage)
      );

      const store = useTimeslicesStore.getState();
      const result = await store.insertTimeslice({
        user_id: "user-1",
        activity_id: "activity-1",
        start_time: "2023-01-01T10:00:00Z",
        end_time: "2023-01-01T11:00:00Z",
        state_id: "state-1",
        note_ids: ["note-1"],
      });

      expect(result).toBeNull();

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBe(errorMessage);
    });
  });

  describe("bulk upsert operations", () => {
    it("should handle upsert multiple timeslices correctly", async () => {
      const existingTimeslice = createMockTimeslice({ id: "timeslice-1" });
      const newTimesliceInput = {
        user_id: "user-1",
        activity_id: "activity-2",
        start_time: "2023-01-01T12:00:00Z",
        end_time: "2023-01-01T13:00:00Z",
        state_id: "state-2",
        note_ids: ["note-2"],
      };

      const upsertInputs = [
        { ...existingTimeslice, end_time: "2023-01-01T11:30:00Z" }, // Update existing
        newTimesliceInput, // Insert new
      ];

      const upsertResults = [
        { ...existingTimeslice, end_time: "2023-01-01T11:30:00Z" },
        createMockTimeslice({ id: "timeslice-2", ...newTimesliceInput }),
      ];

      mockTimeslicesApi.upsertTimeslices.mockResolvedValue(upsertResults);

      // Set initial state with existing timeslice
      useTimeslicesStore.setState({ timeslices: [existingTimeslice] });

      const store = useTimeslicesStore.getState();
      const result = await store.upsertTimeslices(upsertInputs);

      expect(result).toEqual(upsertResults);
      expect(mockTimeslicesApi.upsertTimeslices).toHaveBeenCalledWith(
        upsertInputs
      );

      const updatedStore = useTimeslicesStore.getState();
      expect(updatedStore.timeslices).toHaveLength(2);
      expect(updatedStore.timeslices[0].end_time).toBe("2023-01-01T11:30:00Z"); // Updated
      expect(updatedStore.timeslices[1].id).toBe("timeslice-2"); // New
    });
  });
});
