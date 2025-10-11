import { Timeslice } from "@/shared/types/models";
import { create } from "zustand";

interface PendingTimeslicesStore {
  // Array of empty timeslices waiting for activity selection
  pendingTimeslices: Timeslice[];

  // Array of existing timeslices waiting for activity update
  pendingUpdates: Timeslice[];

  // Add a timeslice to the pending list
  addPendingTimeslice: (timeslice: Timeslice) => void;

  // Add an existing timeslice that needs activity update
  addPendingUpdate: (timeslice: Timeslice) => void;

  // Remove a timeslice from the pending list
  removePendingTimeslice: (timeslice: Timeslice) => void;

  // Remove a timeslice from the pending updates list
  removePendingUpdate: (timeslice: Timeslice) => void;

  // Clear all pending timeslices
  clearPendingTimeslices: () => void;

  // Clear all pending updates
  clearPendingUpdates: () => void;

  // Clear both pending timeslices and updates
  clearAll: () => void;

  // Get all pending timeslices
  getPendingTimeslices: () => Timeslice[];

  // Get all pending updates
  getPendingUpdates: () => Timeslice[];

  // Check if there are any pending timeslices
  hasPendingTimeslices: () => boolean;

  // Check if there are any pending updates
  hasPendingUpdates: () => boolean;

  // Check if there are any pending items (timeslices or updates)
  hasAnyPending: () => boolean;
}

const usePendingTimeslicesStore = create<PendingTimeslicesStore>(
  (set, get) => ({
    pendingTimeslices: [],
    pendingUpdates: [],

    addPendingTimeslice: (timeslice: Timeslice) => {
      set((state) => {
        // Check if this timeslice is already pending (by start_time)
        const exists = state.pendingTimeslices.some(
          (pending) => pending.start_time === timeslice.start_time
        );

        if (!exists) {
          return {
            pendingTimeslices: [...state.pendingTimeslices, timeslice],
          };
        }

        return state;
      });
    },

    addPendingUpdate: (timeslice: Timeslice) => {
      set((state) => {
        // Check if this timeslice is already pending for update (by start_time)
        const exists = state.pendingUpdates.some(
          (pending) => pending.start_time === timeslice.start_time
        );

        if (!exists) {
          return {
            pendingUpdates: [...state.pendingUpdates, timeslice],
          };
        }

        return state;
      });
    },

    removePendingTimeslice: (timeslice: Timeslice) => {
      set((state) => ({
        pendingTimeslices: state.pendingTimeslices.filter(
          (pending) => pending.start_time !== timeslice.start_time
        ),
      }));
    },

    removePendingUpdate: (timeslice: Timeslice) => {
      set((state) => ({
        pendingUpdates: state.pendingUpdates.filter(
          (pending) => pending.start_time !== timeslice.start_time
        ),
      }));
    },

    clearPendingTimeslices: () => {
      set((state) => ({ ...state, pendingTimeslices: [] }));
    },

    clearPendingUpdates: () => {
      set((state) => ({ ...state, pendingUpdates: [] }));
    },

    clearAll: () => {
      set({ pendingTimeslices: [], pendingUpdates: [] });
    },

    getPendingTimeslices: () => get().pendingTimeslices,

    getPendingUpdates: () => get().pendingUpdates,

    hasPendingTimeslices: () => get().pendingTimeslices.length > 0,

    hasPendingUpdates: () => get().pendingUpdates.length > 0,

    hasAnyPending: () => {
      const state = get();
      return (
        state.pendingTimeslices.length > 0 || state.pendingUpdates.length > 0
      );
    },
  })
);

export default usePendingTimeslicesStore;
