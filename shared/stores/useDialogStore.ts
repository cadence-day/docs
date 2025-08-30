import type { StoreApi } from "zustand";
import { create } from "zustand";

export type DialogId = string;
export type DialogType = string;

export interface DialogSpec {
  id: DialogId;
  type: DialogType;
  props?: Record<string, any>;
  collapsed?: boolean;
  zIndex?: number;
  position?: "dock" | { x: number; y: number };
}

interface DialogStore {
  dialogs: Record<DialogId, DialogSpec>;
  openDialog: (
    spec: Omit<DialogSpec, "id" | "zIndex"> & { id?: DialogId }
  ) => DialogId;
  closeDialog: (id: DialogId) => void;
  toggleCollapse: (id: DialogId) => void;
  bringToFront: (id: DialogId) => void;
  getDialog: (id: DialogId) => DialogSpec | undefined;
}

const makeId = () => Math.random().toString(36).slice(2, 9);

const useDialogStore = create<DialogStore>(
  (
    set: StoreApi<DialogStore>["setState"],
    get: StoreApi<DialogStore>["getState"]
  ) => ({
    dialogs: {},

    openDialog: (
      spec: Omit<DialogSpec, "id" | "zIndex"> & { id?: DialogId }
    ) => {
      const id = spec.id ?? makeId();
      const next: DialogSpec = {
        id,
        type: spec.type,
        props: spec.props ?? {},
        collapsed: spec.collapsed ?? false,
        zIndex: Object.keys(get().dialogs).length + 1,
        position: spec.position ?? "dock",
      };

      set((state: DialogStore) => ({
        dialogs: { ...state.dialogs, [id]: next },
      }));
      return id;
    },

    closeDialog: (id: DialogId) =>
      set((state: DialogStore) => {
        const copy = { ...state.dialogs };
        delete copy[id];
        return { dialogs: copy };
      }),

    toggleCollapse: (id: DialogId) =>
      set((state: DialogStore) => {
        const d = state.dialogs[id];
        if (!d) return {} as any;
        return {
          dialogs: {
            ...state.dialogs,
            [id]: { ...d, collapsed: !d.collapsed },
          },
        };
      }),

    bringToFront: (id: DialogId) =>
      set((state: DialogStore) => {
        const max = Math.max(
          0,
          ...Object.values(state.dialogs).map((d) => d?.zIndex ?? 0)
        );
        const d = state.dialogs[id];
        if (!d) return {} as any;
        return {
          dialogs: { ...state.dialogs, [id]: { ...d, zIndex: max + 1 } },
        };
      }),

    getDialog: (id: DialogId) => get().dialogs[id],
  })
);

export default useDialogStore;
