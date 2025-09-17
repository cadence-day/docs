import { Timeslice } from "@/shared/types/models";
import { create } from "zustand";

interface PendingTimeslicesStore {
  // Array of empty timeslices waiting for activity selection
  pendingTimeslices: Timeslice[];

  // Add a timeslice to the pending list
  addPendingTimeslice: (timeslice: Timeslice) => void;

  // Remove a timeslice from the pending list
  removePendingTimeslice: (timeslice: Timeslice) => void;

  // Clear all pending timeslices
  clearPendingTimeslices: () => void;

  // Get all pending timeslices
  getPendingTimeslices: () => Timeslice[];

  // Check if there are any pending timeslices
  hasPendingTimeslices: () => boolean;
}

const usePendingTimeslicesStore = create<PendingTimeslicesStore>(
  (set, get) => ({
    pendingTimeslices: [],

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

    removePendingTimeslice: (timeslice: Timeslice) => {
      set((state) => ({
        pendingTimeslices: state.pendingTimeslices.filter(
          (pending) => pending.start_time !== timeslice.start_time
        ),
      }));
    },

    clearPendingTimeslices: () => {
      set({ pendingTimeslices: [] });
    },

    getPendingTimeslices: () => get().pendingTimeslices,

    hasPendingTimeslices: () => get().pendingTimeslices.length > 0,
  })
);

export default usePendingTimeslicesStore;
