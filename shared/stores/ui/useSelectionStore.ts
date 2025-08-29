import { create } from "zustand";

interface SelectionStore {
  selectedTimesliceId: string | null;
  selectedActivityId: string | null;

  setSelectedTimesliceId: (id: string | null) => void;
  setSelectedActivityId: (id: string | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

const useSelectionStore = create<SelectionStore>((set) => ({
  selectedTimesliceId: null,
  selectedActivityId: null,

  setSelectedTimesliceId: (id) => set({ selectedTimesliceId: id }),
  setSelectedActivityId: (id) => set({ selectedActivityId: id }),

  clearSelection: () =>
    set({ selectedTimesliceId: null, selectedActivityId: null }),

  reset: () => set({ selectedTimesliceId: null, selectedActivityId: null }),
}));

export default useSelectionStore;
