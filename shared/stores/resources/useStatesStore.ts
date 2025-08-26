import * as statesApi from "@/shared/api/resources/states";
import type { State } from "@/shared/types/models";
import { create } from "zustand";
import {
  type BaseStoreState,
  handleApiCall,
  handleGetApiCall,
  handleVoidApiCall,
  handleVoidApiCallWithResult,
} from "../utils/utils";

interface StatesStore extends BaseStoreState {
  // State
  states: State[];

  // Core operations
  // Insert operations
  insertState: (state: Omit<State, "id">) => Promise<State | null>;
  insertStates: (states: Omit<State, "id">[]) => Promise<State[]>;
  upsertState: (
    state: Omit<State, "id"> & Partial<Pick<State, "id">>
  ) => Promise<State | null>;
  upsertStates: (
    states: (Omit<State, "id"> & Partial<Pick<State, "id">>)[]
  ) => Promise<State[]>;

  // Update operations
  updateState: (state: State) => Promise<State | null>;

  // Delete operations
  deleteState: (id: string) => Promise<void>;
  deleteStates: (ids: string[]) => Promise<void>;

  refresh: (userId: string) => Promise<void>;

  // Get operations
  getState: (id: string) => Promise<State | null>;
  getStates: (ids: string[]) => Promise<State[]>;
  getUserStates: (userId: string) => Promise<State[]>;
  getAllStates: () => Promise<State[]>;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useStatesStore = create<StatesStore>((set, get) => ({
  // Initial state
  states: [],
  isLoading: false,
  error: null,

  // Core operations
  insertState: async (state: Omit<State, "id">) => {
    return handleApiCall(
      set,
      () => statesApi.insertState(state),
      "create state",
      null,
      (newState, currentState) =>
        newState
          ? {
              states: [...currentState.states, newState],
            }
          : {}
    );
  },

  insertStates: async (states: Omit<State, "id">[]) => {
    return handleApiCall(
      set,
      () => statesApi.insertStates(states),
      "create states",
      [],
      (newStates, currentState) =>
        newStates.length > 0
          ? {
              states: [...currentState.states, ...newStates],
            }
          : {}
    );
  },

  upsertState: async (
    state: Omit<State, "id"> & Partial<Pick<State, "id">>
  ) => {
    return handleApiCall(
      set,
      () => statesApi.upsertState(state),
      "upsert state",
      null,
      (upsertedState, currentState) => {
        if (!upsertedState) return {};

        const existingIndex = currentState.states.findIndex(
          (s) => s.id === upsertedState.id
        );
        if (existingIndex >= 0) {
          // Update existing
          return {
            states: currentState.states.map((s, index) =>
              index === existingIndex ? upsertedState : s
            ),
          };
        } else {
          // Add new
          return {
            states: [...currentState.states, upsertedState],
          };
        }
      }
    );
  },

  upsertStates: async (
    states: (Omit<State, "id"> & Partial<Pick<State, "id">>)[]
  ) => {
    return handleApiCall(
      set,
      () => statesApi.upsertStates(states),
      "upsert states",
      [],
      (upsertedStates, currentState) => {
        if (!upsertedStates || upsertedStates.length === 0) return {};

        let updatedStates = [...currentState.states];

        upsertedStates.forEach((upsertedState) => {
          const existingIndex = updatedStates.findIndex(
            (s) => s.id === upsertedState.id
          );
          if (existingIndex >= 0) {
            // Update existing
            updatedStates[existingIndex] = upsertedState;
          } else {
            // Add new
            updatedStates.push(upsertedState);
          }
        });

        return { states: updatedStates };
      }
    );
  },

  updateState: async (state: State) => {
    return handleApiCall(
      set,
      () => statesApi.updateState(state),
      "update state",
      null,
      (updatedState, currentState) =>
        updatedState
          ? {
              states: currentState.states.map((s) =>
                s.id === updatedState.id ? updatedState : s
              ),
            }
          : {}
    );
  },

  deleteState: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => statesApi.deleteState(id),
      "delete state",
      (currentState) => ({
        states: currentState.states.filter((s) => s.id !== id),
      })
    );
  },

  deleteStates: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => statesApi.deleteStates(ids),
      "delete states",
      (currentState) => ({
        states: currentState.states.filter((s) => !ids.includes(s.id!)),
      })
    );
  },

  refresh: async (userId: string) => {
    return handleVoidApiCallWithResult(
      set,
      async () => {
        // Fetch states for the user from remote database
        const fetchedStates = await statesApi.getUserStates(userId);
        return fetchedStates;
      },
      "refresh states",
      (fetchedStates, currentState) => ({
        states: currentState.states.concat(fetchedStates),
      })
    );
  },

  // Get operations
  getState: async (id: string) => {
    return handleGetApiCall(
      set,
      () => statesApi.getState(id),
      "get state",
      null
    );
  },

  getStates: async (ids: string[]) => {
    return handleGetApiCall(
      set,
      () => statesApi.getStates(ids),
      "get states",
      []
    );
  },

  getUserStates: async (userId: string) => {
    return handleGetApiCall(
      set,
      () => statesApi.getUserStates(userId),
      "get user states",
      []
    );
  },

  getAllStates: async () => {
    return handleGetApiCall(
      set,
      () => statesApi.getAllStates(),
      "get all states",
      []
    );
  },

  // Utility functions
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ states: [], isLoading: false, error: null }),
}));

export default useStatesStore;
