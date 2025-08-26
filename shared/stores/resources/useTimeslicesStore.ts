import * as timeslicesApi from "@/shared/api/resources/timeslices";
import type { Timeslice } from "@/shared/types/models";
import { create } from "zustand";
import {
  type BaseStoreState,
  handleApiCall,
  handleGetApiCall,
  handleVoidApiCall,
  handleVoidApiCallWithResult,
} from "../utils/utils";

interface TimeslicesStore extends BaseStoreState {
  // State
  timeslices: Timeslice[];

  // Core operations
  // Insert operations
  insertTimeslice: (
    timeslice: Omit<Timeslice, "id">
  ) => Promise<Timeslice | null>;
  insertTimeslices: (
    timeslices: Omit<Timeslice, "id">[]
  ) => Promise<Timeslice[]>;
  upsertTimeslice: (
    timeslice: Omit<Timeslice, "id"> &
      Partial<Pick<Timeslice, "state_id" | "note_ids">>
  ) => Promise<Timeslice | null>;
  upsertTimeslices: (
    timeslices: (Omit<Timeslice, "id"> &
      Partial<Pick<Timeslice, "state_id" | "note_ids">>)[]
  ) => Promise<Timeslice[]>;

  // Update operations
  updateTimeslice: (timeslice: Timeslice) => Promise<Timeslice | null>;

  // Delete operations
  deleteTimeslice: (id: string) => Promise<void>;
  deleteTimeslices: (ids: string[]) => Promise<void>;

  refresh: (userId: string) => Promise<void>;

  // Get operations
  getTimeslice: (id: string) => Promise<Timeslice | null>;
  getTimeslices: (ids: string[]) => Promise<Timeslice[]>;
  getUserTimeslices: (userId: string) => Promise<Timeslice[]>;
  getAllTimeslices: () => Promise<Timeslice[]>;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useTimeslicesStore = create<TimeslicesStore>((set, get) => ({
  // Initial state
  timeslices: [],
  isLoading: false,
  error: null,

  // Core operations
  insertTimeslice: async (timeslice: Omit<Timeslice, "id">) => {
    return handleApiCall(
      set,
      () => timeslicesApi.insertTimeslice(timeslice),
      "create timeslice",
      null,
      (newTimeslice, currentState) =>
        newTimeslice
          ? {
              timeslices: [...currentState.timeslices, newTimeslice],
            }
          : {}
    );
  },

  insertTimeslices: async (timeslices: Omit<Timeslice, "id">[]) => {
    return handleApiCall(
      set,
      () => timeslicesApi.insertTimeslices(timeslices),
      "create timeslices",
      [],
      (newTimeslices, currentState) =>
        newTimeslices.length > 0
          ? {
              timeslices: [...currentState.timeslices, ...newTimeslices],
            }
          : {}
    );
  },

  upsertTimeslice: async (
    timeslice: Omit<Timeslice, "id"> &
      Partial<Pick<Timeslice, "state_id" | "note_ids">>
  ) => {
    return handleApiCall(
      set,
      () => timeslicesApi.upsertTimeslice(timeslice),
      "upsert timeslice",
      null,
      (upsertedTimeslice, currentState) => {
        if (!upsertedTimeslice) return {};

        const existingIndex = currentState.timeslices.findIndex(
          (t) => t.id === upsertedTimeslice.id
        );
        if (existingIndex >= 0) {
          // Update existing
          return {
            timeslices: currentState.timeslices.map((t, index) =>
              index === existingIndex ? upsertedTimeslice : t
            ),
          };
        } else {
          // Add new
          return {
            timeslices: [...currentState.timeslices, upsertedTimeslice],
          };
        }
      }
    );
  },

  upsertTimeslices: async (
    timeslices: (Omit<Timeslice, "id"> &
      Partial<Pick<Timeslice, "state_id" | "note_ids">>)[]
  ) => {
    return handleApiCall(
      set,
      () => timeslicesApi.upsertTimeslices(timeslices),
      "upsert timeslices",
      [],
      (upsertedTimeslices, currentState) => {
        if (!upsertedTimeslices || upsertedTimeslices.length === 0) return {};

        let updatedTimeslices = [...currentState.timeslices];

        upsertedTimeslices.forEach((upsertedTimeslice) => {
          const existingIndex = updatedTimeslices.findIndex(
            (t) => t.id === upsertedTimeslice.id
          );
          if (existingIndex >= 0) {
            // Update existing
            updatedTimeslices[existingIndex] = upsertedTimeslice;
          } else {
            // Add new
            updatedTimeslices.push(upsertedTimeslice);
          }
        });

        return { timeslices: updatedTimeslices };
      }
    );
  },

  updateTimeslice: async (timeslice: Timeslice) => {
    return handleApiCall(
      set,
      () => timeslicesApi.updateTimeslice(timeslice),
      "update timeslice",
      null,
      (updatedTimeslice, currentState) =>
        updatedTimeslice
          ? {
              timeslices: currentState.timeslices.map((t) =>
                t.id === updatedTimeslice.id ? updatedTimeslice : t
              ),
            }
          : {}
    );
  },

  deleteTimeslice: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => timeslicesApi.deleteTimeslice(id),
      "delete timeslice",
      (currentState) => ({
        timeslices: currentState.timeslices.filter((t) => t.id !== id),
      })
    );
  },

  deleteTimeslices: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => timeslicesApi.deleteTimeslices(ids),
      "delete timeslices",
      (currentState) => ({
        timeslices: currentState.timeslices.filter(
          (t) => t.id && !ids.includes(t.id)
        ),
      })
    );
  },

  refresh: async (userId: string) => {
    return handleVoidApiCallWithResult(
      set,
      async () => {
        // Fetch timeslices for the user from remote database
        const fetchedTimeslices = await timeslicesApi.getUserTimeslices(userId);
        return fetchedTimeslices;
      },
      "refresh timeslices",
      (fetchedTimeslices, currentState) => ({
        timeslices: currentState.timeslices.concat(fetchedTimeslices),
      })
    );
  },

  // Get operations
  getTimeslice: async (id: string) => {
    return handleGetApiCall(
      set,
      () => timeslicesApi.getTimeslice(id),
      "get timeslice",
      null
    );
  },

  getTimeslices: async (ids: string[]) => {
    return handleGetApiCall(
      set,
      () => timeslicesApi.getTimeslices(ids),
      "get timeslices",
      []
    );
  },

  getUserTimeslices: async (userId: string) => {
    return handleGetApiCall(
      set,
      () => timeslicesApi.getUserTimeslices(userId),
      "get user timeslices",
      []
    );
  },

  getAllTimeslices: async () => {
    return handleGetApiCall(
      set,
      () => timeslicesApi.getAllTimeslices(),
      "get all timeslices",
      []
    );
  },

  // Utility functions
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ timeslices: [], isLoading: false, error: null }),
}));

export default useTimeslicesStore;
