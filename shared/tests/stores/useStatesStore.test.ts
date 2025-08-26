import * as statesApi from "../../api/resources/states";
import useStatesStore from "../../stores/resources/useStatesStore";
import type { State } from "../../types/models";

// Mock the states API
jest.mock("../../api/resources/states", () => ({
  insertState: jest.fn(),
  insertStates: jest.fn(),
  upsertState: jest.fn(),
  upsertStates: jest.fn(),
  updateState: jest.fn(),
  deleteState: jest.fn(),
  deleteStates: jest.fn(),
  getState: jest.fn(),
  getStates: jest.fn(),
  getUserStates: jest.fn(),
  getAllStates: jest.fn(),
}));

describe("useStatesStore", () => {
  const mockStatesApi = statesApi as jest.Mocked<typeof statesApi>;

  // Helper function to create mock state
  const createMockState = (overrides: Partial<State> = {}): State => ({
    id: "state-1",
    user_id: "user-1",
    mood: 7,
    energy: 8,
    timeslice_id: "timeslice-1",
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useStatesStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useStatesStore.getState();

      expect(store.states).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe("insert operations", () => {
    it("should insert a single state successfully", async () => {
      const newStateInput = {
        user_id: "user-1",
        mood: 7,
        energy: 8,
        timeslice_id: "timeslice-1",
      };
      const mockNewState = createMockState(newStateInput);
      mockStatesApi.insertState.mockResolvedValue(mockNewState);

      const store = useStatesStore.getState();
      const result = await store.insertState(newStateInput);

      expect(result).toEqual(mockNewState);
      expect(mockStatesApi.insertState).toHaveBeenCalledWith(newStateInput);

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states).toContain(mockNewState);
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });

    it("should insert multiple states successfully", async () => {
      const newStatesInput = [
        { user_id: "user-1", mood: 7, energy: 8, timeslice_id: "timeslice-1" },
        { user_id: "user-1", mood: 6, energy: 7, timeslice_id: "timeslice-2" },
      ];
      const mockNewStates = [
        createMockState({ id: "state-1", ...newStatesInput[0] }),
        createMockState({ id: "state-2", ...newStatesInput[1] }),
      ];
      mockStatesApi.insertStates.mockResolvedValue(mockNewStates);

      const store = useStatesStore.getState();
      const result = await store.insertStates(newStatesInput);

      expect(result).toEqual(mockNewStates);
      expect(mockStatesApi.insertStates).toHaveBeenCalledWith(newStatesInput);

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states).toHaveLength(2);
      expect(updatedStore.states).toEqual(
        expect.arrayContaining(mockNewStates)
      );
    });

    it("should handle upsert operation correctly", async () => {
      const existingState = createMockState();
      const updatedStateInput = { ...existingState, mood: 9 };
      mockStatesApi.upsertState.mockResolvedValue(updatedStateInput);

      // Set initial state
      useStatesStore.setState({ states: [existingState] });

      const store = useStatesStore.getState();
      const result = await store.upsertState(updatedStateInput);

      expect(result).toEqual(updatedStateInput);
      expect(mockStatesApi.upsertState).toHaveBeenCalledWith(updatedStateInput);

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states).toHaveLength(1);
      expect(updatedStore.states[0].mood).toBe(9);
    });
  });

  describe("update operations", () => {
    it("should update a state successfully", async () => {
      const existingState = createMockState();
      const updatedState = { ...existingState, mood: 9 };
      mockStatesApi.updateState.mockResolvedValue(updatedState);

      // Set initial state
      useStatesStore.setState({ states: [existingState] });

      const store = useStatesStore.getState();
      const result = await store.updateState(updatedState);

      expect(result).toEqual(updatedState);
      expect(mockStatesApi.updateState).toHaveBeenCalledWith(updatedState);

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states[0].mood).toBe(9);
    });
  });

  describe("delete operations", () => {
    it("should delete a state successfully", async () => {
      const stateToDelete = createMockState();
      mockStatesApi.deleteState.mockResolvedValue(stateToDelete);

      // Set initial state
      useStatesStore.setState({ states: [stateToDelete] });

      const store = useStatesStore.getState();
      await store.deleteState(stateToDelete.id!);

      expect(mockStatesApi.deleteState).toHaveBeenCalledWith(stateToDelete.id);

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states).toHaveLength(0);
    });

    it("should delete multiple states successfully", async () => {
      const statesToDelete = [
        createMockState({ id: "state-1" }),
        createMockState({ id: "state-2" }),
      ];
      const idsToDelete = ["state-1", "state-2"];
      mockStatesApi.deleteStates.mockResolvedValue(statesToDelete);

      // Set initial state
      useStatesStore.setState({ states: statesToDelete });

      const store = useStatesStore.getState();
      await store.deleteStates(idsToDelete);

      expect(mockStatesApi.deleteStates).toHaveBeenCalledWith(idsToDelete);

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states).toHaveLength(0);
    });
  });

  describe("get operations", () => {
    it("should get a single state", async () => {
      const mockState = createMockState();
      mockStatesApi.getState.mockResolvedValue(mockState);

      const store = useStatesStore.getState();
      const state = await store.getState("state-1");

      expect(state).toEqual(mockState);
      expect(mockStatesApi.getState).toHaveBeenCalledWith("state-1");
    });

    it("should get multiple states", async () => {
      const mockStates = [
        createMockState({ id: "state-1" }),
        createMockState({ id: "state-2" }),
      ];
      mockStatesApi.getStates.mockResolvedValue(mockStates);

      const store = useStatesStore.getState();
      const states = await store.getStates(["state-1", "state-2"]);

      expect(states).toEqual(mockStates);
      expect(mockStatesApi.getStates).toHaveBeenCalledWith([
        "state-1",
        "state-2",
      ]);
    });

    it("should get user states", async () => {
      const mockStates = [
        createMockState(),
        createMockState({ id: "state-2" }),
      ];
      mockStatesApi.getUserStates.mockResolvedValue(mockStates);

      const store = useStatesStore.getState();
      const states = await store.getUserStates("user-1");

      expect(states).toEqual(mockStates);
      expect(mockStatesApi.getUserStates).toHaveBeenCalledWith("user-1");
    });

    it("should get all states", async () => {
      const mockStates = [
        createMockState(),
        createMockState({ id: "state-2" }),
      ];
      mockStatesApi.getAllStates.mockResolvedValue(mockStates);

      const store = useStatesStore.getState();
      const states = await store.getAllStates();

      expect(states).toEqual(mockStates);
      expect(mockStatesApi.getAllStates).toHaveBeenCalled();
    });
  });

  describe("refresh operation", () => {
    it("should refresh user states successfully", async () => {
      const existingStates = [createMockState({ id: "state-1" })];
      const fetchedStates = [createMockState({ id: "state-2" })];
      mockStatesApi.getUserStates.mockResolvedValue(fetchedStates);

      // Set initial state
      useStatesStore.setState({ states: existingStates });

      const store = useStatesStore.getState();
      await store.refresh("user-1");

      expect(mockStatesApi.getUserStates).toHaveBeenCalledWith("user-1");

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states).toHaveLength(2);
      expect(updatedStore.states).toEqual(
        expect.arrayContaining([...existingStates, ...fetchedStates])
      );
    });
  });

  describe("utility functions", () => {
    it("should set loading state", () => {
      const store = useStatesStore.getState();
      store.setLoading(true);

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.isLoading).toBe(true);
    });

    it("should set error state", () => {
      const store = useStatesStore.getState();
      store.setError("Test error");

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.error).toBe("Test error");
    });

    it("should reset store state", () => {
      // Set some state first
      useStatesStore.setState({
        states: [createMockState()],
        isLoading: true,
        error: "Some error",
      });

      const store = useStatesStore.getState();
      store.reset();

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.states).toEqual([]);
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should handle API errors gracefully", async () => {
      const errorMessage = "API Error";
      mockStatesApi.insertState.mockRejectedValue(new Error(errorMessage));

      const store = useStatesStore.getState();
      const result = await store.insertState({
        user_id: "user-1",
        mood: 7,
        energy: 8,
        timeslice_id: "timeslice-1",
      });

      expect(result).toBeNull();

      const updatedStore = useStatesStore.getState();
      expect(updatedStore.isLoading).toBe(false);
      expect(updatedStore.error).toBe(errorMessage);
    });
  });
});
